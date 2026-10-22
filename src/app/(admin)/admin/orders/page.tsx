import type { Metadata } from "next";
import { OrdersPage } from "@/components/admin/pages-a";

export const metadata: Metadata = { title: "Orders · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <OrdersPage />;
}
