import { NextResponse } from "next/server"

const COOKIE_NAME = "admin_session"

async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(process.env.ADMIN_PASSWORD || "")
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Buffer.from(digest).toString("hex")
}

export async function POST(req: Request) {
  const { password } = await req.json()
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE_NAME, await sessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
  return res
}
