import Credentials from "@auth/core/providers/credentials"
import { encrypt } from "@repo/core/crypto"
import client from "@repo/db/client"
export const credentialProvider = Credentials({
    type: "credentials",
    credentials: {
        email: {
            type:"email"
        },
        password: {
            type:"password"
        }
    },
    async authorize({ email, password }) {
        let user = null

        // logic to salt and hash password
        const pwHash = await encrypt(password as string)

        // logic to verify if the user exists

        user = await client.user.findUnique({where:{email:email as string,password:{endsWith:pwHash.split(":")[1]}}})

        if (!user) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error("Invalid credentials.")
        }

        // return user object with their profile data
        return user
    }
})