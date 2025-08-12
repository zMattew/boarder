import {nextAuth} from "@repo/auth/edge"
export * from "@repo/auth/edge"
export const {auth,handlers,signIn,signOut} = {...nextAuth}