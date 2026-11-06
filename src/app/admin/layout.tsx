"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newLotOpen, setNewLotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
