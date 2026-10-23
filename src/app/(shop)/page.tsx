import { FeaturedProducts, JournalPreview, Newsletter, ReviewsSection, ValueStrip, WholesaleBanner } from "@/components/home/Sections";
import { CategoryReel } from "@/components/story/CategoryReel";
import { Manifesto } from "@/components/story/Manifesto";
import { SmoothScroll } from "@/components/story/SmoothScroll";
import { StoryChapters } from "@/components/story/StoryChapters";
import { TeaHero } from "@/components/three/tea/TeaHero";

/**
 * Homepage = one continuous, dark, cinematic scroll story (GSAP + the 3D tea ritual),
 * then it lands on the cream "shop" half where browsing and buying stay plain and fast.
 */
export default function HomePage() {
  return (
    <SmoothScroll>
      <div className="bg-night text-cream">
        <TeaHero />
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
