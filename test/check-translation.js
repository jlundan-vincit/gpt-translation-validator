const {checkTranslations} = require("../openai-service");
const fs = require("fs");
const path = require('path');

(async () => {
    const testData = readTestFiles(process.argv[2])
    const response = await checkTranslations(testData);
    console.log(JSON.stringify(response, null, 2));
})();

function readTestFiles(filePath) {
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

function readJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading the JSON file:', error);
        return null;
    }
}