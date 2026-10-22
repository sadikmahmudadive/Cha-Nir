import type { Metadata } from "next";
import { ContentPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Homepage content · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <ContentPage />;
}
