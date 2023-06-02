async function fetchGpt(text, temp, tone = "serious", errorChecking = true) {
    if (errorChecking) {
        text = await fetchGptErrorCheck(text);
    }

    let prompt2 = `Translate this: "${text}" into the languages below with a ${tone} tone, but keep the "\n" characters and any characters between <> brackets. format the output like the this:
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
    }`;
    
    let translations = await promptGpt(prompt2, temp);
    return parseTranslations(translations);
}

async function fetchGptErrorCheck(text) {
    let prompt1 = `Correct any error in this: "${text}", but keep the "\n" characters and any characters between <> brackets. Format the output like this:
    {
        "original": "",
        "corrected": ""
    }`;

    let data = await promptGpt(prompt1, temp);
    return data.corrected;
}

async function promptGpt(prompt, temp = 0.5) {    
    let body = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Answer as concisely as possible and no extra information"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: parseFloat(temp) ?? 0.5
    }
    
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent": "OpenAI/NodeJS/3.2.1",
        "Authorization": `Bearer ${openAiKey}`,
    }
    
    let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    })

    let data = await response.json();
    let content = data.choices[0].message.content;
    console.log(content);
    return JSON.parse(content.match(/{.+}/gs)[0]);
}

function parseTranslations(data) {
    var translations = data.translations;
    var result = [];

    for (let lang in translations) {
        result.push({
            text: translations[lang],
            to: lang
        });
    }

    return result;
}