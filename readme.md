# MPS localize tool

## Run
- To start server, use command `npm run start`
- The current node version is `v18.16.0`
- The example environment config is in [`.env.example`](.env.example)

## Project structure
### Entry point
[`index.mjs`](index.mjs): Express server entry point

### api folder
The server APIs is in. All APIs have a default export handler function. To enable them, add to index.mjs:
```
import <handler name> from "api/<API file name>"
app.get("/api/<route name>, <handler name>);
```
To call the translate API, use `GET <domain name>/api/<route name>` and pass the translate text inside request body

#### Microsoft API ([microsoftTranslate.mjs](api/microsoftTranslate.mjs))
This require 3 env variables:
- MICROSOFT_KEY
- MICROSOFT_ENDPOINT (for example "https://api.cognitive.microsofttranslator.com")
- MICROSOFT_LOCATION (for example "eastus2")

#### OpenAI API ([gptTranslate.mjs](api/gptTranslate.mjs))
This require an OPENAI_KEY env variable. However, the prompt logic is outdated. It is kept so that the static page cat fetch the API key

#### Google API ([googleTranslate.mjs](api/googleTranslate.mjs))
This depends on a public package and canbe unreliable, so it's not enabled

### public folder
Static resources for the localize page. The most recent prompt logic is in scripts/prompter.js