import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderDetail } from "@/components/account/Orders";
import { PageSkeleton } from "@/components/ui/misc";
import { demoOrders } from "@/data/demo/content";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export function generateStaticParams() {
  return demoOrders.map((o) => ({ id: o.id }));
}

async function Content({ params }: Pick<PageProps<"/account/orders/[id]">, "params">) {
  const { id } = await params;
  return (
    <AccountShell title="Order details">
      <OrderDetail id={id} />
    </AccountShell>
  );
}

export default function Page({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
