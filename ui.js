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
        
        setTextCell(id, lang, unwrapHtmlTags(text, textMap));
        setTextCell(`${id}_up`, lang, unwrapHtmlTags(text.toUpperCase(), textMap));
        i++;
    }
}

function unwrapHtmlTags(text, textMap) {
    let tags = text.match(/<.*?>/g);

    if (!tags || !textMap) {
        return text;
    }

    for (let tag of tags) {
        text = text.replaceAll(tag, textMap.get(tag));
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
    for (let cell of cells) {
        str += `"${cell.innerText}"\t`;
    }
    navigator.clipboard.writeText(str);
}