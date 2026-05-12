import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Ortam değişkeni kontrolü ───────────────────────────────────────────────
const REQUIRED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const missing = REQUIRED_VARS.filter(
  (key) => !import.meta.env[key]
);

if (missing.length > 0) {
  console.error(
    "[Firebase] ❌ Eksik .env değişkenleri:",
    missing.join(", "),
    "\n👉 .env dosyanda bu değişkenleri VITE_ ön ekiyle tanımla."
  );
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId .env'de tanımlı değil — Analytics kullanmıyorsan sorun yok
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && {
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  }),
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log(
    `[Firebase] ✅ Bağlantı başarılı — Proje: ${firebaseConfig.projectId}`
  );
} catch (err) {
  console.error("[Firebase] ❌ initializeApp hatası:", err);
  throw err;
}

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;