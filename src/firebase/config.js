import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validazione preventiva per debug in produzione
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error("ERRORE CRITICO: Variabili Firebase mancanti nel build:", missingKeys);
}

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("ERRORE CRITICO: Fallimento initializeApp:", error);
  alert("Errore critico durante l'inizializzazione di Firebase. Controlla la console.");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
