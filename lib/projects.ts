/**
 * PROJECT DATA
 * ---------------------------------------------------------------------------
 * Project names, clients and years are real (mirrored from /PROJECTS).
 * The written copy is placeholder — rewrite `summary`, `intro` and `body`.
 *
 * IMAGES: every project renders generated editorial artwork until you supply
 * a real one. To use a real image, drop a file at
 *
 *     public/work/<slug>/cover.jpg          →  set `cover: "/work/<slug>/cover.jpg"`
 *     public/work/<slug>/01.jpg             →  set `src` on a gallery frame
 *
 * Nothing else needs to change; <Artwork /> swaps to next/image automatically.
 */

export type Motif = "aperture" | "strata" | "field" | "monolith" | "orbit";
export type Ratio = "4/5" | "3/4" | "1/1" | "16/10" | "21/9";

export type Frame = {
  /** Optional real image. Falls back to generated artwork when absent. */
  src?: string;
  caption: string;
  motif: Motif;
  seed: number;
  ratio: Ratio;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  client: string;
  category: string;
  year: string;
  roles: string[];
  summary: string;
  intro: string;
  body: string[];
  featured: boolean;
  /** Controls how much room the card claims in the editorial grid. */
  span: "hero" | "wide" | "tall" | "standard";
  cover?: string;
  motif: Motif;
  seed: number;
  facts: { label: string; value: string }[];
  gallery: Frame[];
};

export const projects: Project[] = [
  {
    slug: "nike-swdc",
    index: "01",
    title: "SWDC",
    client: "Nike",
    category: "Creative Direction",
    year: "2023",
    roles: ["Creative Direction", "3D Environment", "Art Direction"],
    summary:
      "A competition identity built around movement — typography that accelerates, environments that hold their breath.",
    intro:
      "Nike's Sport Wear Design Challenge needed a visual system that could live on a screen, a wall and a stage without losing its nerve.",
    body: [
      "The brief asked for a competition identity. What it actually needed was a way to make design process feel like sport — tension, tempo, the moment before a result.",
      "We built the system around a single behaviour: acceleration. Type compresses as it moves. Environments stay still so the work can move through them. Every surface was designed as a frame first and a graphic second.",
      "The result runs across broadcast stings, physical stage design and a submission platform used by several hundred entrants.",
    ],
    featured: true,
    span: "hero",
    motif: "monolith",
    seed: 11,
    facts: [
      { label: "Client", value: "Nike" },
      { label: "Scope", value: "Identity, environment, broadcast" },
    ],
    gallery: [
      { caption: "Stage architecture study", motif: "monolith", seed: 12, ratio: "16/10" },
      { caption: "Type in motion — compression frames", motif: "strata", seed: 13, ratio: "4/5" },
      { caption: "Environment render, hall B", motif: "aperture", seed: 14, ratio: "4/5" },
      { caption: "Broadcast lower-third system", motif: "field", seed: 15, ratio: "16/10" },
    ],
  },
  {
    slug: "dime-luxury-bags",
    index: "02",
    title: "The Travel Collection",
    client: "Dime",
    category: "Campaign",
    year: "2026",
    roles: ["Art Direction", "Product Design", "Campaign"],
    summary:
      "Monogrammed leather, photographed like architecture. A collection launch with no hurry in it.",
    intro:
      "A travel collection launch — backpack, crossbody, weekender — treated as a single continuous object study.",
    body: [
      "Luxury launches usually shout. This one whispers: one object per frame, one light source, no styling that the leather did not earn.",
      "The monogram was redrawn to survive at two scales — a hardware stamp barely eight millimetres across, and a full-panel repeat. Everything between those two extremes is a derivative.",
      "Shipped as a film set, a lookbook and an e-commerce library of four hundred assets.",
    ],
    featured: true,
    span: "tall",
    motif: "aperture",
    seed: 21,
    facts: [
      { label: "Client", value: "Dime" },
      { label: "Scope", value: "Monogram, campaign, film" },
      { label: "Pieces", value: "6 SKUs" },
    ],
    gallery: [
      { caption: "Monogram construction", motif: "orbit", seed: 22, ratio: "1/1" },
      { caption: "Weekender — hardware detail", motif: "aperture", seed: 23, ratio: "4/5" },
      { caption: "Crossbody, campaign still", motif: "monolith", seed: 24, ratio: "4/5" },
      { caption: "Repeat panel at 1:1", motif: "field", seed: 25, ratio: "16/10" },
    ],
  },
  {
    slug: "daniel-arsham",
    index: "03",
    title: "Eroded Futures",
    client: "Daniel Arsham",
    category: "Poster Series",
    year: "2023",
    roles: ["Art Direction", "Print"],
    summary:
      "Three posters for an automotive series — erosion treated as a typographic material, not a filter.",
    intro:
      "A print series accompanying an automotive exhibition, where the type decays at the same rate as the subject.",
    body: [
      "Arsham's work is about geology doing what time does. The posters had to earn that idea rather than illustrate it.",
      "We cut the letterforms from the same crystalline structure used in the sculptures, then printed them at a scale where the erosion reads as texture from across a room and as damage from a metre away.",
      "Edition of 300, screen-printed on 300gsm uncoated stock.",
    ],
    featured: true,
    span: "standard",
    motif: "strata",
    seed: 31,
    facts: [
      { label: "Client", value: "Daniel Arsham" },
      { label: "Scope", value: "Poster series, print production" },
      { label: "Edition", value: "300" },
    ],
    gallery: [
      { caption: "Poster I", motif: "strata", seed: 32, ratio: "3/4" },
      { caption: "Poster II", motif: "monolith", seed: 33, ratio: "3/4" },
      { caption: "Installed, gallery wall", motif: "field", seed: 34, ratio: "16/10" },
    ],
  },
  {
    slug: "nike-pensole",
    index: "04",
    title: "Fencing Shoe",
    client: "Nike × Pensole",
    category: "Footwear",
    year: "2022",
    roles: ["Concept", "3D", "Art Direction"],
    summary:
      "A performance silhouette developed at Pensole — designed on the piste, rendered in the round.",
    intro:
      "A footwear concept for fencing, developed through the Pensole Academy programme with Nike.",
    body: [
      "Fencing loads a shoe unevenly — the front foot lands, the back foot drags. The silhouette had to be honest about that asymmetry rather than hide it.",
      "Development ran through physical last modification, then into a full 360° render pipeline so the asymmetry could be reviewed from any angle before a sample existed.",
      "Presented to the Nike design team as a complete concept package.",
    ],
    featured: true,
    span: "standard",
    motif: "orbit",
    seed: 41,
    facts: [
      { label: "Client", value: "Nike × Pensole" },
      { label: "Scope", value: "Concept, 3D, presentation" },
      { label: "Programme", value: "Pensole Academy" },
    ],
    gallery: [
      { caption: "360° study, black ground", motif: "orbit", seed: 42, ratio: "1/1" },
      { caption: "Lateral profile", motif: "monolith", seed: 43, ratio: "16/10" },
      { caption: "Outsole tooling", motif: "field", seed: 44, ratio: "4/5" },
    ],
  },
  {
    slug: "dime-hof-2024",
    index: "05",
    title: "Hall of Fame 2024",
    client: "Dime",
    category: "Experiential",
    year: "2024",
    roles: ["Environment", "Creative Direction"],
    summary:
      "A trade booth built as a room you walk through rather than a wall you walk past.",
    intro:
      "Booth and environment design for Dime's 2024 Hall of Fame activation.",
    body: [
      "Most booths are a backdrop with a table in front. This one was planned as circulation: an entry, a turn, a reveal, an exit.",
      "The product sits in the turn — you cannot reach the exit without meeting it. Everything else is deliberately quiet so the turn does the work.",
      "Delivered as construction drawings, a materials specification and a full render set.",
    ],
    featured: true,
    span: "wide",
    motif: "field",
    seed: 51,
    facts: [
      { label: "Client", value: "Dime" },
      { label: "Scope", value: "Booth design, wayfinding" },
      { label: "Footprint", value: "20 × 20 ft" },
    ],
    gallery: [
      { caption: "Approach view", motif: "field", seed: 52, ratio: "16/10" },
      { caption: "Interior turn", motif: "aperture", seed: 53, ratio: "4/5" },
      { caption: "Plan and circulation", motif: "strata", seed: 54, ratio: "4/5" },
    ],
  },
  {
    slug: "kyta",
    index: "06",
    title: "Identity System",
    client: "KYTA",
    category: "Brand Identity",
    year: "2025",
    roles: ["Identity", "Design System"],
    summary:
      "A wordmark with one moving part, and a system disciplined enough to leave it alone.",
    intro:
      "Full brand identity for KYTA — mark, type system, motion behaviour and application guidance.",
    body: [
      "The wordmark carries a single custom ligature. Everything else in the system is standard-issue on purpose, so that ligature never has to compete.",
      "We wrote the guidelines as a set of permissions rather than prohibitions — what the brand is allowed to do, in what order.",
      "Delivered with a 60-page system document and a component library.",
    ],
    featured: true,
    span: "standard",
    motif: "aperture",
    seed: 61,
    facts: [
      { label: "Client", value: "KYTA" },
      { label: "Scope", value: "Identity, guidelines" },
      { label: "Deliverable", value: "60pp system" },
    ],
    gallery: [
      { caption: "Wordmark, ligature detail", motif: "aperture", seed: 62, ratio: "16/10" },
      { caption: "Type system specimen", motif: "strata", seed: 63, ratio: "4/5" },
      { caption: "Applications", motif: "field", seed: 64, ratio: "4/5" },
    ],
  },
  {
    slug: "dime-gummies",
    index: "07",
    title: "Gummies",
    client: "Dime",
    category: "Packaging",
    year: "2025",
    roles: ["Packaging", "Illustration"],
    summary: "Confection packaging that holds its colour without raising its voice.",
    intro: "A packaging range for Dime's confection line, across six flavours.",
    body: [
      "Six flavours, six colours, one structure. The colour does all the differentiating so the layout never has to change.",
      "Printed on uncoated board with a single spot fluorescent — the only loud thing in the system, and it appears once per pack.",
    ],
    featured: false,
    span: "standard",
    motif: "field",
    seed: 71,
    facts: [
      { label: "Client", value: "Dime" },
      { label: "Scope", value: "Packaging range" },
      { label: "SKUs", value: "6" },
    ],
    gallery: [
      { caption: "Range, front faces", motif: "field", seed: 72, ratio: "16/10" },
      { caption: "Structure and dieline", motif: "strata", seed: 73, ratio: "4/5" },
    ],
  },
  {
    slug: "greenmart",
    index: "08",
    title: "Store System",
    client: "Greenmart",
    category: "Retail Identity",
    year: "2024",
    roles: ["Identity", "Retail", "3D"],
    summary:
      "A grocery identity designed from the shelf outwards — legible at four metres, warm at forty centimetres.",
    intro:
      "Retail identity and in-store system for Greenmart, including dimensional signage and shelf architecture.",
    body: [
      "Grocery is read at two distances and almost nothing in between. The system was drawn twice — once for the aisle, once for the hand — and the two versions share only their colour.",
      "The dimensional mark was modelled and rendered before fabrication so the lighting could be signed off against the real store ceiling height.",
    ],
    featured: false,
    span: "standard",
    motif: "monolith",
    seed: 81,
    facts: [
      { label: "Client", value: "Greenmart" },
      { label: "Scope", value: "Identity, signage, retail" },
      { label: "Format", value: "In-store system" },
    ],
    gallery: [
      { caption: "Dimensional mark", motif: "monolith", seed: 82, ratio: "1/1" },
      { caption: "Shelving corner", motif: "field", seed: 83, ratio: "16/10" },
    ],
  },
  {
    slug: "y3-retail-display",
    index: "09",
    title: "Retail Display",
    client: "Y-3",
    category: "Fixture Design",
    year: "2022",
    roles: ["Fixture Design", "Art Direction"],
    summary: "A display fixture that reads as sculpture until you need it to hold a shoe.",
    intro: "In-store fixture and display design for Y-3.",
    body: [
      "The fixture had to work in three store formats without being redrawn for any of them — so it was designed as a single repeated element rather than a bespoke object.",
      "Blackened steel, one fixing type, no visible hardware.",
    ],
    featured: false,
    span: "standard",
    motif: "strata",
    seed: 91,
    facts: [
      { label: "Client", value: "Y-3" },
      { label: "Scope", value: "Fixture design" },
      { label: "Material", value: "Blackened steel" },
    ],
    gallery: [
      { caption: "Fixture, three-quarter", motif: "strata", seed: 92, ratio: "4/5" },
      { caption: "In situ", motif: "aperture", seed: 93, ratio: "16/10" },
    ],
  },
  {
    slug: "dicesaic",
    index: "10",
    title: "Modular Mark",
    client: "Dicesaic",
    category: "Identity",
    year: "2024",
    roles: ["Identity", "Product"],
    summary: "A modular mark for a modular product — the logo is assembled the same way the object is.",
    intro: "Brand identity and product graphics for Dicesaic.",
    body: [
      "The product is built from repeating units, so the mark is too. Six modules, one rule for how they may meet.",
      "That rule produces roughly forty valid lockups, of which the brand uses five.",
    ],
    featured: false,
    span: "standard",
    motif: "orbit",
    seed: 101,
    facts: [
      { label: "Client", value: "Dicesaic" },
      { label: "Scope", value: "Identity, product graphics" },
      { label: "Modules", value: "6" },
    ],
    gallery: [
      { caption: "Module set", motif: "orbit", seed: 102, ratio: "1/1" },
      { caption: "Valid lockups", motif: "field", seed: 103, ratio: "16/10" },
    ],
  },
  {
    slug: "dime-bike-decal",
    index: "11",
    title: "Stunt Bike Livery",
    client: "Dime",
    category: "Livery",
    year: "2025",
    roles: ["Graphics", "Application"],
    summary: "Decal graphics for a stunt bike — drawn to survive being ridden, not photographed.",
    intro: "A full livery for Dime's stunt bike programme.",
    body: [
      "Livery on a stunt bike gets destroyed. The graphics were drawn so that partial destruction still reads as the brand — no element depends on any other element surviving.",
      "Cut vinyl, applied in five pieces.",
    ],
    featured: false,
    span: "standard",
    motif: "field",
    seed: 111,
    facts: [
      { label: "Client", value: "Dime" },
      { label: "Scope", value: "Livery, application" },
      { label: "Material", value: "Cut vinyl" },
    ],
    gallery: [
      { caption: "Applied livery", motif: "field", seed: 112, ratio: "16/10" },
      { caption: "Decal artwork", motif: "strata", seed: 113, ratio: "4/5" },
    ],
  },
  {
    slug: "logofolio",
    index: "12",
    title: "Logofolio",
    client: "Various",
    category: "Marks",
    year: "2021—2026",
    roles: ["Identity", "Lettering"],
    summary: "Marks, monograms and wordmarks. Five years of them, arranged by weight.",
    intro: "A running collection of identity marks made across client and personal work.",
    body: [
      "Some of these shipped, some did not. They are collected here because a mark is easier to judge next to other marks than alone in a deck.",
      "Arranged by optical weight rather than by date or client.",
    ],
    featured: false,
    span: "wide",
    motif: "orbit",
    seed: 121,
    facts: [
      { label: "Client", value: "Various" },
      { label: "Scope", value: "Marks, monograms" },
      { label: "Count", value: "40+" },
    ],
    gallery: [
      { caption: "Plate 01", motif: "orbit", seed: 122, ratio: "16/10" },
      { caption: "Plate 02", motif: "field", seed: 123, ratio: "16/10" },
    ],
  },
  {
    slug: "multimedia-art",
    index: "13",
    title: "Multimedia Studies",
    client: "Personal",
    category: "Mixed Media",
    year: "2026",
    roles: ["Personal Work"],
    summary: "Sketches, scans and material tests. The room where the client work starts.",
    intro: "Ongoing personal work — drawing, collage, scanning, and whatever else is on the desk.",
    body: [
      "None of this is briefed and none of it is for anyone. It is where the language for the commissioned work gets worked out first.",
      "Updated whenever there is enough of it to be worth looking at.",
    ],
    featured: false,
    span: "standard",
    motif: "strata",
    seed: 131,
    facts: [
      { label: "Client", value: "Personal" },
      { label: "Scope", value: "Mixed media" },
      { label: "Status", value: "Live" },
    ],
    gallery: [
      { caption: "Sketch sequence", motif: "strata", seed: 132, ratio: "4/5" },
      { caption: "Material test", motif: "aperture", seed: 133, ratio: "4/5" },
    ],
  },
];

/* ---------------------------------------------------------------------------
   BLOCK COLOURS
   Each project claims a full-bleed colour block. Colour is assigned by
   position rather than stored per project, so reordering the list re-stripes
   the page automatically and no two neighbours ever share a colour.

   `fg` is not a style choice — it is the only text colour that clears WCAG AA
   on that background. The saturated blocks are all light, so they take ink.
--------------------------------------------------------------------------- */

export const BLOCK_SEQUENCE = [
  "orange",
  "paper",
  "slate",
  "yellow",
  "char",
  "green",
] as const;

export type BlockName = (typeof BLOCK_SEQUENCE)[number];

export const BLOCK_STYLE: Record<
  BlockName,
  { bg: string; fg: string; rule: string }
> = {
  orange: { bg: "#ff6200", fg: "#000000", rule: "rgba(0,0,0,0.22)" },
  paper: { bg: "#ffffff", fg: "#000000", rule: "rgba(0,0,0,0.14)" },
  slate: { bg: "#2e3538", fg: "#ffffff", rule: "rgba(255,255,255,0.18)" },
  yellow: { bg: "#ffdd00", fg: "#000000", rule: "rgba(0,0,0,0.22)" },
  char: { bg: "#333333", fg: "#ffffff", rule: "rgba(255,255,255,0.18)" },
  green: { bg: "#00ff77", fg: "#000000", rule: "rgba(0,0,0,0.22)" },
};

export function blockFor(index: number) {
  return BLOCK_STYLE[BLOCK_SEQUENCE[index % BLOCK_SEQUENCE.length]];
}

/**
 * A project's colour, resolved from its own slug. Featured projects are
 * striped in featured order — that is the order the blocks appear in on the
 * home page, so a detail page always opens in the colour you just clicked.
 * Everything else falls back to its position in the full catalogue.
 */
export function blockForSlug(slug: string) {
  const featuredIndex = projects
    .filter((p) => p.featured)
    .findIndex((p) => p.slug === slug);
  if (featuredIndex >= 0) return blockFor(featuredIndex);
  return blockFor(projects.findIndex((p) => p.slug === slug));
}

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
