"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { erpActions } from "@/lib/erp/erp-store";

export function NewLotModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [garden, setGarden] = useState("Malnicherra Tea Estate, Sylhet");
  const [auctionInvoice, setAuctionInvoice] = useState("SRM-AUC-412");
  const [grade, setGrade] = useState("CTC BOP (Brokens)");
  const [initialKg, setInitialKg] = useState(1000);
  const [costPerKg, setCostPerKg] = useState(320);
  const [cuppingScore, setCuppingScore] = useState(90);
  const [moisturePct, setMoisturePct] = useState(3.4);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `LOT-2026-${grade.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    erpActions.addRawLot({
      id,
      garden,
      auctionInvoice,
      grade,
      receivedDate: new Date().toISOString().slice(0, 10),
      initialKg: Number(initialKg),
      remainingKg: Number(initialKg),
      costPerKg: Number(costPerKg),
      cuppingScore: Number(cuppingScore),
      moisturePct: Number(moisturePct),
      status: "active",
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl my-8 overflow-hidden text-brown font-sans">
        <div className="flex items-center justify-between border-b border-line bg-cream/50 px-6 py-4">
          <h3 className="font-serif text-lg font-bold">Register Incoming Raw Tea Garden Lot</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-cream">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Tea Garden Origin *</label>
            <input
              type="text"
              required
              value={garden}
              onChange={(e) => setGarden(e.target.value)}
              placeholder="e.g. Finlay Tea Garden, Sreemangal"
              className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Tea Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30"
              >
                <option value="CTC BOP (Brokens)">CTC BOP (Brokens)</option>
                <option value="Granular CTC Clean">Granular CTC Clean</option>
                <option value="Orthodox Whole Leaf Twist">Orthodox Whole Leaf Twist</option>
                <option value="CTC Dust Super Dark">CTC Dust Super Dark</option>
                <option value="Pan-Fired Whole Green">Pan-Fired Whole Green</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Auction Invoice #</label>
              <input
                type="text"
                required
                value={auctionInvoice}
                onChange={(e) => setAuctionInvoice(e.target.value)}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Lot Weight Received (kg)</label>
              <input
                type="number"
                min={50}
                required
                value={initialKg}
                onChange={(e) => setInitialKg(Number(e.target.value))}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Cost Per kg (৳ BDT)</label>
              <input
                type="number"
                min={50}
                required
                value={costPerKg}
                onChange={(e) => setCostPerKg(Number(e.target.value))}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Cupping Score (0-100)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={cuppingScore}
                onChange={(e) => setCuppingScore(Number(e.target.value))}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Moisture Level (%)</label>
              <input
                type="number"
                step="0.1"
                value={moisturePct}
                onChange={(e) => setMoisturePct(Number(e.target.value))}
                className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Lot Notes & Tasting Assessment</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strong maltiness, deep copper liquor, suitable for milk chai blending"
              className="w-full rounded-xl border border-line p-2.5 text-xs bg-cream/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost border border-line text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-leaf text-xs px-5 py-2"
            >
              Add Lot to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
