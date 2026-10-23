import { FeaturedProducts, JournalPreview, Newsletter, ReviewsSection, ValueStrip, WholesaleBanner } from "@/components/home/Sections";
import { CategoryReel } from "@/components/story/CategoryReel";
import { Manifesto } from "@/components/story/Manifesto";
import { SmoothScroll } from "@/components/story/SmoothScroll";
import { StoryChapters } from "@/components/story/StoryChapters";
import { TeaHero } from "@/components/three/tea/TeaHero";

/**
 * Homepage = a light 3D tea-ritual hero, then a dark cinematic GSAP scroll story,
 * then it lands on the cream "shop" half where browsing and buying stay plain and fast.
 */
export default function HomePage() {
  return (
    <SmoothScroll>
      <TeaHero />
      <div className="bg-night text-cream">
        <Manifesto />
        <StoryChapters />
        <CategoryReel />
      </div>
      <div className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-cream">
        <FeaturedProducts />
        <ValueStrip />
        <WholesaleBanner />
        <ReviewsSection />
        <JournalPreview />
        <Newsletter />
      </div>
    </SmoothScroll>
  );
}
