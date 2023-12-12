const {Dataset} = require("./dataset");
const dataSet = new Dataset('entryId', 'context', 'en');
dataSet.loadFromXlsx(process.argv[2]).filterEmptyValues().writeToJsonFile(process.argv[3], true);