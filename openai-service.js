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
    translateTexts: translateTexts
}