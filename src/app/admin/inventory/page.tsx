"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Edit2,
  Package,
  Scale,
  Sparkles,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";
import { StatCard } from "@/components/admin/StatCard";
import { DonutChart, RadialRing, ChartLegend, CHART_COLORS } from "@/components/admin/charts";

export default function AdminInventoryPage() {
  const { inventory, rawLots, packaging } = useErpStore();
  const [tab, setTab] = useState<"skus" | "raw" | "packaging">("skus");
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState<number>(0);

  // Metrics
  const totalFinishedKg = inventory.reduce((sum, item) => sum + item.inStockKg, 0);
  const totalRawKg = rawLots.reduce((sum, lot) => sum + lot.remainingKg, 0);
  const totalInitialRawKg = rawLots.reduce((sum, lot) => sum + lot.initialKg, 0);
  const rawRemainingPct = totalInitialRawKg > 0 ? Math.round((totalRawKg / totalInitialRawKg) * 100) : 0;
  const lowStockSkus = inventory.filter((i) => i.inStockUnits <= i.reorderPointUnits);
  const healthyCount = inventory.length - lowStockSkus.length;
  const healthRate = inventory.length > 0 ? Math.round((healthyCount / inventory.length) * 100) : 100;

  const categorySegments = useMemo(() => {
    const cats: Record<string, number> = {};
    inventory.forEach((item) => {
      cats[item.category] = (cats[item.category] || 0) + item.inStockKg;
    });
    return [
      { label: "Black Tea", value: Math.round((cats["Black Tea"] || 0) * 10) / 10, color: CHART_COLORS.leaf },
      { label: "Green Tea", value: Math.round((cats["Green Tea"] || 0) * 10) / 10, color: CHART_COLORS.emerald },
      { label: "Specialty", value: Math.round((cats["Specialty"] || 0) * 10) / 10, color: CHART_COLORS.amber },
    ].filter((s) => s.value > 0);
  }, [inventory]);

  const rawLotsLegend = useMemo(() => {
    const activeLots = rawLots.filter((l) => l.status === "active").length;
    return [
      { label: "Active Lots", color: CHART_COLORS.leaf, value: `${activeLots} lots` },
      { label: "Remaining", color: CHART_COLORS.lime, value: `${Math.round(totalRawKg)} kg` },
      { label: "Initial Intake", color: CHART_COLORS.stone, value: `${Math.round(totalInitialRawKg)} kg` },
    ];
  }, [rawLots, totalRawKg, totalInitialRawKg]);

  const stockHealthLegend = useMemo(() => {
    return [
      { label: "Optimal Stock", color: CHART_COLORS.emerald, value: `${healthyCount} SKUs` },
      { label: "Low / Reorder", color: lowStockSkus.length > 0 ? CHART_COLORS.amber : CHART_COLORS.stone, value: `${lowStockSkus.length} SKUs` },
    ];
  }, [healthyCount, lowStockSkus]);

  const startEdit = (id: string, currentUnits: number) => {
    setEditingSku(id);
    setEditUnits(currentUnits);
  };

  const saveEdit = (id: string) => {
    erpActions.updateInventoryStock(id, editUnits);
    setEditingSku(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Metrics with Dynamic Round Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Packaged Warehouse Stock"
          value={`${totalFinishedKg.toLocaleString()} kg`}
          subtitle={`${inventory.length} active finished variant SKUs`}
          trend="Healthy"
          trendUp
          icon={<Package className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <DonutChart
              segments={categorySegments}
              size={110}
              thickness={13}
              centerValue={Math.round(totalFinishedKg)}
              centerLabel="kg"
            />
            <ChartLegend
              items={categorySegments.map((s) => ({
                label: s.label,
                color: s.color,
                value: `${Math.round(s.value)} kg`,
              }))}
            />
          </div>
        </StatCard>

        <StatCard
          title="Unblended Garden Lots"
          value={`${totalRawKg.toLocaleString()} kg`}
          subtitle={`${rawLots.length} Sreemangal & Sylhet auction lots`}
          trend="Raw supply"
          trendUp
          highlight
          icon={<Scale className="size-6 text-leaf" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={totalRawKg}
              max={totalInitialRawKg}
              size={106}
              stroke={12}
              color={CHART_COLORS.leaf}
              colorTo={CHART_COLORS.lime}
              trackColor="var(--chart-track, #e4ead6)"
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{rawRemainingPct}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">left</span>
            </RadialRing>
            <ChartLegend items={rawLotsLegend} />
          </div>
        </StatCard>

        <StatCard
          title="Inventory Alerts"
          value={`${lowStockSkus.length} Items`}
          subtitle="Below minimum reorder threshold"
          trend={lowStockSkus.length > 0 ? "Attention Required" : "Optimal"}
          trendUp={lowStockSkus.length === 0}
          icon={<AlertTriangle className="size-6 text-amber-700 dark:text-amber-400" />}
        >
          <div className="flex items-center gap-3.5 pt-1">
            <RadialRing
              value={healthRate}
              size={106}
              stroke={12}
              color={lowStockSkus.length === 0 ? CHART_COLORS.emerald : CHART_COLORS.amber}
              colorTo={lowStockSkus.length === 0 ? CHART_COLORS.lime : "#f97316"}
            >
              <span className="font-mono text-xl font-extrabold text-brown dark:text-[#f4f7f2] leading-none">{healthRate}%</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] mt-0.5">in stock</span>
            </RadialRing>
            <ChartLegend items={stockHealthLegend} />
          </div>
        </StatCard>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-1 shadow-2xs overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setTab("skus")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            tab === "skus"
              ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2] shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06]"
          }`}
        >
          <Boxes className="size-3.5" />
          <span>Packaged Goods SKUs ({inventory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("raw")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            tab === "raw"
              ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2] shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06]"
          }`}
        >
          <Scale className="size-3.5" />
          <span>Raw Tea Lots & Traceability ({rawLots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("packaging")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            tab === "packaging"
              ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2] shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06]"
          }`}
        >
          <Package className="size-3.5" />
          <span>Packaging Materials ({packaging.length})</span>
        </button>
      </div>

      {/* TAB 1: Packaged Goods SKUs */}
      {tab === "skus" && (
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.07] bg-cream/40 dark:bg-[#182017] font-bold text-brown dark:text-[#f4f7f2] uppercase text-[0.68rem] tracking-wider">
                  <th className="py-3 px-4">SKU / Product Name</th>
                  <th className="py-3 px-4">Grade & Category</th>
                  <th className="py-3 px-4">Pack Size</th>
                  <th className="py-3 px-4 text-center">In-Stock Units</th>
                  <th className="py-3 px-4 text-right">Total Weight</th>
                  <th className="py-3 px-4 text-right">Cost / Retail Price</th>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4 text-center">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {inventory.map((item) => {
                  const isLow = item.inStockUnits <= item.reorderPointUnits;
                  const isEditing = editingSku === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-cream/15 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-brown dark:text-[#f4f7f2]">{item.productName}</p>
                        <p className="font-mono text-[0.65rem] text-brown-soft/80 dark:text-[#98a793]">{item.id}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-leaf dark:text-lime-soft">{item.grade}</span>
                        <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">{item.category}</p>
                      </td>

                      <td className="py-3 px-4 font-semibold text-brown dark:text-[#f4f7f2]">{item.variantLabel}</td>

                      {/* Stock Adjustment Controls */}
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={editUnits}
                              onChange={(e) => setEditUnits(Number(e.target.value))}
                              className="w-16 rounded border border-leaf dark:border-lime p-1 text-center font-bold font-mono text-xs focus:outline-none bg-white dark:bg-[#192218] text-brown dark:text-[#f4f7f2]"
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              className="btn btn-leaf text-[0.7rem] px-2.5 py-1 rounded-md"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-brown dark:text-[#f4f7f2]">
                              {item.inStockUnits}
                            </span>
                            <button
                              type="button"
                              onClick={() => startEdit(item.id, item.inStockUnits)}
                              className="p-1 text-brown-soft dark:text-[#98a793] hover:text-leaf dark:hover:text-lime-soft rounded-md hover:bg-cream dark:hover:bg-white/[0.06]"
                              title="Adjust Stock Quantity"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-leaf dark:text-lime-soft text-sm">
                        {item.inStockKg} kg
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <p className="font-bold text-brown dark:text-[#f4f7f2]">{bdt(item.unitPrice)}</p>
                        <p className="text-[0.65rem] text-brown-soft dark:text-[#98a793]">Cost: {bdt(item.unitCost)}</p>
                      </td>

                      <td className="py-3 px-4 font-mono text-[0.7rem] text-brown-soft dark:text-[#98a793]">
                        {item.batchId}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/25 dark:border-amber-400/35 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="size-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-400/25 dark:border-emerald-400/35 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" /> Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Raw Tea Lots (Traceability) */}
      {tab === "raw" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rawLots.map((lot) => {
              const pct = Math.round((lot.remainingKg / lot.initialKg) * 100);
              return (
                <div
                  key={lot.id}
                  className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#151c14] p-5 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-leaf-deep dark:text-lime-soft">{lot.id}</span>
                      <h3 className="font-serif font-bold text-base text-brown dark:text-[#f4f7f2] mt-0.5">{lot.garden}</h3>
                      <p className="text-xs text-leaf dark:text-lime-soft font-semibold">{lot.grade}</p>
                    </div>

                    <span className="rounded-full bg-cream-2 dark:bg-white/[0.06] px-3 py-1 text-xs font-bold text-leaf-deep dark:text-lime-soft border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1">
                      <Sparkles className="size-3 text-leaf dark:text-lime" />
                      <span>Cupping: {lot.cuppingScore}/100</span>
                    </span>
                  </div>

                  {/* Volume Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brown-soft dark:text-[#98a793]">Remaining Stock:</span>
                      <span className="font-mono text-leaf-deep dark:text-lime-soft font-bold">
                        {lot.remainingKg} / {lot.initialKg} kg ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-cream-2 dark:bg-[#20291e] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct < 25 ? "bg-amber-500" : "bg-leaf dark:bg-lime"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Lot Details Grid */}
                  <div className="grid grid-cols-3 gap-2 border-t border-black/[0.06] dark:border-white/[0.07] pt-3 text-[0.7rem] text-brown-soft dark:text-[#98a793]">
                    <div>
                      <p className="font-semibold text-brown dark:text-[#f4f7f2]">Auction Invoice:</p>
                      <p className="font-mono text-brown-soft dark:text-[#98a793]">{lot.auctionInvoice}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-brown dark:text-[#f4f7f2]">Acquisition Cost:</p>
                      <p className="font-mono text-brown-soft dark:text-[#98a793]">{bdt(lot.costPerKg)} / kg</p>
                    </div>
                    <div>
                      <p className="font-semibold text-brown dark:text-[#f4f7f2]">Moisture Content:</p>
                      <p className="font-mono text-brown-soft dark:text-[#98a793]">{lot.moisturePct}%</p>
                    </div>
                  </div>

                  {lot.notes && (
                    <p className="text-xs text-brown-soft dark:text-[#98a793] bg-cream/40 dark:bg-white/[0.04] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                      <span className="font-bold text-brown dark:text-[#f4f7f2]">Cupping Profile:</span> {lot.notes}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const deduct = prompt(
                          `Enter kilograms to deduct for blending run (Current: ${lot.remainingKg} kg):`,
                          "50"
                        );
                        if (deduct && !isNaN(Number(deduct))) {
                          erpActions.updateRawLot(lot.id, lot.remainingKg - Number(deduct));
                        }
                      }}
                      className="btn btn-ghost border border-black/[0.1] dark:border-white/[0.12] hover:border-leaf dark:hover:border-leaf text-xs font-bold py-1.5 px-3.5 rounded-xl bg-white dark:bg-[#161d15] text-brown dark:text-[#f4f7f2]"
                    >
                      Log Blending Run (-kg)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Packaging Materials */}
      {tab === "packaging" && (
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.07] bg-cream/40 dark:bg-[#182017] font-bold text-brown dark:text-[#f4f7f2] uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Pack Capacity</th>
                <th className="py-3 px-4 text-center">In-Stock Units</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {packaging.map((pkg) => {
                const isLow = pkg.inStockUnits <= pkg.reorderPoint;
                return (
                  <tr key={pkg.id} className="hover:bg-cream/15 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brown dark:text-[#f4f7f2]">{pkg.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-leaf dark:text-lime-soft">{pkg.type}</td>
                    <td className="py-3.5 px-4 text-brown-soft dark:text-[#98a793]">{pkg.size}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-brown dark:text-[#f4f7f2]">
                      {pkg.inStockUnits.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-brown dark:text-[#f4f7f2]">
                      {bdt(pkg.costPerUnit)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/25 dark:border-amber-400/35 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-900 dark:text-amber-300">
                          Reorder Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-400/25 dark:border-emerald-400/35 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-800 dark:text-emerald-300">
                          Sufficient
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
