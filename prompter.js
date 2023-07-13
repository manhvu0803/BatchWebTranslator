const SinglePromptLimit = 25;

// TODO: Multi-prompt split for long prompt
async function fetchGpt(text, temp, tone = "serious", errorChecking = true) {
    text = text.replaceAll("\n", "\\n");
    text = text.replaceAll(`"`, `\\"`);

    if (errorChecking) {
        text = await fetchGptErrorCheck(text, temp);
    }

    //let prompt = `Translate this: "${text}" into the languages below with a ${tone} tone, but but keep the sentence structure and anything between <> or {} brackets. Format the output like the this:`

    if (text.length <= SinglePromptLimit) {
        return fetchSinglePrompt(text, temp, tone);
    }
    else {
        return fetchMultiPrompt(text, temp, tone);
    }
}

async function fetchGptErrorCheck(text, temp) {
    let messages = [
        {
            role: "system",
            content: `The user will give you a text` 
            + ` You will try to correct grammar and type errors if possible. `
            + ` Do not change things inside <> and escape characters`
            + ` Then give the output in JSON format like this: `
            + `{"original":"original-text,"corrected":"corrected-text"}`
        },
        {
            role: "user",
            content: JSON.stringify(text)
        }
    ];
        
    let data = await parseAndPromptGpt(messages, temp);
    console.log(data);
    return data.corrected;
}

async function fetchSinglePrompt(text, temp, tone) {
    let prompt = {
        text: text,
        tone: tone,
        languages: ["de", "en", "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"]
    };

    let translations = await promptTranslateGpt(prompt, temp);
    return parseTranslations(translations, text);
}

async function fetchMultiPrompt(text, temp, tone) {
    let prompt1 = {
        text: text,
        tone: tone,
        languages: ["de", "en", "es", "fr", "id", "it", "ja", "ko"]
    };

    let prompt2 = {
        text: text,
        tone: tone,
        languages: ["en", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"]
    };
    
    let translations = await Promise.all([promptTranslateGpt(prompt1, temp), promptTranslateGpt(prompt2, temp)]);
    return parseTranslations(translations, text);
}

function promptTranslateGpt(prompt, temp = 0.5) {
    let messages = [
        {
            role: "system",
            content: `The user will give you a text, a tone for translating and a list of languages, delimited by JSON format.` 
            + ` You will translate it into the provided languages, do not translate things inside <>, keep intact the sentence structure and escape characters.`
            + ` Then give the output in JSON format like this: `
            + `{"translations":{"languages-code":"translation"}}`
        },
        {
            role: "user",
            content: JSON.stringify(prompt)
        }
    ];

    return parseAndPromptGpt(messages, temp)
}

async function parseAndPromptGpt(messages, temp = 0.5) {    
    let body = {
        model: "gpt-3.5-turbo",
        messages: messages,
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

    if (matchResult && matchResult.length > 0 && matchResult[0].length > 3) {
        try {
            let data = JSON.parse(matchResult[0]);
            str = data.text ?? data.translation ?? data.translatedText ?? data.translatedtext;   
        }
        catch (err) {
            console.log(`Cannot parsed the string ${matchResult[0]}`);
        }
    }

    matchResult = str.match(/^<.*?>$/gms);

    if (matchResult && matchResult.length == 1) {
        str = str.substring(1, str.length - 1);
    }

    if (str[str.length - 1] == "." && original[original.length - 1] != ".") {
        str = str.substring(0, str.length - 1)
    }

    return str;
}