import NextAuth, { type NextAuthResult } from "next-auth"
import authConfig from "./auth.config.ts"
import { PrismaAdapter } from "@repo/db/adapter"
import type { PrismaClient } from "@prisma/client"
import client from "@repo/db/client"

const result = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(client as unknown as PrismaClient),
})
export const auth: NextAuthResult['auth'] = result.auth;



