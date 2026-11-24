"use client";

import { useState } from "react";

/**
 * The password field. Client-side only to manage its own pending and error
 * states — the password itself is never checked here. It is posted to
 * /api/enter and compared on the server, because anything shipped to the
 * browser to compare against would be readable in the bundle.
 */
export function EnterForm() {
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password || state === "checking") return;
    setState("checking");

    const response = await fetch("/api/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      // A full reload rather than a router push: the cookie has just been
      // set, and the page the visitor originally asked for has to be fetched
      // again through middleware for it to be honoured.
      window.location.reload();
      return;
    }
    setState("wrong");
  }

  return (
    <form onSubmit={onSubmit} className="mt-10">
      <div className="flex max-w-md flex-wrap items-stretch gap-3">
        <input
          type="password"
          name="password"
          autoFocus
          autoComplete="current-password"
          aria-label="Password"
          aria-invalid={state === "wrong"}
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (state === "wrong") setState("idle");
          }}
          className="
            min-w-0 flex-1 border border-line bg-surface px-4 py-3
            font-mono text-sm text-fg outline-none
            transition-colors placeholder:text-fg-subtle
            focus-visible:border-accent
            aria-[invalid=true]:border-accent-2
          "
        />
        <button
          type="submit"
          disabled={state === "checking" || !password}
          className="
            u-mono shrink-0 border border-accent bg-accent px-6 py-3
            text-on-accent transition-opacity
            hover:opacity-85 disabled:opacity-40
          "
        >
          {state === "checking" ? "checking…" : "enter"}
        </button>
      </div>

      {/* aria-live so the failure is announced, not only shown. */}
      <p
        aria-live="polite"
        className={`u-mono mt-3 text-accent-2 ${state === "wrong" ? "" : "invisible"}`}
      >
        That password isn&apos;t right.
      </p>
    </form>
  );
}
