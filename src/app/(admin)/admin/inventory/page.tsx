import type { Metadata } from "next";
import { InventoryPage } from "@/components/admin/pages-a";

export const metadata: Metadata = { title: "Inventory · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <InventoryPage />;
}
