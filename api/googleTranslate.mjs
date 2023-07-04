import { translate } from "@vitalets/google-translate-api"
import authorize from "../authorization.mjs"

const langs = ['de', 'en', "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh_Hans", "zh_Hant"];

export default async function handler(req, res) {
    if (!authorize(req, res)) {
        return;
    }
    
    let results = [];
    let promises = [];

    for (let lang of langs) {
        let promise = translate(req.body, { to: lang }).then((res) => results.push({ text: res.text, to: lang }));
        promises.push(promise);
    }

    try {
        await Promise.all(promises);
    }
    catch (err) {
        console.error(err);
    }

    res.send(results);
}
