import type { Metadata } from "next";
import { ProductsPage } from "@/components/admin/pages-a";

export const metadata: Metadata = { title: "Products · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <ProductsPage />;
}
