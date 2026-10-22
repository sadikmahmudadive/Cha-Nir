import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-tea-900 px-5 py-3 text-sm font-semibold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
