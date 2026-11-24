export const site = {
  name: "Kyle Arby",
  role: "Creative Director & Graphic Designer",
  /**
   * Titles that cycle in the hero, after "is a". They share one line and the
   * component reserves the width of the widest, so adding a longer entry here
   * can push the line size down. "Multidisciplinary Designer" is the widest.
   */
  titles: [
    "Creative Director",
    "Industrial Designer",
    "Graphic Designer",
    "Footwear Designer",
    "Multidisciplinary Designer",
    "Multimedia Artist",
    "Beginner Runner",
    "Foodie",
    "Music Lover",
    "Festival Goer",
    "Passionate Designer",
  ],
  hero: {
    /**
     * The headline reads "<greetingLead> <firstName>". Split because the two
     * halves are set differently: the greeting is quiet, the name is set to
     * match the wordmark and is the glitch target.
     */
    greetingLead: "Hello, I'm",
    firstName: "Kyle",
    /** Leads the role line. Reads as "I'm a <cycling title>". */
    connector: "I'm",
  },
  /**
   * Hero portrait — the two halftone separations, stacked and sliced into
   * bands that shear apart under the pointer. Both are 3:4 and carry alpha,
   * so they composite over whatever the page background is.
   */
  portrait: {
    blue: "/brand/portrait-blue.png",
    red: "/brand/portrait-red.png",
  },
  /**
   * About portrait. The greyscale frame is what loads; the colour frame is
   * revealed through a pointer-tracked mask on top of it. Both are 4:5.
   */
  headshot: {
    bw: "/brand/headshot-bw.png",
    color: "/brand/headshot-color.png",
    alt: "Kyle Arby",
  },
  email: "kylearby@gmail.com",
  location: "Orange County, CA",
  /** City only, for the hero masthead. */
  locationShort: "Orange County, CA",
  timezone: "America/Los_Angeles",
  timezoneLabel: "PT",
  available: true,
  availableFor: "Select projects — Q4 2026",
  url: "https://kylearby.com",
  description:
    "Kyle Arby is a creative director and graphic designer building brand systems, campaigns and product identities for Nike, Dime, Y-3 and Daniel Arsham.",
  /**
   * `label` is the only field the footer renders, so it has to identify the
   * destination on its own — and both render sites key off it, so no two may
   * repeat. That is why the second Instagram carries its handle in the label
   * rather than reading "Instagram" twice.
   */
  socials: [
    { label: "Instagram", href: "https://instagram.com/kylearby", handle: "@kylearby" },
    { label: "Instagram — saintsisms", href: "https://instagram.com/saintsisms", handle: "@saintsisms" },
    { label: "Behance", href: "https://behance.net/kylesaints", handle: "kylesaints" },
    { label: "LinkedIn", href: "https://linkedin.com/in/santoskyle/", handle: "santoskyle" },
    { label: "Resume", href: "https://read.cv/", handle: "kylearby" },
  ],
} as const;

export const navigation = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;
