const {checkTranslations} = require("./openai-service");
const fs = require("fs");
const path = require('path');
const XLSX = require("xlsx");

(async () => {
    const argv = require('minimist')(process.argv.slice(2));
    let testData = null;
    const mode = argv["_"][0];
    try {
        switch (mode) {
            case "test-data": {
                testData = readTestMarkdownFiles(argv["_"][1]);
                break;
            }
            case "xslx": {
                testData = readXslxFile(argv["_"][1], argv["_"][2], argv["skip"], argv["page-size"], argv["silent"]);
                break;
            }
        }
        if (testData !== null) {
            const response = await checkTranslations(testData, 100, argv["skip"]);

            const results = argv["print-valid-results"] ? response.results : response.results.filter(item => item.validation.isValid === false);
            const output = {
                state: response.state,
                results: results
            }
            if (response.lastSuccessOnRow > 0) {
                const skip = argv["skip"] ? parseInt(argv["skip"], 10) : 0;
                output.lastSuccessOnRow = skip + response.lastSuccessOnRow + 1; // +1 because first row is header
            }

            const outputPath = path.join(__dirname, argv["output"] ? argv["output"] : 'output.json')
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
        }
    } catch (e) {
        console.log(e.message);
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

function readXslxFile(filePath, languages, offset, limit) {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const languageArray = languages.split(',').map(item => item.trim());

    if (languageArray.length !== 2) {
        throw new Error('Two languages must be specified for checking translations');
    }

    let rows = XLSX.utils.sheet_to_json(worksheet);

    const firstRow = rows[0];
    for (const language of languageArray) {
        if (!firstRow[language]) {
            throw new Error(`Language column ${language} not found in the XLSX file`);
        }
    }

    if (offset !== undefined && limit !== undefined) {
        rows.splice(0, offset);
        rows.splice(limit);
    }

    const translations = [];
    for (const row of rows) {
        const translation = {};
        for (let i=0; i<languageArray.length; i++) {
            translation[languageArray[i]] = row[languageArray[i]];
        }
        translations.push(translation);
    }
    return translations;
}
