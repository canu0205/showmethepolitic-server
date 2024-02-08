// extract.js
const axios = require('axios');
const openaiApiKey = process.env.OPENAI_API_KEY;

async function extractText(jsonObject) {
    try {
        // Assuming jsonObject contains a field 'text' for the command
        const cmd = jsonObject['text'];
        const prompt = "Summarize the position of the moderators on the topic of discussion in Korean with appropriate evidence. Present the summary in a consistent JSON format with each moderator's name and comment as separate objects within an array named 'moderators'. Each object should have 'name' and 'comment' as properties.";

        const payload = {
            model: "gpt-4-1106-preview",
            response_format: {"type": "json_object"},
            messages: [
                {"role": "system", "content": cmd},
                {"role": "user", "content": prompt}
            ]
        };

        const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (err) {
        console.error("Error in extractText:", err);
        throw err; // Rethrowing the error so it can be handled by the caller
    }
}

module.exports = { extractText };
