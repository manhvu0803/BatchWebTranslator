var openAiKey = "";

async function registerEvents() {
    console.log("Load");
    var input = document.getElementById("text_input");
    
    // input.addEventListener("keypress", (event) => {
    //     if (event.key == "Enter") {
    //         event.preventDefault();
    //         document.getElementById("translate_button").click();
    //     }
    // });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

    openAiKey = await fetchGptKey();
}

function outputData(data, id, textMap, isLoading = false) {
    let i = 0;
    for (let trans of data) {
        let text = trans.text;
        let lang = trans.to;

        if (isLoading) {
            text = "Loading...";
            lang = trans;
        }

        // Replace encoded names
        var regex = new RegExp(`(${nameKey})\\d+`);
        regex.global = true;
        text = replaceText(text, textMap, regex);
        
        setTextCell(id, lang, unwrapHtmlTags(text, textMap));
        setTextCell(`${id}_up`, lang, unwrapHtmlTags(text.toUpperCase(), textMap));
        i++;
    }
}

function unwrapHtmlTags(text, textMap) {
    return replaceText(text, textMap, /<.*?>/g);
}

function replaceText(text, textMap, regex) {
    let matches = text.match(regex);

    if (!matches || !textMap) {
        return text;
    }

    for (let match of matches) {
        text = text.replaceAll(match, textMap.get(match));
    }

    return text;
}

function setTextCell(id, lang, text) {
    var cell = document.getElementById(`${id}_${lang}`);

    if (!cell) {
        cell = document.createElement("td");
        cell.id = `${id}_${lang}`;
        var row = document.getElementById(id);
        row.appendChild(cell);
    }

    cell.innerText = text;
    return cell;
}

function onTempChange(value) {
    document.getElementById("temp_input_label").innerText = `Temperature: ${value}`;
}

function copyToClipboard(id) {
    let row = document.getElementById(id);
    let cells = row.getElementsByTagName("td");
    let str = "";

    // Convert the output to excel-pastable text
    for (let cell of cells) {
        let text = cell.innerText.replaceAll("\"", "\"\"");
        str += `"${text}"\t`;
    }

    navigator.clipboard.writeText(str);
}