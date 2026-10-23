import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Lora, Raleway } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

const bengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Cha Nir | Pure, organic, deshi tea from Bangladesh",
    template: "%s | Cha Nir",
  },
  description:
    "Authentic packaged tea from the best tea gardens of Bangladesh. Wholesale and retail for tea shops, tea stalls, hotels, restaurants and homes.",
  openGraph: {
    title: "Cha Nir | Pure, organic, deshi tea",
    description:
      "Fresh, authentic Bangladeshi tea, processed and packed for every counter and every home.",
    images: ["/img/modhumoti-scene.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4e9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${raleway.variable} ${bengali.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:font-bold focus:text-brown"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
