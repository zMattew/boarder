
import express from 'express';
import { promptComponent } from './agent';
const app = express();

app.post("/prompt", async(req, res) => {
    const body = req.body
    const source = body.get("source") as string;
    const provider = body.get("provider") as string;
    const model = body.get("model") as string;
    const prompt = body.get("prompt") as string;
    const session = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");
    const response = await promptComponent(provider, model, prompt, source, session);
    return res.json(response)
});



app.listen(3000)
console.log("listening on port 3000")