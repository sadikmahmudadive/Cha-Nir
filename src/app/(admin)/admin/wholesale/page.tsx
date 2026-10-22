import type { Metadata } from "next";
import { WholesaleAdminPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Wholesale · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <WholesaleAdminPage />;
}
