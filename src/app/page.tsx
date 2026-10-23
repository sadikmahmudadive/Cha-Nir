import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { ScrollStory } from "@/components/home/ScrollStory";
import { Audiences } from "@/components/home/Audiences";
import { Featured } from "@/components/home/Featured";
import { Tiers } from "@/components/home/Tiers";
import { Pillars } from "@/components/home/Pillars";
import { Faq } from "@/components/home/Faq";
import { Cta } from "@/components/home/Cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <ScrollStory />
      <Audiences />
      <Featured />
      <Tiers />
      <Pillars />
      <Faq />
      <Cta />
    </>
  );
}
