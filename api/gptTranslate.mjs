import axios from "axios";
import * as dotenv from "dotenv"

if (!process.env.OPENAI_KEY) {
    dotenv.config();
}

export default async function handler(req, res) {
    console.log(`text: ${req.query.text}`);
    console.log(`temp: ${req.query.temp}`);

    if (req.query.key) {
        res.send(process.env.OPENAI_KEY);
        return;
    }

    try {
        var result = await prompt(req.body, req.query.temp);
        res.send(result);
    }
    catch (error) {
        if (error.data) {
            console.log(error.data);
        }
        else {
            console.log(error)
        }

        res.status(500)
        res.send([]);
    }
}

async function prompt(text, temp, tone = "serious") {
    var body = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Answer as concisely as possible and no extra information"
            },
            {
                role: "user",
                content: `Correct any grammar error in this phrase: "${text}", then translate the the corrected phrase into the languages below with a ${tone} tone, keep the "\n" characters and any characters inside <> brackets. format the output like the following
                {
                "correction": "",
                "translations": {
                "de": "",
                "en": "",
                "es": "",
                "fr": "",
                "id": "",
                "it": "",
                "ja":"",
                "ko": "",
                "pt": "",
                "ru": "",
                "th": "",
                "tr": "",
                "vi": "",
                "zh-Hans": "",
                "zh-Hant": ""
                }
                }`
            }
        ],
        temperature: temp ?? 0.5
    }

    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent": "OpenAI/NodeJS/3.2.1",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
    }
    
    let response = await axios.post("https://api.openai.com/v1/chat/completions", body, { headers: headers });
    return parseResponse(response);
}

function parseResponse(response) {
    var data = response.data.choices[0];
    console.log("response:");
    console.log(data);
    var rawMessage = data.message.content;
    console.log("raw:");
    console.log(data);
    var filteredMessage = rawMessage.match(/{.+}/gs)[0];
    console.log("filtered:");
    console.log(filteredMessage);
    var message = JSON.parse(filteredMessage);
    var translations = message.translations;
    var result = [];

    for (let lang in translations) {
        result.push({
            text: translations[lang],
            to: lang
        });
    }

    console.log("return result");
    return result;
}