const langs = ['de', 'en', "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"];

function registerEvents() {
    console.log("Load");
    var input = document.getElementById("text_input");
    
    input.addEventListener("keypress", (event) => {
        if (event.key == "Enter") {
            event.preventDefault();
            document.getElementById("translate_button").click();
        }
    });
}

function translateInput() {
    console.log("Start translating");
    let input = document.getElementById("text_input").value;
    let temp = document.getElementById("temp_input").value;
    fetchTranslation(`https://microsoft-translate.vercel.app/api/microsoftTranslate?text=${input}`, "microsoft_row");
    fetchGpt(input, temp);
}

async function fetchTranslation(url, id) {
    let response = await fetch(url);
    let data = await response.json();
    outputData(data, id);
}

async function fetchGpt(text, temp, tone = "serious") {
    let body = {
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
        temperature: parseFloat(temp) ?? 0.5
    }
    
    let openAiKey = await fetchGptKey();

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

    var data = await response.text();
    outputData(parseResponse(data), "gpt_row");
}

async function fetchGptKey() {
    let response = await fetch("https://microsoft-translate.vercel.app/api/gptTranslate?key=true")
    let key = await response.text();
    return key;
}

function parseResponse(data) {
    var filteredMessage = data.match(/{.+}/gs);
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

    return result;
}

function outputData(data, id) {
    console.log(id);
    console.log(data);
    var row = document.getElementById(id);
    var rowUpper = document.getElementById(`${id}_up`);

    let i = 0;
    for (let lang in langs) {
        row.appendChild(getTextCell(`${id}_${lang}`, data[i].text));
        rowUpper.appendChild(getTextCell(`${id}_up_${lang}`, data[i].text.toUpperCase()));
        i++;
    }
}

function getTextCell(id, text) {
    var cell = document.getElementById(id);

    if (!cell) {
        cell = document.createElement("td");
        cell.id = id;
    }

    cell.innerText = text;
    return cell;
}