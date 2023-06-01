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
    fetchTranslation(`https://microsoft-translate.vercel.app/api/gptTranslate?text=${input}&temp=${temp}`, "gpt_row");
}

async function fetchTranslation(url, id) {
    var row = document.getElementById(id);
    var rowUpper = document.getElementById(`${id}_up`);
    let response = await fetch(url);
    let data = await response.json();

    let i = 0;
    for (let lang in langs) {
        row.appendChild(getTextCell(`${id}_${lang}`, data[i].text));
        rowUpper.appendChild(getTextCell(`${id}_up_${lang}`, data[i].text.toUpperCase()));
        i++;
    }

    console.log(id);
    console.log(data);
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