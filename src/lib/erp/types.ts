export type BuyerType =
  | "Home"
  | "Tea stall"
  | "Tea shop / retailer"
  | "Hotel"
  | "Restaurant / café"
  | "Other business";

export type OrderStatus =
  | "pending"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "settled";

export type CourierPartner = "Steadfast" | "Pathao" | "RedX" | "Self Delivery" | "Truck Wholesale";

export type OrderItem = {
  slug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  grams: number;
  unitPrice: number;
  qty: number;
  total: number;
};

export type Order = {
  id: string; // e.g. "CN-82914"
  createdAt: string; // ISO string
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    buyerType: BuyerType;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tierLabel?: string;
  deliveryFee: number;
  total: number;
  totalKg: number;
  status: OrderStatus;
  paymentMethod: "COD" | "bKash" | "Bank Transfer";
  paymentStatus: PaymentStatus;
  courier: {
    partner: CourierPartner;
    trackingCode?: string;
    codFee?: number;
    dispatchedAt?: string;
    deliveredAt?: string;
  };
  notes?: string;
};

export type InventoryItem = {
  id: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  category: "Black Tea" | "Green Tea" | "Specialty";
  grade: string;
  grams: number;
  inStockUnits: number;
  inStockKg: number;
  reorderPointUnits: number;
  unitCost: number;
  unitPrice: number;
  batchId: string;
  lastRestocked: string;
};

export type RawTeaLot = {
  id: string; // e.g. "LOT-2026-SYL-01"
  garden: string; // e.g. "Malnicherra Tea Estate, Sylhet"
  auctionInvoice: string; // e.g. "SRM-AUC-412"
  grade: string; // "CTC BOP", "Granular CTC", "Orthodox Whole Leaf"
  receivedDate: string;
  initialKg: number;
  remainingKg: number;
  costPerKg: number;
  moisturePct: number;
  cuppingScore: number; // 0 - 100
  status: "active" | "exhausted";
  notes?: string;
};

export type PackagingItem = {
  id: string;
  name: string;
  type: "Pouch" | "Sack" | "Carton" | "Label";
  size: string;
  inStockUnits: number;
  reorderPoint: number;
  costPerUnit: number;
};

export type WholesaleLeadStatus =
  | "new"
  | "contacted"
  | "sample_sent"
  | "quote_sent"
  | "won"
  | "lost";

export type WholesaleLead = {
  id: string; // e.g. "LEAD-101"
  name: string;
  businessName?: string;
  phone: string;
  type: string;
  volume: string;
  targetProduct?: string;
  notes?: string;
  status: WholesaleLeadStatus;
  quotedAmount?: number;
  createdAt: string;
  convertedOrderId?: string;
};

export type FinancialTransaction = {
  id: string;
  date: string;
  type: "revenue_cod" | "revenue_b2b" | "expense_leaf" | "expense_packaging" | "expense_courier";
  title: string;
  referenceId?: string; // Order ID or Lot ID
  amount: number;
  status: "pending" | "cleared";
  category: "Revenue" | "COGS" | "Operating Expense";
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  buyerType: BuyerType;
  totalOrders: number;
  totalKg: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
};

export type BulkTier = {
  kg: number;
  pct: number;
  label: string;
};

export type StoreSettings = {
  freeDeliveryOver: number;
  deliveryFee: number;
  supportPhone: string;
  supportEmail: string;
  warehouseAddress: string;
  featuredSlugs: string[];
  marqueeItems: string[];
  bulkTiers: BulkTier[];
};
