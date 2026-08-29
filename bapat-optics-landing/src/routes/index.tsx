import { createFileRoute } from "@tanstack/react-router";
import { Intro } from "@/components/bapat/Intro";
import { CustomCursor } from "@/components/bapat/CustomCursor";
import { Nav } from "@/components/bapat/Nav";
import { Hero } from "@/components/bapat/Hero";
import { Manifesto } from "@/components/bapat/Manifesto";
import { Collection } from "@/components/bapat/Collection";
import { Crafted } from "@/components/bapat/Crafted";
import { Campaign } from "@/components/bapat/Campaign";
import { EyeQ } from "@/components/bapat/EyeQ";
import { BrandWall } from "@/components/bapat/BrandWall";
import { StoreLocator } from "@/components/bapat/StoreLocator";
import { BookBand } from "@/components/bapat/BookBand";
import { Footer } from "@/components/bapat/Footer";

const title = "Bapat Optics — Premium Eyewear & Zeiss Precision Fitting, Pune";
const description =
  "Bapat Optics: 14+ years of eyewear in Pune. Designer frames, sunglasses and Zeiss precision lens fitting at Kothrud and Sadashiv Peth.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Intro />
      <CustomCursor />
      <Nav />
      <main>
        <Hero />
        <Crafted />
        <Collection />
        <Campaign />
        <Manifesto />
        <EyeQ />
        <BrandWall />
        <StoreLocator />
        <BookBand />
      </main>
      <Footer />
    </>
  );
}
