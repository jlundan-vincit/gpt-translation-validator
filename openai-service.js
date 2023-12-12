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
            text1: {
                text: item['en'],
                language: "en"
            },
            text2: {
                text: item['fi'],
                language: "fi"
            },
        //    id: index
        }
    });

    // const messages = [
    //     {"role": "system", "content": "You are a translator and markdown checker service. The user will send you a messages with language pairs. Your job is to check if the translation is correct. " +
    //             "The request will be an JSON array of objects with three properties. The id property is an identifier, which uniquely identifies the object in the array. " +
    //             "The remaining two properties are language-text pairs which have been translated. The text is in markdown format. You should check if the translation is correct, " +
    //             "that the markdown is correctly formatted, and that the markdown formats between languages match. You should respond with the JSON array you received from the user, " +
    //             "but append isValid property to each object in the array and remove the language-text pairs. " +
    //             "The isValid property must be true if the translation is correct, texts are valid markdown, and the markdown formats between texts match. Otherwise the isValid property should be false. " +
    //             "The response array must be in the same order as the request array. You will always answer with the JSON array only, not with any other text."},
    //     {"role": "user", "content": JSON.stringify(indexedTranslations)},
    // ];

    // const messages = [
    //     {"role": "system", "content": "Your purpose is to compare markdown documents. " +
    //             "The remaining two properties are markdown texts. You should check if the texts are valid markdown and that the texts have the same markdown formatting. " +
    //             "You should respond with the JSON array you received from the user, but append isValid property to each object in the array. " +
    //             "The isValid property must be true if the texts are valid markdown and the markdown formats match. The response array must be in the same order as the request array. " +
    //             "You will always answer with the JSON array only, not with any other text."},
    //     {"role": "user", "content": JSON.stringify(indexedTranslations)},
    // ];

    const messages = [
        {"role": "system", "content": "Your purpose is to compare markdown documents and compare translations. " +
                "The request will be an JSON array of objects with two properties. The two properties are translations written with markdown. You should check if the texts are valid markdown and that the texts have the same markdown formatting. " +
                "You should also check that the texts are translated correctly. Each text has two properties: text and language. The language property specifies the language of the text." +
                "You should respond with the JSON array you received from the user, but append isValid property to each object in the array. " +
                "The isValid property must be true if the texts are valid markdown, the markdown formats match and the translation is correct. If you set the isValid property to false, you should also " +
                "add a suggestion property to the object, which should include reason why isValid is set to false. The response array must be in the same order as the request array. " +
                "You will always answer with the JSON array only, not with any other text."},
        {"role": "user", "content": JSON.stringify(indexedTranslations)},
    ];

    const response = await sendChatMessages(messages);
    const translated = JSON.parse(response[0]['message']['content']);

    return translated.map((item, index) => {
        let sourceData = indexedTranslations[index];
        return {
            sourceData: sourceData,
            isValid: item.isValid,
            suggestion: item.suggestion
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