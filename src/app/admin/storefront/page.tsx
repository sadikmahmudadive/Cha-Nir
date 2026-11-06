"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  DollarSign,
  Globe,
  Plus,
  Save,
  Sparkles,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";

type SettingsTab = "delivery" | "bulk" | "featured" | "branding";

export default function AdminStorefrontSettingsPage() {
  const { storeSettings, products } = useErpStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("delivery");
  const [deliveryFee, setDeliveryFee] = useState(storeSettings.deliveryFee);
  const [freeDeliveryOver, setFreeDeliveryOver] = useState(storeSettings.freeDeliveryOver);
  const [supportPhone, setSupportPhone] = useState(storeSettings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(storeSettings.supportEmail);
  const [warehouseAddress, setWarehouseAddress] = useState(storeSettings.warehouseAddress);
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>(storeSettings.featuredSlugs);
  const [marqueeItems, setMarqueeItems] = useState<string[]>(storeSettings.marqueeItems);
  const [newMarqueeItem, setNewMarqueeItem] = useState("");
  const [bulkTiers, setBulkTiers] = useState([...storeSettings.bulkTiers]);
  const [saved, setSaved] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    erpActions.updateStoreSettings({
      deliveryFee,
      freeDeliveryOver,
      supportPhone,
      supportEmail,
      warehouseAddress,
      featuredSlugs,
      marqueeItems,
      bulkTiers,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleFeatured = (slug: string) => {
    if (featuredSlugs.includes(slug)) {
      if (featuredSlugs.length <= 1) return;
      setFeaturedSlugs(featuredSlugs.filter((s) => s !== slug));
    } else {
      if (featuredSlugs.length >= 4) {
        alert("The homepage best sellers grid displays up to 4 teas. Uncheck one first.");
        return;
      }
      setFeaturedSlugs([...featuredSlugs, slug]);
    }
  };

  const addMarqueeItem = () => {
    if (!newMarqueeItem.trim()) return;
    setMarqueeItems([...marqueeItems, newMarqueeItem.trim()]);
    setNewMarqueeItem("");
  };

  const removeMarqueeItem = (idx: number) => {
    setMarqueeItems(marqueeItems.filter((_, i) => i !== idx));
  };

  const updateTierPct = (idx: number, pct: number) => {
    const updated = [...bulkTiers];
    updated[idx] = { ...updated[idx], pct };
    setBulkTiers(updated);
  };

  const updateTierKg = (idx: number, kg: number) => {
    const updated = [...bulkTiers];
    updated[idx] = { ...updated[idx], kg };
    setBulkTiers(updated);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-brown dark:text-[#f4f7f2]">
            Storefront CMS & Configuration
          </h2>
          <p className="text-xs text-brown-soft dark:text-[#98a793]">
            Manage delivery thresholds, homepage featured teas, ticker marquee & contact info
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="btn btn-leaf text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs hover:shadow-md shrink-0 transition-all"
        >
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          <span>{saved ? "Changes Saved!" : "Save All Changes"}</span>
        </button>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-1 shadow-2xs overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "delivery"
              ? "bg-leaf text-cream shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c]"
          }`}
        >
          <Truck className="size-3.5" />
          <span>Delivery & Shipping</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bulk")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "bulk"
              ? "bg-leaf text-cream shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c]"
          }`}
        >
          <DollarSign className="size-3.5" />
          <span>Bulk Weight Discounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("featured")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "featured"
              ? "bg-leaf text-cream shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c]"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Homepage Best Sellers ({featuredSlugs.length}/4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "branding"
              ? "bg-leaf text-cream shadow-xs"
              : "text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c]"
          }`}
        >
          <Globe className="size-3.5" />
          <span>Store Ticker & Contact</span>
        </button>
      </div>

      {/* TAB 1: Delivery & Shipping */}
      {activeTab === "delivery" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
                  Nationwide Courier Delivery Rates
                </h3>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">
                  Configured rider charges calculated automatically at customer checkout
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-brown dark:text-[#f4f7f2]">Standard Delivery Charge (৳ BDT)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brown dark:text-[#98a793]">৳</span>
                  <input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] pl-8 pr-4 py-2.5 text-xs bg-cream/30 dark:bg-[#111611] font-mono font-bold text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden"
                  />
                </div>
                <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">Default rider fee applied for orders below threshold</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-brown dark:text-[#f4f7f2]">Free Delivery Threshold (৳ BDT)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brown dark:text-[#98a793]">৳</span>
                  <input
                    type="number"
                    min={0}
                    value={freeDeliveryOver}
                    onChange={(e) => setFreeDeliveryOver(Number(e.target.value))}
                    className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] pl-8 pr-4 py-2.5 text-xs bg-cream/30 dark:bg-[#111611] font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:border-leaf focus:outline-hidden"
                  />
                </div>
                <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">Orders exceeding this total receive 100% free shipping</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Weight Discounts */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
                <DollarSign className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
                  Automated Wholesale Bulk Weight Discounts
                </h3>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">
                  Automatically applied at checkout when total kilograms across items match tier
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              {bulkTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-linear-to-b from-white to-cream/30 dark:from-[#182018] dark:to-[#141a14] p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
                    <span className="font-bold text-leaf-deep dark:text-[#c3d65a] text-sm">{tier.label} Tier</span>
                    <span className="rounded-full bg-lime/40 dark:bg-lime/20 px-2 py-0.5 text-[0.65rem] font-bold text-leaf-deep dark:text-[#c3d65a]">
                      {tier.pct}% OFF
                    </span>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] text-brown-soft dark:text-[#98a793] font-semibold mb-1">
                      Minimum Weight Threshold (kg)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={tier.kg}
                      onChange={(e) => updateTierKg(idx, Number(e.target.value))}
                      className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2 text-xs font-mono font-bold bg-white dark:bg-[#111611] text-brown dark:text-[#f4f7f2] focus:border-leaf"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.68rem] text-brown-soft dark:text-[#98a793] font-semibold mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={tier.pct}
                      onChange={(e) => updateTierPct(idx, Number(e.target.value))}
                      className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2 text-xs font-mono font-bold text-leaf dark:text-[#c3d65a] bg-white dark:bg-[#111611] focus:border-leaf"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Homepage Featured Teas (Visual Picker) */}
      {activeTab === "featured" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-lime/30 dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
                  <Sparkles className="size-5 text-leaf dark:text-[#c3d65a]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
                    Homepage Featured Teas (&ldquo;everyone reorders.&rdquo;)
                  </h3>
                  <p className="text-xs text-brown-soft dark:text-[#98a793]">
                    Select exactly up to 4 teas to be highlighted prominently on the homepage
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-leaf dark:text-[#c3d65a] bg-cream dark:bg-[#1e271c] px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] self-start sm:self-auto">
                {featuredSlugs.length} / 4 Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {products.map((p) => {
                const isFeatured = featuredSlugs.includes(p.slug);
                return (
                  <div
                    key={p.slug}
                    onClick={() => toggleFeatured(p.slug)}
                    className={`relative rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 select-none ${
                      isFeatured
                        ? "border-leaf dark:border-leaf bg-leaf-soft/30 dark:bg-leaf/15 ring-2 ring-leaf shadow-sm"
                        : "border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161d15] hover:border-black/[0.2] dark:hover:border-white/[0.2] hover:bg-cream/20 dark:hover:bg-[#1e271c]"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream/60 dark:bg-[#111611] border border-black/[0.06] dark:border-white/[0.06] mb-2.5">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                      {isFeatured && (
                        <div className="absolute top-2 right-2 size-6 rounded-full bg-leaf text-cream flex items-center justify-center shadow-xs">
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[0.65rem] font-bold text-leaf dark:text-[#a5be16] uppercase tracking-wider">
                      {p.category}
                    </p>
                    <p className="font-serif font-bold text-xs text-brown dark:text-[#f4f7f2] line-clamp-1 mt-0.5">
                      {p.name}
                    </p>
                    <p className="text-[0.65rem] text-brown-soft dark:text-[#98a793] line-clamp-1">{p.grade}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Store Ticker & Contact Branding */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          {/* Live Marquee Ticker Editor */}
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
                <Store className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
                  Storefront Marquee Ticker Strip
                </h3>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">
                  Animated announcement phrases that scroll smoothly on the homepage
                </p>
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="rounded-xl overflow-hidden bg-leaf text-cream dark:bg-[#192418] dark:text-[#f4f7f2] dark:border dark:border-leaf/30 py-2.5 px-4 shadow-inner text-xs font-bold tracking-wide">
              <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
                <span className="text-lime dark:text-[#c3d65a] text-[0.68rem] uppercase tracking-widest font-sans">Live Preview:</span>
                <div className="flex items-center gap-6 animate-pulse">
                  {marqueeItems.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Existing Phrase Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {marqueeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-cream/50 dark:bg-[#1c241b] px-3 py-1.5 text-xs font-semibold text-brown dark:text-[#f4f7f2] group hover:border-black/[0.2] dark:hover:border-white/[0.2]"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeMarqueeItem(idx)}
                    className="text-brown-soft dark:text-[#98a793] hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5 rounded-full"
                    title="Remove item"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add phrase input */}
            <div className="flex gap-2 max-w-lg pt-1">
              <input
                type="text"
                value={newMarqueeItem}
                onChange={(e) => setNewMarqueeItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMarqueeItem();
                  }
                }}
                placeholder="Add announcement phrase (e.g. Free delivery on orders over ৳1,500)..."
                className="flex-1 rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#111611] text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden dark:placeholder-[#98a793]/60"
              />
              <button
                type="button"
                onClick={addMarqueeItem}
                className="btn btn-leaf text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Add Phrase</span>
              </button>
            </div>
          </div>

          {/* Contact and Facility Details */}
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
                <Globe className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
                  Support Contact & Facility Address
                </h3>
                <p className="text-xs text-brown-soft dark:text-[#98a793]">
                  Displayed on public storefront footer and packing slip invoices
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-brown dark:text-[#f4f7f2]">Customer Support Hotline</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#111611] font-mono font-bold text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-brown dark:text-[#f4f7f2]">Inquiries Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#111611] font-mono text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 text-brown dark:text-[#f4f7f2]">
                  Central Warehouse & Blending Facility Address
                </label>
                <input
                  type="text"
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-2.5 text-xs bg-cream/30 dark:bg-[#111611] text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button Bottom */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => handleSave()}
          className="btn btn-leaf text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs hover:shadow-md transition-all"
        >
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          <span>{saved ? "Settings Saved Successfully!" : "Save All Changes"}</span>
        </button>
      </div>
    </div>
  );
}
