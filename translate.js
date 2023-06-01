const langs = ['de', 'en', "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"];

async function microsoftTranslate() {
    var row = document.getElementById("microsft_row");
    var rowUpper = document.getElementById("microsft_row_up");

    let input = document.getElementById("text_input").value;
    let response = await fetch(`https://microsoft-translate-manhvu0803.vercel.app/api/translate?text=${input}`);
    let data = await response.json();

    let i = 0;
    let id = "microsft_row";
    for (let lang in langs) {
        var cell = document.createElement("td");
        cell.innerText = data[i].text;
        cell.id = `${id}_${lang}`;
        row.appendChild(cell);

        cell = document.createElement("td");
        cell.innerText = data[i].text.toUpperCase();
        cell.id = `${id}_up_${lang}`;
        rowUpper.appendChild(cell);
    }

    console.log(data);
}

function createCells(id) {
    let cells = [];
    for (let lang of langs) {
        var cell = document.createElement("td");
        cell.id = `${id}_${lang}`;
        cells.push(cell);
    }
    return cells;
}