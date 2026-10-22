import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressesSection, ProfileSection } from "@/components/account/Profile";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function Page() {
  return (
    <AccountShell title="Your account">
      <ProfileSection />
      <AddressesSection />
    </AccountShell>
  );
}
