"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Coffee,
  Edit,
  Eye,
  Grid,
  List,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";
import type { Category, Product, Variant } from "@/lib/products";

const CATEGORIES: Category[] = ["Black Tea", "Green Tea", "Specialty"];
const BADGES = ["None", "Best seller", "New", "Wholesale favourite"];

export default function AdminProductsPage() {
  const { products } = useErpStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("Black Tea");
  const [formGrade, setFormGrade] = useState("CTC");
  const [formBadge, setFormBadge] = useState<string>("None");
  const [formTagline, setFormTagline] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formNotes, setFormNotes] = useState("Malty, Full-bodied, Amber");
  const [formBrewTemp, setFormBrewTemp] = useState("100°C");
  const [formBrewTime, setFormBrewTime] = useState("3–4 min");
  const [formBrewAmount, setFormBrewAmount] = useState("1 tsp per cup");
  const [formVariants, setFormVariants] = useState<Variant[]>([
    { id: "250g", label: "250 g", grams: 250, price: 220 },
    { id: "500g", label: "500 g", grams: 500, price: 420 },
    { id: "1000g", label: "1 kg", grams: 1000, price: 800 },
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchGrade = p.grade.toLowerCase().includes(q);
        const matchSlug = p.slug.toLowerCase().includes(q);
        if (!matchName && !matchGrade && !matchSlug) return false;
      }
      return true;
    });
  }, [products, selectedCategory, search]);

  const openAddModal = () => {
    setEditingSlug(null);
    setFormName("");
    setFormCategory("Black Tea");
    setFormGrade("CTC");
    setFormBadge("None");
    setFormTagline("");
    setFormDesc("");
    setFormNotes("Malty, Rich, Full-bodied");
    setFormBrewTemp("100°C");
    setFormBrewTime("3–4 min");
    setFormBrewAmount("1 tsp per cup");
    setFormVariants([
      { id: "250g", label: "250 g", grams: 250, price: 220 },
      { id: "500g", label: "500 g", grams: 500, price: 420 },
      { id: "1000g", label: "1 kg", grams: 1000, price: 800 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingSlug(p.slug);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormGrade(p.grade);
    setFormBadge(p.badge || "None");
    setFormTagline(p.tagline);
    setFormDesc(p.description);
    setFormNotes(p.notes.join(", "));
    setFormBrewTemp(p.brew.temp);
    setFormBrewTime(p.brew.time);
    setFormBrewAmount(p.brew.amount);
    setFormVariants([...p.variants]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const notesArray = formNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingSlug) {
      erpActions.updateProduct(editingSlug, {
        name: formName,
        category: formCategory,
        grade: formGrade,
        badge: formBadge === "None" ? undefined : formBadge,
        tagline: formTagline,
        description: formDesc,
        notes: notesArray,
        brew: {
          temp: formBrewTemp,
          time: formBrewTime,
          amount: formBrewAmount,
        },
        variants: formVariants,
      });
    } else {
      const slug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const newProduct: Product = {
        slug: slug || `tea-${Date.now().toString(36)}`,
        name: formName,
        category: formCategory,
        grade: formGrade,
        image: "/img/chai-ready-pouch.webp",
        imageAlt: `${formName} packaged tea by Cha Nir`,
        tagline: formTagline || "Fresh, pure Bangladeshi garden tea.",
        description: formDesc || "Handpicked from Bangladesh's top tea estates.",
        notes: notesArray.length > 0 ? notesArray : ["Rich", "Aromatic"],
        brew: {
          temp: formBrewTemp,
          time: formBrewTime,
          amount: formBrewAmount,
        },
        bestFor: ["home", "stall", "shop"],
        variants: formVariants,
        badge: formBadge === "None" ? undefined : formBadge,
      };

      erpActions.addProduct(newProduct);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the storefront catalog?`)) {
      erpActions.deleteProduct(slug);
    }
  };

  const updateVariantPrice = (idx: number, newPrice: number) => {
    const updated = [...formVariants];
    updated[idx] = { ...updated[idx], price: Math.max(0, newPrice) };
    setFormVariants(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, grade, or slug..."
              className="w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 py-2 text-xs text-brown focus:border-leaf focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === c
                    ? "bg-leaf text-cream shadow-xs"
                    : "bg-white border border-black/[0.08] text-brown-soft hover:bg-cream hover:text-brown"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex rounded-xl border border-black/[0.08] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-leaf text-cream shadow-2xs"
                  : "text-brown-soft hover:text-brown hover:bg-cream"
              }`}
              title="Grid Card View"
            >
              <Grid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-leaf text-cream shadow-2xs"
                  : "text-brown-soft hover:text-brown hover:bg-cream"
              }`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-leaf text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs hover:shadow-md"
          >
            <Plus className="size-4" />
            <span>Add New Tea</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Visual Card Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const minPrice = Math.min(...p.variants.map((v) => v.price));
            const primaryVariant = p.variants[0];

            return (
              <div
                key={p.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream/60 border border-black/[0.05] mb-3">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 rounded-full bg-lime/90 backdrop-blur-xs px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-leaf-deep shadow-xs flex items-center gap-1">
                        <Sparkles className="size-2.5" />
                        {p.badge}
                      </span>
                    )}

                    {/* Quick View Button on Image */}
                    <a
                      href={`/shop/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/60 hover:bg-black/80 text-white p-1.5 backdrop-blur-xs transition-colors opacity-0 group-hover:opacity-100"
                      title="View public product page"
                    >
                      <Eye className="size-3.5" />
                    </a>
                  </div>

                  {/* Category & Grade */}
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <span className="font-bold text-leaf uppercase tracking-wider">
                      {p.category} • {p.grade}
                    </span>
                    <span className="font-mono text-brown-soft/70">/{p.slug}</span>
                  </div>

                  {/* Title & Tagline */}
                  <h4 className="font-serif font-bold text-base text-brown group-hover:text-leaf-deep transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[0.72rem] text-brown-soft line-clamp-2 mt-0.5 leading-relaxed">
                    {p.tagline}
                  </p>

                  {/* Tasting Note Chips */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {p.notes.slice(0, 3).map((n) => (
                      <span
                        key={n}
                        className="rounded-md bg-leaf-soft/60 px-1.5 py-0.5 text-[0.65rem] font-semibold text-leaf-deep"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Price & Edit Actions */}
                <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[0.65rem] text-brown-soft block">Starting from</span>
                    <span className="font-mono font-bold text-sm text-brown">
                      {bdt(minPrice)}
                    </span>
                    <span className="text-[0.65rem] text-brown-soft ml-1">
                      ({primaryVariant?.label})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="rounded-lg border border-black/[0.08] hover:border-leaf p-1.5 text-leaf hover:bg-leaf-soft/60 transition-colors"
                      title="Edit Product Details"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.slug, p.name)}
                      className="rounded-lg border border-black/[0.08] hover:border-rose-400 p-1.5 text-brown-soft hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Dense Table View */}
      {viewMode === "table" && (
        <div className="rounded-2xl border border-black/[0.08] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-cream/40 font-bold text-brown uppercase text-[0.68rem] tracking-wider">
                  <th className="py-3 px-4">Tea & Photo</th>
                  <th className="py-3 px-4">Category & Grade</th>
                  <th className="py-3 px-4">Badge / Promo</th>
                  <th className="py-3 px-4">Pack Sizes & Price Range</th>
                  <th className="py-3 px-4">Tasting Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {filteredProducts.map((p) => {
                  const minPrice = Math.min(...p.variants.map((v) => v.price));
                  const maxPrice = Math.max(...p.variants.map((v) => v.price));

                  return (
                    <tr key={p.slug} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 rounded-xl overflow-hidden bg-cream border border-black/[0.06] shrink-0">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-brown">{p.name}</p>
                            <p className="text-[0.68rem] text-brown-soft line-clamp-1">{p.tagline}</p>
                            <span className="font-mono text-[0.65rem] text-leaf">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-leaf">{p.grade}</p>
                        <p className="text-[0.68rem] text-brown-soft">{p.category}</p>
                      </td>

                      <td className="py-3 px-4">
                        {p.badge ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lime/40 px-2.5 py-0.5 text-xs font-bold text-leaf-deep">
                            <Sparkles className="size-3" />
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-brown-soft/60 italic text-[0.7rem]">Standard</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold font-mono text-sm text-brown">
                          {bdt(minPrice)} – {bdt(maxPrice)}
                        </p>
                        <p className="text-[0.68rem] text-brown-soft">
                          {p.variants.map((v) => v.label).join(", ")}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.notes.map((n) => (
                            <span key={n} className="rounded bg-leaf-soft/60 px-1.5 py-0.2 text-[0.65rem] font-semibold text-leaf-deep">
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/shop/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost border border-black/[0.08] p-1.5 rounded-lg text-brown-soft hover:text-brown"
                            title="View on Storefront"
                          >
                            <Eye className="size-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="btn btn-ghost border border-black/[0.08] p-1.5 rounded-lg text-leaf hover:bg-leaf-soft"
                            title="Edit Tea Product"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.slug, p.name)}
                            className="btn btn-ghost border border-black/[0.08] p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Slide-over / Modal with LIVE PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden text-brown font-sans border border-black/[0.08]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-cream/40 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-leaf text-cream flex items-center justify-center shadow-2xs">
                  <Coffee className="size-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {editingSlug ? `Edit Tea: ${formName}` : "Add New Tea to Storefront"}
                  </h3>
                  <p className="text-[0.7rem] text-brown-soft">Live synchronization with public customer store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-cream text-brown-soft hover:text-brown"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body: Left Form + Right Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[78vh] overflow-y-auto">
              {/* Form Inputs (7 cols) */}
              <form onSubmit={handleSave} className="lg:col-span-7 p-6 space-y-4 text-xs border-r border-black/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-brown">Tea Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Sreemangal Gold Special CTC"
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 font-bold focus:border-leaf focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-brown">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Category)}
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-brown">Tea Grade</label>
                    <input
                      type="text"
                      required
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      placeholder="e.g. CTC, Orthodox, Granular CTC"
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-brown">Badge / Promotion</label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    >
                      {BADGES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-brown">Tasting Notes (comma-separated)</label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Malty, Bold, Amber"
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-brown">Tagline (Store card subtitle)</label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. Rich, fragrant, built for milk chai."
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-brown">Full Product Description</label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Detailed liquor quality, aroma notes, and origin details..."
                      className="w-full rounded-xl border border-black/[0.08] p-2.5 text-xs bg-cream/30 focus:border-leaf focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Brewing Parameters */}
                <div className="border-t border-black/[0.06] pt-3">
                  <p className="font-bold mb-2 text-brown">Brewing Guide</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[0.65rem] text-brown-soft mb-0.5">Water Temp</label>
                      <input
                        type="text"
                        value={formBrewTemp}
                        onChange={(e) => setFormBrewTemp(e.target.value)}
                        className="w-full rounded-lg border border-black/[0.08] p-2 text-xs bg-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] text-brown-soft mb-0.5">Steep Time</label>
                      <input
                        type="text"
                        value={formBrewTime}
                        onChange={(e) => setFormBrewTime(e.target.value)}
                        className="w-full rounded-lg border border-black/[0.08] p-2 text-xs bg-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] text-brown-soft mb-0.5">Portion Amount</label>
                      <input
                        type="text"
                        value={formBrewAmount}
                        onChange={(e) => setFormBrewAmount(e.target.value)}
                        className="w-full rounded-lg border border-black/[0.08] p-2 text-xs bg-cream/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Variants & Pricing */}
                <div className="border-t border-black/[0.06] pt-3">
                  <p className="font-bold mb-2 text-brown">Pack Sizes & BDT Retail Pricing</p>
                  <div className="space-y-2">
                    {formVariants.map((v, idx) => (
                      <div key={v.id} className="flex items-center gap-3 p-2 rounded-xl bg-cream/30 border border-black/[0.06]">
                        <span className="font-bold w-24">{v.label}</span>
                        <span className="text-brown-soft text-[0.7rem] w-20">({v.grams} g)</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="font-bold text-brown">৳</span>
                          <input
                            type="number"
                            min={1}
                            value={v.price}
                            onChange={(e) => updateVariantPrice(idx, Number(e.target.value))}
                            className="w-24 rounded-lg border border-black/[0.08] p-1.5 text-xs text-right font-mono font-bold bg-white focus:border-leaf focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-ghost border border-black/[0.08] text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-leaf text-xs px-5 py-2 font-bold shadow-xs hover:shadow-md"
                  >
                    {editingSlug ? "Save Changes" : "Publish Tea to Storefront"}
                  </button>
                </div>
              </form>

              {/* Right Live Preview Panel (5 cols) */}
              <div className="hidden lg:flex lg:col-span-5 p-6 bg-cream/20 flex-col items-center justify-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-3">
                  Storefront Card Preview
                </p>

                {/* Simulated Real Product Card */}
                <div className="w-64 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-md space-y-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream/60 border border-black/[0.06]">
                    <Image
                      src="/img/chai-ready-pouch.webp"
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                    {formBadge !== "None" && (
                      <span className="absolute top-2 left-2 rounded-full bg-lime/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-leaf-deep shadow-xs">
                        {formBadge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[0.65rem] font-bold text-leaf uppercase tracking-wider block">
                      {formCategory} • {formGrade || "CTC"}
                    </span>
                    <h5 className="font-serif font-bold text-sm text-brown truncate mt-0.5">
                      {formName || "Untitled Tea"}
                    </h5>
                    <p className="text-[0.68rem] text-brown-soft line-clamp-1 mt-0.5">
                      {formTagline || "Pure fresh garden tea"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {formNotes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((n) => (
                        <span key={n} className="rounded bg-leaf-soft/60 px-1.5 py-0.2 text-[0.6rem] font-semibold text-leaf-deep">
                          {n}
                        </span>
                      ))}
                  </div>

                  <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[0.6rem] text-brown-soft block">From</span>
                      <span className="font-mono font-bold text-sm text-brown">
                        {bdt(formVariants[0]?.price || 0)}
                      </span>
                    </div>
                    <span className="rounded-full bg-leaf text-cream px-3 py-1 text-[0.7rem] font-bold">
                      + {formVariants[0]?.label || "250g"}
                    </span>
                  </div>
                </div>

                <p className="text-[0.65rem] text-brown-soft mt-3 text-center">
                  Live preview updates as you adjust values
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
