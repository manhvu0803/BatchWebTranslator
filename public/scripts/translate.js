const langs = ["de", "en", "es", "fr", "id", "it", "jp", "kr", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant", "hi", "ar"];
const langNames = ["German", "English", "Spanish", "French", "Indonesian", "Italian", "Japanese", "Korean", "Portugese", "Russian", "Thais", "Turkish", "Vietnamese", "Chinese (simple)", "Chinese (tradition)", "Hindi", "Arabic"];
var langEnabled = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false];

const nameKey = "a25ptx";
const keyUrl = "api/gpt?key=true"

async function fetchGptKey() {
    let response = await fetch(keyUrl);
    let key = await response.text();
    return key;
}

function flipEnableLang(lang) {
    let index = langs.indexOf(lang);

    if (index < 0) {
        return;
    }

    langEnabled[index] = !langEnabled[index];
    localStorage.setItem("enabledLanguages", JSON.stringify(langEnabled));
    resetLanguageRow();
}

function translateInput() {
    console.log("Start translating");
    let input = document.getElementById("text_input").value;
    let temp = document.getElementById("temp_input").value;
    let tone = document.getElementById("tone_select").value;
    let needErrorChecking = document.getElementById("error_correcting_input").checked;
    //outputData(langs, "microsoft_row", null, true);
    outputData(langs, "gpt_row", null, "Loading...");
    let { text, map: textMap } = prepocessText(input);
    //fetchTranslation(`https://microsoft-translate.vercel.app/api/microsoftTranslate`, text, "microsoft_row", textMap);    
    processTranslation(fetchGpt(text, temp, tone, needErrorChecking), "gpt_row", textMap);
}

function prepocessText(text) {
    text = replaceColor(text);
    let map = new Map();
    let tags = text.match(/<.*?>/g);

    if (tags && tags.length > 0) {
        let code = 999;
        for (let tag of tags) {
            let wrapper = `<${code}>`;
            map.set(wrapper, tag);
            text = text.replaceAll(tag, wrapper);
            code--;
        }    
    }

    let names = text.match(/--.+?--/g);

    if (names && names.length > 0) {
        let count = 0;
        for (let name of names) {
            let replacer = `${nameKey}${count}`;
            let str = name.substring(2, name.length - 2);
            map.set(replacer, str);
            map.set(replacer.toUpperCase(), str);
            map.set(`<${replacer}>`, str);
            map.set(`<${replacer.toUpperCase()}>`, str);
            text = text.replaceAll(name, replacer);
            count++;
        }
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
        console.error(e.stack);
        outputData(langs, id, null, "Error");
        alert(`Error: ${e.message ?? e} at ${id}`);
    }
}