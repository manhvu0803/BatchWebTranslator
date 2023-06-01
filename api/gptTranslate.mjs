import axios from "axios";
import * as dotenv from "dotenv"

if (!process.env.OPENAI_KEY) {
    dotenv.config();
}

export default async function handler(req, res) {
    console.log(`text: ${req.query.text}`);
    console.log(`temp: ${req.query.temp}`);
    var result = await prompt(req.query.text, req.query.temp)
    res.send(result);
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
                "zh-Hant": "",
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
    
    try {
        let response = await axios.post("https://api.openai.com/v1/chat/completions", body, { headers: headers });
        return parseResponse(response);
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

function parseResponse(response) {
    console.log("response:");
    console.log(response);
    var result = [];
    var data = JSON.parse(response.data.choices[0].message.content.match(/{.+}/gs));
    var translations = data.translations;

    for (let lang in translations) {
        result.push({
            text: translations[lang],
            to: lang
        });
    }

    console.log("return result");
    return result;
}