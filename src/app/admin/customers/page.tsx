"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Coffee,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Scale,
  Search,
  Store,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";
import { StatCard, MiniSparklineBars } from "@/components/admin/StatCard";
import { DonutChart, RadialRing, ChartLegend, CHART_COLORS } from "@/components/admin/charts";
import { BuyerTypeBadge, OrderStatusBadge } from "@/components/admin/StatusBadge";
import type { BuyerType, CustomerRecord } from "@/lib/erp/types";

const BUYER_FILTERS: { label: string; value: "All" | BuyerType; icon?: typeof Coffee }[] = [
  { label: "All Accounts", value: "All" },
  { label: "Tea Stalls", value: "Tea stall", icon: Coffee },
  { label: "Retail Shops", value: "Tea shop / retailer", icon: Store },
  { label: "Hotels", value: "Hotel", icon: Building2 },
  { label: "Restaurants & Cafés", value: "Restaurant / café", icon: UtensilsCrossed },
  { label: "Home Consumers", value: "Home", icon: Home },
];

export default function AdminCustomersPage() {
  const { customers, orders } = useErpStore();
  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState<"All" | BuyerType>("All");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (buyerFilter !== "All" && c.buyerType !== buyerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchAddress = c.address.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchAddress) return false;
      }
      return true;
    });
  }, [customers, buyerFilter, search]);

  const totalVolume = customers.reduce((sum, c) => sum + c.totalKg, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const LIFETIME_SPEND_MILESTONE = 500000;
  const spendMilestonePct = Math.min(100, Math.round((totalRevenue / LIFETIME_SPEND_MILESTONE) * 100));

  const buyerTypeSegments = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach((c) => {
      const type = c.buyerType || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });

    const palette: Record<string, string> = {
      "Tea stall": CHART_COLORS.leaf,
      "Tea shop / retailer": CHART_COLORS.lime,
      "Hotel": CHART_COLORS.amber,
      "Restaurant / café": "#ea580c",
      "Home": CHART_COLORS.blue,
      "Other business": CHART_COLORS.purple,
    };

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        color: palette[label] || CHART_COLORS.stone,
        display: `${value} accounts`,
      }))
      .sort((a, b) => b.value - a.value);
  }, [customers]);

  const volumeSegments = useMemo(() => {
    const volumes: Record<string, number> = {};
    customers.forEach((c) => {
      const type = c.buyerType || "Other";
      volumes[type] = (volumes[type] || 0) + (c.totalKg || 0);
    });

    const palette: Record<string, string> = {
      "Tea shop / retailer": CHART_COLORS.leaf,
      "Tea stall": CHART_COLORS.lime,
      "Hotel": CHART_COLORS.amber,
      "Restaurant / café": "#ea580c",
      "Home": CHART_COLORS.blue,
      "Other business": CHART_COLORS.purple,
    };

    return Object.entries(volumes)
      .map(([label, value]) => ({
        label,
        value: Math.round(value * 10) / 10,
        color: palette[label] || CHART_COLORS.stone,
        display: `${value} kg`,
      }))
      .sort((a, b) => b.value - a.value);
  }, [customers]);

  const monthlySpendBars = useMemo(() => {
    return [
      { label: "Jun", value: 38000, display: "৳38,000" },
      { label: "Jul", value: 52000, display: "৳52,000" },
      { label: "Aug", value: 68500, display: "৳68,500" },
      { label: "Sep", value: 89000, display: "৳89,000" },
      { label: "Oct", value: 112000, display: "৳1,12,000" },
      {
        label: "Nov",
        value: Math.max(124650, totalRevenue - 359500),
        display: bdt(Math.max(124650, totalRevenue - 359500)),
        isToday: true,
      },
    ];
  }, [totalRevenue]);

  // Customer orders history
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    const cleanPhone = selectedCustomer.phone.replace(/[\s-]/g, "");
    return orders.filter((o) => o.customer.phone.replace(/[\s-]/g, "") === cleanPhone);
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards with Dynamic Round Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Registered Buyers"
          value={`${customers.length} Accounts`}
          subtitle="Stalls, shops, hotels & households"
          trend="+8 this month"
          trendUp
          icon={<Users className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={buyerTypeSegments}
              size={110}
              thickness={13}
              centerValue={customers.length}
              centerLabel="buyers"
            />
            <ChartLegend
              items={buyerTypeSegments.slice(0, 4).map((s) => ({
                label: s.label,
                color: s.color,
                value: `${s.value} (${Math.round((s.value / Math.max(1, customers.length)) * 100)}%)`,
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Total Volume Distributed"
          value={`${totalVolume.toLocaleString()} kg`}
          subtitle="Across Sylhet, Dhaka & Chittagong"
          trend="+18% YoY"
          trendUp
          icon={<Scale className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={volumeSegments}
              size={110}
              thickness={13}
              centerValue={totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}`}
              centerLabel="kg"
            />
            <ChartLegend
              items={volumeSegments.slice(0, 4).map((s) => ({
                label: s.label,
                color: s.color,
                value: `${Math.round(s.value)} kg`,
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Customer Lifetime Spend"
          value={bdt(totalRevenue)}
          subtitle="Total gross order receipts"
          trend="+24%"
          trendUp
          highlight
          icon={<Package className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={totalRevenue}
              max={LIFETIME_SPEND_MILESTONE}
              size={106}
              stroke={12}
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
              trackColor="#e4ead6"
            >
              <span className="font-mono text-xl font-extrabold text-brown leading-none">{spendMilestonePct}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 mt-0.5">of ৳5L goal</span>
            </RadialRing>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[0.68rem] font-bold text-brown-soft">Monthly Spend Run-Rate</p>
              <MiniSparklineBars data={monthlySpendBars} height={50} />
            </div>
          </div>
        </StatCard>
      </div>

      {/* Search & Channel Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, or district..."
            className="w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 py-2 text-xs text-brown focus:border-leaf focus:outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {BUYER_FILTERS.map((b) => {
            const on = buyerFilter === b.value;
            const Icon = b.icon;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => setBuyerFilter(b.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  on
                    ? "bg-leaf text-cream shadow-xs"
                    : "bg-white border border-black/[0.08] text-brown-soft hover:bg-cream hover:text-brown"
                }`}
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-black/[0.08] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-black/[0.06] bg-cream/40 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-lg font-bold text-brown">Buyer Accounts Directory</h3>
            <p className="text-xs text-brown-soft">Retail consumers and commercial B2B accounts</p>
          </div>
          <span className="font-mono text-xs font-bold text-leaf bg-cream px-3 py-1 rounded-full border border-black/[0.08]">
            {filteredCustomers.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] bg-cream/20 font-bold text-brown uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Channel Type</th>
                <th className="py-3 px-4">Address / District</th>
                <th className="py-3 px-4 text-center">Orders Placed</th>
                <th className="py-3 px-4 text-right">Volume Bought</th>
                <th className="py-3 px-4 text-right">Lifetime Spent</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filteredCustomers.map((c) => {
                const cleanPhone = c.phone.replace(/[\s-]/g, "");
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-cream/20 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-linear-to-br from-leaf-soft to-lime/40 border border-leaf/20 flex items-center justify-center font-bold text-leaf-deep text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brown group-hover:text-leaf-deep transition-colors">
                            {c.name}
                          </p>
                          <p className="font-mono text-xs text-leaf font-semibold">{c.phone}</p>
                          <span className="font-mono text-[0.65rem] text-brown-soft/70">{c.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Buyer Type */}
                    <td className="py-3.5 px-4">
                      <BuyerTypeBadge type={c.buyerType} />
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-brown line-clamp-1">{c.address}</p>
                      <p className="text-[0.7rem] text-brown-soft font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-leaf" />
                        <span>{c.city}</span>
                      </p>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-brown">
                      <span className="rounded-full bg-cream-2 px-2.5 py-0.5">
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-leaf text-sm">
                      {c.totalKg} kg
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-brown text-sm">
                      {bdt(c.totalSpent)}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 font-mono text-brown-soft text-[0.7rem]">
                      {c.lastOrderDate}
                    </td>

                    {/* Outreach */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="rounded-lg border border-black/[0.08] hover:border-leaf p-1.5 text-brown-soft hover:text-brown hover:bg-cream transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="size-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/880${cleanPhone.replace(/^0/, "")}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Cha%20Nir.`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 p-1.5 shadow-2xs transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="size-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden text-brown font-sans border border-black/[0.08]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-cream/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-linear-to-br from-leaf to-leaf-deep text-cream font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-leaf/20">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brown">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <BuyerTypeBadge type={selectedCustomer.buyerType} />
                    <span className="text-[0.7rem] text-brown-soft">• {selectedCustomer.city}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1.5 hover:bg-cream text-brown-soft hover:text-brown"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Account summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-black/[0.06] bg-cream/20 p-3 text-center">
                  <p className="text-[0.65rem] text-brown-soft uppercase font-bold">Total Orders</p>
                  <p className="font-mono font-bold text-lg text-brown mt-0.5">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-black/[0.06] bg-cream/20 p-3 text-center">
                  <p className="text-[0.65rem] text-brown-soft uppercase font-bold">Total Volume</p>
                  <p className="font-mono font-bold text-lg text-leaf mt-0.5">{selectedCustomer.totalKg} kg</p>
                </div>
                <div className="rounded-xl border border-black/[0.06] bg-cream/20 p-3 text-center">
                  <p className="text-[0.65rem] text-brown-soft uppercase font-bold">Lifetime Spent</p>
                  <p className="font-mono font-bold text-lg text-leaf-deep mt-0.5">{bdt(selectedCustomer.totalSpent)}</p>
                </div>
              </div>

              {/* Contact and address details card */}
              <div className="rounded-2xl border border-black/[0.08] p-4 space-y-2.5 bg-cream/10">
                <p className="font-bold text-brown text-sm">Delivery & Contact Information</p>
                <div className="flex items-center gap-2 text-brown-soft">
                  <Phone className="size-3.5 text-leaf" />
                  <span className="font-mono font-semibold text-brown">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-brown-soft">
                  <MapPin className="size-3.5 text-leaf shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}, {selectedCustomer.city}</span>
                </div>
                {selectedCustomer.notes && (
                  <p className="text-[0.7rem] text-amber-900 bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/25 mt-2">
                    <span className="font-bold">Preferences / Notes:</span> {selectedCustomer.notes}
                  </p>
                )}
              </div>

              {/* Order History Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-brown text-sm">Customer Order History</p>
                  <span className="font-mono text-[0.7rem] text-brown-soft">{customerOrders.length} Orders</span>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-brown-soft italic py-4 text-center">No direct web order history logged.</p>
                ) : (
                  <div className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs">
                    {customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 flex justify-between items-center text-xs hover:bg-cream/20 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-leaf-deep">{ord.id}</span>
                            <OrderStatusBadge status={ord.status} />
                          </div>
                          <p className="text-[0.68rem] text-brown-soft mt-1">
                            {new Date(ord.createdAt).toLocaleDateString("en-GB")} • {ord.courier.partner} ({ord.paymentMethod})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-brown">{bdt(ord.total)}</p>
                          <p className="text-[0.68rem] font-mono text-leaf font-bold">{ord.totalKg} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Outreach Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <a
                  href={`tel:${selectedCustomer.phone.replace(/[\s-]/g, "")}`}
                  className="btn btn-ghost border border-black/[0.12] hover:border-leaf flex-1 text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white"
                >
                  <Phone className="size-4 text-leaf" />
                  <span>Call Buyer</span>
                </a>
                <a
                  href={`https://wa.me/880${selectedCustomer.phone.replace(/[\s-]/g, "").replace(/^0/, "")}?text=Hello%20${encodeURIComponent(selectedCustomer.name)},%20this%20is%20Cha%20Nir%20regarding%20your%20tea%20orders.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex-1 text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageSquare className="size-4" />
                  <span>WhatsApp Message</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
