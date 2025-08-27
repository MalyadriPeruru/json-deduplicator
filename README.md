# json-deduplicator

Project for Adobe take home interview code challenge

## Features

-   Deduplicates JSON records by ID and email.
-   Prefers newest entry by date, or last occurrence if dates are identical.
-   Outputs deduplicated records and a detailed change log.
-   Command-line usage.
-   Includes automated test cases.

## Assumptions & Pre-requisities

-   Javasript is used to create the program as there is not language specification.
-   Node.js is required for the program to run.
-   Folders "input" and "output" are required for the program to run correctly.
-   The test script only tests the core logic and displays the output. It does not create the output and log file.

## Usage

### 1. Install Node.js

Make sure you have Node.js installed on your system.

### 2. Prepare Input

-   There are two ways to provide input to the program.
    -   Place your input file at `input/leads.json` (see sample in repo).
    -   Provide the path to the input file as the first command line argument.

### 3. Run Deduplication

```
npm start
```

This will generate two files by default in the output folder if the file name and path for output and log file are not provide as the second and third command line argument:

-   `output/deduped_leads.json` (deduplicated output)
-   `output/change_log.json` (change log)

### 4. Run Tests

```
npm test
```

This will execute the test cases in `tests/deduplicator.test.js`.

## Project Structure

-   `core/deduplicator.js` - Main deduplication logic
-   `tests/deduplicator.test.js` - Test cases script
-   `input/leads.json` - Sample input
-   `output/deduped_leads.json` - Default Output file
-   `output/change_log.json` - Default Change log file
