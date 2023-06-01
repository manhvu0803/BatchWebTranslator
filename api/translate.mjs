import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from "dotenv";

if (!process?.env) {
    dotenv.config();
}

let key = process.env.KEY;
let endpoint = "https://api.cognitive.microsofttranslator.com";
let location = "eastus2";
let port = process.env.PORT || 3000;

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

export default async function handler(req, res) {
    let text = req.query.text;

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
