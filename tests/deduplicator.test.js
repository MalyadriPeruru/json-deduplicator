const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { deduplicateLeads } = require("../core/deduplicator");

/**
 * Loads leads from a JSON file.
 * @param {*} filePath
 * @returns
 */
function loadLeads(testFilePath) {
    try {
        const data = fs.readFileSync(testFilePath, "utf8");
        const parsed = JSON.parse(data);
        return parsed.leads;
    } catch (err) {
        console.error("Error reading or parsing leads.json:", err.message);
        throw new Error(err.message);
    }
}

function runTests() {
    // Test 1: No duplicates
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 1: No duplicates");
    const leads1 = loadLeads(path.join(__dirname, "1.json"));
    const result1 = deduplicateLeads(leads1);
    assert.strictEqual(result1.deduped.length, 2);
    assert.strictEqual(result1.log.length, 0);
    console.log("Test 1 Passed\n\n");

    // Test 2: Duplicate by _id, prefer newest date
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 2: Duplicate by _id, prefer newest date");
    const leads2 = loadLeads(path.join(__dirname, "2.json"));
    const result2 = deduplicateLeads(leads2);
    assert.strictEqual(result2.deduped.length, 1);
    assert.strictEqual(result2.deduped[0].address, "Addr2");
    assert.strictEqual(result2.log.length, 1);
    console.log("Test 2 Passed\n\n");

    // Test 3: Duplicate by email, prefer newest date
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 3: Duplicate by email, prefer newest date");
    const leads3 = loadLeads(path.join(__dirname, "3.json"));
    const result3 = deduplicateLeads(leads3);
    assert.strictEqual(result3.deduped.length, 1);
    assert.strictEqual(result3.deduped[0]._id, "2");
    assert.strictEqual(result3.log.length, 1);
    console.log("Test 3 Passed\n\n");

    // Test 4: Tie-breaker by last occurrence
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 4: Tie-breaker by last occurrence");
    const leads4 = loadLeads(path.join(__dirname, "4.json"));
    const result4 = deduplicateLeads(leads4);
    assert.strictEqual(result4.deduped.length, 1);
    assert.strictEqual(result4.deduped[0].address, "Addr2");
    assert.strictEqual(result4.log.length, 1);
    console.log("Test 4 Passed\n\n");

    // Test 5: Multiple duplicates
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 5: Multiple duplicates");
    const leads5 = loadLeads(path.join(__dirname, "5.json"));
    const result5 = deduplicateLeads(leads5);
    assert.strictEqual(result5.deduped.length, 1);
    assert.strictEqual(result5.deduped[0].address, "Addr3");
    assert.strictEqual(result5.log.length, 2);
    console.log("Test 5 Passed\n\n");

    // Test 6: Empty leads array
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 6: Empty leads array");
    const leads6 = loadLeads(path.join(__dirname, "6.json"));
    const result6 = deduplicateLeads(leads6);
    assert.strictEqual(result6.deduped.length, 0);
    assert.strictEqual(result6.log.length, 0);
    console.log("Test 6 Passed\n\n");

    // Test 7: Empty file (no leads property)
    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("Running Test 7: Empty file (no leads property)");
    try {
        loadLeads(path.join(__dirname, "7.json"));
        console.log("Test 7 Failed: Should have thrown an error\n\n");
    } catch (err) {
        console.log("Test 7 Passed\n\n");
    }

    console.log(
        "---------------------------------------------------------------------------"
    );
    console.log("All tests passed!");
}

runTests();
