import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-x pb-24 pt-8">
      <Checkout />
    </div>
  );
}
