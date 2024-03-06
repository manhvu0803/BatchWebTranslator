import express from "express";
import * as dotenv from 'dotenv';
import gptHandler from "./api/gptTranslate.mjs";
import microsoftHandler from "./api/microsoftTranslate.mjs";

if (!process.env.MICROSOFT_KEY) {
    dotenv.config();
}

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.static("public/pages"));
app.use(express.static("public/css"));
app.use(express.static("public/scripts"));

app.get("/api/gpt", gptHandler);
app.get("/api/microsoft", microsoftHandler);

app.listen(port, () => console.log("Listening on port " + port));