import type { Metadata } from "next";
import { CustomersPage } from "@/components/admin/pages-b";

export const metadata: Metadata = { title: "Customers · Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <CustomersPage />;
}
