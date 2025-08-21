import { auth as middleware } from "./lib/auth"

export default middleware((req) => {
  if (req.nextUrl.pathname.startsWith("/home") && !req.auth) {
    return Response.redirect(req.nextUrl.origin + "/login")
  }
  if (req.nextUrl.pathname.startsWith("/login") && req.auth)
    return Response.redirect(req.nextUrl.origin + "/home")
})

export const config = {
  matcher: ["/((?!api|data|_next/static|_next/image|favicon.ico).*)", "/home/:path", "/login"],
  runtime: 'nodejs',
}
