import { Navbar } from "@/components/chrome/Navbar";
import { Footer } from "@/components/chrome/Footer";
import { Cursor } from "@/components/chrome/Cursor";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";

/**
 * Chrome for the site proper.
 *
 * This exists so the gate page at /enter does not inherit it. The gate used to
 * sit under the root layout and rendered the full navigation on top of itself:
 * two overlapping wordmarks, and nav links pointing at pages the visitor had
 * not been let into yet. A route group keeps the chrome with the pages it
 * belongs to.
 *
 * The alternative — reading the path from headers() in the root layout and
 * branching — was rejected because headers() opts the whole tree into dynamic
 * rendering, which would cost the home and project pages their static builds
 * to style one page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
