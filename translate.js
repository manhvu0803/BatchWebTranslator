const langs = ['de', 'en', "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"];

async function fetchGptKey() {
    let response = await fetch("https://microsoft-translate.vercel.app/api/gptTranslate?key=true")
    let key = await response.text();
    return key;
}

function translateInput() {
    console.log("Start translating");
    let input = document.getElementById("text_input").value;
    let temp = document.getElementById("temp_input").value;
    let tone = document.getElementById("tone_select").value;
    let needErrorChecking = false;
    outputData(langs, "microsoft_row", null, true);
    outputData(langs, "gpt_row", null, true);
    let { text, map: textMap } = prepocessText(input);
    fetchTranslation(`https://microsoft-translate.vercel.app/api/microsoftTranslate`, text, "microsoft_row", textMap);    
    processTranslation(fetchGpt(text, temp, tone, needErrorChecking), "gpt_row", textMap);
}

function prepocessText(text) {
    text = replaceColor(text);
    let map = new Map();
    let tags = text.match(/<.*?>/g);
    let code = 999;

    if (!tags) {
        return {text, map: null};
    }

    for (let tag of tags) {
        let wrapper = `<${code}>`;
        map.set(wrapper, tag);
        text = text.replaceAll(tag, wrapper);
        code--;
    }

    return {text, map};
}

function replaceColor(text) {
    var color = document.getElementById("color_input").value;
    text = text.replaceAll("((", `<color=${color}>`);
    text = text.replaceAll("))", `</color>`);
    return text;
}

async function fetchTranslation(url, text, id, textMap) {
    console.log(JSON.stringify({ content: text }));
    let response = await fetch(url, {
        method: "POST",
        body: text
    });
    processTranslation(response.json(), id, textMap);
}

async function processTranslation(promise, id, textMap) {
    try {
        let data = await promise;
        outputData(data, id, textMap);
    }
    catch (e) {
        alert(`Error: ${e} at ${id}`);
        console.error(e.stack);
    }
}