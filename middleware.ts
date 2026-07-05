import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "admin_session"

async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(process.env.ADMIN_PASSWORD || "")
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Buffer.from(digest).toString("hex")
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname === "/admin/login"
  const isLoginApi = pathname === "/api/admin/login"
  if (isLoginPage || isLoginApi) return NextResponse.next()

  const cookie = req.cookies.get(COOKIE_NAME)?.value
  const valid = !!cookie && cookie === (await sessionToken())

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
