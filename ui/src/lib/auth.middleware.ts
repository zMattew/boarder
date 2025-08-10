import {nextAuth} from "@repo/auth/middleware"
export * from "@repo/auth/middleware"
export const {auth,handlers,signIn,signOut} = {...nextAuth}