// src/lib/firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para la base de datos
import { getAuth } from "firebase/auth";           // Para el login
import { getStorage } from "firebase/storage";     // Para subir imágenes

const firebaseConfig = {
    apiKey: "AIzaSyDTJ81zZfaP_mpw4kxV0tI1ZXI8PcGMpdU",
    authDomain: "yofre-al-toque.firebaseapp.com",
    projectId: "yofre-al-toque",
    storageBucket: "yofre-al-toque.firebasestorage.app",
    messagingSenderId: "1012232274898",
    appId: "1:1012232274898:web:c18e0867a802176277fe0b"
};

// Inicializar Firebase (evita errores si se recarga la página)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar servicios
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
