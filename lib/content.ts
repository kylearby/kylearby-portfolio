/**
 * ABOUT CONTENT
 * Sourced from 25KYLE_SANTOS_RESUME_MECH_V002. Keep this in sync with the
 * resume — it is the single source of truth for dates, titles and awards.
 */

/**
 * Down to one line since the redesign: it now overlays the headshot directly
 * rather than running as a column of paragraphs beneath it, so there is only
 * room — and only need — for the opening statement. The `\n` is deliberate,
 * not incidental — it is what drives the two-line, offset-second-line stagger
 * of the overlay treatment, so this is presentation as much as copy.
 */
export const bio = ["I turn visions\ninto reality."];

/**
 * The About band. Replaced the full Experience list — three figures instead
 * of six job entries, on the principle that a portfolio's job is to make
 * someone want the résumé, not to be one.
 *
 * `figure` is the glitch target, so keep each one short and unspaced: the
 * effect fires per word, and "20+" as one token tears as a single unit the
 * way the marquee's words do.
 */
export const stats = [
  {
    figure: "3+",
    label: "Years as a Creative Director",
    note: "Lead visionary and strategist, from concept to execution.",
  },
  {
    figure: "8+",
    label: "Years as a Professional Designer",
    note: "Work spanning across print, digital, and industrial.",
  },
  {
    figure: "20+",
    label: "Years as an Artist",
    note: "Filipino is my first language, Art is my second.",
  },
];

export const experience = [
  {
    period: "2024 — Present",
    role: "Creative Director",
    org: "Dime Industries — Irvine, CA",
    note: "Lead creative vision and strategy across branding, advertising, merchandise, events and product. Oversee design from concept to execution — packaging, digital, print and retail displays.",
  },
  {
    period: "2023 — 2024",
    role: "3D Generalist",
    org: "Dime Industries — Irvine, CA",
    note: "Conceptualised products, packaging and marketing assets, and initiated the branding and 3D design effort across cross-channel campaigns.",
  },
  {
    period: "2022",
    role: "3D Footwear Designer",
    org: "Nike — Beaverton, OR",
    note: "Modelled and rendered footwear for the FA/SP 2024 SWDC collection with the Serena Williams Design Crew.",
  },
  {
    period: "2019 — 2022",
    role: "Campus Brand Ambassador",
    org: "Adobe — Long Beach, CA",
    note: "Promoted Creative Cloud across CSULB through software workshops, seminars and training.",
  },
  {
    period: "2018 — 2022",
    role: "Freelance Graphic Designer",
    org: "saintsisms — Anaheim, CA",
    note: "Design assets for corporate and individual clients — chalkboard menu layouts, logos, posters and merchandise graphics.",
  },
  {
    period: "2019",
    role: "Art Director",
    org: "CSULB Design Student Association",
    note: "Led the association's design committee across logos, posters, merchandise, social and events.",
  },
];

export const education = [
  {
    period: "2018 — 2022",
    school: "CSU Long Beach",
    place: "Long Beach, CA",
    detail: "B.S. Industrial Design",
  },
  {
    period: "2022",
    school: "Pensole Academy",
    place: "Detroit, MI",
    detail: "Footwear Design Masterclass",
  },
  {
    period: "2021",
    school: "Hongik University",
    place: "Seoul, South Korea",
    detail: "Industrial Design — Exchange Program",
  },
  {
    period: "2015 — 2018",
    school: "Cypress College",
    place: "Cypress, CA",
    detail: "A.A. Arts & Humanities, A.S. Science & Math",
  },
  {
    period: "2013 — 2015",
    school: "University of Santo Tomas",
    place: "Manila, PH",
    detail: "Architecture",
  },
];

/** `year` is optional — most of these are not tied to a single year. */
export const awards: { name: string; detail: string; year?: string }[] = [
  { name: "Magna Cum Laude", detail: "CSULB" },
  {
    name: "POPAI The Design Student Award",
    detail: "International Gold",
    year: "2021",
  },
  { name: "Duncan Anderson Scholar", detail: "CSULB" },
  { name: "President's Honor List", detail: "CSULB, Cypress College" },
  {
    name: "Outstanding Graduate of the Year Nominee",
    detail: "Cypress College",
  },
];

export const skills = [
  "Problem Solving",
  "Storytelling",
  "Ideation",
  "Branding",
  "Innovation",
];

export const tools = [
  "Adobe Creative Suite",
  "Blender",
  "Modo",
  "Solidworks",
  "Keyshot",
  "ZBrush",
  "Gravity Sketch",
  "Figma",
  "Procreate",
  "3D Printing",
  "Traditional Media",
  "MS Office",
];
