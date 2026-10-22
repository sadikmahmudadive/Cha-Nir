import type { Metadata } from "next";
import { DiscountsPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Discounts · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <DiscountsPage />;
}
