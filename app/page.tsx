import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { PageTransition } from "@/components/chrome/PageTransition";

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <SelectedWork />
      <About />
      <Contact />
    </PageTransition>
  );
}
