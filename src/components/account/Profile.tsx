"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { authActions, useAuth } from "@/context/auth-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Alert, EmptyState } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/Sheet";
import { districts } from "@/data/demo/content";
import { isBdPhone } from "@/lib/format";

interface Addr { id: string; label: string; address: string; district: string; isDefault: boolean }

export function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const x: typeof err = {};
    if (name.trim().length < 2) x.name = "Enter your full name.";
    if (phone && !isBdPhone(phone)) x.phone = "Enter a valid Bangladesh mobile number, like 01712 345678.";
    setErr(x);
    if (Object.keys(x).length) return;
    authActions.updateProfile({ name: name.trim(), phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section aria-labelledby="prof" className="rounded-card border border-line bg-paper p-6 sm:p-8">
      <h2 id="prof" className="font-display text-2xl">Profile</h2>
      {user?.wholesale === "pending" && (
        <div className="mt-4"><Alert tone="info" title="Wholesale account pending">Cha Nir will review your business account. You&rsquo;ll see negotiated pricing here once approved.</Alert></div>
      )}
      <form noValidate onSubmit={save} className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} error={err.name} autoComplete="name" />
        <Input label="Email" value={user?.email ?? ""} disabled hint="Email can't be changed here." />
        <Input label="Mobile number" type="tel" inputMode="tel" placeholder="01XXX XXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} error={err.phone} autoComplete="tel" />
        <div className="flex items-end gap-3">
          <Button type="submit">Save changes</Button>
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="status" className="inline-flex items-center gap-1.5 pb-3 text-sm font-semibold text-success">
                <Check className="size-4" aria-hidden /> Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </section>
  );
}

export function AddressesSection() {
  const [list, setList] = useState<Addr[]>([
    { id: "a1", label: "Home", address: "House 12, Road 4, Dhanmondi", district: "Dhaka", isDefault: true },
  ]);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<Addr | null>(null);
  const [f, setF] = useState({ label: "", address: "", district: "" });
  const [err, setErr] = useState<Record<string, string>>({});

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.label.trim()) x.label = "Give this address a name, like Home or Shop.";
    if (f.address.trim().length < 8) x.address = "Enter the full address.";
    if (!f.district) x.district = "Choose a district.";
    setErr(x);
    if (Object.keys(x).length) return;
    setList((l) => [...l, { id: `a${Date.now()}`, ...f, isDefault: l.length === 0 }]);
    setF({ label: "", address: "", district: "" });
    setOpen(false);
  };

  return (
    <section aria-labelledby="addr" className="mt-6 rounded-card border border-line bg-paper p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 id="addr" className="font-display text-2xl">Saved addresses</h2>
        <Button size="sm" variant="secondary" iconLeft={<Plus className="size-4" aria-hidden />} onClick={() => setOpen(true)}>Add address</Button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<MapPin className="size-7" aria-hidden />} title="No saved addresses" body="Add an address to check out faster." />
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((a) => (
              <motion.li key={a.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="rounded-md border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-2 font-semibold">{a.label}{a.isDefault && <Badge tone="green">Default</Badge>}</p>
                  <button type="button" onClick={() => setConfirm(a)} className="tap -mr-2 -mt-2 grid cursor-pointer place-items-center rounded-full text-ink-mute hover:bg-danger-bg hover:text-danger" aria-label={`Delete ${a.label} address`}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{a.address}, {a.district}</p>
                {!a.isDefault && <button type="button" onClick={() => setList((l) => l.map((x) => ({ ...x, isDefault: x.id === a.id })))} className="mt-2 min-h-9 cursor-pointer text-sm font-semibold text-tea-700 underline underline-offset-4">Make default</button>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Add address" side="center">
        <form noValidate onSubmit={add} className="space-y-5">
          <Input label="Label" required placeholder="Home, Shop…" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} error={err.label} />
          <Textarea label="Address" required rows={3} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} error={err.address} />
          <Select label="District" required value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} error={err.district}>
            <option value="">Select district</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </Select>
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save address</Button></div>
        </form>
      </Sheet>

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title="Delete address?" side="center">
        <p className="text-ink-soft">Delete your <strong>{confirm?.label}</strong> address? This can&rsquo;t be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirm(null)}>Keep it</Button>
          <Button variant="danger" onClick={() => { setList((l) => l.filter((x) => x.id !== confirm?.id)); setConfirm(null); }}>Delete</Button>
        </div>
      </Sheet>
    </section>
  );
}
