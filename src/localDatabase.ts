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

const STORAGE_PREFIX = "ALW_STANDALONE_DB_";

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

// Helper to save a document in both local and Cloud Firestore (if enabled)
export async function saveDocument(collName: string, docId: string, data: any): Promise<any> {
  const cleanData = sanitizeFirestoreData(data);
  
  // 1) Write to LocalStorage instantly (Offline-First core sync)
  try {
    const list = await getLocalDocuments<any>(collName);
    const existingIndex = list.findIndex(r => r.id === docId);
    const recordPayload = { ...cleanData, id: docId };
    if (existingIndex >= 0) {
      list[existingIndex] = recordPayload;
    } else {
      list.push(recordPayload);
    }
    localStorage.setItem(STORAGE_PREFIX + collName, JSON.stringify(list));
  } catch (e) {
    console.warn("Local persistence write error", e);
  }

  // 2) Write to Firebase Firestore asynchronously
  if (db) {
    try {
      await setDoc(doc(db, collName, docId), cleanData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collName}/${docId}`);
    }
  }
  return { ...cleanData, id: docId };
}

// Helper to delete a document in both local and Cloud Firestore (if enabled)
export async function deleteDocument(collName: string, docId: string): Promise<void> {
  // 1) Delete from LocalStorage instantly
  try {
    const list = await getLocalDocuments<any>(collName);
    const filtered = list.filter(r => r.id !== docId);
    localStorage.setItem(STORAGE_PREFIX + collName, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Local persistence delete error", e);
  }

  // 2) Delete from Firebase Firestore
  if (db) {
    try {
      await deleteDoc(doc(db, collName, docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collName}/${docId}`);
    }
  }
}

// Read-only helper for pure LocalStorage documents
async function getLocalDocuments<T>(collName: string): Promise<T[]> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + collName);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return [];
}

// Helper to fetch all documents from a collection (Cloud fetched fallback with local storage)
export async function getDocuments<T>(collName: string): Promise<T[]> {
  const localList = await getLocalDocuments<T>(collName);

  if (db && navigator.onLine) {
    try {
      const snap = await getDocs(collection(db, collName));
      const out: T[] = [];
      snap.forEach((d) => {
        out.push({ ...d.data(), id: d.id } as T);
      });
      // Synchronize latest server data in the local cache
      if (out.length > 0) {
        localStorage.setItem(STORAGE_PREFIX + collName, JSON.stringify(out));
        return out;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, collName);
    }
  }
  
  // Return offline local persistence in case of offline, error, or missing keys
  return localList;
}

// Helper for generic key-value store items
export async function getStoreValue<T>(key: string, defaultVal: T): Promise<T> {
  // Read local first
  let localVal: T = defaultVal;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "store_" + key);
    if (raw) {
      localVal = JSON.parse(raw);
    }
  } catch (e) {}

  if (db && navigator.onLine) {
    try {
      const snap = await getDoc(doc(db, "genericStore", key));
      if (snap.exists()) {
        const cloudVal = (snap.data() as any).value as T;
        try {
          localStorage.setItem(STORAGE_PREFIX + "store_" + key, JSON.stringify(cloudVal));
        } catch (e) {}
        return cloudVal;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `genericStore/${key}`);
    }
  }
  return localVal;
}

export async function saveStoreValue<T>(key: string, value: T): Promise<void> {
  const cleanVal = sanitizeFirestoreData({ value });

  // 1) Write to LocalStorage
  try {
    localStorage.setItem(STORAGE_PREFIX + "store_" + key, JSON.stringify(value));
  } catch (err) {
    console.warn("Local storage save error", err);
  }

  // 2) Write to Cloud
  if (db) {
    try {
      await setDoc(doc(db, "genericStore", key), cleanVal);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `genericStore/${key}`);
    }
  }
}

export async function getBrandingData(): Promise<typeof DEFAULT_BRANDING> {
  let localBranding = DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "branding");
    if (raw) {
      localBranding = { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
    }
  } catch (e) {}

  if (db && navigator.onLine) {
    try {
      const snap = await getDoc(doc(db, "branding", "config"));
      if (snap.exists()) {
        const cloudBranding = { ...DEFAULT_BRANDING, ...snap.data() };
        localStorage.setItem(STORAGE_PREFIX + "branding", JSON.stringify(cloudBranding));
        return cloudBranding;
      } else {
        // Init branding document if not exists on server
        await setDoc(doc(db, "branding", "config"), sanitizeFirestoreData(localBranding));
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "branding/config");
    }
  }
  return localBranding;
}

export async function saveBrandingData(data: any): Promise<void> {
  // 1) Save to local
  try {
    const current = await getBrandingData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_PREFIX + "branding", JSON.stringify(updated));
  } catch (e) {}

  // 2) Save to cloud database
  if (db) {
    try {
      await setDoc(doc(db, "branding", "config"), sanitizeFirestoreData(data), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "branding/config");
    }
  }
}

export async function getRegisteredUsers(): Promise<any[]> {
  const localUsers = await getLocalDocuments<any>("users");
  if (localUsers.length === 0) {
    // Seed and return default user accounts locally
    localStorage.setItem(STORAGE_PREFIX + "users", JSON.stringify(DEFAULT_USERS));
  }

  if (db && navigator.onLine) {
    try {
      const snap = await getDocs(collection(db, "users"));
      const out: any[] = [];
      snap.forEach((d) => {
        out.push({ ...d.data(), id: d.id });
      });
      if (out.length > 0) {
        localStorage.setItem(STORAGE_PREFIX + "users", JSON.stringify(out));
        return out;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "users");
    }
  }

  return localUsers.length > 0 ? localUsers : DEFAULT_USERS;
}

export async function saveRegisteredUsers(users: any[]): Promise<void> {
  // 1) Local save
  try {
    localStorage.setItem(STORAGE_PREFIX + "users", JSON.stringify(users));
  } catch (e) {}

  // 2) Cloud save
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
        
        // Sync locally
        try {
          localStorage.setItem(STORAGE_PREFIX + collName, JSON.stringify(list));
        } catch (e) {
          console.warn("Storage sync failure", e);
        }
        
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collName);
        getLocalDocuments<T>(collName).then((localList) => {
          onUpdate(localList);
        });
      }
    );
    return unsubscribe;
  } else {
    getLocalDocuments<T>(collName).then((localList) => {
      onUpdate(localList);
    });
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
          try {
            localStorage.setItem(STORAGE_PREFIX + "store_" + key, JSON.stringify(cloudVal));
          } catch (e) {}
          onUpdate(cloudVal);
        } else {
          onUpdate(defaultVal);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `genericStore/${key}`);
        getStoreValue<T>(key, defaultVal).then(onUpdate);
      }
    );
    return unsubscribe;
  } else {
    getStoreValue<T>(key, defaultVal).then(onUpdate);
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
          localStorage.setItem(STORAGE_PREFIX + "branding", JSON.stringify(cloudBranding));
          onUpdate(cloudBranding);
        } else {
          // Trigger setup default but don't crash
          onUpdate(DEFAULT_BRANDING);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "branding/config");
        getBrandingData().then(onUpdate);
      }
    );
    return unsubscribe;
  } else {
    getBrandingData().then(onUpdate);
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
          localStorage.setItem(STORAGE_PREFIX + "users", JSON.stringify(list));
          onUpdate(list);
        } else {
          onUpdate(DEFAULT_USERS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
        getRegisteredUsers().then(onUpdate);
      }
    );
    return unsubscribe;
  } else {
    getRegisteredUsers().then(onUpdate);
    return () => {};
  }
}
