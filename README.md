# Kyle Arby — Portfolio

One-page editorial portfolio with per-project detail routes.
Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export of every route
```

---

## Adding your real images

**Every project currently renders generated artwork.** Nothing is broken and
nothing is missing — the abstract plates are a deliberate stand-in so the site
reads as finished before the photography lands. Swap them in one at a time; the
two systems coexist.

1. Drop files into `public/work/<slug>/`, e.g.

   ```
   public/work/dime-luxury-bags/cover.jpg
   public/work/dime-luxury-bags/01.jpg
   ```

   Slugs are listed in `lib/projects.ts` (`slug:` on each project).

2. Point the data at them in `lib/projects.ts`:

   ```ts
   {
     slug: "dime-luxury-bags",
     cover: "/work/dime-luxury-bags/cover.jpg",   // ← add this line
     gallery: [
       { src: "/work/dime-luxury-bags/01.jpg",    // ← and this one
         caption: "Monogram construction",
         motif: "orbit", seed: 22, ratio: "1/1" },
     ],
   }
   ```

`<Artwork>` switches to `next/image` the moment `src` is present — AVIF/WebP,
responsive `srcset`, lazy loading below the fold, and no layout shift because
every frame declares its aspect ratio. Leave `motif`/`seed` in place; they are
ignored once a real image exists, and they are your fallback if you remove it.

**Image sizing.** Covers want ~2400px on the long edge. The lead plate on a
project page renders at 21:9, so crop with that in mind.

---

## Editing content

| What | Where |
|---|---|
| Name, email, socials, stats, availability | `lib/site.ts` |
| Projects — titles, years, copy, galleries | `lib/projects.ts` |
| Bio, experience, awards, skills, services | `lib/content.ts` |
| Colour, type scale, spacing tokens | `app/globals.css` |
| Motion timing and easing | `lib/motion.ts` |

Project names, clients and years mirror your `/PROJECTS` folders. **All written
copy is placeholder** — the summaries, narratives, bio, awards and experience
entries are invented and should be rewritten before this goes live.

`site.url` in `lib/site.ts` is set to `https://kylearby.com`. Change it before
deploying, or the canonical URLs, sitemap and Open Graph tags will point at the
wrong host.

---

## The logo

`KYLEARBY_LOGO_Asset 1.png` is a two-tone lockup with the colour baked in —
`#181D27` for "Kyle Arby", `#D2D7DF` for "Santos". Shipped as-is it would
disappear against the dark background, so it was split into two tightly-cropped
alpha masks:

```
public/brand/logo-name.png     "Kyle Arby"  1977 × 431
public/brand/logo-santos.png   "Santos"     1367 × 333
```

Both carry shape only — RGB forced to white, original alpha preserved.
[components/ui/Logo.tsx](components/ui/Logo.tsx) paints them through
`mask-image` with `--c-fg` and `--c-logo-2`, so your letterforms are exact and
the colour follows the theme.

The two words overlap vertically by ~20px (the descenders of Kyle/Arby run past
the cap line of Santos), which is why they are separate masks rather than one
image sliced in half. Geometry in `Logo.tsx` is measured from the artwork — if
you replace the source, re-run the splitter rather than nudging those numbers.

`variant="lockup"` renders both lines; `variant="name"` renders just
"Kyle Arby", cropped to its own bounding box (navigation).

### The 3D version

The hero uses [Logo3D](components/ui/Logo3D.tsx) — the same masks, extruded
into an object you can pick up and turn. No WebGL and no 3D model: depth is
14 copies of each mask stacked along Z inside a `preserve-3d` context, each
mixed further toward the background so the extrusion reads as a shaded side
wall. The front face carries a diagonal gradient for the specular highlight.
It stays pure CSS, so it themes itself and stays crisp at any size.

The first drag unpins it from the grid. After that it moves freely anywhere
inside the hero, clamped by `dragConstraints` pointed at the section element.
Rotation is not steered — it is derived from drag velocity, so the object leans
into its own movement and settles flat when it stops. A soft accent glow trails
behind while it moves and clears the moment it is released.

Three things are load-bearing, not cosmetic:

- **Free drag is mouse-only.** A draggable element covering 75% of the hero
  would swallow vertical swipes and trap the page scroll on touch, so `drag` is
  gated behind `(pointer: fine)`. On touch the logo stays put.
- **`data-grabbing` on `<html>`.** A fast throw outruns the pointer, `pointerover`
  fires on whatever is underneath, and the cursor would flip from fist back to
  crosshair mid-drag. The attribute lets the cursor know a throw owns it.
- **Entrance animates opacity and `y` only.** `rotateX`/`rotateY` are
  spring-driven motion values; animating them via the `animate` prop makes the
  keyframe and the spring fight over the same value.

The glow has a floor (`GLOW_FLOOR`) so picking the object up registers even on
a slow, careful drag, and its spring is stiff enough to arrive during a quick
flick rather than after it.

The logo renders at 75% of the shell width at every breakpoint.

## Design system

Five brief colours plus one accent, defined once in `app/globals.css` and never
hardcoded anywhere else.

| Token | Light | Dark |
|---|---|---|
| `--c-bg` | `#FFFFFF` | `#181D27` Shadow Grey |
| `--c-line` | `#D2D7DF` Pale Slate | `#2F3746` |
| `--c-fg-muted` | `#66655A` | `#A3A598` |
| `--c-fg-subtle` | `#737266` | `#929387` |
| `--c-accent` | `#B4462A` Oxide | `#E08A63` |

Silver `#BDBBB0` and Grey Olive `#8A897C` are the raw palette entries the
neutral tones are derived from. The two `--c-fg-*` tokens are the palette
re-toned to clear WCAG AA — Grey Olive itself is only 3.5:1 on white, and these
tokens carry real content (years, categories, captions).

Dark mode is a separate set of values, not an inversion, and both were checked
independently:

| Pair | Light | Dark |
|---|---|---|
| Body text on background | 16.9:1 | 15.3:1 |
| Muted text on background | 5.9:1 | 6.8:1 |
| Subtle text on background | 4.9:1 | 5.4:1 |
| Accent on background | 5.5:1 | 6.4:1 |

Type is Satoshi (display) + General Sans (body), served from Fontshare with
`display=swap` and preconnect. The hero holds 72px → 120px at every viewport
width via `--text-display`.

---

## Motion

Every animated component calls Framer Motion's `useReducedMotion` and has a
still fallback. Under `prefers-reduced-motion: reduce`:

- Lenis smooth scroll is never instantiated; native scrolling takes over
- the custom cursor stands down and the system pointer returns
- the shuffling job title stops on the first entry
- the marquee holds still and stays readable
- the ambient background gradients do not render at all
- a global CSS rule collapses any remaining transition to ~0ms

All motion is `transform`/`opacity`/`clip-path` only — nothing animates
`width`, `height`, `top` or `left`, so no animation can trigger layout.

---

## Accessibility notes

- Skip link to `#main`, visible on focus
- `h1 → h2 → h3` outline with no skipped levels; section eyebrows are the `h2`s
- Focus rings are never removed — 2px accent outline at 3px offset
- Touch targets meet 44px; text-link lists use `-my-3 py-3` to grow the hit
  area without disturbing the visual rhythm
- The mobile menu is a labelled dialog, closes on Escape, and locks page scroll
- The shuffling title exposes only the current value to a polite live region
- Status is carried by text as well as colour throughout

## Structure

```
app/
  layout.tsx           fonts, metadata, JSON-LD, chrome
  page.tsx             the one-page scroll
  work/[slug]/page.tsx static project routes
  sitemap.ts robots.ts
components/
  chrome/              nav, cursor, scroll progress, smooth scroll, footer
  sections/            hero, work, stats, about, contact, marquee
  work/                project card, index, gallery
  ui/                  reveal, split text, magnetic, marquee, artwork, icons
  theme/               provider + toggle
lib/                   site, projects, content, motion tokens
```
