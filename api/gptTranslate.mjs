import { Configuration, OpenAIApi } from "openai";

if (!process.env.OPENAI_KEY) {
    dotenv.config();
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    console.log(`text: ${req.query.text}`);
    console.log(`temp: ${req.query.temp}`);
    var result = await prompt(req.query.text, req.query.temp)
    res.send(result);
}

async function prompt(text, temp, tone = "serious") {
    let completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible and no extra information"
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
    });

    console.log("response:");
    console.log(completion.data.choices[0].message.content);
    var result = [];
    var data = JSON.parse(completion.data.choices[0].message.content.match(/{.+}/gs));
    console.log("parsed data:");
    console.log(data);
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