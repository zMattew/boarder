import { auth as middleware } from "@repo/auth/edge"
import { antiBot } from "./lib/limiter"
import { userAgent } from "next/server"

export default middleware(async (req) => {
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith("/home") && !req.auth) {
    return Response.redirect(req.nextUrl.origin + "/login")
  }
  if (pathname.startsWith("/login") && req.auth) {
    if (req.auth) return Response.redirect(req.nextUrl.origin + "/home")
  }
})

export const config = {
  matcher: ["/((?!api|data|_next/static|_next/image|favicon.ico).*)", "/home/:path", "/login"],
  runtime: "nodejs"
}
