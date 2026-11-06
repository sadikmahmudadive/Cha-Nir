"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";
import { StatCard } from "@/components/admin/StatCard";
import { LeadStatusBadge } from "@/components/admin/StatusBadge";
import type { WholesaleLeadStatus } from "@/lib/erp/types";

const STAGE_FILTERS: { label: string; value: "all" | WholesaleLeadStatus }[] = [
  { label: "All Deal Flow", value: "all" },
  { label: "New Leads", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Sample Sent", value: "sample_sent" },
  { label: "Quote Sent", value: "quote_sent" },
  { label: "Won Clients", value: "won" },
  { label: "Closed", value: "lost" },
];

export default function AdminWholesalePage() {
  const { leads } = useErpStore();
  const [stageFilter, setStageFilter] = useState<"all" | WholesaleLeadStatus>("all");
  const [search, setSearch] = useState("");
  const [editingQuote, setEditingQuote] = useState<{ id: string; amount: number } | null>(null);

  const activeLeads = leads.filter((l) => l.status !== "lost");
  const wonLeads = leads.filter((l) => l.status === "won");
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.quotedAmount || 0), 0);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (stageFilter !== "all" && lead.status !== stageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchBiz = lead.businessName?.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchType = lead.type.toLowerCase().includes(q);
        if (!matchName && !matchBiz && !matchPhone && !matchType) return false;
      }
      return true;
    });
  }, [leads, stageFilter, search]);

  const handleStatusChange = (leadId: string, status: WholesaleLeadStatus) => {
    erpActions.updateLeadStatus(leadId, status);
  };

  const handleSaveQuote = (leadId: string) => {
    if (!editingQuote) return;
    erpActions.updateLeadStatus(leadId, editingQuote.amount > 0 ? "quote_sent" : "contacted", editingQuote.amount);
    setEditingQuote(null);
  };

  return (
    <div className="space-y-6">
      {/* Top CRM Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total B2B Pipeline Value"
          value={bdt(totalPipelineValue)}
          subtitle="Commercial quotes in negotiation"
          trend="+32% this month"
          trendUp
          highlight
          icon={<DollarSign className="size-6 text-leaf" />}
        />

        <StatCard
          title="Active Inbound Inquiries"
          value={`${activeLeads.length} Accounts`}
          subtitle="Stalls, retailers, hotels & cafés"
          trend="Inbound desk"
          trendUp
          icon={<Users className="size-6 text-leaf" />}
        />

        <StatCard
          title="Converted Commercial Clients"
          value={`${wonLeads.length} Contracts`}
          subtitle="Recurring bulk supply orders"
          trend="82% win rate"
          trendUp
          icon={<CheckCircle2 className="size-6 text-leaf" />}
        />
      </div>

      {/* Stage Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wholesale accounts by contact or business..."
            className="w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 py-2 text-xs text-brown focus:border-leaf focus:outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {STAGE_FILTERS.map((s) => {
            const count = s.value === "all" ? leads.length : leads.filter((l) => l.status === s.value).length;
            const on = stageFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setStageFilter(s.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  on
                    ? "bg-leaf text-cream shadow-xs"
                    : "bg-white border border-black/[0.08] text-brown-soft hover:bg-cream hover:text-brown"
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-mono ${
                    on ? "bg-cream text-leaf-deep" : "bg-cream-2 text-brown"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className="rounded-2xl border border-black/[0.08] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-black/[0.06] bg-cream/40 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-lg font-bold text-brown">Commercial Deal Flow</h3>
            <p className="text-xs text-brown-soft">Inbound quotes captured from public wholesale request desk</p>
          </div>
          <span className="text-xs font-bold font-mono text-leaf bg-cream px-3 py-1 rounded-full border border-black/[0.08]">
            {filteredLeads.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] bg-cream/20 font-bold text-brown uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Contact & Business</th>
                <th className="py-3 px-4">Channel Type</th>
                <th className="py-3 px-4">Est. Volume</th>
                <th className="py-3 px-4">Target Tea Blend</th>
                <th className="py-3 px-4 text-right">Quoted Contract</th>
                <th className="py-3 px-4">Deal Stage</th>
                <th className="py-3 px-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filteredLeads.map((lead) => {
                const isEditingThisQuote = editingQuote?.id === lead.id;
                const cleanPhone = lead.phone.replace(/[\s-]/g, "");

                return (
                  <tr key={lead.id} className="hover:bg-cream/15 transition-colors">
                    {/* Contact & Business */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-brown text-sm">{lead.name}</p>
                      {lead.businessName && (
                        <p className="text-xs font-semibold text-leaf">{lead.businessName}</p>
                      )}
                      <p className="text-[0.68rem] text-brown-soft font-mono">{lead.phone}</p>
                      <span className="font-mono text-[0.65rem] text-brown-soft/70">ID: {lead.id}</span>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4 font-semibold text-brown">
                      <span className="rounded-md bg-cream-2 px-2 py-0.5 text-xs text-brown font-bold border border-black/[0.05]">
                        {lead.type}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4 font-mono font-bold text-leaf-deep text-sm">
                      {lead.volume}
                    </td>

                    {/* Target Tea Blend */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-brown">{lead.targetProduct || "Everyday Stall CTC Blend"}</p>
                      {lead.notes && (
                        <p className="text-[0.68rem] text-brown-soft italic line-clamp-1 mt-0.5">
                          &ldquo;{lead.notes}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Quoted Amount */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {isEditingThisQuote ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editingQuote.amount}
                            onChange={(e) => setEditingQuote({ id: lead.id, amount: Number(e.target.value) })}
                            className="w-24 rounded border border-leaf p-1 text-xs text-right font-bold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveQuote(lead.id)}
                            className="btn btn-leaf text-[0.7rem] px-2 py-1 rounded"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          className="group cursor-pointer"
                          onClick={() => setEditingQuote({ id: lead.id, amount: lead.quotedAmount || 25000 })}
                        >
                          <p className="font-bold text-brown text-sm">
                            {lead.quotedAmount ? bdt(lead.quotedAmount) : "Not Quoted"}
                          </p>
                          <span className="text-[0.65rem] text-leaf underline opacity-0 group-hover:opacity-100 transition-opacity">
                            Edit quote
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Deal Stage */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as WholesaleLeadStatus)}
                          className="rounded-lg border border-black/[0.1] p-1 text-xs font-semibold bg-white focus:border-leaf"
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="sample_sent">Sample Sent</option>
                          <option value="quote_sent">Quote Sent</option>
                          <option value="won">Won (Active Deal)</option>
                          <option value="lost">Lost</option>
                        </select>
                        <LeadStatusBadge status={lead.status} />
                      </div>
                    </td>

                    {/* Direct Outreach Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="rounded-lg border border-black/[0.08] hover:border-leaf p-1.5 text-brown-soft hover:text-brown hover:bg-cream transition-colors"
                          title="Call Commercial Buyer"
                        >
                          <Phone className="size-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/880${cleanPhone.replace(/^0/, "")}?text=Hello%20${encodeURIComponent(lead.name)},%20this%20is%20Cha%20Nir%20Tea%20Wholesale%20Division.`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 p-1.5 shadow-2xs transition-colors"
                          title="WhatsApp Discussion"
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
    </div>
  );
}
