"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { useAdminAuth } from "@/lib/firebase/admin-auth";
import { useAdminTheme } from "@/lib/theme/admin-theme";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isFirebaseConnected } = useAdminAuth();
  const { resolvedTheme, toggleTheme } = useAdminTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Failed to sign in. Please verify your credentials.");
      }
    } catch {
      setError("An unexpected error occurred during sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#0c100c] text-brown dark:text-[#f4f7f2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-lime/40 transition-colors duration-200 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-9 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#141a14]/80 backdrop-blur-xs text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c] transition-all shadow-2xs"
          title={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4 text-lime" />
          ) : (
            <Moon className="size-4 text-leaf-deep" />
          )}
        </button>
      </div>

      {/* Background visual flourishes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-leaf/10 dark:bg-leaf/5 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-96 rounded-full bg-lime/15 dark:bg-lime/5 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-leaf to-leaf-deep text-cream font-bold text-xl shadow-md ring-2 ring-leaf/20 group-hover:scale-105 transition-transform">
              <span>CN</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-lime border-2 border-white dark:border-[#0c100c]" />
            </div>
            <div className="text-left">
              <span className="font-serif text-2xl font-bold tracking-tight text-brown dark:text-[#f4f7f2] block">
                Cha Nir
              </span>
              <span className="text-[0.7rem] uppercase tracking-wider font-bold text-leaf-deep dark:text-[#a5be16]">
                Admin & Operations OS
              </span>
            </div>
          </Link>

          <h2 className="mt-6 text-2xl font-serif font-bold text-brown dark:text-[#f4f7f2] tracking-tight">
            Sign in to Admin Portal
          </h2>
          <p className="mt-1 text-xs text-brown-soft dark:text-[#98a793]">
            Storefront management, order fulfillment desk & ERP suite
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#141a14]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] space-y-6">
          {/* Error notice */}
          {error && (
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-800 dark:text-rose-400 flex items-start gap-2.5 animate-in fade-in">
              <span className="size-2 rounded-full bg-rose-600 mt-1 shrink-0" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft dark:text-[#98a793]" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chanir.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] pl-10 pr-4 py-2.5 text-xs text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden focus:ring-2 focus:ring-leaf/20 transition-all font-mono dark:placeholder-[#98a793]/60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft dark:text-[#98a793]" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] pl-10 pr-10 py-2.5 text-xs text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden focus:ring-2 focus:ring-leaf/20 transition-all font-mono dark:placeholder-[#98a793]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-leaf w-full py-3 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="size-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Firestore Connection Status Indicator */}
          <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] text-[0.72rem] text-brown-soft dark:text-[#98a793] space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="size-3.5 text-leaf dark:text-[#c3d65a]" />
                <span>Backend Engine:</span>
              </span>
              {isFirebaseConnected ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Live Firestore Sync</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-500/20 dark:border-amber-500/30">
                  <Flame className="size-3 text-amber-600 dark:text-amber-400" />
                  <span>Local Firestore Emulation</span>
                </span>
              )}
            </div>

            <p className="text-[0.66rem] text-brown-soft/80 dark:text-[#98a793]/80 leading-relaxed">
              {isFirebaseConnected
                ? "Live snapshot listeners connected. Roles updated in the Firebase Console collection 'admins' sync immediately."
                : "Active with local offline storage. To connect live cloud Firestore, copy your Firebase SDK keys into .env.local (see .env.example)."}
            </p>
          </div>
        </div>

        {/* Back to Live Storefront */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-leaf dark:text-[#c3d65a] hover:underline inline-flex items-center gap-1"
          >
            <span>← Back to Cha Nir Public Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
