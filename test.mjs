import microsoft from "./api/microsoftTranslate.mjs";
import gpt from "./api/gptTranslate.mjs";
import google from "./api/googleTranslate.mjs";
import { writeFileSync } from "fs"

async function runTest(func, name) {
    try {
        return await func(
            {
                query: {
                    text: "kill the zombie",
                    temp: 0.5,
                    debug: false
                },
                body: "kill the zombie"
            },
            {
                send: (result) => {
                    console.log(`${name} success`);
                    writeFileSync(`./test_dump/${name}_result.json`, JSON.stringify(result, null, "\t"));
                }
            }
        );
    }
    catch (e) {
        console.log(`${name} failed`);
        console.log(e);
        writeFileSync(`./test_dump/${name}_error.json`, JSON.stringify(e, null, "\t"));
    }
}

runTest(microsoft, "microsoft");
runTest(gpt, "gpt");
runTest(google, "google")