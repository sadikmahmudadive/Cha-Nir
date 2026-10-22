import type { Metadata } from "next";
import { DashboardPage } from "@/components/admin/pages-a";

export const metadata: Metadata = { title: "Dashboard · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <DashboardPage />;
}
