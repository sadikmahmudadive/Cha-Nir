"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { authActions, friendlyAuthError, useAuth } from "@/context/auth-store";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";
import { isBdPhone, isEmail } from "@/lib/format";

export function AuthCard({ title, intro, children, footer }: { title: string; intro?: string; children: ReactNode; footer?: ReactNode }) {
  const { mode } = useAuth();
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-line bg-paper p-6 shadow-soft sm:p-9">
        <h1 className="t-h2 text-tea-900">{title}</h1>
        {intro && <p className="mt-2 text-ink-soft">{intro}</p>}
        {mode === "demo" && (
          <div className="mt-5">
            <Alert tone="warn" title="Demo mode">
              Firebase isn&rsquo;t configured, so any valid email works and nothing is stored on a server. Add NEXT_PUBLIC_FIREBASE_* variables to enable real sign-in.
            </Alert>
          </div>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/account";
  const [v, setV] = useState({ email: "", password: "" });
  const [err, setErr] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: typeof err = {};
    if (!isEmail(v.email)) x.email = "Enter a valid email address, like name@example.com.";
    if (!v.password) x.password = "Enter your password.";
    setErr(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await authActions.signIn(v.email.trim(), v.password);
      router.push(next.startsWith("/") ? next : "/account");
    } catch (ex) {
      setErr({ form: friendlyAuthError(ex) });
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      intro="Log in to see your orders and reorder your favourites."
      footer={<>New to Cha Nir? <Link href="/account/register" className="font-semibold text-tea-700 underline underline-offset-4">Create an account</Link></>}
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        {err.form && <Alert tone="danger" live title={err.form} />}
        <Input label="Email" required type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={err.email} />
        <Input label="Password" required type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={err.password} />
        <div className="flex justify-end"><Link href="/account/reset" className="text-sm font-semibold text-tea-700 underline underline-offset-4">Forgot password?</Link></div>
        <Button type="submit" size="lg" full loading={busy}>{busy ? "Logging in…" : "Log in"}</Button>
      </form>
    </AuthCard>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const business = useSearchParams().get("type") === "business";
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "", business, terms: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 2) x.name = "Enter your full name.";
    if (!isEmail(v.email)) x.email = "Enter a valid email address, like name@example.com.";
    if (v.phone && !isBdPhone(v.phone)) x.phone = "Enter a valid Bangladesh mobile number, like 01712 345678.";
    if (v.password.length < 8) x.password = "Use at least 8 characters.";
    if (!v.terms) x.terms = "Please accept the terms to create an account.";
    setErr(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await authActions.signUp({ name: v.name.trim(), email: v.email.trim(), password: v.password, phone: v.phone });
      if (v.business) authActions.updateProfile({ wholesale: "pending" });
      router.push("/account");
    } catch (ex) {
      setErr({ form: friendlyAuthError(ex) });
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      intro="Save addresses, track orders and reorder in a tap."
      footer={<>Already have an account? <Link href="/account/login" className="font-semibold text-tea-700 underline underline-offset-4">Log in</Link></>}
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        {err.form && <Alert tone="danger" live title={err.form} />}
        <Input label="Full name" required autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.name} />
        <Input label="Email" required type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={err.email} />
        <Input label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX XXXXXX" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={err.phone} />
        <Input label="Password" required type="password" autoComplete="new-password" hint="At least 8 characters." value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={err.password} />
        <Checkbox checked={v.business} onChange={(e) => setV({ ...v, business: e.target.checked })} label="I'm registering a business for wholesale pricing (needs Cha Nir approval)" />
        <div>
          <Checkbox checked={v.terms} onChange={(e) => setV({ ...v, terms: e.target.checked })} aria-invalid={err.terms ? true : undefined} label={<>I agree to the <Link href="/policies/terms" className="underline">terms</Link> and <Link href="/policies/privacy" className="underline">privacy policy</Link>.</>} />
          {err.terms && <p role="alert" className="text-sm font-medium text-danger">{err.terms}</p>}
        </div>
        <Button type="submit" size="lg" full loading={busy}>{busy ? "Creating account…" : "Create account"}</Button>
      </form>
    </AuthCard>
  );
}

export function ResetForm() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string>();
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setErr("Enter a valid email address, like name@example.com.");
    setErr(undefined);
    setState("busy");
    try {
      await authActions.resetPassword(email.trim());
    } catch {
      /* never reveal whether the account exists */
    }
    setState("sent");
  };

  return (
    <AuthCard
      title="Reset your password"
      intro="Enter your email and we'll send a reset link."
      footer={<Link href="/account/login" className="font-semibold text-tea-700 underline underline-offset-4">Back to log in</Link>}
    >
      {state === "sent" ? (
        <div className="space-y-4 text-center" role="status">
          <CheckCircle2 className="mx-auto size-12 text-tea-600" aria-hidden />
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-ink-soft">If an account exists for {email}, a password reset link is on its way.</p>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-5">
          <Input label="Email" required type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
          <Button type="submit" size="lg" full loading={state === "busy"}>{state === "busy" ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
    </AuthCard>
  );
}
