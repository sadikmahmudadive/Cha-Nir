"use client";

import { useSyncExternalStore } from "react";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Auth store. Uses Firebase Auth (email + password) when NEXT_PUBLIC_FIREBASE_*
 * env vars exist; otherwise falls back to a clearly-flagged DEMO session kept in
 * localStorage so the account screens are fully explorable. Demo mode never
 * verifies credentials and must not be shipped as real authentication.
 */
export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  /** Wholesale approval status for business accounts. */
  wholesale?: "none" | "pending" | "approved";
}

interface AuthState {
  user: AppUser | null;
  ready: boolean;
  mode: "firebase" | "demo";
}

const KEY = "chanir.demo.user";
const serverState: AuthState = { user: null, ready: false, mode: firebaseConfigured ? "firebase" : "demo" };
let state: AuthState = serverState;
let started = false;
const listeners = new Set<() => void>();

function set(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (firebaseConfigured) {
    const [auth, { onAuthStateChanged }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
    onAuthStateChanged(auth, async (u) => {
      if (!u) {
        set({ ready: true, user: null });
        return;
      }

      let extra: Partial<AppUser> = {};
      try {
        const { getDb } = await import("@/lib/firebase/client");
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          extra = snap.data() as Partial<AppUser>;
        }
      } catch (e) {
        console.warn("Could not load user profile from Firestore:", e);
      }

      set({
        ready: true,
        user: {
          uid: u.uid,
          name: extra.name ?? u.displayName ?? u.email?.split("@")[0] ?? "Customer",
          email: u.email ?? "",
          phone: extra.phone ?? "",
          wholesale: extra.wholesale ?? "none",
        },
      });
    });
  } else {
    let user: AppUser | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      user = raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      /* ignore */
    }
    set({ user, ready: true });
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  void start();
  return () => listeners.delete(cb);
}

function saveDemo(user: AppUser | null) {
  try {
    if (user) window.localStorage.setItem(KEY, JSON.stringify(user));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  set({ user });
}

export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Email or password is incorrect.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists.";
  if (code.includes("weak-password")) return "Choose a password with at least 8 characters.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("network")) return "Network problem. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authActions = {
  async signIn(email: string, password: string) {
    if (firebaseConfigured) {
      const [auth, m] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      await m.signInWithEmailAndPassword(auth, email, password);
      return;
    }
    await wait(700);
    saveDemo({ uid: "demo-user", name: email.split("@")[0], email, wholesale: "none" });
  },
  async signUp(input: { name: string; email: string; password: string; phone?: string }) {
    if (firebaseConfigured) {
      const [auth, m] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      const cred = await m.createUserWithEmailAndPassword(auth, input.email, input.password);
      await m.updateProfile(cred.user, { displayName: input.name });

      try {
        const { getDb } = await import("@/lib/firebase/client");
        const db = await getDb();
        const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          name: input.name,
          email: input.email,
          phone: input.phone ?? "",
          wholesale: "none",
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn("Could not save user profile to Firestore:", e);
      }
      return;
    }
    await wait(800);
    saveDemo({ uid: "demo-user", name: input.name, email: input.email, phone: input.phone, wholesale: "none" });
  },
  async resetPassword(email: string) {
    if (firebaseConfigured) {
      const [auth, m] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      await m.sendPasswordResetEmail(auth, email);
      return;
    }
    await wait(700);
  },
  async signOut() {
    if (firebaseConfigured) {
      const [auth, m] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      await m.signOut(auth);
      return;
    }
    saveDemo(null);
  },
  async updateProfile(patch: Partial<AppUser>) {
    if (!state.user) return;
    const next = { ...state.user, ...patch };
    if (firebaseConfigured) {
      set({ user: next });
      try {
        const [auth, { updateProfile: updateAuthProfile }] = await Promise.all([
          getFirebaseAuth(),
          import("firebase/auth"),
        ]);
        if (auth.currentUser && patch.name) {
          await updateAuthProfile(auth.currentUser, { displayName: patch.name });
        }
        const { getDb } = await import("@/lib/firebase/client");
        const db = await getDb();
        const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
        await setDoc(
          doc(db, "users", state.user.uid),
          { ...patch, updatedAt: serverTimestamp() },
          { merge: true },
        );
      } catch (e) {
        console.warn("Could not update user profile in Firestore:", e);
      }
    } else {
      saveDemo(next);
    }
  },
};

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}
