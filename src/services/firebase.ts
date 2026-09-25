import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Product, OrderRecord } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { CustomerUser } from '../components/CustomerAuthModal';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if valid Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'your_api_key_here'
);

// Initialize Firebase only if configured
const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const db = app ? getFirestore(app) : null;

/**
 * Fetch all products from Firestore collection 'products'.
 * Falls back to INITIAL_PRODUCTS if not configured or empty.
 */
export async function fetchLiveProducts(): Promise<Product[]> {
  if (!db) {
    return INITIAL_PRODUCTS;
  }

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      console.info('[Firebase] Firestore products collection is empty. Auto-seeding initial catalog...');
      try {
        await seedProductsToFirestore();
      } catch (seedErr) {
        console.warn('[Firebase] Auto-seed failed:', seedErr);
      }
      return INITIAL_PRODUCTS;
    }

    const fetchedProducts: Product[] = [];
    snapshot.forEach(docSnap => {
      fetchedProducts.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, 'id'>)
      });
    });

    return fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('[Firebase] Could not fetch products, using offline catalog fallback:', error);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Persist an order to Firestore 'orders' collection.
 */
export async function submitOrderToFirestore(order: OrderRecord): Promise<boolean> {
  if (!db) {
    console.info('[Firebase] Storing order locally (Firebase not configured).');
    return false;
  }

  try {
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, {
      ...order,
      timestamp: serverTimestamp(),
      platform: 'web-storefront'
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to write order to Firestore:', error);
    return false;
  }
}

/**
 * Persist or update customer profile in Firestore 'customers' collection.
 */
export async function syncCustomerProfileToFirestore(customer: CustomerUser): Promise<boolean> {
  if (!db) return false;

  try {
    // Phone or email as document ID
    const customerId = (customer.phone || customer.email).replace(/[^a-zA-Z0-9]/g, '_');
    const customerRef = doc(db, 'customers', customerId);
    await setDoc(customerRef, {
      ...customer,
      lastActive: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to update customer profile in Firestore:', error);
    return false;
  }
}

/**
 * Seed initial catalog to Firestore (convenience method for the store owner).
 */
export async function seedProductsToFirestore(): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not configured yet. Please add your credentials to .env');
  }

  for (const product of INITIAL_PRODUCTS) {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, product, { merge: true });
  }
}
