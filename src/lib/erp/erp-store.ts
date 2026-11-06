"use client";

import { useSyncExternalStore } from "react";
import { PRODUCTS, type Product } from "@/lib/products";
import type {
  CustomerRecord,
  FinancialTransaction,
  InventoryItem,
  Order,
  OrderStatus,
  PackagingItem,
  RawTeaLot,
  StoreSettings,
  WholesaleLead,
  WholesaleLeadStatus,
} from "./types";
import {
  generateSeedInventory,
  SEED_CUSTOMERS,
  SEED_ORDERS,
  SEED_PACKAGING,
  SEED_RAW_LOTS,
  SEED_STORE_SETTINGS,
  SEED_TRANSACTIONS,
  SEED_WHOLESALE_LEADS,
} from "./mock-data";

const STORAGE_KEY = "chanir.erp.state.v2";

export type ErpState = {
  products: Product[];
  orders: Order[];
  customers: CustomerRecord[];
  inventory: InventoryItem[];
  rawLots: RawTeaLot[];
  packaging: PackagingItem[];
  leads: WholesaleLead[];
  transactions: FinancialTransaction[];
  storeSettings: StoreSettings;
  initialized: boolean;
};

const INITIAL_STATE: ErpState = {
  products: PRODUCTS,
  orders: SEED_ORDERS,
  customers: SEED_CUSTOMERS,
  inventory: generateSeedInventory(),
  rawLots: SEED_RAW_LOTS,
  packaging: SEED_PACKAGING,
  leads: SEED_WHOLESALE_LEADS,
  transactions: SEED_TRANSACTIONS,
  storeSettings: SEED_STORE_SETTINGS,
  initialized: true,
};

export type ErpMetrics = {
  totalRevenue: number;
  totalVolumeKg: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  pendingCodAmount: number;
  newLeadsCount: number;
  totalProductsCount: number;
  totalCustomersCount: number;
};

function computeMetrics(state: ErpState): ErpMetrics {
  let totalRevenue = 0;
  let totalVolumeKg = 0;
  let pendingOrdersCount = 0;
  let pendingCodAmount = 0;

  for (const o of state.orders) {
    if (o.status !== "cancelled") {
      totalRevenue += o.total;
      totalVolumeKg += o.totalKg;
    }
    if (o.status === "pending" || o.status === "processing") {
      pendingOrdersCount++;
    }
    if (o.paymentMethod === "COD" && o.paymentStatus !== "settled" && o.status !== "cancelled") {
      pendingCodAmount += o.total;
    }
  }

  let lowStockCount = 0;
  for (const i of state.inventory) {
    if (i.inStockUnits <= i.reorderPointUnits) {
      lowStockCount++;
    }
  }

  let newLeadsCount = 0;
  for (const l of state.leads) {
    if (l.status === "new") {
      newLeadsCount++;
    }
  }

  return {
    totalRevenue,
    totalVolumeKg,
    pendingOrdersCount,
    lowStockCount,
    pendingCodAmount,
    newLeadsCount,
    totalProductsCount: state.products.length,
    totalCustomersCount: state.customers.length,
  };
}

let memoryState: ErpState = INITIAL_STATE;
let cachedMetrics: ErpMetrics = computeMetrics(INITIAL_STATE);
const listeners = new Set<() => void>();
let isLoaded = false;

function loadFromStorage(): ErpState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.inventory)) {
        return {
          ...INITIAL_STATE,
          ...parsed,
          products: parsed.products || PRODUCTS,
          customers: parsed.customers || SEED_CUSTOMERS,
          storeSettings: parsed.storeSettings || SEED_STORE_SETTINGS,
          initialized: true,
        };
      }
    }
  } catch {
    /* fallback to initial */
  }
  return INITIAL_STATE;
}

function persistState(state: ErpState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

function notify() {
  cachedMetrics = computeMetrics(memoryState);
  persistState(memoryState);
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (!isLoaded && typeof window !== "undefined") {
    isLoaded = true;
    memoryState = loadFromStorage();
    cachedMetrics = computeMetrics(memoryState);
  }
}

export const erpActions = {
  // --- STOREFRONT / ADMIN CATALOG ACTIONS ---
  addProduct(product: Product) {
    ensureLoaded();
    const products = [product, ...memoryState.products];
    // Automatically create SKUs in inventory for this new tea's variants
    const newSkus: InventoryItem[] = product.variants.map((v) => ({
      id: `SKU-${product.slug}-${v.id}`,
      productSlug: product.slug,
      productName: product.name,
      variantId: v.id,
      variantLabel: v.label,
      category: product.category,
      grade: product.grade,
      grams: v.grams,
      inStockUnits: 50,
      inStockKg: Math.round((50 * v.grams) / 1000),
      reorderPointUnits: 20,
      unitCost: Math.round(v.price * 0.6),
      unitPrice: v.price,
      batchId: `BATCH-2026-${product.grade.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3)}-01`,
      lastRestocked: new Date().toISOString().slice(0, 10),
    }));

    memoryState = {
      ...memoryState,
      products,
      inventory: [...newSkus, ...memoryState.inventory],
    };
    notify();
  },

  updateProduct(slug: string, updated: Partial<Product>) {
    ensureLoaded();
    const products = memoryState.products.map((p) => {
      if (p.slug !== slug) return p;
      return { ...p, ...updated };
    });
    memoryState = { ...memoryState, products };
    notify();
  },

  deleteProduct(slug: string) {
    ensureLoaded();
    const products = memoryState.products.filter((p) => p.slug !== slug);
    const inventory = memoryState.inventory.filter((i) => i.productSlug !== slug);
    memoryState = { ...memoryState, products, inventory };
    notify();
  },

  // --- CUSTOMER MANAGEMENT ---
  updateCustomer(id: string, updated: Partial<CustomerRecord>) {
    ensureLoaded();
    const customers = memoryState.customers.map((c) => {
      if (c.id !== id) return c;
      return { ...c, ...updated };
    });
    memoryState = { ...memoryState, customers };
    notify();
  },

  // --- STOREFRONT CMS & SETTINGS ---
  updateStoreSettings(settings: Partial<StoreSettings>) {
    ensureLoaded();
    memoryState = {
      ...memoryState,
      storeSettings: {
        ...memoryState.storeSettings,
        ...settings,
      },
    };
    notify();
  },

  // --- ORDER MANAGEMENT (OMS) ---
  addOrder(order: Order) {
    ensureLoaded();
    const orders = [order, ...memoryState.orders];

    // Automatically reduce packaged inventory if matches SKU
    const inventory = [...memoryState.inventory];
    order.items.forEach((item) => {
      const skuIndex = inventory.findIndex(
        (inv) => inv.productSlug === item.slug && inv.variantId === item.variantId
      );
      if (skuIndex >= 0) {
        const current = inventory[skuIndex];
        const newUnits = Math.max(0, current.inStockUnits - item.qty);
        inventory[skuIndex] = {
          ...current,
          inStockUnits: newUnits,
          inStockKg: Math.round((newUnits * current.grams) / 1000),
        };
      }
    });

    // Update customer stats or add new customer record
    const customers = [...memoryState.customers];
    const custIdx = customers.findIndex((c) => c.phone.replace(/[\s-]/g, "") === order.customer.phone.replace(/[\s-]/g, ""));
    const today = new Date().toISOString().slice(0, 10);
    if (custIdx >= 0) {
      const c = customers[custIdx];
      customers[custIdx] = {
        ...c,
        totalOrders: c.totalOrders + 1,
        totalKg: c.totalKg + order.totalKg,
        totalSpent: c.totalSpent + order.total,
        lastOrderDate: today,
      };
    } else {
      customers.push({
        id: `CUST-${Date.now().toString(36).toUpperCase().slice(-4)}`,
        name: order.customer.name,
        phone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        buyerType: order.customer.buyerType,
        totalOrders: 1,
        totalKg: order.totalKg,
        totalSpent: order.total,
        lastOrderDate: today,
        notes: order.notes,
      });
    }

    // Add financial ledger transaction
    const newTx: FinancialTransaction = {
      id: `TX-${Date.now().toString(36).toUpperCase()}`,
      date: today,
      type: order.paymentMethod === "COD" ? "revenue_cod" : "revenue_b2b",
      title: `Order ${order.id} (${order.customer.buyerType})`,
      referenceId: order.id,
      amount: order.total,
      status: order.paymentStatus === "settled" ? "cleared" : "pending",
      category: "Revenue",
    };

    memoryState = {
      ...memoryState,
      orders,
      inventory,
      customers,
      transactions: [newTx, ...memoryState.transactions],
    };
    notify();
  },

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    courierUpdate?: Partial<Order["courier"]>
  ) {
    ensureLoaded();
    const orders = memoryState.orders.map((o) => {
      if (o.id !== orderId) return o;
      const courier = {
        ...o.courier,
        ...courierUpdate,
      };
      if (status === "dispatched" && !courier.dispatchedAt) {
        courier.dispatchedAt = new Date().toISOString();
      }
      if (status === "delivered" && !courier.deliveredAt) {
        courier.deliveredAt = new Date().toISOString();
      }
      return {
        ...o,
        status,
        courier,
      };
    });

    memoryState = { ...memoryState, orders };
    notify();
  },

  // --- INVENTORY & RAW LOTS ---
  updateInventoryStock(itemId: string, newUnits: number) {
    ensureLoaded();
    const inventory = memoryState.inventory.map((item) => {
      if (item.id !== itemId) return item;
      const safeUnits = Math.max(0, newUnits);
      return {
        ...item,
        inStockUnits: safeUnits,
        inStockKg: Math.round((safeUnits * item.grams) / 1000),
        lastRestocked: new Date().toISOString().slice(0, 10),
      };
    });
    memoryState = { ...memoryState, inventory };
    notify();
  },

  addRawLot(lot: RawTeaLot) {
    ensureLoaded();
    memoryState = {
      ...memoryState,
      rawLots: [lot, ...memoryState.rawLots],
    };
    notify();
  },

  updateRawLot(lotId: string, remainingKg: number) {
    ensureLoaded();
    const rawLots = memoryState.rawLots.map((l) => {
      if (l.id !== lotId) return l;
      return {
        ...l,
        remainingKg: Math.max(0, remainingKg),
        status: (remainingKg <= 0 ? "exhausted" : "active") as "active" | "exhausted",
      };
    });
    memoryState = { ...memoryState, rawLots };
    notify();
  },

  // --- WHOLESALE CRM ---
  addWholesaleLead(lead: WholesaleLead) {
    ensureLoaded();
    memoryState = {
      ...memoryState,
      leads: [lead, ...memoryState.leads],
    };
    notify();
  },

  updateLeadStatus(
    leadId: string,
    status: WholesaleLeadStatus,
    quotedAmount?: number
  ) {
    ensureLoaded();
    const leads = memoryState.leads.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        status,
        quotedAmount: quotedAmount !== undefined ? quotedAmount : l.quotedAmount,
      };
    });
    memoryState = { ...memoryState, leads };
    notify();
  },

  // --- FINANCE & COD ---
  settleCodOrder(orderId: string) {
    ensureLoaded();
    const orders = memoryState.orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        paymentStatus: "settled" as const,
      };
    });

    const transactions = memoryState.transactions.map((tx) => {
      if (tx.referenceId === orderId) {
        return { ...tx, status: "cleared" as const };
      }
      return tx;
    });

    memoryState = { ...memoryState, orders, transactions };
    notify();
  },

  // --- DEMO RESET ---
  resetDemoData() {
    memoryState = {
      products: PRODUCTS,
      orders: SEED_ORDERS,
      customers: SEED_CUSTOMERS,
      inventory: generateSeedInventory(),
      rawLots: SEED_RAW_LOTS,
      packaging: SEED_PACKAGING,
      leads: SEED_WHOLESALE_LEADS,
      transactions: SEED_TRANSACTIONS,
      storeSettings: SEED_STORE_SETTINGS,
      initialized: true,
    };
    notify();
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => {
  ensureLoaded();
  return memoryState;
};

const getServerSnapshot = () => INITIAL_STATE;

export function useErpStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...state,
    metrics: cachedMetrics,
  };
}
