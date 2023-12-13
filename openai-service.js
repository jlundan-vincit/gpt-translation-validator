const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.TRANS_OPENAI_API_KEY,
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
    const results = [];
    for (const item of translationsArray) {
        const languages = Object.keys(item);
        results.push(await checkTranslation(languages[0], languages[1], item[languages[0]], item[languages[1]]));
    }
    return results;
}

async function checkTranslation(lang1, lang2, text1, text2) {
    // const openAiInput = {
    //     text1: {
    //         text: text1,
    //         language: lang1
    //     },
    //     text2: {
    //         text: text2,
    //         language: lang2
    //     }
    // }

    // const messages = [
    //     {"role": "system", "content": "Your purpose is to compare markdown documents and compare translations. " +
    //             "The request will be an JSON array of objects with two text properties. The two properties are translations written with markdown. You should check if the texts are valid markdown and that the texts have the same markdown formatting. " +
    //             "You must pay attention to detecting extra line changes. You must pay attention to detecting extra whitespaces especially at the beginning of the document. You must also check that the text translations match exactly. Each text has two properties: text and language. " +
    //             "The language property specifies the language of the text." +
    //             "You must respond with JSON array which contains JSON objects. Each JSON object object should have isValid property, which must be true if the texts are valid markdown, " +
    //             "the markdown formats match and the translation is correct. If you set the isValid property to false, you should also add a suggestion property to the object, which should " +
    //             "include reason why isValid is set to false. The response array must be in the same order as the request array. You will always answer with the JSON array only, not with any other text."},
    //     {"role": "user", "content": JSON.stringify([openAiInput])},
    // ];

    const openAiInput = "First text is in language: " + lang1 + " and second text is in language: " + lang2 +
    "\n\nFirst text is: " + text1 + " \n\n Second text is: " + text2;

    const messages = [
        {"role": "system", "content": "Your purpose is to compare markdown documents and compare translations. " +
                "The user will send you two Markdown formatted texts and tell you the language of each text. You should check if the texts are valid markdown and that the texts have the same markdown formatting. " +
                "You must pay attention to detecting extra line changes. You must pay attention to detecting extra whitespaces especially at the beginning of the document. You must also check that the text translations match exactly." +
                "If the document does not contain any markdown, you must consider the document as valid markdown. You must respond with a JSON object. The JSON object should have isValid property, which must be true if the texts are valid markdown, " +
                "the markdown formats match and the translation is correct. If you set the isValid property to false, you should also add a suggestion property to the object, which should " +
                "include reason why isValid is set to false. You must always answer with the JSON object only, not with any other text."},
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
            //model: "gpt-3.5-turbo",
            model: "gpt-4",
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