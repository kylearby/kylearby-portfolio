import { NextResponse, type NextRequest } from "next/server";

/**
 * SITE GATE
 * ---------------------------------------------------------------------------
 * HTTP Basic Auth in front of everything, so the site can be live on its real
 * domain while the project copy is still placeholder. Deliberately built here
 * rather than switched on at the host: this travels with the code, so it works
 * the same on Vercel, Netlify, a preview URL or a laptop, and it does not
 * depend on a paid plan tier.
 *
 * Fails CLOSED. If the credentials are not configured the site serves a 503
 * and no content at all. The alternative — treating "unset" as "no gate" —
 * means a single missing environment variable on the host silently publishes
 * the whole site, which is the exact outcome this exists to prevent.
 *
 * Basic Auth sends the password on every request, so this is only private
 * over HTTPS. That is fine on any real host; it is not a reason to trust it
 * over plain HTTP.
 *
 * This is a "not ready for visitors" sign, not a security boundary. It keeps
 * the work-in-progress out of public view and out of search results; it is not
 * protecting secrets, and anything served here should be safe to hand to
 * whoever is given the password.
 */

/**
 * Compares without leaking, through timing, how much of the value matched.
 * `crypto.timingSafeEqual` is a Node API and middleware runs on the Edge
 * runtime, so the comparison is written out by hand.
 */
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function challenge() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      // `charset` so non-ASCII characters in a password are read correctly.
      "WWW-Authenticate": 'Basic realm="Private preview", charset="UTF-8"',
      // Belt and braces alongside the 401: never cache, never index.
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.SITE_USER;
  const expectedPassword = process.env.SITE_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return new NextResponse(
      "Site gate is not configured. Set SITE_USER and SITE_PASSWORD.",
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return challenge();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return challenge();
  }

  // Only the first colon separates the pair — passwords may contain colons.
  const separator = decoded.indexOf(":");
  if (separator === -1) return challenge();

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  // Both comparisons always run, so the response time does not reveal whether
  // it was the username or the password that was wrong.
  const userOk = safeEqual(user, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  if (!(userOk && passwordOk)) return challenge();

  const response = NextResponse.next();
  // Keep the whole preview out of search indexes even once past the gate.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Everything, including /_next assets and /public files. A gate over the
  // HTML alone would still leave images and chunks fetchable by direct URL.
  matcher: "/:path*",
};
