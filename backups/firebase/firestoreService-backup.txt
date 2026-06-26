import { db, OperationType, handleFirestoreError, sanitizeFirestoreData } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc
} from "firebase/firestore";

// Helper to save a document with merging
export async function saveDocToFirestore(collName: string, docId: string, data: any): Promise<any> {
  const clean = sanitizeFirestoreData(data);
  try {
    await setDoc(doc(db, collName, docId), clean, { merge: true });
    return clean;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collName}/${docId}`);
  }
}

// Helper to delete a document
export async function deleteDocFromFirestore(collName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collName, docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collName}/${docId}`);
  }
}

// Helper to fetch all documents from a collection
export async function getDocsFromFirestore<T>(collName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collName));
    const out: T[] = [];
    snap.forEach((d) => {
      out.push({ ...d.data() } as T);
    });
    return out;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collName);
    return [];
  }
}

// Helper for generic key-value store items
export async function getStoreValue<T>(key: string, defaultVal: T): Promise<T> {
  try {
    const snap = await getDoc(doc(db, "genericStore", key));
    if (snap.exists()) {
      return (snap.data() as any).value as T;
    }
    return defaultVal;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `genericStore/${key}`);
    return defaultVal;
  }
}

export async function saveStoreValue<T>(key: string, value: T): Promise<void> {
  try {
    const clean = sanitizeFirestoreData({ value });
    await setDoc(doc(db, "genericStore", key), clean);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `genericStore/${key}`);
  }
}

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

export async function getBrandingData(): Promise<typeof DEFAULT_BRANDING> {
  try {
    const snap = await getDoc(doc(db, "branding", "config"));
    if (snap.exists()) {
      return { ...DEFAULT_BRANDING, ...snap.data() };
    }
    // Seed standard branding
    await saveDocToFirestore("branding", "config", DEFAULT_BRANDING);
    return DEFAULT_BRANDING;
  } catch (e) {
    return DEFAULT_BRANDING;
  }
}

export async function saveBrandingData(data: any): Promise<void> {
  await saveDocToFirestore("branding", "config", data);
}

export async function getRegisteredUsers(): Promise<any[]> {
  try {
    const list = await getDocsFromFirestore<any>("users");
    if (list.length === 0) {
      // Seed default users
      for (const user of DEFAULT_USERS) {
        await saveDocToFirestore("users", user.id, user);
      }
      return DEFAULT_USERS;
    }
    return list;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export async function saveRegisteredUsers(users: any[]): Promise<void> {
  for (const user of users) {
    if (user.id) {
      await saveDocToFirestore("users", user.id, user);
    }
  }
}
