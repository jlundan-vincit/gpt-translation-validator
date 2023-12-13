const {checkTranslations} = require("../openai-service");
const fs = require("fs");
const path = require('path');
const XLSX = require("xlsx");

(async () => {
    const argv = require('minimist')(process.argv.slice(2));
    let testData = null;
    const mode = argv["_"][0];

    switch (mode) {
        case "test-data": {
            testData = readTestMarkdownFiles(argv["_"][1]);
            break;
        }
        case "xslx": {
            testData = readXslxFile(argv["_"][1]);
            break;
        }
    }
    if (testData !== null) {
        const response = await checkTranslations(testData);
        console.log(JSON.stringify(response, null, 2));
    }
})();

function readTestMarkdownFiles(filePath) {
    const directoryPath = path.join(__dirname, filePath);

    const testFiles = {};

    const files = fs.readdirSync(directoryPath);
    files.forEach(function (file) {
        const fileBase = file.split('.')[0];
        testFiles[fileBase] = fs.readFileSync(path.join(directoryPath, file), 'utf8');
    });

    const testData = [];
    for (const [key, value] of Object.entries(testFiles)) {
        if (key === "english") {
            continue;
        }
        const testItem = {
            "english": testFiles["english"]
        };
        testItem[key] = value;
        testData.push(testItem)
    }

    return testData;
}

function readXslxFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    let headers = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = { c: col, r: 0 }; // 0 for the first row
        if (worksheet[XLSX.utils.encode_cell(cellAddress)]) {
            headers.push(worksheet[XLSX.utils.encode_cell(cellAddress)].v);
        } else {
            headers.push(null);
        }
    }

    const languages = [
        headers[3],
        headers[4]
    ];

    const rows = XLSX.utils.sheet_to_json(worksheet);
    const translations = [];
    for (const row of rows) {
        const translation = {};
        for (let i=0; i<languages.length; i++) {
            translation[languages[i]] = row[languages[i]];
        }
        translations.push(translation);
    }
    return translations;
}

function readJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading the JSON file:', error);
        return null;
    }
}

