"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AdminAuthProvider, useAdminAuth } from "@/lib/firebase/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Lazy-load heavy modals only when triggered to optimize initial bundle and compilation speed
const NewOrderModal = dynamic(
  () => import("@/components/admin/NewOrderModal").then((m) => m.NewOrderModal),
  { ssr: false }
);

const NewLotModal = dynamic(
  () => import("@/components/admin/NewLotModal").then((m) => m.NewLotModal),
  { ssr: false }
);

const QuickSearchModal = dynamic(
  () => import("@/components/admin/QuickSearchModal").then((m) => m.QuickSearchModal),
  { ssr: false }
);

function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAdminAuth();

  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newLotOpen, setNewLotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Auth Protection Guard: Redirect unauthenticated requests to /admin/login
  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    if (isLoginPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginPage]);

  // Login page renders clean without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading indicator while verifying credentials / Firestore session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="size-11 rounded-2xl bg-linear-to-br from-leaf to-leaf-deep text-cream font-bold text-lg flex items-center justify-center shadow-md animate-pulse">
            CN
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-brown-soft">
            <span className="size-2 rounded-full bg-leaf animate-ping" />
            <span>Verifying Admin Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, render blank while redirect triggers
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#fcfbfa] text-brown font-sans antialiased selection:bg-lime/40">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          onOpenMobileSidebar={() => setMobileSidebar(true)}
          onOpenNewOrder={() => setNewOrderOpen(true)}
          onOpenNewLot={() => setNewLotOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-[96rem] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals - Loaded on demand */}
      {newOrderOpen && (
        <NewOrderModal isOpen={newOrderOpen} onClose={() => setNewOrderOpen(false)} />
      )}
      {newLotOpen && (
        <NewLotModal isOpen={newLotOpen} onClose={() => setNewLotOpen(false)} />
      )}
      {searchOpen && (
        <QuickSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
