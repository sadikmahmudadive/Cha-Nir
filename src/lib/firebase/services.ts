import { firebaseConfigured, getDb } from "./client";
import type { Order, OrderStatus } from "@/types/catalog";
import { categories as defaultCategories, products as defaultProducts } from "@/data/demo/catalog";

export interface AddressItem {
  id: string;
  label: string;
  address: string;
  district: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface CreateOrderInput {
  uid: string | null;
  customer: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  notes?: string;
  payment: "cod" | "gateway";
  lines: {
    productId: string;
    variantId: string;
    productName: string;
    variantLabel: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  discountCode?: string | null;
  delivery: number;
  total: number;
}

export interface WholesaleInquiryInput {
  business: string;
  contact: string;
  phone: string;
  email: string;
  type: string;
  location: string;
  products: string[];
  qty: string;
  unit: string;
  message?: string;
  notes?: string;
}

/**
 * Creates a new customer order in Firestore.
 */
export async function createOrder(input: CreateOrderInput): Promise<{ id: string; success: boolean }> {
  if (!firebaseConfigured) {
    const fakeId = `CN-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    return { id: fakeId, success: true };
  }

  const db = await getDb();
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const orderId = `CN-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  await setDoc(doc(db, "orders", orderId), {
    id: orderId,
    uid: input.uid,
    customer: input.customer,
    email: input.email,
    phone: input.phone,
    district: input.district,
    address: input.address,
    notes: input.notes || "",
    payment: input.payment,
    status: "pending" as OrderStatus,
    lines: input.lines,
    subtotal: input.subtotal,
    discount: input.discount,
    discountCode: input.discountCode ?? null,
    delivery: input.delivery,
    total: input.total,
    placedAt: now,
    createdAt: serverTimestamp(),
  });

  return { id: orderId, success: true };
}

/**
 * Fetches all orders for a specific user ID.
 */
export async function fetchUserOrders(uid: string): Promise<Order[]> {
  if (!firebaseConfigured || !uid) return [];

  try {
    const db = await getDb();
    const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");

    let snapshot;
    try {
      const q = query(collection(db, "orders"), where("uid", "==", uid), orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch {
      // In case composite index on uid + createdAt is not yet built
      const q = query(collection(db, "orders"), where("uid", "==", uid));
      snapshot = await getDocs(q);
    }

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: data.id || docSnap.id,
        placedAt: data.placedAt || new Date().toISOString(),
        status: data.status || "pending",
        payment: data.payment || "cod",
        customer: data.customer || "Customer",
        lines: (data.lines || []).map((l: { productId: string; variantId: string; qty: number; unitPrice: number }) => ({
          productId: l.productId,
          variantId: l.variantId,
          qty: l.qty,
          unitPrice: l.unitPrice,
        })),
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        delivery: data.delivery || 0,
        total: data.total || 0,
        address: data.address || "",
        district: data.district || "",
      };
    });
  } catch (err) {
    console.error("Failed to fetch user orders:", err);
    return [];
  }
}

/**
 * Submits a wholesale inquiry to Firestore.
 */
export async function submitWholesaleInquiry(input: WholesaleInquiryInput): Promise<{ id: string; success: boolean }> {
  if (!firebaseConfigured) {
    return { id: `inq-demo-${Date.now()}`, success: true };
  }

  const db = await getDb();
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");

  const docRef = await addDoc(collection(db, "wholesaleInquiries"), {
    ...input,
    status: "pending",
    createdAt: serverTimestamp(),
    timestamp: new Date().toISOString(),
  });

  return { id: docRef.id, success: true };
}

/**
 * Subscribes an email to the newsletter collection in Firestore.
 */
export async function subscribeNewsletter(email: string, source = "footer"): Promise<{ success: boolean }> {
  if (!firebaseConfigured) {
    return { success: true };
  }

  const db = await getDb();
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const cleanEmail = email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[^a-z0-9]/gi, "_");

  await setDoc(
    doc(db, "newsletter", docId),
    {
      email: cleanEmail,
      source,
      subscribedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { success: true };
}

/**
 * Loads saved addresses for a user from Firestore subcollection.
 */
export async function fetchUserAddresses(uid: string): Promise<AddressItem[]> {
  if (!firebaseConfigured || !uid) return [];

  try {
    const db = await getDb();
    const { collection, getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(collection(db, "users", uid, "addresses"));
    return snapshot.docs.map((d) => ({
      id: d.id,
      label: d.data().label || "Address",
      address: d.data().address || "",
      district: d.data().district || "",
      isDefault: Boolean(d.data().isDefault),
      createdAt: d.data().createdAt,
    }));
  } catch (err) {
    console.error("Failed to fetch addresses:", err);
    return [];
  }
}

/**
 * Adds an address to the user's addresses subcollection.
 */
export async function saveUserAddress(
  uid: string,
  addr: Omit<AddressItem, "id"> & { id?: string },
): Promise<AddressItem> {
  const db = await getDb();
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

  const addrId = addr.id || `addr_${Date.now()}`;
  const addressDoc = doc(db, "users", uid, "addresses", addrId);

  await setDoc(addressDoc, {
    label: addr.label,
    address: addr.address,
    district: addr.district,
    isDefault: addr.isDefault,
    updatedAt: serverTimestamp(),
  });

  return {
    id: addrId,
    label: addr.label,
    address: addr.address,
    district: addr.district,
    isDefault: addr.isDefault,
  };
}

/**
 * Deletes an address from Firestore.
 */
export async function removeUserAddress(uid: string, addrId: string): Promise<void> {
  const db = await getDb();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", uid, "addresses", addrId));
}

/**
 * Seeds the demo catalog (categories and products) into Firestore.
 * Useful for initializing the newly created Firebase project database.
 */
export async function seedCatalogToFirestore(): Promise<{ categoriesCount: number; productsCount: number }> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = await getDb();
  const { doc, writeBatch, serverTimestamp } = await import("firebase/firestore");
  const batch = writeBatch(db);

  for (const cat of defaultCategories) {
    const catRef = doc(db, "categories", cat.id);
    batch.set(catRef, { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  for (const prod of defaultProducts) {
    const prodRef = doc(db, "products", prod.id);
    batch.set(prodRef, { ...prod, updatedAt: serverTimestamp() }, { merge: true });
  }

  await batch.commit();

  return {
    categoriesCount: defaultCategories.length,
    productsCount: defaultProducts.length,
  };
}
