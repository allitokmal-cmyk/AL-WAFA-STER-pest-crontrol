import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Environment fallbacks safely bypassed with type casting
const metaEnv = (import.meta as any).env || {};

const config = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || "AIzaSyDieHuCmrVvks13ME-cX4Hu7gKTYnO5pnU",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || "gen-lang-client-0182998394.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || "gen-lang-client-0182998394",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || "gen-lang-client-0182998394.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || "637344929873",
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfig.appId || "1:637344929873:web:9f4c20a2f692bdefc00070",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || "G-EKMDJRWYBH",
  databaseId: firebaseConfig.firestoreDatabaseId || ""
};

// Default Seed Data
const DEFAULT_BRANDING = {
  companyBrand: "AL WAFA STAR",
  companySubtitle: "ERP Smart Control v2.5",
  profileUser: "Superintendent Hamdy",
  profileEmail: "allitokmal@gmail.com",
  profileAvatarUrl: "",
  appPassword: "123456"
};

const DEFAULT_USERS = [
  { id: "user-admin", username: "admin", passwordPlain: "admin123", role: "Admin" },
  { id: "user-moderator", username: "moderator", passwordPlain: "mod123", role: "Moderator" },
  { id: "user-visitor", username: "visitor", passwordPlain: "visitor123", role: "Visitor" }
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.warn('Firestore Operation status indicator: ', JSON.stringify(errInfo));
}

export function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) return "" as any;
  if (data === null) return null as any;
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData) as any;
  }
  if (typeof data === 'object') {
    const cleanObj: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleanObj[key] = sanitizeFirestoreData(val);
      }
    }
    return cleanObj;
  }
  return data;
}

// Check if Firebase configs are provided
const hasFirebaseKeys = !!(config.apiKey && config.projectId);

let db: any = null;

if (hasFirebaseKeys) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app, config.databaseId || undefined);
    
    // Enable Multi-Tab Offline persistence to handle the Firestore requests smoothly offline
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      console.warn("Firestore indexedDB persistence state:", err.code);
    });
  } catch (err) {
    console.error("Firebase initializer fallback:", err);
  }
}

// Helper to save a document directly in Cloud Firestore (LocalStorage bypassed!)
export async function saveDocument(collName: string, docId: string, data: any): Promise<any> {
  const cleanData = sanitizeFirestoreData(data);

  if (db) {
    try {
      await setDoc(doc(db, collName, docId), cleanData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collName}/${docId}`);
    }
  }
  return { ...cleanData, id: docId };
}

// Helper to delete a document directly in Cloud Firestore (LocalStorage bypassed!)
export async function deleteDocument(collName: string, docId: string): Promise<void> {
  if (db) {
    try {
      await deleteDoc(doc(db, collName, docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collName}/${docId}`);
    }
  }
}

// Helper to fetch all documents from a collection directly from Cloud (LocalStorage bypassed!)
export async function getDocuments<T>(collName: string): Promise<T[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, collName));
      const out: T[] = [];
      snap.forEach((d) => {
        out.push({ ...d.data(), id: d.id } as T);
      });
      return out;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, collName);
    }
  }
  return [];
}

// Helper for generic key-value store items directly from Cloud (LocalStorage bypassed!)
export async function getStoreValue<T>(key: string, defaultVal: T): Promise<T> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, "genericStore", key));
      if (snap.exists()) {
        return (snap.data() as any).value as T;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `genericStore/${key}`);
    }
  }
  return defaultVal;
}

export async function saveStoreValue<T>(key: string, value: T): Promise<void> {
  const cleanVal = sanitizeFirestoreData({ value });

  if (db) {
    try {
      await setDoc(doc(db, "genericStore", key), cleanVal);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `genericStore/${key}`);
    }
  }
}

export async function getBrandingData(): Promise<typeof DEFAULT_BRANDING> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, "branding", "config"));
      if (snap.exists()) {
        return { ...DEFAULT_BRANDING, ...snap.data() };
      } else {
        await setDoc(doc(db, "branding", "config"), sanitizeFirestoreData(DEFAULT_BRANDING));
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "branding/config");
    }
  }
  return DEFAULT_BRANDING;
}

export async function saveBrandingData(data: any): Promise<void> {
  if (db) {
    try {
      await setDoc(doc(db, "branding", "config"), sanitizeFirestoreData(data), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "branding/config");
    }
  }
}

export async function getRegisteredUsers(): Promise<any[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, "users"));
      const out: any[] = [];
      snap.forEach((d) => {
        out.push({ ...d.data(), id: d.id });
      });
      if (out.length > 0) return out;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "users");
    }
  }
  return DEFAULT_USERS;
}

export async function saveRegisteredUsers(users: any[]): Promise<void> {
  if (db) {
    try {
      for (const user of users) {
        if (user.id) {
          await setDoc(doc(db, "users", user.id), sanitizeFirestoreData(user), { merge: true });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "users");
    }
  }
}

// ==========================================
// REAL-TIME FIRESTORE DATA SYNC SUBSCRIBERS
// ==========================================

export function subscribeCollection<T>(
  collName: string, 
  onUpdate: (data: T[]) => void
 ): () => void {
  if (db) {
    const collRef = collection(db, collName);
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        const list: T[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as T);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collName);
        onUpdate([]);
      }
    );
    return unsubscribe;
  } else {
    onUpdate([]);
    return () => {};
  }
}

export function subscribeStoreValue<T>(
  key: string, 
  defaultVal: T, 
  onUpdate: (value: T) => void
): () => void {
  if (db) {
    const docRef = doc(db, "genericStore", key);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudVal = (snap.data() as any).value as T;
          onUpdate(cloudVal);
        } else {
          onUpdate(defaultVal);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `genericStore/${key}`);
        onUpdate(defaultVal);
      }
    );
    return unsubscribe;
  } else {
    onUpdate(defaultVal);
    return () => {};
  }
}

export function subscribeBrandingData(
  onUpdate: (branding: typeof DEFAULT_BRANDING) => void
): () => void {
  if (db) {
    const docRef = doc(db, "branding", "config");
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudBranding = { ...DEFAULT_BRANDING, ...snap.data() };
          onUpdate(cloudBranding);
        } else {
          onUpdate(DEFAULT_BRANDING);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "branding/config");
        onUpdate(DEFAULT_BRANDING);
      }
    );
    return unsubscribe;
  } else {
    onUpdate(DEFAULT_BRANDING);
    return () => {};
  }
}

export function subscribeRegisteredUsers(
  onUpdate: (users: any[]) => void
): () => void {
  if (db) {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id });
        });
        if (list.length > 0) {
          onUpdate(list);
        } else {
          onUpdate(DEFAULT_USERS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
        onUpdate(DEFAULT_USERS);
      }
    );
    return unsubscribe;
  } else {
    onUpdate(DEFAULT_USERS);
    return () => {};
  }
}
