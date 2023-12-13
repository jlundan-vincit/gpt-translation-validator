const OpenAI = require('openai');
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
    apiKey: process.env.TRANS_OPENAI_API_KEY,
});

const validateSystemPrompt = fs.readFileSync(path.join(__dirname, 'validate-system-prompt.txt'), 'utf8');

async function checkTranslations(translationsArray) {
    const results = [];
    let requestCount = 0;
    try {
        for (const item of translationsArray) {
            const languages = Object.keys(item);
            results.push(await checkTranslation(languages[0], languages[1], item[languages[0]], item[languages[1]]));
            requestCount++;
        }
    } catch (e) {
        return {
            state: results.length === 0 ? "failure" : "partial-success",
            lastSuccessOnRow: requestCount,
            results: results
        };
    }
    return {
        state: "success",
        results: results
    };
}

async function checkTranslation(lang1, lang2, text1, text2) {
    const openAiInput = "First text is in language: " + lang1 + " and second text is in language: " + lang2 +
        "\n\nFirst text is: '" + text1 + "' \n\n Second text is: '" + text2 + "'";

    const messages = [
        {"role": "system", "content": validateSystemPrompt},
        {"role": "user", "content": openAiInput},
    ];

    const response = await sendChatMessages(messages);
    const content = JSON.parse(response[0]['message']['content']);

    const sourceData = {}
    sourceData[lang1] = text1;
    sourceData[lang2] = text2;

    return {
        sourceData: sourceData,
        prompt: openAiInput,
        isValid: content.isValid,
        suggestion: content.suggestion
    }
}

async function sendChatMessages(messages) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        });

        return response.choices;
    } catch (error) {
        throw new Error(`Error in sending chat messages: ${error}`);
    }
}

module.exports = {
    checkTranslations: checkTranslations
}