import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, mintToken, safeEqual } from "@/lib/gate";

/**
 * SITE GATE
 * ---------------------------------------------------------------------------
 * Holds the site closed while the project write-ups are still placeholder,
 * behind a branded page at /enter rather than the browser's own auth dialog.
 *
 * This replaced an HTTP Basic Auth version. Basic Auth was rejected for two
 * reasons that no amount of styling fixes: the prompt is an unbrandable
 * operating-system dialog that renders before any of the site exists, and the
 * browser re-asks for it each session. A cookie set from a real page solves
 * both — it looks like the site, and it lasts 90 days.
 *
 * Fails CLOSED. With no password configured the site serves 503 and nothing
 * else. Treating "unset" as "no gate" means one missing environment variable
 * silently publishes the whole site, which is what this exists to prevent.
 *
 * This is a "not ready for visitors" sign, not a security boundary. Anything
 * served here should be safe to hand to whoever gets the password.
 */

export async function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  if (!password) {
    return new NextResponse(
      "Site gate is not configured. Set SITE_PASSWORD.",
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const presented = request.cookies.get(GATE_COOKIE)?.value;
  if (presented && safeEqual(presented, await mintToken(password))) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Rewrite rather than redirect: the visitor keeps the URL they asked for,
  // so a shared deep link still lands on that page once they are through,
  // and /enter never shows up in their history or the address bar.
  const url = request.nextUrl.clone();
  url.pathname = "/enter";
  url.search = "";
  const response = NextResponse.rewrite(url, { status: 401 });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  /**
   * Pages, not assets — and never /enter or the handler that sets the cookie,
   * which would be a loop.
   *
   * The asset exclusion is load-bearing and non-obvious. An earlier version
   * matched everything, which broke every image on the site: Next's image
   * optimizer serves /_next/image by fetching the source back off its own
   * origin over HTTP, and that internal request carries no cookie. It got the
   * gate page instead of a PNG and answered "400 — The requested resource
   * isn't a valid image". Authenticating in the browser never helped, because
   * the failing request was never the browser's.
   *
   * So someone who knows an exact asset URL can still fetch it. That is the
   * deliberate trade against a site with no images for everyone holding the
   * password.
   */
  matcher: [
    "/((?!enter|api/enter|_next/|favicon\.ico|.*\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$).*)",
  ],
};
