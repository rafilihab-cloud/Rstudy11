import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Upload an entire collection to Firestore in a batch
 */
export async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const batch = writeBatch(db);
    const colRef = collection(db, collectionName);

    items.forEach((item) => {
      const docRef = doc(colRef, item.id);
      batch.set(docRef, item, { merge: true });
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.warn(`Firestore syncCollection error for [${collectionName}]:`, err);
    return false;
  }
}

/**
 * Fetch a single collection once from Firestore
 */
export async function fetchCollectionFromFirestore<T>(
  collectionName: string
): Promise<T[] | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;

    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push(d.data() as T);
    });
    return items;
  } catch (err) {
    console.warn(`Firestore fetch error for [${collectionName}]:`, err);
    return null;
  }
}

/**
 * Set a single document in Firestore
 */
export async function syncDocToFirestore<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore syncDoc error for [${collectionName}/${item.id}]:`, err);
    return false;
  }
}

/**
 * Subscribe to live Firestore updates
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: T[] = [];
          snapshot.forEach((docSnap) => items.push(docSnap.data() as T));
          onUpdate(items);
        }
      },
      (error) => {
        console.warn(`Firestore subscription notice for [${collectionName}]:`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Failed to subscribe to [${collectionName}]:`, err);
    return null;
  }
}
