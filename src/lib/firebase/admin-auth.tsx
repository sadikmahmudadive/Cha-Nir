"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./config";

export type AdminRole =
  | "super_admin"
  | "admin"
  | "operations_manager"
  | "finance_manager"
  | "viewer";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: "active" | "suspended";
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
  password?: string; // preserved for simulated offline mode
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  operations_manager: "Operations Manager",
  finance_manager: "Finance Manager",
  viewer: "Auditor / Viewer",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Full platform control: manage team, assign roles, access all ERP & financial operations.",
  admin: "Full operational access: storefront, catalog, customers, orders, inventory & financials.",
  operations_manager: "Fulfillment & supply access: OMS orders, WMS inventory, raw tea lots & catalog.",
  finance_manager: "Fiscal access: COD courier reconciliation, expense ledger & cashflow statements.",
  viewer: "Read-only access: view executive overview, charts, reports and analytics.",
};

export const ROLE_COLORS: Record<AdminRole, { badge: string; dot: string }> = {
  super_admin: { badge: "bg-purple-500/15 text-purple-900 dark:text-purple-300 border-purple-500/30 dark:border-purple-400/40", dot: "bg-purple-600 dark:bg-purple-400" },
  admin: { badge: "bg-leaf-soft text-leaf-deep dark:bg-leaf/25 dark:text-lime-soft border-leaf/25 dark:border-leaf/40", dot: "bg-leaf dark:bg-lime" },
  operations_manager: { badge: "bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40", dot: "bg-amber-600 dark:bg-amber-400" },
  finance_manager: { badge: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40", dot: "bg-emerald-600 dark:bg-emerald-400" },
  viewer: { badge: "bg-stone-500/15 text-stone-800 dark:text-stone-300 border-stone-500/30 dark:border-stone-400/40", dot: "bg-stone-500 dark:bg-stone-400" },
};

/** Default hardcoded Superadmin credentials requested by the user */
export const DEFAULT_SUPERADMIN = {
  email: "chanir@gmail.com",
  password: "admin#chanir@1257",
  displayName: "Cha Nir Super Admin",
  role: "super_admin" as AdminRole,
};

const STORAGE_SESSION_KEY = "chanir_admin_session";
const STORAGE_ADMINS_KEY = "chanir_firestore_admins";

const INITIAL_TEAM: AdminUser[] = [
  {
    uid: "sa-chanir-root",
    email: DEFAULT_SUPERADMIN.email,
    displayName: DEFAULT_SUPERADMIN.displayName,
    role: DEFAULT_SUPERADMIN.role,
    status: "active",
    createdAt: "2026-11-01T00:00:00Z",
    lastLoginAt: new Date().toISOString(),
    password: DEFAULT_SUPERADMIN.password,
  },
  {
    uid: "adm-adive-01",
    email: "adive@chanir.com",
    displayName: "S. M. Adive",
    role: "operations_manager",
    status: "active",
    createdAt: "2026-11-02T10:00:00Z",
    lastLoginAt: "2026-11-06T15:30:00Z",
    createdBy: "chanir@gmail.com",
    password: "password123",
  },
  {
    uid: "adm-farhan-02",
    email: "finance@chanir.com",
    displayName: "Farhan Chowdhury",
    role: "finance_manager",
    status: "active",
    createdAt: "2026-11-03T11:00:00Z",
    lastLoginAt: "2026-11-05T18:20:00Z",
    createdBy: "chanir@gmail.com",
    password: "password123",
  },
];

interface AdminAuthContextType {
  user: AdminUser | null;
  role: AdminRole | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  teamMembers: AdminUser[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createAccount: (data: {
    email: string;
    password?: string;
    displayName: string;
    role: AdminRole;
  }) => Promise<{ success: boolean; error?: string }>;
  updateRole: (uid: string, newRole: AdminRole) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (uid: string, status: "active" | "suspended") => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (uid: string) => Promise<{ success: boolean; error?: string }>;
  refreshTeam: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

function getLocalAdmins(): AdminUser[] {
  if (typeof window === "undefined") return INITIAL_TEAM;
  try {
    const raw = window.localStorage.getItem(STORAGE_ADMINS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback to initial */
  }
  return INITIAL_TEAM;
}

function saveLocalAdmins(admins: AdminUser[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(admins));
  } catch {
    /* ignore storage write errors */
  }
}

function getInitialSessionUser(initialList: AdminUser[]): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const storedSession = window.localStorage.getItem(STORAGE_SESSION_KEY);
    if (storedSession) {
      const sessionUser = JSON.parse(storedSession) as AdminUser;
      const match = initialList.find((u) => u.email.toLowerCase() === sessionUser.email.toLowerCase());
      if (match && match.status === "active") {
        return match;
      } else if (match && match.status === "suspended") {
        window.localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return sessionUser;
    }
  } catch {
    /* ignore parse error */
  }
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>(() => getLocalAdmins());
  const [user, setUser] = useState<AdminUser | null>(() => {
    const initialList = getLocalAdmins();
    return getInitialSessionUser(initialList);
  });
  const [isLoading] = useState(false);

  // 1. Real-time Firebase Auth & Firestore synchronization
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) return;

    let unsubscribeSnapshot: (() => void) | null = null;

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up previous snapshot listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (fbUser && fbUser.email) {
        try {
          const docRef = doc(db!, "admins", fbUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as AdminUser;
            if (data.status === "active") {
              setUser({ ...data, uid: fbUser.uid });
              window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ ...data, uid: fbUser.uid }));
            } else {
              setUser(null);
              window.localStorage.removeItem(STORAGE_SESSION_KEY);
            }
          } else {
            // First time super admin log in via Firebase
            const isSuper = fbUser.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase();
            const newDoc: AdminUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || DEFAULT_SUPERADMIN.displayName,
              role: isSuper ? "super_admin" : "viewer",
              status: "active",
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            try {
              await setDoc(docRef, newDoc);
            } catch (writeErr) {
              console.warn("Could not write initial admin profile to Firestore (check security rules):", writeErr);
            }
            setUser(newDoc);
            window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newDoc));
          }
        } catch (err) {
          console.warn("Could not read admin profile from Firestore (check security rules):", err);
        }

        // Attach snapshot listener ONLY when user is authenticated
        try {
          const colRef = collection(db!, "admins");
          unsubscribeSnapshot = onSnapshot(
            colRef,
            (snapshot) => {
              const loaded: AdminUser[] = [];
              snapshot.forEach((snapDoc) => {
                const item = snapDoc.data() as AdminUser;
                loaded.push({ ...item, uid: snapDoc.id });
              });

              if (loaded.length > 0) {
                setTeamMembers(loaded);
                saveLocalAdmins(loaded);

                // Update current user if their role/status changed in Firestore
                setUser((prev) => {
                  if (!prev) return null;
                  const updated = loaded.find(
                    (u) => u.uid === prev.uid || u.email.toLowerCase() === prev.email.toLowerCase()
                  );
                  if (updated) {
                    if (updated.status === "suspended") {
                      window.localStorage.removeItem(STORAGE_SESSION_KEY);
                      return null;
                    }
                    window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
                    return updated;
                  }
                  return prev;
                });
              }
            },
            (err) => {
              console.warn("Firestore snapshot listener permission error. Please verify Firestore security rules:", err.message);
            }
          );
        } catch (snapErr) {
          console.warn("Could not attach Firestore snapshot listener:", snapErr);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // 3. Login Flow
  const login = useCallback(
    async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
      const email = emailInput.trim().toLowerCase();
      const password = passwordInput.trim();

      // A. Try Live Firebase Auth & Firestore flow
      if (isFirebaseConfigured && auth && db) {
        try {
          let fbUser = null;

          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            fbUser = userCredential.user;
          } catch (signInErr: unknown) {
            const errCode = (signInErr as { code?: string })?.code || "";

            // If user account hasn't been created in Firebase Auth yet, automatically create it
            const isSuper = email === DEFAULT_SUPERADMIN.email.toLowerCase() && password === DEFAULT_SUPERADMIN.password;
            if (
              isSuper ||
              errCode === "auth/user-not-found" ||
              errCode === "auth/invalid-credential" ||
              errCode === "auth/invalid-login-credentials"
            ) {
              try {
                const createCred = await createUserWithEmailAndPassword(auth, email, password);
                fbUser = createCred.user;
              } catch (createErr: unknown) {
                const createCode = (createErr as { code?: string })?.code || "";
                if (createCode === "auth/email-already-in-use") {
                  return { success: false, error: "Incorrect password for this registered admin account." };
                } else if (createCode === "auth/operation-not-allowed") {
                  console.warn("Firebase Auth Email/Password provider not enabled in Firebase Console.");
                } else {
                  console.warn("Auto-create in Firebase Auth skipped or failed:", createErr);
                }
              }
            }

            if (!fbUser && errCode === "auth/wrong-password") {
              return { success: false, error: "Incorrect password. Please verify your credentials." };
            }
          }

          if (fbUser) {
            const isSuper = email === DEFAULT_SUPERADMIN.email.toLowerCase();
            let adminData: AdminUser = {
              uid: fbUser.uid,
              email: fbUser.email || email,
              displayName: fbUser.displayName || (isSuper ? DEFAULT_SUPERADMIN.displayName : "Admin User"),
              role: isSuper ? "super_admin" : "admin",
              status: "active",
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };

            // Attempt write/read in Firestore
            try {
              const docRef = doc(db, "admins", fbUser.uid);
              const docSnap = await getDoc(docRef);

              if (!docSnap.exists()) {
                await setDoc(docRef, adminData, { merge: true });
              } else {
                const existing = docSnap.data() as AdminUser;
                if (existing.status === "suspended") {
                  await firebaseSignOut(auth);
                  return { success: false, error: "This admin account has been suspended. Contact the Super Admin." };
                }
                adminData = { ...existing, lastLoginAt: new Date().toISOString() };
                await updateDoc(docRef, {
                  lastLoginAt: new Date().toISOString(),
                  email: fbUser.email || email,
                });
              }
            } catch (firestoreErr) {
              console.warn(
                "Notice: Firestore read/write blocked by security rules. Update Firestore rules in Firebase Console to allow read/write:",
                firestoreErr
              );
            }

            const activeUser: AdminUser = { ...adminData, uid: fbUser.uid };
            setUser(activeUser);
            window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(activeUser));

            // Sync with local team list
            const currentList = getLocalAdmins();
            const filtered = currentList.filter(
              (u) => u.uid !== activeUser.uid && u.email.toLowerCase() !== activeUser.email.toLowerCase()
            );
            const updatedTeam = [activeUser, ...filtered];
            setTeamMembers(updatedTeam);
            saveLocalAdmins(updatedTeam);

            return { success: true };
          }
        } catch (fbErr: unknown) {
          const errMessage = fbErr instanceof Error ? fbErr.message : "Firebase authentication failed";
          console.warn("Firebase Auth / Firestore error, checking local store fallback:", errMessage);
        }
      }

      // B. Local / Offline / Mock Firestore Flow (Immediate out-of-the-box support)
      const currentAdmins = getLocalAdmins();

      // Check for predefined superadmin credentials
      const isSuperCreds =
        email === DEFAULT_SUPERADMIN.email.toLowerCase() &&
        password === DEFAULT_SUPERADMIN.password;

      let matched = currentAdmins.find((a) => a.email.toLowerCase() === email);

      if (!matched && isSuperCreds) {
        // Ensure superadmin exists in team list
        matched = {
          uid: "sa-chanir-root",
          email: DEFAULT_SUPERADMIN.email,
          displayName: DEFAULT_SUPERADMIN.displayName,
          role: DEFAULT_SUPERADMIN.role,
          status: "active",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          password: DEFAULT_SUPERADMIN.password,
        };
        const updated = [matched, ...currentAdmins];
        setTeamMembers(updated);
        saveLocalAdmins(updated);
      }

      if (!matched) {
        return { success: false, error: "No admin account found with this email address." };
      }

      if (matched.status === "suspended") {
        return { success: false, error: "This admin account is currently suspended. Contact your Super Admin." };
      }

      // Validate password
      const expectedPassword = matched.password || (matched.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase() ? DEFAULT_SUPERADMIN.password : "password123");
      if (password !== expectedPassword && !isSuperCreds) {
        return { success: false, error: "Incorrect password. Please verify your credentials." };
      }

      // Successful login
      const updatedUser: AdminUser = {
        ...matched,
        lastLoginAt: new Date().toISOString(),
      };

      // Always persist to Firestore if db is available
      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, "admins", updatedUser.uid);
          await setDoc(docRef, updatedUser, { merge: true });
        } catch (firestoreErr) {
          console.warn("Could not write fallback user to Firestore:", firestoreErr);
        }
      }

      const nextList = currentAdmins.map((u) => (u.uid === updatedUser.uid ? updatedUser : u));
      setTeamMembers(nextList);
      saveLocalAdmins(nextList);

      setUser(updatedUser);
      window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));

      return { success: true };
    },
    []
  );

  // 4. Logout
  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        /* ignore signout error */
      }
    }
    setUser(null);
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
  }, []);

  // 5. Create new Admin account from admin panel (Super Admin capability)
  const createAccount = useCallback(
    async (data: {
      email: string;
      password?: string;
      displayName: string;
      role: AdminRole;
    }): Promise<{ success: boolean; error?: string }> => {
      const email = data.email.trim().toLowerCase();
      const pass = data.password?.trim() || "admin#chanir@1257";

      // Check duplicate
      const currentList = getLocalAdmins();
      if (currentList.some((u) => u.email.toLowerCase() === email)) {
        return { success: false, error: "An admin account with this email already exists." };
      }

      const uid = `adm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newAdmin: AdminUser = {
        uid,
        email,
        displayName: data.displayName.trim() || email.split("@")[0],
        role: data.role,
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: user?.email || "super_admin",
        password: pass,
      };

      // If Firebase Auth + Firestore is configured, save in Firestore
      if (isFirebaseConfigured && db) {
        try {
          // Attempt Firebase Auth user creation if possible
          if (auth) {
            try {
              const res = await createUserWithEmailAndPassword(auth, email, pass);
              newAdmin.uid = res.user.uid;
            } catch (authErr) {
              console.warn("Could not create Firebase Auth user directly (will save profile document in Firestore):", authErr);
            }
          }

          const docRef = doc(db, "admins", newAdmin.uid);
          await setDoc(docRef, newAdmin);
        } catch (dbErr) {
          console.error("Firestore setDoc failed:", dbErr);
          return { success: false, error: "Failed to persist new admin in Firestore. Check your permissions." };
        }
      }

      // Always sync local list
      const updated = [newAdmin, ...currentList];
      setTeamMembers(updated);
      saveLocalAdmins(updated);

      return { success: true };
    },
    [user]
  );

  // 6. Update Role (can be updated from Firestore directly or via the UI)
  const updateRole = useCallback(
    async (uid: string, newRole: AdminRole): Promise<{ success: boolean; error?: string }> => {
      // Prevent demoting the root superadmin if it's the only one
      const currentList = getLocalAdmins();
      const target = currentList.find((u) => u.uid === uid);

      if (target?.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase() && newRole !== "super_admin") {
        return { success: false, error: "Root superadmin chanir@gmail.com cannot have its super_admin role revoked." };
      }

      // Update in Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, "admins", uid);
          await updateDoc(docRef, { role: newRole });
        } catch (err) {
          console.warn("Could not update role in live Firestore:", err);
        }
      }

      // Update local state
      const nextList = currentList.map((u) => (u.uid === uid ? { ...u, role: newRole } : u));
      setTeamMembers(nextList);
      saveLocalAdmins(nextList);

      // If current user's role was changed, update active user
      if (user && user.uid === uid) {
        const updatedSelf = { ...user, role: newRole };
        setUser(updatedSelf);
        window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedSelf));
      }

      return { success: true };
    },
    [user]
  );

  // 7. Update Status (Active / Suspended)
  const updateStatus = useCallback(
    async (uid: string, status: "active" | "suspended"): Promise<{ success: boolean; error?: string }> => {
      const currentList = getLocalAdmins();
      const target = currentList.find((u) => u.uid === uid);

      if (target?.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase() && status === "suspended") {
        return { success: false, error: "Root superadmin chanir@gmail.com cannot be suspended." };
      }

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, "admins", uid);
          await updateDoc(docRef, { status });
        } catch (err) {
          console.warn("Firestore status update error:", err);
        }
      }

      const nextList = currentList.map((u) => (u.uid === uid ? { ...u, status } : u));
      setTeamMembers(nextList);
      saveLocalAdmins(nextList);

      // If user suspended themselves
      if (user && user.uid === uid && status === "suspended") {
        await logout();
      }

      return { success: true };
    },
    [user, logout]
  );

  // 8. Delete Admin Account
  const deleteAccount = useCallback(
    async (uid: string): Promise<{ success: boolean; error?: string }> => {
      const currentList = getLocalAdmins();
      const target = currentList.find((u) => u.uid === uid);

      if (target?.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase()) {
        return { success: false, error: "Root superadmin chanir@gmail.com cannot be deleted." };
      }

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, "admins", uid);
          await deleteDoc(docRef);
        } catch (err) {
          console.warn("Firestore delete error:", err);
        }
      }

      const nextList = currentList.filter((u) => u.uid !== uid);
      setTeamMembers(nextList);
      saveLocalAdmins(nextList);

      if (user && user.uid === uid) {
        await logout();
      }

      return { success: true };
    },
    [user, logout]
  );

  const refreshTeam = useCallback(async () => {
    setTeamMembers(getLocalAdmins());
  }, []);

  const isSuperAdmin = user?.role === "super_admin" || user?.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase();

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isSuperAdmin,
        isLoading,
        isFirebaseConnected: isFirebaseConfigured,
        teamMembers,
        login,
        logout,
        createAccount,
        updateRole,
        updateStatus,
        deleteAccount,
        refreshTeam,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
