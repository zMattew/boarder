"use server"

import client from "@repo/db/client"
import { auth, signOut } from "./auth"
import { decrypt, encrypt } from "@repo/core/crypto"
import { actionLimiter } from "./limiter"

export async function setPassword(password: string, confirm: string, currPassword?: string) {
    const session = await auth()
    if (!session?.user?.id) throw "Unauthorized"
    const { success } = await actionLimiter.limit(session?.user?.id)
    if (!success) throw "Too many request"
    if (password !== confirm) throw "Passwords do not match"
    const user = await client.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) throw "Unauthorized"
    if (user?.password) {
        const decryptedPassword = await decrypt(user?.password)
        if (decryptedPassword == currPassword) {
            const newPassword = await encrypt(password)
            await client.user.update({ where: { id: session.user.id }, data: { password: newPassword } })
        } else throw "Passwords do not match"
    } else {
        const newPassword = await encrypt(password)
        await client.user.update({ where: { id: session.user.id }, data: { password: newPassword } })
    }
}

export async function deleteUser() {
    const session = await auth()
    if (!session?.user?.id) throw "Unauthorized"
    const user = await client.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) throw "Unauthorized"
    await client.user.delete({ where: { id: session.user.id } })
    await signOut()
}