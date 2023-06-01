import microsoft from "./api/microsoftTranslate.mjs";
import gpt from "./api/gptTranslate.mjs";

async function runTest(func, name) {
    return await func({
        query: {
            text: "Hello, kill that zombie for me please"
        }
    },
    {
        send: function(result) {
            console.log(result);
            console.log(`${name} success`);
        }
    });
}

runTest(microsoft, "microsoft");
runTest(gpt, "gpt");