
import express, { type NextFunction, type Request, type Response } from 'express';
import { promptComponent } from '@repo/core/agent';
import { getSession } from "@repo/auth/express"
import authConfig from "@repo/auth/config"
import { getMemberRoleFromCookie } from "@repo/db/esm.handler"
import cookieParser from "cookie-parser"
import "dotenv/config"
const app = express();
app.use(cookieParser())
export async function authSession(req: Request, res: Response, next: NextFunction) {
    res.locals.session = await getSession(req,authConfig)
    next()
}
app.use(authSession)
app.post("/prompt", authenticatedUser, async (req, res) => {
    const body = req.body
    const source = body.get("source") as string;
    const provider = body.get("provider") as string;
    const model = body.get("model") as string;
    const prompt = body.get("prompt") as string;
    const session = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");
    const response = await promptComponent(provider, model, prompt, source);
    return res.json(response)
});

export async function authenticatedUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session = res.locals.session ?? (await getSession(req, authConfig))
    if (!session?.user) {
        return res.json({error:"Unauthenticated"}).status(401);
    } else {
        try {
            const projectId = req.cookies["selected-project"]
            const role = await getMemberRoleFromCookie(projectId, session.user.id)   
            if (role == "viewer") throw "Unauthorized"     
        } catch (error) {
            return res.json({error:"Unauthorized"}).status(401);
        }
        next()
    }
}



app.listen(3001)
console.log("listening on port 3001")