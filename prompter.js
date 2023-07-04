const SinglePromptLimit = 25;

// TODO: Multi-prompt split for long prompt
async function fetchGpt(text, temp, tone = "serious", errorChecking = true) {
    text = text.replaceAll("\n", "\\n");
    text = text.replaceAll(`"`, `\\"`);

    if (errorChecking) {
        text = await fetchGptErrorCheck(text);
    }

    let prompt = `Translate this: "${text}" into the languages below with a ${tone} tone, but but keep the sentence structure and anything between <> or {} brackets. Format the output like the this:`

    if (text.length <= SinglePromptLimit) {
        return fetchSinglePrompt(prompt, temp, text);
    }
    else {
        return fetchMultiPrompt(prompt, temp, text);
    }
}

async function fetchGptErrorCheck(text) {
    let prompt1 = `Correct any error in this: "${text}", but keep the sentence structure and any characters between <> brackets. Do not add period to the end if the original doesn't have it. Format the output like this:
    {
        "original": "",
        "corrected": ""
    }`;

    let data = await promptGpt(prompt1, temp);
    return data.corrected;
}

async function fetchSinglePrompt(prompt, temp, ogText) {
    let prompt2 = `${prompt}
    {
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
    return parseTranslations(translations, ogText);
}

async function fetchMultiPrompt(prompt, temp, ogText) {
    let prompt2 = `${prompt}
    {
    "translations": {
    "de": "",
    "en": "",
    "es": "",
    "fr": "",
    "id": "",
    "it": ""
    }
    }`;
    
    let prompt3 = `${prompt}
    {
    "translations": {
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
    
    let translations = await Promise.all([promptGpt(prompt2, temp), promptGpt(prompt3, temp)]);
    return parseTranslations(translations, ogText);
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

    if (data.error) {
        throw new Error(data.error.message);
    }

    let content = data.choices[0].message.content;
    console.log(content);
    return JSON.parse(content.match(/{.+}/gs)[0]);
}

function parseTranslations(data, original) {
    var result = [];

    if (Array.isArray(data)) {
        for (let batch of data) {
            result = result.concat(parseBatchTranslation(batch, original));
        }
    }
    else {
        result = parseBatchTranslation(data, original);
    }

    return result;
}

function parseBatchTranslation(batch, original) {
    let result = [];
    var translations = batch.translations;
    for (let lang in translations) {
        result.push({
            text: sanitizeTranslation(translations[lang], original),
            to: lang
        });
    }
    return result; 
}

function sanitizeTranslation(str, original) {
    // TODO: replace default quotation mark with localized quotation mark
    str = str.replace(`\\"`, `"`).replace(/\\\\u003c/gi, `<`).replace(/\\\\u003e/gi, `>`);
    var matchResult = str.match(/{.+}/gs);

    if (matchResult && matchResult.length > 0) {
        let data = JSON.parse(matchResult[0]);
        str = data.text ?? data.translation ?? data.translatedText ?? data.translatedtext;
    }

    matchResult = str.match(/<.*?>/gms);

    if (matchResult && matchResult.length == 1) {
        str = str.substring(1, str.length - 1);
    }

    if (str[str.length - 1] == "." && original[original.length - 1] != ".") {
        str = str.substring(0, str.length - 1)
    }

    return str;
}