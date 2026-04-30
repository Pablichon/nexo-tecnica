import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhYws7CavB3geGTvFyhdrB8485q0ywAHo",
  authDomain: "nexo-tecnica.firebaseapp.com",
  projectId: "nexo-tecnica",
  storageBucket: "nexo-tecnica.firebasestorage.app",
  messagingSenderId: "316059157738",
  appId: "1:316059157738:web:0fc9b383fee55918788393",
  measurementId: "G-ZYVX7BPJTM"
};

// Initialize Firebase (evitando inicializaciones duplicadas en Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
