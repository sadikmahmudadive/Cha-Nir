import { TeaHero } from "@/components/three/tea/TeaHero";
import {
  CategoryGrid,
  FeaturedProducts,
  JournalPreview,
  Newsletter,
  ReviewsSection,
  ValueStrip,
  WholesaleBanner,
} from "@/components/home/Sections";
import { TeaJourney } from "@/components/three/TeaJourney";

export default function HomePage() {
  return (
    <>
      <TeaHero />
      <ValueStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <TeaJourney />
      <WholesaleBanner />
      <ReviewsSection />
      <JournalPreview />
      <Newsletter />
    </>
  );
}
