import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { OrdersList } from "@/components/account/Orders";

export const metadata: Metadata = { title: "Order history", robots: { index: false } };

export default function Page() {
  return (
    <AccountShell title="Order history">
      <OrdersList />
    </AccountShell>
  );
}
