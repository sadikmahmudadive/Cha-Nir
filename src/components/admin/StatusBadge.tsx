import clsx from "clsx";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Coffee,
  Store,
  Building2,
  UtensilsCrossed,
  Home,
} from "lucide-react";
import type { BuyerType, OrderStatus, PaymentStatus, WholesaleLeadStatus } from "@/lib/erp/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { bg: string; text: string; border: string; label: string; dot: string; icon: typeof Clock }
  > = {
    pending: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-500/25 dark:border-amber-400/35",
      label: "Pending Verification",
      dot: "bg-amber-500 ring-amber-400/40",
      icon: Clock,
    },
    processing: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-500/25 dark:border-blue-400/35",
      label: "Packing / Processing",
      dot: "bg-blue-500 ring-blue-400/40",
      icon: Package,
    },
    dispatched: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-800 dark:text-purple-300",
      border: "border-purple-500/25 dark:border-purple-400/35",
      label: "With Courier",
      dot: "bg-purple-500 ring-purple-400/40",
      icon: Truck,
    },
    delivered: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-500/25 dark:border-emerald-400/35",
      label: "Delivered",
      dot: "bg-emerald-500 ring-emerald-400/40",
      icon: CheckCircle2,
    },
    cancelled: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-800 dark:text-rose-300",
      border: "border-rose-500/25 dark:border-rose-400/35",
      label: "Cancelled",
      dot: "bg-rose-500 ring-rose-400/40",
      icon: XCircle,
    },
  };

  const s = config[status] || config.pending;
  const Icon = s.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wide border shadow-2xs backdrop-blur-xs",
        s.bg,
        s.text,
        s.border
      )}
    >
      <span className="relative flex size-2 shrink-0">
        <span
          className={clsx(
            "absolute inline-flex h-full w-full rounded-full ring-2 opacity-75",
            s.dot
          )}
        />
        <span className={clsx("relative inline-flex size-2 rounded-full", s.dot.split(" ")[0])} />
      </span>
      <Icon className="size-3 shrink-0 opacity-80" />
      <span>{s.label}</span>
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  method,
}: {
  status: PaymentStatus;
  method: string;
}) {
  const styles: Record<PaymentStatus, { bg: string; text: string; border: string; label: string }> = {
    unpaid: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-400/30 dark:border-amber-400/40",
      label: `COD Pending (${method})`,
    },
    paid: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-400/30 dark:border-blue-400/40",
      label: `Paid via ${method}`,
    },
    settled: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-400/30 dark:border-emerald-400/40",
      label: `Settled (${method})`,
    },
  };

  const s = styles[status] || styles.unpaid;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider border shadow-2xs",
        s.bg,
        s.text,
        s.border
      )}
    >
      {s.label}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: WholesaleLeadStatus }) {
  const styles: Record<
    WholesaleLeadStatus,
    { bg: string; text: string; border: string; label: string }
  > = {
    new: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-400/25 dark:border-blue-400/40",
      label: "New Inquiry",
    },
    contacted: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-800 dark:text-purple-300",
      border: "border-purple-400/25 dark:border-purple-400/40",
      label: "Contacted",
    },
    sample_sent: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-400/25 dark:border-amber-400/40",
      label: "Sample Sent",
    },
    quote_sent: {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      text: "text-cyan-800 dark:text-cyan-300",
      border: "border-cyan-400/25 dark:border-cyan-400/40",
      label: "Quote Sent",
    },
    won: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-400/25 dark:border-emerald-400/40",
      label: "Won / Active Client",
    },
    lost: {
      bg: "bg-stone-500/10 dark:bg-stone-500/20",
      text: "text-stone-700 dark:text-stone-300",
      border: "border-stone-400/25 dark:border-stone-400/40",
      label: "Closed / Lost",
    },
  };

  const s = styles[status] || styles.new;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wide border",
        s.bg,
        s.text,
        s.border
      )}
    >
      {s.label}
    </span>
  );
}

export function BuyerTypeBadge({ type }: { type: BuyerType }) {
  const map: Record<BuyerType, { icon: typeof Coffee; label: string; bg: string; text: string }> = {
    "Tea stall": {
      icon: Coffee,
      label: "Tea Stall",
      bg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-300/40 dark:border-amber-400/35",
      text: "text-amber-900 dark:text-amber-300",
    },
    "Tea shop / retailer": {
      icon: Store,
      label: "Retail Shop",
      bg: "bg-leaf-soft/50 dark:bg-leaf/25 border-leaf/20 dark:border-leaf/35",
      text: "text-leaf-deep dark:text-lime-soft",
    },
    Hotel: {
      icon: Building2,
      label: "Hotel Commercial",
      bg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-300/40 dark:border-blue-400/35",
      text: "text-blue-900 dark:text-blue-300",
    },
    "Restaurant / café": {
      icon: UtensilsCrossed,
      label: "Restaurant / Café",
      bg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-300/40 dark:border-purple-400/35",
      text: "text-purple-900 dark:text-purple-300",
    },
    Home: {
      icon: Home,
      label: "Home / Retail",
      bg: "bg-stone-500/10 dark:bg-stone-500/20 border-stone-300/40 dark:border-stone-400/35",
      text: "text-stone-800 dark:text-stone-300",
    },
    "Other business": {
      icon: Building2,
      label: "Commercial B2B",
      bg: "bg-teal-500/10 dark:bg-teal-500/20 border-teal-300/40 dark:border-teal-400/35",
      text: "text-teal-900 dark:text-teal-300",
    },
  };

  const c = map[type] || map["Home"];
  const Icon = c.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[0.7rem] font-bold border",
        c.bg,
        c.text
      )}
    >
      <Icon className="size-3" />
      <span>{c.label}</span>
    </span>
  );
}
