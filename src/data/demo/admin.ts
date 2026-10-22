/** DEMO admin data. Names, orders and figures are fabricated placeholders for the prototype only. */
import type { OrderStatus } from "@/types/catalog";

export interface AdminOrder {
  id: string;
  date: string;
  customer: string;
  type: "Retail" | "Wholesale";
  items: number;
  total: number;
  payment: "COD" | "Online";
  status: OrderStatus;
  district: string;
}

export const adminOrders: AdminOrder[] = [
  { id: "CN-DEMO-1063", date: "2026-10-21", customer: "Demo Customer", type: "Retail", items: 2, total: 580, payment: "COD", status: "pending", district: "Dhaka" },
  { id: "CN-DEMO-1062", date: "2026-10-21", customer: "Sample Tea Stall", type: "Wholesale", items: 4, total: 15600, payment: "COD", status: "confirmed", district: "Cumilla" },
  { id: "CN-DEMO-1061", date: "2026-10-20", customer: "Sample Customer A", type: "Retail", items: 1, total: 520, payment: "Online", status: "packed", district: "Chattogram" },
  { id: "CN-DEMO-1060", date: "2026-10-20", customer: "Sample Hotel", type: "Wholesale", items: 3, total: 21800, payment: "COD", status: "shipped", district: "Sylhet" },
  { id: "CN-DEMO-1057", date: "2026-10-18", customer: "Demo Customer", type: "Retail", items: 3, total: 2436, payment: "Online", status: "shipped", district: "Dhaka" },
  { id: "CN-DEMO-1055", date: "2026-10-17", customer: "Sample Customer B", type: "Retail", items: 2, total: 1180, payment: "COD", status: "delivered", district: "Gazipur" },
  { id: "CN-DEMO-1051", date: "2026-10-15", customer: "Sample Café", type: "Wholesale", items: 2, total: 12000, payment: "COD", status: "delivered", district: "Dhaka" },
  { id: "CN-DEMO-1049", date: "2026-10-14", customer: "Sample Customer C", type: "Retail", items: 1, total: 340, payment: "COD", status: "cancelled", district: "Rajshahi" },
];

export const adminCustomers = [
  { id: "u1", name: "Demo Customer", email: "demo@example.com", orders: 3, spent: 4456, type: "Retail", joined: "2026-08-02" },
  { id: "u2", name: "Sample Tea Stall", email: "stall@example.com", orders: 5, spent: 71200, type: "Wholesale", joined: "2026-07-11" },
  { id: "u3", name: "Sample Hotel", email: "hotel@example.com", orders: 2, spent: 43600, type: "Wholesale", joined: "2026-09-04" },
  { id: "u4", name: "Sample Customer A", email: "a@example.com", orders: 1, spent: 520, type: "Retail", joined: "2026-10-01" },
];

export interface Applicant {
  id: string;
  business: string;
  contact: string;
  type: string;
  location: string;
  estimate: string;
  status: "pending" | "approved" | "rejected";
}

export const applicants: Applicant[] = [
  { id: "w1", business: "Sample Tea Corner", contact: "Sample Person", type: "Tea stall", location: "Dhaka", estimate: "60 kg / month", status: "pending" },
  { id: "w2", business: "Sample Grand Hotel", contact: "Sample Manager", type: "Hotel", location: "Sylhet", estimate: "120 kg / month", status: "pending" },
  { id: "w3", business: "Sample Mart", contact: "Sample Owner", type: "Retailer", location: "Cumilla", estimate: "200 packs / month", status: "approved" },
  { id: "w4", business: "Sample Restaurant", contact: "Sample Chef", type: "Restaurant", location: "Chattogram", estimate: "30 kg / month", status: "rejected" },
];

export const discounts = [
  { id: "d1", code: "DEMO10", type: "Percent", value: "10%", uses: 24, limit: "Unlimited", status: "active" },
  { id: "d2", code: "DEMO50", type: "Fixed", value: "৳50", uses: 9, limit: "100", status: "active" },
  { id: "d3", code: "SAMPLE-OLD", type: "Percent", value: "15%", uses: 40, limit: "40", status: "expired" },
];

export const salesWeek = [
  { d: "Mon", v: 4200 }, { d: "Tue", v: 6100 }, { d: "Wed", v: 3800 }, { d: "Thu", v: 9400 },
  { d: "Fri", v: 7300 }, { d: "Sat", v: 12100 }, { d: "Sun", v: 8800 },
];

export const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed", confirmed: "packed", packed: "shipped", shipped: "delivered", delivered: null, cancelled: null,
};
