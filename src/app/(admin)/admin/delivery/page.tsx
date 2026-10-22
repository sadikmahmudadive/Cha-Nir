import type { Metadata } from "next";
import { DeliveryPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Delivery · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <DeliveryPage />;
}
