import type { Metadata } from "next";
import { ReportsPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Reports · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <ReportsPage />;
}
