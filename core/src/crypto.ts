import fs from "fs/promises"
import "dotenv/config"

export async function encrypt(value: string) {
    const key = Buffer.from(process.env.PV_KEY as string, "hex");

    const encodedKey = await crypto.subtle.importKey(
        "raw",
        key,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
    );
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(13))
    const encryptedBuffer = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv
    },
        encodedKey,
        encoder.encode(value)
    );
    return `${Buffer.from(iv).toString("hex")}:${Buffer.from(encryptedBuffer).toString("hex")}`
}

export async function decrypt(ciphertext: string) {
    const [iv, data] = ciphertext.split(":")
    const key = Buffer.from(process.env.PV_KEY as string, 'hex');
    const encodedKey = await crypto.subtle.importKey(
        "raw",
        key,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
    );
    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(iv, 'hex') }, encodedKey, Buffer.from(data, 'hex'))
    return Buffer.from(decryptedBuffer).toString('utf-8')
}
