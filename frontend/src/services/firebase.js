import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAg30qiaItcFjdQR9cGKdPDL0eh5Bl3AS4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sih2026-7b8bb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sih2026-7b8bb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sih2026-7b8bb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "478051224555",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:478051224555:web:ea98517831b485c11927ae",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TKCWV1VMQ2",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally (browser environment)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  fbUpdateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
};
