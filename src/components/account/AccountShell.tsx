"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { authActions, useAuth } from "@/context/auth-store";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/account", label: "Profile & addresses", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
];

/** Guards account pages: signed-out visitors are sent to login and returned afterwards. */
export function AccountShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, pathname, router]);

  if (!ready || !user) {
    return (
      <div className="container-x py-16" aria-busy="true" aria-label="Loading account">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container-x pb-24 pt-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-eyebrow text-tea-600">My account</p>
          <h1 className="t-h1 mt-2 text-tea-900">{title}</h1>
          <p className="mt-1 text-ink-soft">Signed in as {user.email}</p>
        </div>
        <Button variant="secondary" size="sm" iconLeft={<LogOut className="size-4" aria-hidden />} onClick={() => { void authActions.signOut().then(() => router.push("/")); }}>
          Log out
        </Button>
      </header>
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="Account" className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col">
          {tabs.map((t) => {
            const on = t.href === "/account" ? pathname === "/account" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex min-h-12 shrink-0 items-center gap-3 rounded-full px-5 text-[0.95rem] font-semibold transition-colors", on ? "bg-tea-600 text-white" : "hover:bg-tea-100")}
              >
                <t.icon className="size-[1.1rem]" aria-hidden /> {t.label}
              </Link>
            );
          })}
          <Link href="/wholesale#inquiry" className="flex min-h-12 shrink-0 items-center gap-3 rounded-full px-5 text-[0.95rem] font-semibold hover:bg-tea-100">
            <MapPin className="size-[1.1rem]" aria-hidden /> Wholesale
          </Link>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
