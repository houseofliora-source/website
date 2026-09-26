import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Product, OrderRecord, StoreSettings, SiteContent, SiteTheme } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/products';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import { CustomerUser } from '../components/CustomerAuthModal';

// Firebase configuration from environment variables with House of Líora project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDgn2EovOCx9nqHzYUP27-FKN1YO9A1DP4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'house-of-liora.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'house-of-liora',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'house-of-liora.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '955051533475',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:955051533475:web:6afba66d6deefcc790cb16',
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
    // Sanitize order object: remove undefined fields as Firestore rejects undefined
    const cleanOrder = JSON.parse(JSON.stringify(order));
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, {
      ...cleanOrder,
      timestamp: serverTimestamp(),
      platform: 'web-storefront'
    });
    console.log('[Firebase] Successfully written order to Firestore:', order.id);
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
    const cleanCustomer = JSON.parse(JSON.stringify(customer));
    await setDoc(customerRef, {
      ...cleanCustomer,
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

/**
 * Fetch store settings (including dynamic favicon) from Firestore collection 'settings', doc 'store'
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  if (!db) return DEFAULT_STORE_SETTINGS;

  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const snap = await getDoc(settingsDocRef);
    if (snap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...snap.data() } as StoreSettings;
    } else {
      // Auto-seed store settings on first run so owner can edit in console
      const initialSettingsWithFavicon: StoreSettings = {
        faviconUrl: '/favicon.svg',
        ...DEFAULT_STORE_SETTINGS
      };
      await setDoc(settingsDocRef, initialSettingsWithFavicon, { merge: true });
      return initialSettingsWithFavicon;
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch store settings, using defaults:', error);
    return DEFAULT_STORE_SETTINGS;
  }
}

/**
 * Dynamically change the website favicon in the browser tab.
 * Supports:
 * 1. Image or SVG URLs (e.g. '/favicon.svg', 'https://.../logo.png')
 * 2. Raw SVG code directly pasted by the owner (e.g. '<svg xmlns=...>...</svg>')
 * 3. Base64 or Data URIs ('data:image/svg+xml;...')
 */
export function updateDocumentFavicon(urlOrSvg?: string) {
  if (!urlOrSvg) return;
  let finalHref = urlOrSvg.trim();

  // If the owner pasted raw SVG code directly, convert it to a valid SVG Data URI
  if (finalHref.startsWith('<svg') || finalHref.includes('</svg>')) {
    const encodedSvg = encodeURIComponent(finalHref)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    finalHref = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  }

  const link = document.getElementById('site-favicon') as HTMLLinkElement | null;
  const isSvg = finalHref.includes('svg');

  if (link) {
    link.href = finalHref;
    link.type = isSvg ? 'image/svg+xml' : 'image/x-icon';
  } else {
    const newLink = document.createElement('link');
    newLink.id = 'site-favicon';
    newLink.rel = 'icon';
    newLink.type = isSvg ? 'image/svg+xml' : 'image/x-icon';
    newLink.href = finalHref;
    document.head.appendChild(newLink);
  }
}

/**
 * Save or update a product in Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<boolean> {
  if (!db) return false;
  try {
    const cleanProduct = JSON.parse(JSON.stringify(product));
    const ref = doc(db, 'products', product.id);
    await setDoc(ref, cleanProduct, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to save product to Firestore:', error);
    return false;
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, 'products', productId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to delete product from Firestore:', error);
    return false;
  }
}

/**
 * Fetch all orders from Firestore (for Admin dashboard)
 */
export async function fetchAllOrdersFromFirestore(): Promise<OrderRecord[]> {
  if (!db) return [];
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    const list: OrderRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as OrderRecord);
    });
    // Sort newest first
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('[Firebase] Failed to fetch orders:', error);
    return [];
  }
}

/**
 * Update an order's status in Firestore
 */
export async function updateOrderStatusInFirestore(orderId: string, status: OrderRecord['status']): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, 'orders', orderId);
    await setDoc(ref, { status }, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to update order status:', error);
    return false;
  }
}

/**
 * Fetch all registered patrons/customers
 */
export async function fetchAllCustomersFromFirestore(): Promise<CustomerUser[]> {
  if (!db) return [];
  try {
    const ref = collection(db, 'customers');
    const snapshot = await getDocs(ref);
    const list: CustomerUser[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as CustomerUser);
    });
    return list;
  } catch (error) {
    console.error('[Firebase] Failed to fetch customers:', error);
    return [];
  }
}

/**
 * Update global store settings in Firestore
 */
export async function updateStoreSettingsInFirestore(settings: StoreSettings): Promise<boolean> {
  if (!db) return false;
  try {
    const clean = JSON.parse(JSON.stringify(settings));
    const ref = doc(db, 'settings', 'store');
    await setDoc(ref, clean, { merge: true });
    if (settings.faviconUrl) {
      updateDocumentFavicon(settings.faviconUrl);
    }
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to update store settings:', error);
    return false;
  }
}

/**
 * Real-time listener for Orders
 */
export function subscribeToOrders(callback: (orders: OrderRecord[]) => void) {
  if (!db) return () => {};
  try {
    const ordersRef = collection(db, 'orders');
    return onSnapshot(ordersRef, (snapshot) => {
      const list: OrderRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as OrderRecord);
      });
      callback(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    }, (error) => {
      console.warn('[Firebase] Order subscription warning:', error);
    });
  } catch (err) {
    console.error('[Firebase] subscribeToOrders error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for Products
 */
export function subscribeToProducts(callback: (products: Product[]) => void) {
  if (!db) return () => {};
  try {
    const prodsRef = collection(db, 'products');
    return onSnapshot(prodsRef, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
      });
      callback(list.length > 0 ? list : INITIAL_PRODUCTS);
    }, (error) => {
      console.warn('[Firebase] Product subscription warning:', error);
    });
  } catch (err) {
    console.error('[Firebase] subscribeToProducts error:', err);
    return () => {};
  }
}

/**
 * Apply Site Theme CSS variables to DOM
 */
export function applySiteThemeToDOM(theme: SiteTheme) {
  if (typeof document === 'undefined' || !theme) return;
  const root = document.documentElement;
  if (theme.headingFont) {
    root.style.setProperty('--font-serif', `'${theme.headingFont}', Georgia, serif`);
  }
  if (theme.bodyFont) {
    root.style.setProperty('--font-sans', `'${theme.bodyFont}', system-ui, sans-serif`);
  }
  if (theme.primaryColor) {
    root.style.setProperty('--brand-primary', theme.primaryColor);
  }
  if (theme.accentColor) {
    root.style.setProperty('--brand-accent', theme.accentColor);
  }
  if (theme.backgroundColor) {
    root.style.setProperty('--brand-bg', theme.backgroundColor);
  }
}

/**
 * Fetch dynamic site content & typography theme from Firestore
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  if (!db) return DEFAULT_SITE_CONTENT;
  try {
    const contentRef = doc(db, 'settings', 'content');
    const docSnap = await getDoc(contentRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<SiteContent>;
      // Deep merge with DEFAULT_SITE_CONTENT
      return {
        theme: { ...DEFAULT_SITE_CONTENT.theme, ...(data.theme || {}) },
        hero: { ...DEFAULT_SITE_CONTENT.hero, ...(data.hero || {}) },
        catalog: { ...DEFAULT_SITE_CONTENT.catalog, ...(data.catalog || {}) },
        favors: { ...DEFAULT_SITE_CONTENT.favors, ...(data.favors || {}) },
        care: { ...DEFAULT_SITE_CONTENT.care, ...(data.care || {}) },
        reviews: {
          badge: data.reviews?.badge || DEFAULT_SITE_CONTENT.reviews.badge,
          title: data.reviews?.title || DEFAULT_SITE_CONTENT.reviews.title,
          items: data.reviews?.items && data.reviews.items.length > 0 ? data.reviews.items : DEFAULT_SITE_CONTENT.reviews.items,
        },
        faq: {
          badge: data.faq?.badge || DEFAULT_SITE_CONTENT.faq.badge,
          title: data.faq?.title || DEFAULT_SITE_CONTENT.faq.title,
          subtitle: data.faq?.subtitle || DEFAULT_SITE_CONTENT.faq.subtitle,
          items: data.faq?.items && data.faq.items.length > 0 ? data.faq.items : DEFAULT_SITE_CONTENT.faq.items,
        },
        footer: { ...DEFAULT_SITE_CONTENT.footer, ...(data.footer || {}) },
      };
    }
    return DEFAULT_SITE_CONTENT;
  } catch (error) {
    console.warn('[Firebase] Could not fetch site content, using default:', error);
    return DEFAULT_SITE_CONTENT;
  }
}

/**
 * Update site content & theme in Firestore
 */
export async function updateSiteContentInFirestore(content: SiteContent): Promise<boolean> {
  if (!db) return false;
  try {
    const cleanContent = JSON.parse(JSON.stringify(content));
    const contentRef = doc(db, 'settings', 'content');
    await setDoc(contentRef, cleanContent, { merge: true });
    if (content.theme) {
      applySiteThemeToDOM(content.theme);
    }
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to update site content:', error);
    return false;
  }
}

/**
 * Real-time listener for Site Content
 */
export function subscribeToSiteContent(callback: (content: SiteContent) => void) {
  if (!db) return () => {};
  try {
    const contentRef = doc(db, 'settings', 'content');
    return onSnapshot(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SiteContent>;
        const merged: SiteContent = {
          theme: { ...DEFAULT_SITE_CONTENT.theme, ...(data.theme || {}) },
          hero: { ...DEFAULT_SITE_CONTENT.hero, ...(data.hero || {}) },
          catalog: { ...DEFAULT_SITE_CONTENT.catalog, ...(data.catalog || {}) },
          favors: { ...DEFAULT_SITE_CONTENT.favors, ...(data.favors || {}) },
          care: { ...DEFAULT_SITE_CONTENT.care, ...(data.care || {}) },
          reviews: {
            badge: data.reviews?.badge || DEFAULT_SITE_CONTENT.reviews.badge,
            title: data.reviews?.title || DEFAULT_SITE_CONTENT.reviews.title,
            items: data.reviews?.items && data.reviews.items.length > 0 ? data.reviews.items : DEFAULT_SITE_CONTENT.reviews.items,
          },
          faq: {
            badge: data.faq?.badge || DEFAULT_SITE_CONTENT.faq.badge,
            title: data.faq?.title || DEFAULT_SITE_CONTENT.faq.title,
            subtitle: data.faq?.subtitle || DEFAULT_SITE_CONTENT.faq.subtitle,
            items: data.faq?.items && data.faq.items.length > 0 ? data.faq.items : DEFAULT_SITE_CONTENT.faq.items,
          },
          footer: { ...DEFAULT_SITE_CONTENT.footer, ...(data.footer || {}) },
        };
        if (merged.theme) {
          applySiteThemeToDOM(merged.theme);
        }
        callback(merged);
      } else {
        callback(DEFAULT_SITE_CONTENT);
      }
    }, (error) => {
      console.warn('[Firebase] Site content subscription warning:', error);
    });
  } catch (err) {
    console.error('[Firebase] subscribeToSiteContent error:', err);
    return () => {};
  }
}



