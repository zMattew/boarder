"use server"

import { headers } from "next/headers";
import { antiBot } from "./limiter";
import { signIn } from "./auth";
import { AuthError } from "./auth";

export async function login(formData: FormData) {
    try {
        const head = await headers()
        const ip = head.get('x-forwarded-for')?.split(',')[0].trim()
            || head.get('cf-connecting-ip')
            || head.get('x-vercel-forwarded-for')
            || "null";
        const { success } = await antiBot.limit(ip)
        if (!success) throw "Too many request"
        const pass = formData.get("password");
        const authType = pass ? "credentials" : "nodemailer";
        await signIn(authType, formData);
    } catch (error) {
        if (error instanceof AuthError) {
            return error.cause?.err?.message
        }
        return "success"
    }
}

export async function thirdPartyLogin(providerId: string) {
    try {
        const head = await headers()
        const ip = head.get('x-forwarded-for')?.split(',')[0].trim()
            || head.get('cf-connecting-ip')
            || head.get('x-vercel-forwarded-for')
            || "null";
        const { success } = await antiBot.limit(ip)
        if (!success) throw "Too many request"
        await signIn(providerId);
    } catch (error) {
        throw error
    }
}