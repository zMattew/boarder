import { auth as middleware } from "@repo/auth/edge"
import { getMemberRoleFromCookie } from "@repo/db"

export default middleware(async (req) => {
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith("/home")) {
    if (!req.auth) return Response.redirect(req.nextUrl.origin + "/login")
    const projectId = req.cookies.get('selected-project')?.value
    const userId = req.auth.user?.id
    try {
      if (pathname.startsWith("/home/llms") || pathname.startsWith("/home/sources") || pathname.startsWith("/home/team") || pathname.startsWith("/home/projects/settings")) {
        const role = await getMemberRoleFromCookie(projectId, userId)
        if (role != "admin") return Response.redirect(req.nextUrl.origin + "/home")
      }
      if (pathname.startsWith("/home/new-component")) {
        const role = await getMemberRoleFromCookie(projectId, userId)
        if (role == "viewer") return Response.redirect(req.nextUrl.origin + "/home")
      }
      if (pathname.startsWith("/home/views/")) {
        const role = await getMemberRoleFromCookie(projectId, userId)
        if (pathname.startsWith("/home/views/create")) {
          if (role == "viewer") return Response.redirect(req.nextUrl.origin + "/home")
        }
        if (role == undefined) return Response.redirect(req.nextUrl.origin + "/home")
      }
    } catch {
      return Response.redirect(req.nextUrl.origin + "/home")
    }
  }
  if (pathname.startsWith("/login") && req.auth) {
    if (req.auth) return Response.redirect(req.nextUrl.origin + "/home")
  }
})

export const config = {
  matcher: ["/((?!api|data|_next/static|_next/image|favicon.ico).*)", "/home/:path", "/login"],
  runtime: "nodejs"
}
