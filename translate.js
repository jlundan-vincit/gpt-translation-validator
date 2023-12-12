const {Dataset} = require("./dataset");
const {translateTexts} = require("./openai-service");
const fs = require("fs");
const dataSet = new Dataset('entryId', 'context', 'value');

const entries = dataSet.loadFromJsonFile(process.argv[2]).filterEmptyValues().filterValuesByLength('*', 50).pickRandomRows(2).getGroupedByValues();
const texts = Object.keys(entries);

(async () => {
    const response = await translateTexts(texts);
    const responseJson = JSON.parse(response);

    const output =[];
    for (let i=0; i< responseJson.length; i++) {
        output.push({
            "en": texts[i],
            "fi": responseJson[i]
        })
    }

    fs.writeFileSync(process.argv[3], JSON.stringify(output, null, process.argv[4]? 4 : null));
})();
