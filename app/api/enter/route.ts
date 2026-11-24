import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, GATE_MAX_AGE, mintToken, safeEqual } from "@/lib/gate";

/**
 * Verifies the password and issues the access cookie.
 *
 * A route handler rather than a Server Action because middleware has to let
 * this path through explicitly, and a stable URL is easier to exempt than an
 * action endpoint whose identifier changes between builds.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!safeEqual(submitted, expected)) {
    // A deliberate pause. Without it this endpoint answers in a millisecond
    // and can be tried thousands of times a minute; a second makes guessing
    // impractical while being invisible to someone typing the real password.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: GATE_COOKIE,
    value: await mintToken(expected),
    httpOnly: true,            // JavaScript on the page can never read it
    sameSite: "lax",
    // Only set `secure` in production: on http://localhost a secure cookie is
    // silently dropped, which would make the gate impossible to pass locally.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
  return response;
}
