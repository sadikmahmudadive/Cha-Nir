"use client";

import { Printer, X } from "lucide-react";
import type { Order } from "@/lib/erp/types";
import { bdt } from "@/lib/pricing";

export function PackingSlipModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none border border-line dark:border-white/[0.1]">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-line dark:border-white/[0.08] bg-cream/50 dark:bg-[#161d15] px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brown dark:text-[#f4f7f2]">Warehouse Packing Slip & Invoice</span>
            <span className="rounded bg-leaf px-2 py-0.5 text-xs font-bold text-cream">
              {order.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-leaf text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Printer className="size-4" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brown-soft dark:text-[#98a793] hover:bg-cream dark:hover:bg-white/[0.06] hover:text-brown dark:hover:text-[#f4f7f2]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Packing Document */}
        <div className="p-8 sm:p-10 font-sans text-brown">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-brown pb-6">
            <div>
              <h2 className="font-serif text-3xl font-extrabold tracking-tight text-leaf-deep">
                Cha Nir
              </h2>
              <p className="text-xs font-bold text-leaf uppercase tracking-widest mt-0.5">
                Pure • Organic • Deshi Tea
              </p>
              <p className="text-xs text-brown-soft mt-2 leading-relaxed">
                Central Warehouse & Blending Facility<br />
                Sylhet – Dhaka Highway, Maulvibazar, Bangladesh<br />
                Helpline: +880 1712-345678 • orders@chanir.com
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-md border-2 border-brown px-3 py-1 font-mono text-sm font-bold uppercase tracking-wider">
                {order.customer.buyerType.toUpperCase()} INVOICE
              </span>
              <p className="font-mono text-xs font-bold mt-2">
                Order ID: <span className="text-leaf-deep">{order.id}</span>
              </p>
              <p className="text-xs text-brown-soft">
                Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>

          {/* Consignee / Delivery details */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-line text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider text-brown-soft">Ship To (Consignee):</p>
              <p className="mt-1 font-bold text-sm text-brown">{order.customer.name}</p>
              <p className="text-brown-soft mt-0.5">{order.customer.address}</p>
              <p className="text-brown-soft">{order.customer.city}, Bangladesh</p>
              <p className="mt-1 font-semibold text-leaf">Phone: {order.customer.phone}</p>
            </div>

            <div className="text-right">
              <p className="font-bold uppercase tracking-wider text-brown-soft">Courier & Payment:</p>
              <p className="mt-1 font-bold text-sm">
                Courier: {order.courier.partner}
              </p>
              {order.courier.trackingCode && (
                <p className="font-mono text-xs text-brown-soft">
                  Tracking: {order.courier.trackingCode}
                </p>
              )}
              <div className="mt-2 inline-block rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                Collect COD Amount: {bdt(order.total)}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs mt-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-line bg-cream/40 font-bold text-brown">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Pack Size</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3">
                    <p className="font-bold text-brown">{item.productName}</p>
                    <p className="text-[0.7rem] text-brown-soft">SKU: {item.slug} ({item.grams}g)</p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-leaf">{item.variantLabel}</td>
                  <td className="py-3 px-3 text-right font-bold font-mono">{item.qty}</td>
                  <td className="py-3 px-3 text-right font-mono">{bdt(item.unitPrice)}</td>
                  <td className="py-3 px-3 text-right font-bold font-mono">{bdt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="mt-6 flex justify-between items-start border-t-2 border-line pt-4">
            <div className="text-xs text-brown-soft max-w-xs">
              <p className="font-bold text-brown uppercase tracking-wider">Weight & Handling:</p>
              <p className="mt-1">
                Total Gross Volume: <span className="font-bold text-leaf font-mono">{order.totalKg} kg</span>
              </p>
              {order.notes && (
                <p className="mt-2 text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  <span className="font-bold">Instructions:</span> {order.notes}
                </p>
              )}
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-brown-soft">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{bdt(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Bulk Discount ({order.tierLabel || "Tier"}):</span>
                  <span className="font-mono">-{bdt(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-brown-soft">
                <span>Delivery Charge:</span>
                <span className="font-mono">{order.deliveryFee === 0 ? "FREE" : bdt(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-brown pt-2 text-base font-bold text-brown">
                <span>Total Payable:</span>
                <span className="font-mono text-leaf-deep font-extrabold">{bdt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Verification signatures */}
          <div className="mt-12 pt-8 border-t border-line grid grid-cols-3 text-center text-xs text-brown-soft">
            <div>
              <div className="border-b border-brown-soft/40 w-36 mx-auto mb-1.5" />
              <span>Prepared & Weighed By</span>
            </div>
            <div>
              <div className="border-b border-brown-soft/40 w-36 mx-auto mb-1.5" />
              <span>Warehouse QC Inspector</span>
            </div>
            <div>
              <div className="border-b border-brown-soft/40 w-36 mx-auto mb-1.5" />
              <span>Rider / Receiver Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

