const XLSX = require("xlsx");
const fs = require("fs");

class Dataset {
    #data = [];
    #entryIdColumn = '';
    #contextColumn = '';
    #valueColumn = '';

    constructor(entryIdColumn, contextColumn, valueColumn) {
        this.#entryIdColumn = entryIdColumn;
        this.#contextColumn = contextColumn;
        this.#valueColumn = valueColumn;
    }

    loadFromXlsx(filePath) {
        const fileData = this.#readXlsxFile(filePath);
        this.#data = this.#convertToDatasetRowArray(fileData);
        return this;
    }

    loadFromJsonFile(filePath) {
        const fileData = this.#readJsonFile(filePath);
        this.#data = this.#convertToDatasetRowArray(fileData);
        return this;
    }

    filterEmptyValues() {
        this.#data = this.#data.filter(entry => !entry.isValueEmpty());
        return this;
    }

    filterValuesByLength(minLength, maxLength) {
        this.#data = this.#data.filter(entry => entry.isValueLengthBetween(minLength, maxLength));
        return this;
    }

    getSize() {
        return this.#data.length;
    }

    getData() {
        return this.#data;
    }

    getValues() {
        return Object.keys(this.#data);
    }

    pickRandomRows(count) {
        const randomRows = [];
        const randomIndexes = [];
        for (let i = 0; i < count; i++) {
            let randomIndex = Math.floor(Math.random() * this.#data.length);
            while (randomIndexes.includes(randomIndex)) {
                randomIndex = Math.floor(Math.random() * this.#data.length);
            }
            randomIndexes.push(randomIndex);
            randomRows.push(this.#data[randomIndex]);
        }
        this.#data = randomRows;
        return this;
    }

    getGroupedByValues() {
        const contentsToEntryIdArray = {}
        for (const row of this.#data) {
            if (row.value in contentsToEntryIdArray) {
                contentsToEntryIdArray[row.value].push(row.compositeKey);
            } else {
                contentsToEntryIdArray[row.value] = [row.compositeKey];
            }
        }
        return contentsToEntryIdArray;
    }

    writeToJsonFile(filePath, prettyPrint = false) {
        const dataToWrite = [];
        for (const row of this.#data) {
            if(row.isValueEmpty()) {
                row.push({
                    [this.#entryIdColumn]: row.entryId,
                    [this.#contextColumn]: row.context,
                    [this.#valueColumn]: ''
                })
            }
            dataToWrite.push(row.toJSON());
        }
        fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, prettyPrint ? 4 : null));
    }

    #convertToDatasetRowArray(data) {
        return data.map(row => new DatasetRow(row[this.#entryIdColumn], row[this.#contextColumn], row[this.#valueColumn]));
    }

    #readXlsxFile(filePath) {
        const workbook = XLSX.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        return XLSX.utils.sheet_to_json(worksheet);
    }

    #readJsonFile(filePath) {
        try {
            const rawData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('Error reading the JSON file:', error);
            return null;
        }
    }
}

class DatasetRow {
    #entryId = '';
    #context = '';
    #value = '';

    constructor(entryId, context, value) {
        this.#entryId = entryId;
        this.#context = context;
        this.#value = value || '';
    }

    get entryId() {
        return this.#entryId;
    }

    get compositeKey() {
        return `${this.#entryId}_${this.#context}`;
    }

    get context() {
        return this.#context;
    }

    get value() {
        return this.#value;
    }

    isValueLengthBetween(minLength, maxLength) {
        if (maxLength === "*") {
            maxLength = Number.MAX_SAFE_INTEGER
        }

        if (minLength === "*") {
            minLength = 0;
        }
        return this.#value.length >= minLength && this.#value.length <= maxLength;
    }

    isValueEmpty() {
        return this.#value === '' || this.#value === ' ';
    }

    toJSON() {
        return {
            entryId: this.#entryId,
            context: this.#context,
            value: this.#value
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}

module.exports = {
    Dataset: Dataset,
    DatasetRow: DatasetRow
};