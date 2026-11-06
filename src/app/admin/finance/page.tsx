"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HandCoins,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";
import { StatCard, MiniSparklineBars } from "@/components/admin/StatCard";
import { DonutChart, RadialRing, ChartLegend, CHART_COLORS } from "@/components/admin/charts";

export default function AdminFinancePage() {
  const { orders, transactions } = useErpStore();
  const [courierFilter, setCourierFilter] = useState<"All" | "Steadfast" | "Pathao">("All");

  const pendingCodOrders = useMemo(() => {
    return orders.filter(
      (o) => o.paymentMethod === "COD" && o.paymentStatus !== "settled" && o.status !== "cancelled"
    );
  }, [orders]);

  const totalCodPendingAmount = pendingCodOrders.reduce((sum, o) => sum + o.total, 0);

  // Revenue vs Expense Totals
  const totalRevenue = transactions
    .filter((tx) => tx.category === "Revenue" && tx.status === "cleared")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCogs = transactions
    .filter((tx) => tx.category === "COGS" && tx.status === "cleared")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netOperatingProfit = totalRevenue - totalCogs;
  const profitMarginPct = totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 100) : 0;

  const courierCodSegments = useMemo(() => {
    const map: Record<string, number> = {};
    pendingCodOrders.forEach((o) => {
      const p = o.courier.partner || "Other";
      map[p] = (map[p] || 0) + o.total;
    });
    return [
      { label: "Steadfast", value: map["Steadfast"] || 0, color: CHART_COLORS.emerald },
      { label: "Pathao", value: map["Pathao"] || 0, color: CHART_COLORS.rose },
      { label: "RedX", value: map["RedX"] || 0, color: CHART_COLORS.amber },
    ].filter((s) => s.value > 0);
  }, [pendingCodOrders]);

  const cogsSegments = useMemo(() => {
    const leaf = transactions
      .filter((t) => t.type === "expense_leaf" && t.status === "cleared")
      .reduce((sum, t) => sum + t.amount, 0);
    const pkg = transactions
      .filter((t) => t.type === "expense_packaging" && t.status === "cleared")
      .reduce((sum, t) => sum + t.amount, 0);
    const courier = transactions
      .filter((t) => t.type === "expense_courier" && t.status === "cleared")
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { label: "Auction Leaf", value: leaf || 58000, color: CHART_COLORS.leaf },
      { label: "Packaging", value: pkg || 14500, color: CHART_COLORS.amber },
      { label: "Courier Logistics", value: courier || 6200, color: CHART_COLORS.blue },
    ];
  }, [transactions]);

  const REVENUE_SPARKLINE = [
    { label: "Sat", value: 16200, display: "৳16.2k" },
    { label: "Sun", value: 21400, display: "৳21.4k" },
    { label: "Mon", value: 19800, display: "৳19.8k" },
    { label: "Tue", value: 28900, display: "৳28.9k" },
    { label: "Wed", value: 24500, display: "৳24.5k" },
    { label: "Thu", value: 31200, display: "৳31.2k" },
    { label: "Fri", value: 38500, display: "৳38.5k", isToday: true },
  ];

  const filteredCodOrders = pendingCodOrders.filter((o) => {
    if (courierFilter === "All") return true;
    return o.courier.partner === courierFilter;
  });

  return (
    <div className="space-y-6">
      {/* Financial Executive Summary Cards with Dynamic Round Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Cleared Cash Revenue"
          value={bdt(totalRevenue)}
          subtitle="Bank transfers & remittances"
          trend="+18%"
          trendUp
          icon={<ArrowUpRight className="size-6 text-emerald-700" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={totalRevenue}
              max={150000}
              size={106}
              stroke={12}
              color={CHART_COLORS.emerald}
              colorTo={CHART_COLORS.lime}
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">
                {Math.min(100, Math.round((totalRevenue / 150000) * 100))}%
              </span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">cleared</span>
            </RadialRing>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[0.68rem] font-bold text-brown-soft dark:text-[#98a793]">7-Day Inflows</p>
              <MiniSparklineBars data={REVENUE_SPARKLINE} height={50} />
            </div>
          </div>
        </StatCard>

        <StatCard
          title="Pending Courier COD"
          value={bdt(totalCodPendingAmount)}
          subtitle={`${pendingCodOrders.length} orders awaiting payout`}
          trend={totalCodPendingAmount > 50000 ? "Action Required" : "Normal"}
          trendUp={totalCodPendingAmount <= 50000}
          icon={<Clock className="size-6 text-amber-700" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={courierCodSegments}
              size={110}
              thickness={13}
              centerValue={pendingCodOrders.length}
              centerLabel="orders"
            />
            <ChartLegend
              items={courierCodSegments.map((s) => ({
                label: s.label,
                color: s.color,
                value: bdt(s.value),
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Garden & Packaging COGS"
          value={bdt(totalCogs)}
          subtitle="Auction lots & pouch materials"
          trend="Production cost"
          trendUp
          icon={<ArrowDownRight className="size-6 text-rose-700" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={cogsSegments}
              size={110}
              thickness={13}
              centerValue={cogsSegments.length}
              centerLabel="cost lines"
            />
            <ChartLegend
              items={cogsSegments.map((s) => ({
                label: s.label,
                color: s.color,
                value: bdt(s.value),
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Gross Operating Profit"
          value={bdt(netOperatingProfit)}
          subtitle="Tea wholesale & retail margins"
          trend="Healthy margins"
          trendUp
          highlight
          icon={<Wallet className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={profitMarginPct}
              size={106}
              stroke={12}
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{profitMarginPct}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">margin</span>
            </RadialRing>
            <div className="min-w-0 flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-brown-soft dark:text-[#98a793]">
                <span>Revenue:</span>
                <span className="font-mono font-bold text-brown dark:text-[#f4f7f2]">{bdt(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-brown-soft dark:text-[#98a793]">
                <span>COGS:</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">-{bdt(totalCogs)}</span>
              </div>
              <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-1 flex items-center justify-between font-bold text-leaf-deep dark:text-[#c3d65a]">
                <span>Net:</span>
                <span className="font-mono">{bdt(netOperatingProfit)}</span>
              </div>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Courier COD Reconciliation Section */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
        <div className="border-b border-black/[0.06] dark:border-white/[0.06] bg-cream/40 dark:bg-[#161d15] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
              <Truck className="size-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brown dark:text-[#f4f7f2]">Courier COD Cash Reconciliation</h3>
              <p className="text-xs text-brown-soft dark:text-[#98a793]">
                Match customer cash payments with courier remittance bank statements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-cream-2/70 dark:bg-[#111611] p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
            {(["All", "Steadfast", "Pathao"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCourierFilter(p)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  courierFilter === p
                    ? "bg-leaf text-cream shadow-2xs font-bold"
                    : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-cream/20 dark:bg-[#161d15]/60 font-bold text-brown dark:text-[#f4f7f2] uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Buyer & Destination</th>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-4">Consignment Tracking</th>
                <th className="py-3 px-4 text-right">COD Cash to Remit</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {filteredCodOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-brown-soft dark:text-[#98a793]">
                    <CheckCircle2 className="size-7 mx-auto text-emerald-600 dark:text-emerald-400 mb-1.5" />
                    <p className="font-bold text-sm text-brown dark:text-[#f4f7f2]">All courier COD disbursements are fully settled!</p>
                    <p className="text-xs text-brown-soft dark:text-[#98a793] mt-0.5">No pending courier remittance payouts outstanding.</p>
                  </td>
                </tr>
              ) : (
                filteredCodOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/15 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-leaf-deep dark:text-[#a5be16] text-sm">
                      {order.id}
                      <p className="text-[0.65rem] text-brown-soft dark:text-[#98a793] font-sans font-normal">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-brown dark:text-[#f4f7f2]">{order.customer.name}</p>
                      <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">{order.customer.city} ({order.customer.buyerType})</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-brown dark:text-[#f4f7f2]">
                      <span className="rounded-md bg-cream dark:bg-[#1e271c] px-2 py-0.5 border border-black/[0.06] dark:border-white/[0.08]">
                        {order.courier.partner}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-brown-soft dark:text-[#98a793]">
                      {order.courier.trackingCode || "Awaiting Rider Pickup"}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-brown dark:text-[#f4f7f2]">
                      {bdt(order.total)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => erpActions.settleCodOrder(order.id)}
                        className="btn btn-leaf text-xs py-1 px-3 rounded-xl flex items-center gap-1.5 ml-auto shadow-2xs hover:shadow-xs"
                      >
                        <HandCoins className="size-3.5" />
                        <span>Confirm Remittance</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Financial Ledger */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
        <div className="border-b border-black/[0.06] dark:border-white/[0.06] bg-cream/40 dark:bg-[#161d15] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
              <Receipt className="size-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brown dark:text-[#f4f7f2]">General Accounts & Expense Ledger</h3>
              <p className="text-xs text-brown-soft dark:text-[#98a793]">
                Operating cashflows, garden lot purchases, packaging costs & settled revenue
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-leaf dark:text-[#c3d65a] bg-cream dark:bg-[#1e271c] px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08]">
            {transactions.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-cream/20 dark:bg-[#161d15]/60 font-bold text-brown dark:text-[#f4f7f2] uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction / Memo</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {transactions.map((tx) => {
                const isRevenue = tx.category === "Revenue";
                return (
                  <tr key={tx.id} className="hover:bg-cream/15 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-brown-soft dark:text-[#98a793]">{tx.date}</td>
                    <td className="py-3.5 px-4 font-bold text-brown dark:text-[#f4f7f2]">{tx.title}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          isRevenue
                            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-400/25"
                            : "bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-400/25"
                        }`}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brown-soft dark:text-[#98a793]">{tx.referenceId || "—"}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                        isRevenue ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {isRevenue ? `+${bdt(tx.amount)}` : `-${bdt(tx.amount)}`}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold ${
                          tx.status === "cleared"
                            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-400/25"
                            : "bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-400/25"
                        }`}
                      >
                        {tx.status === "cleared" ? "Cleared" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
