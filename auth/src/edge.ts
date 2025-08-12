import NextAuth from "next-auth"
import authConfig from "./auth.config.ts"
import { PrismaAdapter } from "@auth/prisma-adapter"
import client from "@repo/db/client"

export const nextAuth = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(client),
})

