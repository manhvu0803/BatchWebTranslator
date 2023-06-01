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
        row.appendChild(getTextCell(`${id}_${lang}`, data[i].text));
        rowUpper.appendChild(getTextCell(`${id}_up_${lang}`, data[i].text.toUpperCase()));
        i++;
    }

    console.log(data);
}

function getTextCell(id, text) {
    var cell = document.getElementById(id);

    if (!cell) {
        cell = document.createElement("td");
        cell.id = `${id}_${lang}`;
    }

    cell.innerText = data[i].text;
    return cell;
}