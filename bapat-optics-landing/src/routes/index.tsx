import { createFileRoute } from "@tanstack/react-router";
import { Intro } from "@/components/bapat/Intro";
import { CustomCursor } from "@/components/bapat/CustomCursor";
import { ScrollProgress } from "@/components/bapat/ScrollProgress";
import { MobileBookBar } from "@/components/bapat/MobileBookBar";
import { Nav } from "@/components/bapat/Nav";
import { Hero } from "@/components/bapat/Hero";
import { Crafted } from "@/components/bapat/Crafted";
import { SpectaclePortal } from "@/components/bapat/SpectaclePortal";
import { Collection } from "@/components/bapat/Collection";
import { PhotochromicEclipse } from "@/components/bapat/PhotochromicEclipse";
import { DetailReel } from "@/components/bapat/DetailReel";
import { Campaign } from "@/components/bapat/Campaign";
import { ApertureTransition } from "@/components/bapat/ApertureTransition";
import { Manifesto } from "@/components/bapat/Manifesto";
import { EyeQ } from "@/components/bapat/EyeQ";
import { GoldenThreadTransition } from "@/components/bapat/GoldenThreadTransition";
import { BrandWall } from "@/components/bapat/BrandWall";
import { StoreLocator } from "@/components/bapat/StoreLocator";
import { BookBand } from "@/components/bapat/BookBand";
import { Footer } from "@/components/bapat/Footer";

const title = "Bapat Optics — Premium Eyewear in Pune";
const description =
  "Designer eyewear, Zeiss precision fitting, free eye exams, and lifetime service at Bapat Optics in Kothrud and Sadashiv Peth, Pune.";

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
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Crafted />
        <SpectaclePortal />
        <Collection />
        <PhotochromicEclipse />
        <DetailReel />
        <Campaign />
        <ApertureTransition
          id="aperture-campaign-manifesto"
          theme="dark-to-light"
          badge="Carl Zeiss Vision Centration · Optical Diaphragm"
          heading="Calibrating Individual Optical Axis"
          subheading="From international designer silhouettes to bespoke Zeiss optical refraction in Pune"
          metric="AXIS 180° · Ø 54mm · APERTURE f/1.4"
        />
        <Manifesto />
        <EyeQ />
        <GoldenThreadTransition />
        <BrandWall />
        <StoreLocator />
        <BookBand />
      </main>
      <Footer />
      {/* clearance for the phone-only sticky booking bar */}
      <div className="h-[68px] bg-obsidian md:hidden" />
      <MobileBookBar />
    </>
  );
}
