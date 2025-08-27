const fs = require("fs");
const path = require("path");

const defaultLeadsPath = path.join(__dirname, "..", "input", "leads.json");
const defaultOutputPath = path.join(
    __dirname,
    "..",
    "output",
    "deduped_leads.json"
);
const defaultLogPath = path.join(__dirname, "..", "output", "change_log.json");

/**
 * Loads leads from a JSON file.
 * @param {*} filePath
 * @returns
 */
function loadLeads(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(data);
        if (!parsed.leads || !Array.isArray(parsed.leads)) {
            throw new Error('Input JSON does not contain a "leads" array.');
        }
        return parsed.leads;
    } catch (err) {
        console.error("Error reading or parsing leads.json:", err.message);
        process.exit(1);
    }
}

/**
 * Compares the entry dates of two lead objects.
 * @param {*} a - The first lead object.
 * @param {*} b - The second lead object.
 * @returns {number} -1 if a is earlier, 1 if a is later, 0 if they are the same.
 */
function compareDates(a, b) {
    const dateA = new Date(a.entryDate);
    const dateB = new Date(b.entryDate);
    if (dateA > dateB) return 1;
    if (dateA < dateB) return -1;
    return 0;
}

/**
 * Compares two lead records and identifies changes.
 * @param {*} oldRec - The original lead record.
 * @param {*} newRec - The updated lead record.
 * @returns {Array} - An array of changes found.
 */
function getFieldChanges(oldRec, newRec) {
    const changes = [];
    for (const key of Object.keys(newRec)) {
        if (oldRec[key] !== newRec[key]) {
            changes.push({ field: key, from: oldRec[key], to: newRec[key] });
        }
    }
    return changes;
}

/**
 * Core function to deduplicate leads.
 *
 * @param {Array} leads - The array of lead objects to deduplicate.
 * @returns {Object} - An object containing the deduplicated leads and a change log.
 */
function deduplicateLeads(leads) {
    const idMap = new Map();
    const emailMap = new Map();
    const log = [];

    /**
     * Deduplication process based on _id.
     *
     * Check if _id is already present in the idMap,
     * If it is not, add it.
     * If the _id is already present, compare the entryDate fields.
     * If the incoming lead has a newer date, it replaces the existing one.
     * If the dates are the same, use the one with the higher original index as it is last in the input list.
     */
    for (const lead of leads) {
        if (!idMap.has(lead._id)) {
            idMap.set(lead._id, lead);
        } else {
            const existing = idMap.get(lead._id);
            const cmp = compareDates(lead, existing);
            let chosen;
            if (cmp > 0) {
                chosen = lead;
            } else if (cmp < 0) {
                chosen = existing;
            } else {
                chosen = lead;
            }
            if (chosen !== existing) {
                log.push({
                    reason: "Duplicate _id",
                    source: existing,
                    output: chosen,
                    changes: getFieldChanges(existing, chosen),
                });
                idMap.set(lead._id, chosen);
            }
        }
    }

    /**
     * Deduplication process based on email.
     *
     * This process is similar to the _id-based deduplication, but it uses the email field
     * to identify duplicates. The same logic applies: if a lead with the same email is found,
     * it is compared with the existing one based on entryDate.
     *
     * If the incoming lead has a newer date, it replaces the existing one.
     * If the dates are the same, use the one with the higher original index as it is last in the input list.
     */
    for (const lead of idMap.values()) {
        if (!emailMap.has(lead.email)) {
            emailMap.set(lead.email, lead);
        } else {
            const existing = emailMap.get(lead.email);
            const cmp = compareDates(lead, existing);
            let chosen;
            if (cmp > 0) {
                chosen = lead;
            } else if (cmp < 0) {
                chosen = existing;
            } else {
                chosen = lead;
            }
            if (chosen !== existing) {
                log.push({
                    reason: "Duplicate email",
                    source: existing,
                    output: chosen,
                    changes: getFieldChanges(existing, chosen),
                });
                emailMap.set(lead.email, chosen);
            }
        }
    }

    /**
     * Create the final deduplicated leads array.
     */
    const deduped = Array.from(emailMap.values());
    console.log(
        `Deduped leads: ${JSON.stringify({ leads: deduped }, null, 2)}`
    );

    return { deduped, log };
}

/**
 * Main function to execute the deduplication process.
 */
function main() {
    const args = process.argv.slice(2);

    let inputFilePath;
    let outputFilePath;
    let changesLogFilePath;

    /**
     * Check the command line arguments to see if filenames are provided, otherwise use defaults
     */
    if (args.length == 3) {
        inputFilePath = args[0];
        outputFilePath = args[1];
        changesLogFilePath = args[2];
    } else {
        inputFilePath = defaultLeadsPath;
        outputFilePath = defaultOutputPath;
        changesLogFilePath = defaultLogPath;
    }

    /**
     * Load leads from input JSON file.
     */
    const leads = loadLeads(inputFilePath);
    if (!leads || !Array.isArray(leads)) {
        console.error("No valid leads found in input.");
        process.exit(1);
    }

    const { deduped, log } = deduplicateLeads(leads);

    /**
     * Write the deduplicated leads to the output JSON file.
     */
    fs.writeFileSync(
        outputFilePath,
        JSON.stringify({ leads: deduped }, null, 2)
    );

    /**
     * Write the changes log to the changes log JSON file.
     */
    fs.writeFileSync(changesLogFilePath, JSON.stringify(log, null, 2));
    console.log(
        `Output written to ${outputFilePath} and log to ${changesLogFilePath}.`
    );

    return { deduped, log };
}

module.exports = { main, deduplicateLeads };
