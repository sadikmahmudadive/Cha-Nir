"use client";

import { useMemo, useState } from "react";
import {
  Coffee,
  Building2,
  Home,
  Package,
  Printer,
  Search,
  Send,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { BuyerTypeBadge, OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import dynamic from "next/dynamic";
import { bdt } from "@/lib/pricing";
import type { BuyerType, Order, OrderStatus } from "@/lib/erp/types";

const PackingSlipModal = dynamic(
  () => import("@/components/admin/PackingSlipModal").then((m) => m.PackingSlipModal),
  { ssr: false }
);

const STATUS_TABS: { label: string; value: "all" | OrderStatus }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Packing", value: "processing" },
  { label: "With Courier", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const BUYER_TABS: { label: string; value: "all" | BuyerType; icon?: typeof Coffee }[] = [
  { label: "All Channels", value: "all" },
  { label: "Tea Stall", value: "Tea stall", icon: Coffee },
  { label: "Retail Shop", value: "Tea shop / retailer", icon: Store },
  { label: "Hotel", value: "Hotel", icon: Building2 },
  { label: "Restaurant", value: "Restaurant / café", icon: UtensilsCrossed },
  { label: "Home", value: "Home", icon: Home },
];

export default function AdminOrdersPage() {
  const { orders } = useErpStore();
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [buyerFilter, setBuyerFilter] = useState<"all" | BuyerType>("all");
  const [search, setSearch] = useState("");
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (buyerFilter !== "all" && order.customer.buyerType !== buyerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchName = order.customer.name.toLowerCase().includes(q);
        const matchPhone = order.customer.phone.toLowerCase().includes(q);
        const matchCity = order.customer.city.toLowerCase().includes(q);
        const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchId && !matchName && !matchPhone && !matchCity && !matchItem) return false;
      }
      return true;
    });
  }, [orders, statusFilter, buyerFilter, search]);

  const totalFilteredAmount = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalFilteredKg = filteredOrders.reduce((sum, o) => sum + o.totalKg, 0);

  return (
    <div className="space-y-6">
      {/* Search & Matching Stats Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft dark:text-[#98a793]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, stall name, phone, or destination..."
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#151c14] pl-10 pr-9 py-2 text-xs text-brown dark:text-[#f4f7f2] placeholder:text-brown-soft/60 dark:placeholder:text-[#98a793]/60 focus:border-leaf dark:focus:border-leaf focus:outline-hidden shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] rounded-md"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Live Filter Totals Ticker */}
        <div className="flex items-center gap-3 text-xs bg-cream/60 dark:bg-[#161d15] border border-black/[0.06] dark:border-white/[0.07] px-4 py-2 rounded-xl shadow-2xs text-brown-soft dark:text-[#98a793]">
          <span className="font-semibold">Matching:</span>
          <span className="font-bold text-brown dark:text-[#f4f7f2]">{filteredOrders.length} orders</span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="font-mono font-bold text-leaf dark:text-lime-soft">{totalFilteredKg} kg</span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="font-mono font-bold text-leaf-deep dark:text-lime-soft">{bdt(totalFilteredAmount)}</span>
        </div>
      </div>

      {/* Filter Tabs Container */}
      <div className="space-y-2.5">
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "all" ? orders.length : orders.filter((o) => o.status === tab.value).length;
            const on = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  on
                    ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2] shadow-xs"
                    : "bg-white dark:bg-[#161d15] border border-black/[0.08] dark:border-white/[0.08] text-brown-soft dark:text-[#98a793] hover:bg-cream dark:hover:bg-white/[0.06] hover:text-brown dark:hover:text-[#f4f7f2]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-mono ${
                    on ? "bg-cream dark:bg-lime/20 text-leaf-deep dark:text-lime-soft" : "bg-cream-2 dark:bg-white/[0.08] text-brown dark:text-[#f4f7f2]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buyer Channel Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-0.5 pb-1 [scrollbar-width:none] text-[0.75rem]">
          <span className="flex items-center text-brown-soft dark:text-[#98a793] font-bold text-[0.68rem] uppercase mr-1">
            Channel:
          </span>
          {BUYER_TABS.map((b) => {
            const on = buyerFilter === b.value;
            const Icon = b.icon;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => setBuyerFilter(b.value)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all shrink-0 ${
                  on
                    ? "bg-brown dark:bg-leaf text-cream dark:text-[#f4f7f2] shadow-2xs"
                    : "bg-cream/40 dark:bg-white/[0.04] text-brown-soft dark:text-[#98a793] hover:bg-cream-2 dark:hover:bg-white/[0.08] hover:text-brown dark:hover:text-[#f4f7f2]"
                }`}
              >
                {Icon && <Icon className="size-3" />}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.07] bg-cream/40 dark:bg-[#182017] font-bold text-brown dark:text-[#f4f7f2] uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Channel</th>
                <th className="py-3 px-4">Teas & Weight</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4">Courier / COD</th>
                <th className="py-3 px-4">Status & Pipeline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brown-soft dark:text-[#98a793]">
                    <Package className="size-8 mx-auto text-line dark:text-white/20 mb-2" />
                    <p className="font-bold text-brown dark:text-[#f4f7f2]">No orders match the selected filters</p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setBuyerFilter("all");
                        setSearch("");
                      }}
                      className="mt-2 text-xs font-bold text-leaf dark:text-lime-soft hover:underline"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/15 dark:hover:bg-white/[0.03] transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-leaf-deep dark:text-lime-soft text-sm">{order.id}</p>
                      <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-brown dark:text-[#f4f7f2] truncate">{order.customer.name}</p>
                      <p className="text-[0.68rem] text-leaf dark:text-lime-soft font-medium">{order.customer.phone}</p>
                      <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793] truncate">{order.customer.city}</p>
                      <div className="mt-1">
                        <BuyerTypeBadge type={order.customer.buyerType} />
                      </div>
                    </td>

                    {/* Teas & Weight */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="space-y-0.5">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs text-brown dark:text-[#f4f7f2] line-clamp-1">
                            <span className="font-semibold">{item.qty}×</span> {item.productName}{" "}
                            <span className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">({item.variantLabel})</span>
                          </p>
                        ))}
                      </div>
                      <p className="font-mono font-bold text-[0.72rem] text-leaf dark:text-lime-soft mt-1">
                        Gross Weight: {order.totalKg} kg
                      </p>
                    </td>

                    {/* Financials */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-mono font-bold text-sm text-brown dark:text-[#f4f7f2]">{bdt(order.total)}</p>
                      {order.discount > 0 && (
                        <p className="text-[0.65rem] text-emerald-700 dark:text-emerald-400 font-bold">
                          Tier -{bdt(order.discount)}
                        </p>
                      )}
                      <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">
                        {order.paymentMethod}
                      </p>
                    </td>

                    {/* Courier & COD */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-xs text-brown dark:text-[#f4f7f2]">{order.courier.partner}</p>
                      {order.courier.trackingCode && (
                        <p className="font-mono text-[0.68rem] text-brown-soft dark:text-[#98a793] truncate max-w-[120px]">
                          {order.courier.trackingCode}
                        </p>
                      )}
                      <div className="mt-1">
                        <PaymentStatusBadge status={order.paymentStatus} method={order.paymentMethod} />
                      </div>
                    </td>

                    {/* Status & Pipeline */}
                    <td className="py-3.5 px-4 space-y-1.5">
                      <OrderStatusBadge status={order.status} />
                      <div>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            erpActions.updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="w-full rounded-lg border border-black/[0.1] dark:border-white/[0.1] p-1 text-[0.7rem] font-semibold bg-white dark:bg-[#161d15] text-brown dark:text-[#f4f7f2] focus:border-leaf"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing / Packing</option>
                          <option value="dispatched">With Courier</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSlipOrder(order)}
                          className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] hover:border-leaf dark:hover:border-leaf p-1.5 text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06] transition-colors"
                          title="Print Packing Slip / Commercial Invoice"
                        >
                          <Printer className="size-4" />
                        </button>

                        {order.status === "processing" && (
                          <button
                            type="button"
                            onClick={() =>
                              erpActions.updateOrderStatus(order.id, "dispatched", {
                                trackingCode: `STF-${Math.floor(10000 + Math.random() * 90000)}`,
                              })
                            }
                            className="btn bg-purple-700 text-white hover:bg-purple-800 p-1.5 rounded-lg shadow-2xs"
                            title="Dispatch Courier"
                          >
                            <Send className="size-4" />
                          </button>
                        )}

                        {order.status === "delivered" && order.paymentStatus !== "settled" && (
                          <button
                            type="button"
                            onClick={() => erpActions.settleCodOrder(order.id)}
                            className="btn btn-leaf text-xs py-1 px-2.5 rounded-lg shadow-2xs"
                            title="Settle Cash Remittance"
                          >
                            Settle COD
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Slip Modal */}
      {selectedSlipOrder && (
        <PackingSlipModal
          order={selectedSlipOrder}
          onClose={() => setSelectedSlipOrder(null)}
        />
      )}
    </div>
  );
}
