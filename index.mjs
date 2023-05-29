import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from "dotenv";
import express from "express";

dotenv.config();
let key = process.env.KEY;
let endpoint = "https://api.cognitive.microsofttranslator.com";
let location = "eastus2";
let port = process.env.PORT || 3000;

const app = express();

app.get("/", async (req, res) => {
    var translations = await translate(req.query.text)
    res.send(translations);
})

app.listen(port, () => console.log("Listening on port " + port));

async function translate(string) {
    let response = await axios({
        baseURL: endpoint,
        url: '/translate',
        method: 'post',
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Ocp-Apim-Subscription-Region': location,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString()
        },
        params: {
            'api-version': '3.0',
            'from': 'en',
            'to': ['de', 'en', "es", "fr", "id", "it", "ja", "ko", "pt", "ru", "th", "tr", "vi", "zh-Hans", "zh-Hant"]
        },
        data: [{
            'text': 'BOLLOCKS!'
        }],
        responseType: 'json'
    })
    
    return response.data[0].translations
}