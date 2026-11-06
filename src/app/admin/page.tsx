"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Briefcase,
  CheckCircle2,
  Coffee,
  DollarSign,
  Globe,
  HeartPulse,
  Package,
  Printer,
  Scale,
  Send,
  Sparkles,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { StatCard, MiniSparklineBars } from "@/components/admin/StatCard";
import {
  ActivityRings,
  CHART_COLORS,
  ChartLegend,
  DonutChart,
  RadialRing,
} from "@/components/admin/charts";
import { WeeklyPerformanceChart } from "@/components/admin/WeeklyPerformanceChart";
import { BuyerTypeBadge, OrderStatusBadge } from "@/components/admin/StatusBadge";
import dynamic from "next/dynamic";
import { bdt } from "@/lib/pricing";
import type { BuyerType, Order } from "@/lib/erp/types";

const PackingSlipModal = dynamic(
  () => import("@/components/admin/PackingSlipModal").then((m) => m.PackingSlipModal),
  { ssr: false }
);

const WEEKLY_REVENUE_TARGET = 150000;

// Sample 7-day series for the sparkline (matches WeeklyPerformanceChart).
const REVENUE_SPARKLINE = [
  { label: "Sat", value: 16400, display: "৳16.4k" },
  { label: "Sun", value: 18900, display: "৳18.9k" },
  { label: "Mon", value: 24200, display: "৳24.2k" },
  { label: "Tue", value: 17800, display: "৳17.8k" },
  { label: "Wed", value: 26500, display: "৳26.5k" },
  { label: "Thu", value: 21100, display: "৳21.1k" },
  { label: "Fri", value: 14607, isToday: true, display: "৳14.6k" },
];

const CHANNEL_META: Record<BuyerType, { label: string; color: string }> = {
  "Tea stall": { label: "Tea stalls", color: CHART_COLORS.leaf },
  "Tea shop / retailer": { label: "Retailers", color: CHART_COLORS.lime },
  Hotel: { label: "Hotels", color: CHART_COLORS.leafDeep },
  "Restaurant / café": { label: "Restaurants", color: CHART_COLORS.amber },
  Home: { label: "Home", color: CHART_COLORS.blue },
  "Other business": { label: "Other", color: CHART_COLORS.stone },
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;

function HubTile({
  href,
  icon: Icon,
  label,
  meta,
  value,
  caption,
  color,
  colorTo,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  meta: string;
  value: number;
  caption: string;
  color: string;
  colorTo: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#151c14] p-3 text-center shadow-2xs transition-all hover:-translate-y-0.5 hover:border-leaf/40 dark:hover:border-leaf/50 hover:shadow-md"
      title={`${value}% ${caption}`}
    >
      <RadialRing value={value} size={60} stroke={6.5} color={color} colorTo={colorTo}>
        <Icon className="size-4.5 text-leaf-deep dark:text-lime-soft transition-transform group-hover:scale-110" />
      </RadialRing>
      <p className="w-full truncate text-xs font-bold text-brown dark:text-[#f4f7f2] group-hover:text-leaf-deep dark:group-hover:text-lime-soft">{label}</p>
      <p className="-mt-1 font-mono text-[0.62rem] text-brown-soft dark:text-[#98a793]">{meta}</p>
      <span
        className="rounded-full px-1.5 py-0.5 font-mono text-[0.6rem] font-bold"
        style={{ color, background: `${color}1a` }}
      >
        {value}% {caption}
      </span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { orders, inventory, rawLots, leads, customers, storeSettings, metrics } = useErpStore();
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  );
  const lowStockItems = inventory.filter((i) => i.inStockUnits <= i.reorderPointUnits);
  const recentLeads = leads.slice(0, 4);

  // All chart figures are derived from live store data.
  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled");

    const status = { pending: 0, processing: 0, dispatched: 0, delivered: 0 };
    for (const o of orders) {
      if (o.status in status) status[o.status as keyof typeof status]++;
    }

    const channelKg = new Map<BuyerType, number>();
    for (const o of active) {
      channelKg.set(o.customer.buyerType, (channelKg.get(o.customer.buyerType) ?? 0) + o.totalKg);
    }

    const cod = active.filter((o) => o.paymentMethod === "COD");
    const codTotal = cod.reduce((s, o) => s + o.total, 0);
    const codSettled = cod.filter((o) => o.paymentStatus === "settled").reduce((s, o) => s + o.total, 0);
    const courierPending = new Map<string, number>();
    for (const o of cod) {
      if (o.paymentStatus === "settled") continue;
      courierPending.set(o.courier.partner, (courierPending.get(o.courier.partner) ?? 0) + o.total);
    }

    const lotsInitial = rawLots.reduce((s, l) => s + l.initialKg, 0);
    const lotsRemaining = rawLots.reduce((s, l) => s + l.remainingKg, 0);

    const deliveredRate = pct(status.delivered, active.length);
    const codClearedRate = pct(codSettled, codTotal);
    const stockHealthRate = pct(inventory.length - lowStockItems.length, inventory.length);

    return {
      status,
      channelKg,
      codClearedRate,
      courierPending,
      deliveredRate,
      stockHealthRate,
      healthScore: Math.round((deliveredRate + codClearedRate + stockHealthRate) / 3),
      quotaRate: pct(metrics.totalRevenue, WEEKLY_REVENUE_TARGET),
      repeatBuyerRate: pct(customers.filter((c) => c.totalOrders > 1).length, customers.length),
      featuredRate: pct(storeSettings.featuredSlugs.length, 4),
      wonRate: pct(leads.filter((l) => l.status === "won").length, leads.length),
      lotsRemainingRate: pct(lotsRemaining, lotsInitial),
    };
  }, [orders, inventory, lowStockItems.length, rawLots, customers, storeSettings, leads, metrics.totalRevenue]);

  const channelSegments = [...stats.channelKg.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, value]) => ({
      label: CHANNEL_META[type]?.label ?? type,
      color: CHANNEL_META[type]?.color ?? CHART_COLORS.stone,
      value,
      display: kg(value),
    }));

  const statusSegments = [
    { label: "Pending", value: stats.status.pending, color: CHART_COLORS.amber },
    { label: "Packing", value: stats.status.processing, color: CHART_COLORS.blue },
    { label: "With courier", value: stats.status.dispatched, color: CHART_COLORS.purple },
    { label: "Delivered", value: stats.status.delivered, color: CHART_COLORS.emerald },
  ];

  const courierColors = [CHART_COLORS.emerald, CHART_COLORS.rose, CHART_COLORS.blue, CHART_COLORS.stone];
  const courierItems = [...stats.courierPending.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([partner, amount], i) => ({ label: partner, value: bdt(amount), color: courierColors[i] }));

  const healthRings = [
    { label: "Orders delivered", value: stats.deliveredRate, color: CHART_COLORS.leaf, colorTo: CHART_COLORS.lime },
    { label: "COD cleared to bank", value: stats.codClearedRate, color: CHART_COLORS.amber, colorTo: CHART_COLORS.amberSoft },
    { label: "SKUs above reorder", value: stats.stockHealthRate, color: CHART_COLORS.blue, colorTo: "#60a5fa" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.07] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brown dark:text-[#f4f7f2]">
              Welcome back, Adive
            </h2>
            <span className="rounded-full bg-lime/40 dark:bg-lime/20 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-leaf-deep dark:text-lime-soft border border-lime/30 flex items-center gap-1">
              <Sparkles className="size-2.5" />
              Live System
            </span>
          </div>
          <p className="text-xs text-brown-soft dark:text-[#98a793] mt-1">
            Sylhet tea processing & dispatch terminal operating normally. {pendingOrders.length} orders awaiting fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/orders"
            className="btn btn-leaf text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:shadow-md flex items-center gap-1.5"
          >
            <Package className="size-4" />
            <span>Open Order Desk</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="btn btn-ghost border border-black/[0.1] dark:border-white/[0.12] hover:border-leaf dark:hover:border-leaf text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-[#161d15] text-brown dark:text-[#f4f7f2]"
          >
            <span>Live Store</span>
          </Link>
        </div>
      </div>

      {/* KPI cards with round charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Gross Revenue"
          value={bdt(metrics.totalRevenue)}
          subtitle="vs last week"
          trend="+14%"
          trendUp
          highlight
          icon={<DollarSign className="size-6" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={metrics.totalRevenue}
              max={WEEKLY_REVENUE_TARGET}
              size={106}
              stroke={12}
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
              trackColor="var(--chart-track, #e4ead6)"
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{stats.quotaRate}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">of quota</span>
            </RadialRing>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[0.68rem] font-bold text-brown-soft dark:text-[#98a793]">Last 7 days</p>
              <MiniSparklineBars data={REVENUE_SPARKLINE} height={50} />
            </div>
          </div>
        </StatCard>

        <StatCard
          title="Tea Volume Moved"
          value={kg(metrics.totalVolumeKg)}
          subtitle="by buyer channel"
          trend="+22%"
          trendUp
          icon={<Scale className="size-6" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={channelSegments}
              size={112}
              thickness={13}
              centerValue={channelSegments.length}
              centerLabel="channels"
            />
            <ChartLegend
              items={channelSegments.slice(0, 4).map((s) => ({
                label: s.label,
                color: s.color,
                value: `${pct(s.value, metrics.totalVolumeKg)}%`,
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Orders In Pipeline"
          value={metrics.pendingOrdersCount}
          subtitle={`${stats.status.processing} currently packing`}
          icon={<Package className="size-6" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={statusSegments}
              size={112}
              thickness={13}
              centerValue={orders.length}
              centerLabel="orders"
            />
            <ChartLegend
              items={statusSegments.map((s) => ({ label: s.label, color: s.color, value: String(s.value) }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="COD Pending Remittance"
          value={bdt(metrics.pendingCodAmount)}
          subtitle="awaiting courier payout"
          trend={metrics.pendingCodAmount > 50000 ? "Action Required" : "Normal"}
          trendUp={metrics.pendingCodAmount <= 50000}
          icon={<Truck className="size-6" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={stats.codClearedRate}
              size={106}
              stroke={12}
              color={CHART_COLORS.emerald}
              colorTo={CHART_COLORS.lime}
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{stats.codClearedRate}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">cleared</span>
            </RadialRing>
            {courierItems.length > 0 ? (
              <ChartLegend items={courierItems} />
            ) : (
              <p className="flex-1 text-[0.7rem] font-semibold text-emerald-700 dark:text-emerald-400">All COD settled 🎉</p>
            )}
          </div>
        </StatCard>
      </div>

      {/* Hubs with ring tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-linear-to-b from-white to-[#fbfaf6] dark:from-[#141a14] dark:to-[#111711] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.07] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-leaf-soft dark:bg-leaf/25 flex items-center justify-center text-leaf-deep dark:text-lime-soft">
                <Store className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-leaf-deep dark:text-lime-soft block">
                  Storefront Administration
                </span>
                <span className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">Retail catalog, buyer database & store CMS</span>
              </div>
            </div>
            <span className="rounded-full bg-cream-2 dark:bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-bold text-brown dark:text-[#f4f7f2]">Store OS</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <HubTile
              href="/admin/products"
              icon={Coffee}
              label="Products"
              meta={`${metrics.totalProductsCount} live teas`}
              value={stats.stockHealthRate}
              caption="in stock"
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
            />
            <HubTile
              href="/admin/customers"
              icon={Users}
              label="Buyers"
              meta={`${metrics.totalCustomersCount} accounts`}
              value={stats.repeatBuyerRate}
              caption="repeat"
              color={CHART_COLORS.leafDeep}
              colorTo={CHART_COLORS.leaf}
            />
            <HubTile
              href="/admin/storefront"
              icon={Globe}
              label="Store CMS"
              meta={`${storeSettings.featuredSlugs.length}/4 featured`}
              value={stats.featuredRate}
              caption="curated"
              color={CHART_COLORS.lime}
              colorTo={CHART_COLORS.limeSoft}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-linear-to-b from-white to-[#fbfaf6] dark:from-[#141a14] dark:to-[#111711] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.07] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-lime/30 dark:bg-lime/20 flex items-center justify-center text-leaf-deep dark:text-lime-soft">
                <Boxes className="size-4 text-leaf dark:text-lime" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-leaf-deep dark:text-lime-soft block">
                  Operations & ERP Engine
                </span>
                <span className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">Fulfillment, garden lots & wholesale ledger</span>
              </div>
            </div>
            <span className="rounded-full bg-cream-2 dark:bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-bold text-brown dark:text-[#f4f7f2]">Supply OS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <HubTile
              href="/admin/orders"
              icon={Package}
              label="OMS"
              meta={`${orders.length} orders`}
              value={stats.deliveredRate}
              caption="delivered"
              color={CHART_COLORS.purple}
              colorTo="#c084fc"
            />
            <HubTile
              href="/admin/inventory"
              icon={Scale}
              label="Lots"
              meta={`${rawLots.length} lots`}
              value={stats.lotsRemainingRate}
              caption="left"
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
            />
            <HubTile
              href="/admin/wholesale"
              icon={Briefcase}
              label="CRM"
              meta={`${leads.length} leads`}
              value={stats.wonRate}
              caption="won"
              color={CHART_COLORS.amber}
              colorTo={CHART_COLORS.amberSoft}
            />
            <HubTile
              href="/admin/finance"
              icon={DollarSign}
              label="Finance"
              meta="COD ledger"
              value={stats.codClearedRate}
              caption="cleared"
              color={CHART_COLORS.emerald}
              colorTo="#6ee7b7"
            />
          </div>
        </div>
      </div>

      {/* Analytics row: pill-bar chart + activity rings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyPerformanceChart />
        </div>

        <div className="flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.07] pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-leaf-soft dark:bg-leaf/25 text-leaf-deep dark:text-lime-soft">
              <HeartPulse className="size-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">Operations Health</h3>
              <p className="text-xs text-brown-soft dark:text-[#98a793]">Live ratios across orders, cash & stock</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-6">
            <ActivityRings rings={healthRings} size={204} stroke={18} gap={6}>
              <span className="font-mono text-4xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{stats.healthScore}</span>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-1">health score</span>
            </ActivityRings>

            <ul className="w-full space-y-2">
              {healthRings.map((ring) => (
                <li
                  key={ring.label}
                  className="flex items-center justify-between rounded-xl bg-cream/40 dark:bg-white/[0.04] px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 text-brown-soft dark:text-[#98a793]">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${ring.color}, ${ring.colorTo})` }}
                    />
                    {ring.label}
                  </span>
                  <span className="font-mono font-bold text-brown dark:text-[#f4f7f2]">{ring.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-400/40 dark:border-amber-400/30 bg-amber-500/10 dark:bg-amber-500/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xs">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 border border-amber-400/30 dark:border-amber-400/40 flex items-center justify-center text-amber-900 dark:text-amber-300 shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                Warehouse Reorder Notice: {lowStockItems.length} Packaged SKUs below threshold
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                {lowStockItems.slice(0, 3).map((i) => `${i.productName} (${i.variantLabel})`).join(", ")}
                {lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : ""}
              </p>
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="btn btn-ghost border border-amber-400/50 dark:border-amber-400/40 text-xs font-bold py-2 px-4 rounded-xl text-amber-950 dark:text-amber-200 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 bg-white/70 dark:bg-[#161d15] self-start sm:self-auto shrink-0 transition-colors"
          >
            Review Warehouse Stock
          </Link>
        </div>
      )}

      {/* Fulfillment desk + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold tracking-tight text-brown dark:text-[#f4f7f2]">Active Fulfillment Desk</h3>
              <p className="text-xs text-brown-soft dark:text-[#98a793]">Orders ready for warehouse packing and courier dispatch</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-leaf dark:text-lime-soft hover:underline flex items-center gap-1 group">
              <span>View all ({orders.length})</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {pendingOrders.length === 0 ? (
                <div className="p-10 text-center text-brown-soft dark:text-[#98a793]">
                  <CheckCircle2 className="size-9 mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-sm text-brown dark:text-[#f4f7f2]">All pending orders dispatched!</p>
                  <p className="text-xs mt-1">Check back when new retail or wholesale orders arrive.</p>
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream/20 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-leaf-deep dark:text-lime-soft">{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                        <BuyerTypeBadge type={order.customer.buyerType} />
                      </div>
                      <p className="font-bold text-sm text-brown dark:text-[#f4f7f2] truncate">
                        {order.customer.name}
                        <span className="font-normal text-brown-soft dark:text-[#98a793] ml-2 text-xs">({order.customer.city})</span>
                      </p>
                      <p className="text-xs text-brown-soft dark:text-[#98a793] line-clamp-1">
                        {order.items.map((i) => `${i.productName} (${i.variantLabel} × ${i.qty})`).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-black/[0.05] dark:border-white/[0.06]">
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-brown dark:text-[#f4f7f2]">{bdt(order.total)}</p>
                        <p className="text-[0.68rem] font-mono text-leaf dark:text-lime-soft font-bold">{order.totalKg} kg</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSlipOrder(order)}
                        className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-leaf dark:hover:border-leaf p-2 text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06] transition-colors"
                        title="Print Packing Slip"
                      >
                        <Printer className="size-4" />
                      </button>

                      {order.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => erpActions.updateOrderStatus(order.id, "processing")}
                          className="btn btn-leaf text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow-md"
                        >
                          Pack Order
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            erpActions.updateOrderStatus(order.id, "dispatched", {
                              trackingCode: `STF-${Math.floor(10000 + Math.random() * 90000)}`,
                            })
                          }
                          className="btn bg-purple-700 text-white hover:bg-purple-800 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <Send className="size-3.5" />
                          <span>Dispatch</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Inbound quotes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-brown dark:text-[#f4f7f2]">Inbound B2B Quotes</h4>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">Submitted from /wholesale desk</p>
              </div>
              <Link href="/admin/wholesale" className="text-xs font-bold text-leaf dark:text-lime-soft hover:underline">CRM View</Link>
            </div>

            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-3.5 space-y-1 hover:bg-cream/20 dark:hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-brown dark:text-[#f4f7f2]">{lead.name}</span>
                    <span className="rounded-full bg-cream dark:bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-bold text-leaf dark:text-lime-soft border border-black/[0.06] dark:border-white/[0.08]">
                      {lead.volume}
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-brown-soft dark:text-[#98a793]">{lead.type} • {lead.phone}</p>
                  {lead.notes && (
                    <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793] italic line-clamp-1">&ldquo;{lead.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw lots with rings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-brown dark:text-[#f4f7f2]">Active Raw Tea Lots</h4>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">Unblended leaf remaining</p>
              </div>
              <Link href="/admin/inventory" className="text-xs font-bold text-leaf dark:text-lime-soft hover:underline">All Lots</Link>
            </div>

            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs p-4 space-y-3">
              {rawLots.slice(0, 3).map((lot) => {
                const remaining = pct(lot.remainingKg, lot.initialKg);
                const low = remaining < 25;
                return (
                  <div key={lot.id} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-cream/30 dark:hover:bg-white/[0.04] transition-colors">
                    <RadialRing
                      value={remaining}
                      size={52}
                      stroke={6}
                      color={low ? CHART_COLORS.amber : CHART_COLORS.leaf}
                      colorTo={low ? CHART_COLORS.amberSoft : CHART_COLORS.lime}
                    >
                      <span className="font-mono text-xs font-extrabold text-brown dark:text-[#f4f7f2]">{remaining}%</span>
                    </RadialRing>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-brown dark:text-[#f4f7f2]">{lot.garden.split(",")[0]}</p>
                      <p className="truncate text-[0.68rem] text-brown-soft dark:text-[#98a793]">{lot.grade}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-leaf dark:text-lime-soft shrink-0">{lot.remainingKg} kg</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedSlipOrder && (
        <PackingSlipModal order={selectedSlipOrder} onClose={() => setSelectedSlipOrder(null)} />
      )}
    </div>
  );
}
