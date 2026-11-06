"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { bdt } from "@/lib/pricing";
import { erpActions } from "@/lib/erp/erp-store";
import type { BuyerType, CourierPartner, OrderItem } from "@/lib/erp/types";

const BUYER_TYPES: BuyerType[] = [
  "Tea stall",
  "Tea shop / retailer",
  "Hotel",
  "Restaurant / café",
  "Home",
  "Other business",
];

const COURIERS: CourierPartner[] = ["Steadfast", "Pathao", "RedX", "Self Delivery", "Truck Wholesale"];

function createUniqueOrderId() {
  return `CN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function getNowIso() {
  return new Date().toISOString();
}

export function NewOrderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [buyerType, setBuyerType] = useState<BuyerType>("Tea stall");
  const [courier, setCourier] = useState<CourierPartner>("Steadfast");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "bKash" | "Bank Transfer">("COD");
  const [notes, setNotes] = useState("");

  // Items
  const [items, setItems] = useState<OrderItem[]>([
    {
      slug: PRODUCTS[0].slug,
      productName: PRODUCTS[0].name,
      variantId: PRODUCTS[0].variants[PRODUCTS[0].variants.length - 1].id,
      variantLabel: PRODUCTS[0].variants[PRODUCTS[0].variants.length - 1].label,
      grams: PRODUCTS[0].variants[PRODUCTS[0].variants.length - 1].grams,
      unitPrice: PRODUCTS[0].variants[PRODUCTS[0].variants.length - 1].price,
      qty: 2,
      total: PRODUCTS[0].variants[PRODUCTS[0].variants.length - 1].price * 2,
    },
  ]);

  if (!isOpen) return null;

  const addItem = () => {
    const p = PRODUCTS[0];
    const v = p.variants[0];
    setItems([
      ...items,
      {
        slug: p.slug,
        productName: p.name,
        variantId: v.id,
        variantLabel: v.label,
        grams: v.grams,
        unitPrice: v.price,
        qty: 1,
        total: v.price,
      },
    ]);
  };

  const updateItem = (index: number, slug: string, variantId: string, qty: number) => {
    const p = PRODUCTS.find((x) => x.slug === slug) || PRODUCTS[0];
    const v = p.variants.find((x) => x.id === variantId) || p.variants[0];
    const updated = [...items];
    const validQty = Math.max(1, qty);
    updated[index] = {
      slug: p.slug,
      productName: p.name,
      variantId: v.id,
      variantLabel: v.label,
      grams: v.grams,
      unitPrice: v.price,
      qty: validQty,
      total: v.price * validQty,
    };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalKg = items.reduce((sum, item) => sum + (item.grams * item.qty) / 1000, 0);

  // Bulk tier
  let discountPct = 0;
  let tierLabel = "";
  if (totalKg >= 50) {
    discountPct = 12;
    tierLabel = "Wholesale (12%)";
  } else if (totalKg >= 25) {
    discountPct = 8;
    tierLabel = "Shop (8%)";
  } else if (totalKg >= 10) {
    discountPct = 5;
    tierLabel = "Counter (5%)";
  }

  const discount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Please enter customer name, phone, and delivery address.");
      return;
    }

    const newId = createUniqueOrderId();
    erpActions.addOrder({
      id: newId,
      createdAt: getNowIso(),
      customer: {
        name,
        phone,
        address,
        city,
        buyerType,
      },
      items,
      subtotal,
      discount,
      tierLabel: tierLabel || undefined,
      deliveryFee: 0,
      total,
      totalKg,
      status: "processing",
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "unpaid" : "paid",
      courier: {
        partner: courier,
        codFee: paymentMethod === "COD" ? Math.round(total * 0.01) : 0,
      },
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#141a14] shadow-2xl my-8 overflow-hidden text-brown dark:text-[#f4f7f2] font-sans border border-line dark:border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-line dark:border-white/[0.08] bg-cream/50 dark:bg-white/[0.04] px-6 py-4">
          <h3 className="font-serif text-lg font-bold">Create New Commercial / Wholesale Order</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-cream dark:hover:bg-white/[0.06] text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2]">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Customer / Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Al-Amin Tea Stall"
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2] focus:border-leaf"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Mobile Number (BD) *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712 345678"
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2] focus:border-leaf"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Buyer Classification</label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2]"
              >
                {BUYER_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">City / District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dhaka, Sylhet, Chittagong..."
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2] focus:border-leaf"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">Delivery Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full stall counter, shop number, or hotel address"
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2] focus:border-leaf"
              />
            </div>
          </div>

          {/* Line items */}
          <div className="border-t border-line dark:border-white/[0.08] pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm">Order Items & Tea Packs</span>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-ghost border border-line dark:border-white/[0.12] text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 text-brown dark:text-[#f4f7f2]"
              >
                <Plus className="size-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const selectedProduct = PRODUCTS.find((p) => p.slug === item.slug) || PRODUCTS[0];
                return (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border border-line dark:border-white/[0.08] bg-cream/20 dark:bg-white/[0.03]">
                    <select
                      value={item.slug}
                      onChange={(e) => {
                        const newP = PRODUCTS.find((x) => x.slug === e.target.value) || PRODUCTS[0];
                        updateItem(index, newP.slug, newP.variants[0].id, item.qty);
                      }}
                      className="flex-1 rounded-lg border border-line dark:border-white/[0.1] p-1.5 text-xs bg-white dark:bg-[#151c14] text-brown dark:text-[#f4f7f2]"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>

                    <select
                      value={item.variantId}
                      onChange={(e) => updateItem(index, item.slug, e.target.value, item.qty)}
                      className="w-28 rounded-lg border border-line dark:border-white/[0.1] p-1.5 text-xs bg-white dark:bg-[#151c14] text-brown dark:text-[#f4f7f2]"
                    >
                      {selectedProduct.variants.map((v) => (
                        <option key={v.id} value={v.id}>{v.label} ({bdt(v.price)})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(index, item.slug, item.variantId, Number(e.target.value))}
                      className="w-16 rounded-lg border border-line dark:border-white/[0.1] p-1.5 text-xs text-center font-bold bg-white dark:bg-[#151c14] text-brown dark:text-[#f4f7f2]"
                    />

                    <span className="w-20 font-mono font-bold text-right text-xs text-brown dark:text-[#f4f7f2]">
                      {bdt(item.total)}
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fulfillment & Payment */}
          <div className="grid grid-cols-2 gap-4 border-t border-line dark:border-white/[0.08] pt-4">
            <div>
              <label className="block font-bold mb-1">Courier Partner</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value as CourierPartner)}
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2]"
              >
                {COURIERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "COD" | "bKash" | "Bank Transfer")
                }
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2]"
              >
                <option value="COD">Cash On Delivery (COD)</option>
                <option value="bKash">bKash Merchant Pay</option>
                <option value="Bank Transfer">Bank Transfer (Commercial)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-bold mb-1">Special Packing / Commercial Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Heavy-duty poly woven sack, deliver before 10 AM"
                className="w-full rounded-xl border border-line dark:border-white/[0.1] p-2 text-xs bg-cream/30 dark:bg-[#192218] text-brown dark:text-[#f4f7f2]"
              />
            </div>
          </div>

          {/* Order Totals */}
          <div className="rounded-xl border border-leaf/30 dark:border-leaf/40 bg-leaf-soft/30 dark:bg-leaf/15 p-4 space-y-1">
            <div className="flex justify-between text-brown-soft dark:text-[#98a793]">
              <span>Total Volume:</span>
              <span className="font-bold text-leaf dark:text-lime-soft font-mono">{totalKg} kg</span>
            </div>
            <div className="flex justify-between text-brown dark:text-[#f4f7f2]">
              <span>Subtotal:</span>
              <span className="font-mono">{bdt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                <span>Tier Discount ({tierLabel}):</span>
                <span className="font-mono">-{bdt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line/60 dark:border-white/10 pt-1 text-sm font-bold text-brown dark:text-[#f4f7f2]">
              <span>Payable Total:</span>
              <span className="font-mono text-base font-extrabold text-leaf-deep dark:text-lime-soft">{bdt(total)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost border border-line dark:border-white/[0.12] text-xs px-4 py-2 text-brown dark:text-[#f4f7f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-leaf text-xs px-5 py-2"
            >
              Confirm & Book Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
