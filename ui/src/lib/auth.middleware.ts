import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import client from "@repo/db/client"
import authConfig from "@/auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(client),
    session: { strategy: "jwt" },
    ...authConfig
})

