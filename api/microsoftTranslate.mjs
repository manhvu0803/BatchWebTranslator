import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

if (!process.env.MICROSOFT_KEY) {
    dotenv.config();
}

let key = process.env.MICROSOFT_KEY;
let endpoint = "https://api.cognitive.microsofttranslator.com";
let location = "eastus2";

export default async function handler(req, res) {
    let text = req.body;

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
            'text': text
        }],
        responseType: 'json'
    })
    
    res.send(response.data[0].translations);
}
