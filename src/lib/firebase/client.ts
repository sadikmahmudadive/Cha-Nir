/**
 * Firebase client bootstrap (Auth + Firestore).
 *
 * The Firebase web config is *public by design* - security comes from
 * Firestore/Storage rules and server-side checks, not from hiding these values.
 * Do NOT put service-account credentials here. Admin SDK code belongs only in
 * server route handlers / server actions.
 *
 * When the env vars are missing the app runs in DEMO mode (no network calls).
 */
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let appPromise: Promise<FirebaseApp> | null = null;

/** Lazily loads the Firebase SDK so it never weighs down first paint. */
export function getFirebaseApp(): Promise<FirebaseApp> {
  if (!firebaseConfigured) return Promise.reject(new Error("Firebase is not configured"));
  appPromise ??= import("firebase/app").then(({ getApps, initializeApp }) =>
    getApps().length ? getApps()[0] : initializeApp(config),
  );
  return appPromise;
}

export async function getFirebaseAuth() {
  const [app, { getAuth }] = await Promise.all([getFirebaseApp(), import("firebase/auth")]);
  return getAuth(app);
}

export async function getDb() {
  const [app, { getFirestore }] = await Promise.all([getFirebaseApp(), import("firebase/firestore")]);
  return getFirestore(app);
}
