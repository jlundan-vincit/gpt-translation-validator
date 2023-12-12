const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.TRANS_OPENAI_API_KEY, // Make sure to set your API key in the environment variables
});

async function translateTexts(textArray) {
    const messages = [
        {"role": "system", "content": "You are a translator service. The user will send you a message in English and you will translate it to Finnish. The user message will be a JSON array of strings" +
                " with each item a text to be translated. You will reply with a JSON array of strings with each item a translated text. The response array must be in the same order as the request array." +
                " If you cannot translate a text, you will reply with an empty string in the response array. You will always answer with the JSON array only, not with any other text."},
        {"role": "user", "content": JSON.stringify(textArray)},
    ];

    const response = await sendChatMessages(messages);
    return response[0]['message']['content'];
}

async function checkTranslations(translationsArray) {
    const indexedTranslations = translationsArray.map((item, index) => {
        return {
            ...item,
            index
        }
    });

    const messages = [
        {"role": "system", "content": "You are a translator service. The user will send you a messages with language pairs. Your job is to check if the translation is correct. " +
                "The request will be an JSON array of objects with three properties. The id property is an identifier, which uniquely identifies the object in the array. " +
                "The remaining two properties are language-text pairs which have been translated. You should check if the translation is correct. You should respond with the JSON array you received from the user, " +
                "but append isValid property to each object in the array and remove the language-text pairs. " +
                "The isValid property must be true if the translation is correct and false if the translation is not correct. The response array must be in the same order as the request array. " +
                " You will always answer with the JSON array only, not with any other text."},
        {"role": "user", "content": JSON.stringify(indexedTranslations)},
    ];

    const response = await sendChatMessages(messages);
    const translated = JSON.parse(response[0]['message']['content']);

    return translated.map((item) => {
        let sourceData = indexedTranslations[item.index];
        delete sourceData.index;
        return {
            sourceData: indexedTranslations[item.index],
            isValid: item.isValid
        }
    });
}

async function sendChatMessages(messages) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        return response.choices;
    } catch (error) {
        throw new Error(`Error in sending chat messages: ${error}`);
    }
}

module.exports = {
    translateTexts: translateTexts,
    checkTranslations: checkTranslations
}