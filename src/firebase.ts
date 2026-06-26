// firebase.ts - Firebase Configuration & Initialization File
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDieHuCmrVvks13ME-cX4Hu7gKTYnO5pnU",
  authDomain: "gen-lang-client-0182998394.firebaseapp.com",
  projectId: "gen-lang-client-0182998394",
  storageBucket: "gen-lang-client-0182998394.firebasestorage.app",
  messagingSenderId: "637344929873",
  appId: "1:637344929873:web:9f4c20a2f692bdefc00070",
  measurementId: "G-EKMDJRWYBH"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
