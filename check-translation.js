const {checkTranslations} = require("./openai-service");
const fs = require("fs");

(async () => {
    const response = await checkTranslations(readJsonFile(process.argv[2]));
    console.log(JSON.stringify(response, null, 2));
})();

function readJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading the JSON file:', error);
        return null;
    }
}