/**
 * SITE GATE — shared token logic
 * ---------------------------------------------------------------------------
 * The cookie cannot simply say "allowed" — anyone could set that themselves
 * from devtools. It carries an HMAC of a fixed phrase keyed by the password,
 * so a valid cookie can only be produced by something that knows the password.
 * Verification recomputes it and compares, which keeps the whole thing
 * stateless: no sessions to store, no database, and it survives redeploys.
 *
 * Web Crypto rather than node:crypto because middleware runs on the Edge
 * runtime, where node:crypto does not exist. Web Crypto is available in both
 * places, so middleware and the route handler share this one implementation.
 */

export const GATE_COOKIE = "ka_access";

/** 90 days: long enough that nobody re-enters the password in practice. */
export const GATE_MAX_AGE = 60 * 60 * 24 * 90;

export async function mintToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("kylearby-site-access-v1")
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent compare, so timing never reveals how much matched. */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
