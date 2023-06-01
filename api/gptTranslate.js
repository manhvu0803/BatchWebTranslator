const { Configuration, OpenAIApi } = require("openai");

if (!process?.env) {
    dotenv.config();
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    try {
        var result = await prompt(req.query.text, req.query.temp)
        res.send(result);
    }
    catch (error) {
        res.status(500);
        res.send(error);
    }
}

async function prompt(text, temp, tone = "normal") {
    let completion = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        prompt: `Correct any grammar error in the original_sentence, then translate into the languages below with a ${tone} tone, keep the "\n" characters and any characters inside <> brackets. format the output like the following
        {
        "original_sentence": "${text}",
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
        "vi": ""
        "zh-Hans": "",
        "zh-Hant": "",
        }
        }`,
        temperature: temp ?? 0.7
    });

    var result = [];
    var data = completion.data.choices[0].text.translations;

    for (let lang in data) {
        result.push({
            text: data.translations[lang],
            to: lang
        });
    }
    return result;
}