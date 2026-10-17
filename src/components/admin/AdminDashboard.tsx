import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  Check, 
  Eye, 
  X, 
  ArrowLeft, 
  LogOut, 
  Upload, 
  Image as ImageIcon, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Shield, 
  KeyRound, 
  Search, 
  DollarSign, 
  Filter, 
  RefreshCw,
  Flame,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Tag,
  FileText,
  RotateCcw,
  ShieldCheck,
  Inbox,
  Download,
  Printer,
  Copy,
  BarChart2,
  Database,
  Activity,
  FileSpreadsheet,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { Product, OrderRecord, StoreSettings, SiteContent, CouponItem, StorePolicies, CustomInquiry } from '../../types';
import { CustomerUser } from '../CustomerAuthModal';
import { 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  fetchAllOrdersFromFirestore, 
  updateOrderStatusInFirestore,
  updateOrderInFirestore,
  fetchAllCustomersFromFirestore,
  deleteCustomerFromFirestore,
  fetchStoreSettings, 
  updateStoreSettingsInFirestore,
  subscribeToOrders,
  subscribeToProducts,
  fetchSiteContent,
  updateSiteContentInFirestore,
  subscribeToSiteContent,
  subscribeToInquiries,
  fetchAllInquiriesFromFirestore
} from '../../services/firebase';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, DEFAULT_COUPONS, DEFAULT_STORE_POLICIES } from '../../data/products';
import { DEFAULT_SITE_CONTENT, sanitizeSiteContent } from '../../data/defaultContent';
import { VisualSiteEditor } from './VisualSiteEditor';
import { InvoiceModal } from './InvoiceModal';
import { BespokeInbox } from './BespokeInbox';
import { CustomerDetailModal } from './CustomerDetailModal';
import { FragranceManager } from './FragranceManager';
import { FragranceItem } from '../../types';

interface AdminDashboardProps {
  onBackToStore: () => void;
  initialSiteContent?: SiteContent;
  fragrances?: FragranceItem[];
  onFragrancesChange?: (fragrances: FragranceItem[]) => void;
}

const DEFAULT_ADMIN_PASSCODE = 'liora2026';
const ADMIN_AUTH_KEY = 'liora_admin_auth_token';
const TRUSTED_DEVICE_KEY = 'liora_trusted_admin_session_v2';
const FAILED_ATTEMPTS_KEY = 'liora_admin_failed_attempts';
const LOCKOUT_EXPIRY_KEY = 'liora_admin_lockout_until';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes auto-logout



export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToStore, 
  initialSiteContent,
  fragrances = [],
  onFragrancesChange,
}) => {
  // ── Tab Navigation State ──────────────────────────────────────────
  // Main tabs: 'today' | 'orders' | 'products' | 'inbox' | 'more'
  const [currentTab, setCurrentTab] = useState<'today' | 'orders' | 'products' | 'fragrances' | 'inbox' | 'more'>('today');
  const [moreSubTab, setMoreSubTab] = useState<'fragrances' | 'coupons' | 'policies' | 'settings' | 'editor' | 'customers' | 'analytics' | 'backup' | 'activity'>('fragrances');

  // ── Core Data States ──────────────────────────────────────────────
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [inquiries, setInquiries] = useState<CustomInquiry[]>([]);
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; time: string; action: string; user: string }>>(() => {
    try {
      const stored = localStorage.getItem('liora_admin_activity');
      return stored ? JSON.parse(stored) : [
        { id: '1', time: new Date().toLocaleTimeString(), action: 'Studio portal initialized', user: 'Owner' }
      ];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ── Authentication & Security States ──────────────────────────────
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [lockoutRemaining, setLockoutRemaining] = useState<number>(() => {
    try {
      const lockUntil = Number(localStorage.getItem(LOCKOUT_EXPIRY_KEY) || '0');
      const diff = lockUntil - Date.now();
      return diff > 0 ? Math.ceil(diff / 1000) : 0;
    } catch {
      return 0;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedSession = localStorage.getItem(TRUSTED_DEVICE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return true;
        } else {
          localStorage.removeItem(TRUSTED_DEVICE_KEY);
        }
      }
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // ── Modal & Detail States ─────────────────────────────────────────
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<OrderRecord | null>(null);
  const [activeCustomerDetail, setActiveCustomerDetail] = useState<CustomerUser | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'bubble',
    price: undefined,
    originalPrice: undefined,
    image: '',
    scentFamily: 'Floral',
    scentNotes: [],
    dimensions: '',
    burnTime: '',
    waxType: '100% Pure Botanical Soy Wax',
    description: '',
    inStock: true,
    stockQuantity: 20,
    lowStockThreshold: 5,
    sku: '',
    status: 'published'
  });
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [scentNotesInput, setScentNotesInput] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  // ── Order Filtering & Actions ─────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // ── Product Catalog Search & Sorting ───────────────────────────
  const [productSearch, setProductSearch] = useState<string>('');
  const [productSort, setProductSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'name'>('newest');

  // ── Customer Search & Sort ────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState('');

  // ── Coupon State ──────────────────────────────────────────────────
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(10);
  const [couponType, setCouponType] = useState<'percent' | 'flat'>('percent');
  const [couponMinOrder, setCouponMinOrder] = useState<number>(0);
  const [couponDesc, setCouponDesc] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponLimit, setCouponLimit] = useState<number>(0);

  // ── Policy Editor ─────────────────────────────────────────────────
  const [policyTab, setPolicyTab] = useState<'terms' | 'privacy' | 'refund'>('terms');

  // ── Visual Site Editor Integration ────────────────────────────────
  const [editorPageView, setEditorPageView] = useState<'home' | 'product'>('home');
  const [editorProductId, setEditorProductId] = useState<string>('');

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    if (initialSiteContent) {
      return sanitizeSiteContent(initialSiteContent);
    }
    try {
      const cached = localStorage.getItem('liora_site_content');
      if (cached) {
        return sanitizeSiteContent(JSON.parse(cached));
      }
    } catch {}
    return DEFAULT_SITE_CONTENT;
  });

  // ── Helper Log Activity ───────────────────────────────────────────
  const logActivity = (action: string) => {
    const newEntry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      action,
      user: 'Studio Owner'
    };
    setActivityLogs(prev => {
      const updated = [newEntry, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('liora_admin_activity', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ── Inactivity Auto-Logout (30 Minutes) ───────────────────────────
  const lastActivityRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        handleLogout();
        alert('নিরাপত্তার স্বার্থে ৩০ মিনিট নিষ্ক্রিয় থাকার কারণে অ্যাডমিন পোর্টাল থেকে স্বয়ংক্রিয়ভাবে লগ আউট করা হয়েছে।');
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // ── Lockout Countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          localStorage.removeItem(LOCKOUT_EXPIRY_KEY);
          localStorage.removeItem(FAILED_ATTEMPTS_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const formatLockoutTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ── Real-time Data Sync ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubProds = subscribeToProducts((liveProds) => {
      setProducts(liveProds);
    });

    const unsubOrders = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    const unsubInquiries = subscribeToInquiries((liveInquiries) => {
      setInquiries(liveInquiries);
    });

    fetchAllCustomersFromFirestore().then(setCustomers);

    const unsubContent = subscribeToSiteContent((liveContent) => {
      if (liveContent) {
        const safe = sanitizeSiteContent(liveContent);
        setSiteContent(safe);
        try {
          localStorage.setItem('liora_site_content', JSON.stringify(safe));
        } catch {}
      }
    });

    fetchStoreSettings().then(st => {
      if (st) {
        setSettings(st);
        setSettingsForm(st);
        if (st.faviconUrl) setFaviconPreview(st.faviconUrl);
      }
    });

    return () => {
      unsubProds();
      unsubOrders();
      unsubInquiries();
      unsubContent();
    };
  }, [isAuthenticated]);

  // ── Auth Handlers ─────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutRemaining > 0) {
      setAuthError(`⚠️ অতিরিক্ত ভুল চেষ্টার কারণে পোর্টাল লক। আর ${formatLockoutTimer(lockoutRemaining)} অপেক্ষা করুন।`);
      return;
    }

    let expectedPasscode = settings.adminPasscode || DEFAULT_ADMIN_PASSCODE;

    if (passcode.trim() !== expectedPasscode) {
      try {
        const fresh = await fetchStoreSettings();
        if (fresh?.adminPasscode) {
          expectedPasscode = fresh.adminPasscode;
          setSettings(fresh);
        }
      } catch (err) {
        console.error('Settings recheck failed', err);
      }
    }

    if (passcode.trim() === expectedPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      if (rememberDevice) {
        const sessionData = {
          token: 'liora_trusted_' + Math.random().toString(36).substring(2),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        };
        localStorage.setItem(TRUSTED_DEVICE_KEY, JSON.stringify(sessionData));
      }
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_EXPIRY_KEY);
      setAuthError('');
      setPasscode('');
      logActivity('Studio Admin unlocked successfully');
    } else {
      const currentFails = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
      localStorage.setItem(FAILED_ATTEMPTS_KEY, String(currentFails));

      if (currentFails >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(LOCKOUT_EXPIRY_KEY, String(lockUntil));
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setAuthError(`⚠️ ৫ বার ভুল পাসওয়ার্ড দেওয়া হয়েছে! নিরাপত্তার জন্য পোর্টাল ১৫ মিনিটের জন্য লক করা হয়েছে।`);
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - currentFails;
        setAuthError(`ভুল পাসকোড। সতর্ক থাকুন: আর ${remaining} বার ভুল দিলে পোর্টাল ১৫ মিনিটের জন্য লক হয়ে যাবে।`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(TRUSTED_DEVICE_KEY);
    logActivity('Studio Admin logged out');
  };

  // ── Calculated Metrics (Section 11) ───────────────────────────────
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Cancelled' && !o.isTestOrder && o.id !== 'HL-SAMPLE' && o.paymentStatus === 'verified')
      .reduce((acc, curr) => {
        // Recalculate each order to ensure mathematical integrity
        const sub = curr.items.reduce((s, it) => s + (it.price * it.quantity), 0);
        const del = curr.deliveryFee ?? (curr.deliveryArea === 'dhaka' ? settings.deliveryFeeDhaka : settings.deliveryFeeOutside);
        const disc = curr.discountAmount ?? 0;
        return acc + Math.max(0, sub + del - disc);
      }, 0);
  }, [orders, settings]);

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'Pending'), [orders]);
  const newInquiries = useMemo(() => inquiries.filter(i => (i.status || '').toLowerCase() === 'new'), [inquiries]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      const qty = p.stockQuantity ?? (p.inStock ? 15 : 0);
      const threshold = p.lowStockThreshold ?? 5;
      return qty <= threshold || !p.inStock;
    });
  }, [products]);

  // ── Filtered & Sorted Orders ──────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = orderFilter === 'all' || order.status.toLowerCase() === orderFilter.toLowerCase();
      const matchesPayment = orderPaymentFilter === 'all' || 
        (orderPaymentFilter === 'verified' && order.paymentStatus === 'verified') ||
        (orderPaymentFilter === 'unverified' && order.paymentStatus !== 'verified');
      
      const term = orderSearch.toLowerCase().trim();
      const matchesSearch = !term || 
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        (order.transactionId && order.transactionId.toLowerCase().includes(term)) ||
        order.items.some(i => (i.fragrance || i.scent || '').toLowerCase().includes(term));

      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [orders, orderFilter, orderPaymentFilter, orderSearch]);

  // ── Filtered & Sorted Products ────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let prods = products.filter(p => {
      const term = productSearch.toLowerCase().trim();
      const matchesSearch = !term || 
        p.name.toLowerCase().includes(term) ||
        (p.scentNotes && p.scentNotes.some(s => s.toLowerCase().includes(term))) ||
        (p.sku && p.sku.toLowerCase().includes(term));
      return matchesSearch;
    });

    return prods.sort((a, b) => {
      if (productSort === 'price_asc') return a.price - b.price;
      if (productSort === 'price_desc') return b.price - a.price;
      if (productSort === 'name') return a.name.localeCompare(b.name);
      return b.id.localeCompare(a.id); // newest by default
    });
  }, [products, productSearch, productSort]);

  // ── Order Operations ──────────────────────────────────────────────
  const handleUpdateOrderStatusWithConfirm = async (order: OrderRecord, newStatus: OrderRecord['status']) => {
    if (!window.confirm(`Move order #${order.id} from "${order.status}" to "${newStatus}"?`)) {
      return;
    }
    const success = await updateOrderInFirestore(order.id, { 
      status: newStatus,
      auditLog: [
        ...(order.auditLog || []),
        { time: new Date().toISOString(), action: `Status changed to ${newStatus}`, by: 'Studio Owner' }
      ]
    });
    if (success) {
      flash(`Order #${order.id} status updated to ${newStatus}`);
      logActivity(`Order #${order.id} moved to ${newStatus}`);
    } else {
      flash('Failed to update order status', 'error');
    }
  };

  const handleNextStage = (order: OrderRecord) => {
    const stages: OrderRecord['status'][] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const idx = stages.indexOf(order.status);
    if (idx >= 0 && idx < stages.length - 1) {
      handleUpdateOrderStatusWithConfirm(order, stages[idx + 1]);
    }
  };

  const handleTogglePaymentVerified = async (order: OrderRecord, newStatus: 'verified' | 'rejected' | 'pending_verification') => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
    const success = await updateOrderInFirestore(order.id, { paymentStatus: newStatus });
    if (success) {
      flash(`Order #${order.id} payment marked as "${newStatus}".`);
      logActivity(`Order #${order.id} payment marked as ${newStatus}`);
    } else {
      flash('Failed to update payment status', 'error');
    }
  };

  const handleUpdateOrderTracking = async (orderId: string, tracking: string) => {
    await updateOrderInFirestore(orderId, { courierTracking: tracking.trim() });
    flash('Tracking number updated.');
  };

  const handleUpdateOrderNotes = async (orderId: string, notes: string) => {
    await updateOrderInFirestore(orderId, { internalNotes: notes.trim() });
    flash('Internal note saved.');
  };

  const handleToggleTestOrder = async (order: OrderRecord) => {
    const newFlag = !order.isTestOrder;
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isTestOrder: newFlag } : o));
    await updateOrderInFirestore(order.id, { isTestOrder: newFlag });
    flash(`Order #${order.id} marked as ${newFlag ? 'Test (Excluded from Revenue)' : 'Real Order'}.`);
  };

  const handleCancelOrderWithReason = async (order: OrderRecord) => {
    const reason = window.prompt(`Enter cancellation reason for Order #${order.id}:`, 'Customer requested cancellation');
    if (reason === null) return;
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o));
    const success = await updateOrderInFirestore(order.id, { 
      status: 'Cancelled',
      cancellationReason: reason,
      auditLog: [
        ...(order.auditLog || []),
        { time: new Date().toISOString(), action: `Cancelled: ${reason}`, by: 'Studio Owner' }
      ]
    });
    if (success) {
      flash(`Order #${order.id} cancelled.`);
      logActivity(`Order #${order.id} cancelled (${reason})`);
    }
  };

  const handleSendWhatsAppConfirmation = (order: OrderRecord) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('880') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? `88${cleanPhone}` 
        : `880${cleanPhone}`;

    const itemsSummary = order.items.map(i => {
      const frag = i.fragrance || i.scent;
      return `• ${i.title}${frag ? ` (Fragrance: ${frag})` : ''} (x${i.quantity}) - ৳${i.price * i.quantity}`;
    }).join('%0A');
    const message = `Hello ${order.customerName},%0A%0AThank you for ordering with *House of Líora* (@houseofliorabd)!%0A%0A*Order ID:* ${order.id}%0A*Items:*%0A${itemsSummary}%0A%0A*Delivery Fee:* ৳${order.deliveryFee}%0A*Grand Total:* ৳${order.grandTotal}%0A*Payment Method:* ${order.paymentMethod.toUpperCase()}%0A*Status:* ${order.status}%0A%0AWe are preparing your artisanal botanical soy candle batch with utmost care! ✨`;
    
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // ── CSV Export ────────────────────────────────────────────────────
  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Delivery Area', 'Payment Method', 'TrxID', 'Sender Phone', 'Payment Status', 'Subtotal', 'Delivery Fee', 'Discount', 'Grand Total', 'Status', 'Courier Tracking'];
    const rows = orders.map(o => {
      const sub = o.items.reduce((s, it) => s + (it.price * it.quantity), 0);
      const del = o.deliveryFee ?? (o.deliveryArea === 'dhaka' ? 70 : 130);
      const disc = o.discountAmount ?? 0;
      const total = Math.max(0, sub + del - disc);
      return [
        o.id,
        `"${o.createdAt}"`,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${o.customerAddress.replace(/"/g, '""')}"`,
        o.deliveryArea,
        o.paymentMethod,
        `"${o.transactionId || ''}"`,
        `"${o.senderPhone || ''}"`,
        o.paymentStatus || 'pending_verification',
        sub,
        del,
        disc,
        total,
        o.status,
        `"${o.courierTracking || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `house_of_liora_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash('Orders exported to CSV successfully.');
  };

  const exportCustomersCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Address', 'Joined'];
    const rows = customers.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.city || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.joinedAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `house_of_liora_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash('Customers exported to CSV successfully.');
  };

  // ── Product Creation & Edit (Section 4) ───────────────────────────
  // Add Product form starts COMPLETELY BLANK!
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'bubble',
      price: undefined,
      originalPrice: undefined,
      image: '',
      scentFamily: 'Floral',
      scentNotes: [],
      dimensions: '',
      burnTime: '',
      waxType: '100% Pure Botanical Soy Wax',
      description: '',
      inStock: true,
      stockQuantity: 25,
      lowStockThreshold: 5,
      sku: `HL-CAN-${Date.now().toString().slice(-4)}`,
      status: 'published'
    });
    setScentNotesInput('');
    setProductImagePreview('');
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    const exactStockQty = product.stockQuantity !== undefined ? Number(product.stockQuantity) : (product.inStock ? 20 : 0);
    const exactInStock = exactStockQty > 0 ? (product.inStock ?? true) : false;
    const exactSku = product.sku || `HL-${product.id.slice(-4)}`;

    const loadedProduct: Product = {
      ...product,
      stockQuantity: exactStockQty,
      inStock: exactInStock,
      sku: exactSku,
      status: product.status || 'published',
    };

    setEditingProduct(loadedProduct);
    setProductForm(loadedProduct);
    setScentNotesInput((product.scentNotes || []).join(', '));
    setProductImagePreview(product.image);
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    const copy: Product = {
      ...product,
      id: `liora-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `HL-${Date.now().toString().slice(-4)}`,
      status: 'draft',
    };
    setLoading(true);
    const success = await saveProductToFirestore(copy);
    setLoading(false);
    if (success) {
      flash(`Duplicated "${product.name}" as draft.`);
      logActivity(`Duplicated product: ${product.name}`);
    } else {
      flash('Failed to duplicate product', 'error');
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
          setProductImagePreview(compressedDataUrl);
          setProductForm(prev => ({ ...prev, image: compressedDataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Strict validation (Section 4): Title, Price, Photo required
    if (!productForm.name?.trim()) errors.name = 'Candle title is required';
    if (!productForm.price || Number(productForm.price) <= 0) errors.price = 'Valid price is required';
    const finalImage = productImagePreview || productForm.image;
    if (!finalImage) errors.image = 'Candle photo is required';

    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      flash('Please fill all required product fields.', 'error');
      return;
    }

    setLoading(true);
    const id = editingProduct ? editingProduct.id : `liora-${Date.now()}`;
    const qty = Number(productForm.stockQuantity ?? (productForm.inStock ? 20 : 0));

    const newProduct: Product = {
      id,
      name: productForm.name!.trim(),
      category: (productForm.category || 'candles') as Product['category'],
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      image: finalImage!,
      gallery: productForm.gallery || [],
      scentFamily: productForm.scentFamily as Product['scentFamily'] || 'Floral',
      scentNotes: [], // Global pool manages fragrances (Part 1A)
      dimensions: productForm.dimensions || '6cm x 6cm x 6cm',
      burnTime: productForm.burnTime || '20 Hours',
      waxType: productForm.waxType || '100% Pure Botanical Soy Wax',
      description: productForm.description || '',
      inStock: qty > 0 ? (productForm.inStock ?? true) : false,
      stockQuantity: qty,
      lowStockThreshold: Number(productForm.lowStockThreshold ?? 5),
      sku: productForm.sku?.trim() || (id === 'botanical-aroma-sachets' ? 'HL-TAB-01' : `HL-${id.slice(-4)}`),
      status: productForm.status || 'published',
      isBestseller: productForm.isBestseller ?? false,
      isNewArrival: productForm.isNewArrival ?? false,
    };

    setProducts(prev => {
      const exists = prev.some(p => p.id === id);
      return exists ? prev.map(p => p.id === id ? newProduct : p) : [newProduct, ...prev];
    });

    const success = await saveProductToFirestore(newProduct);
    setLoading(false);
    if (success) {
      flash(editingProduct ? `"${newProduct.name}" updated successfully.` : `"${newProduct.name}" published to live store.`);
      logActivity(editingProduct ? `Updated candle: ${newProduct.name}` : `Published new candle: ${newProduct.name}`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } else {
      flash('Failed to save product to cloud', 'error');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }
    setLoading(true);
    const success = await deleteProductFromFirestore(product.id);
    setLoading(false);
    if (success) {
      flash(`"${product.name}" deleted.`);
      logActivity(`Deleted product: ${product.name}`);
    } else {
      flash('Failed to delete product', 'error');
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated: Product = { ...product, inStock: !product.inStock };
    await saveProductToFirestore(updated);
    flash(`"${product.name}" marked as ${updated.inStock ? 'In Stock' : 'Sold Out'}.`);
  };

  const handleJumpToProductPage = (prodId: string) => {
    setEditorPageView('product');
    setEditorProductId(prodId);
    setCurrentTab('more');
    setMoreSubTab('editor');
  };

  // ── Single-Step Coupon Management (Section 7) ─────────────────────
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      flash('Coupon code is required', 'error');
      return;
    }
    if (couponDiscount <= 0) {
      flash('Discount must be greater than 0', 'error');
      return;
    }
    if (couponType === 'percent' && couponDiscount > 100) {
      flash('Percentage discount cannot exceed 100%', 'error');
      return;
    }
    if (couponType === 'flat' && couponMinOrder > 0 && couponDiscount >= couponMinOrder) {
      flash('Flat discount cannot exceed minimum order amount', 'error');
      return;
    }

    const cleanCode = couponCode.trim().toUpperCase();
    const existing = settingsForm.coupons || DEFAULT_COUPONS;

    if (!editingCoupon && existing.some(c => c.code.toUpperCase() === cleanCode)) {
      flash(`Coupon ${cleanCode} already exists!`, 'error');
      return;
    }

    let updatedCoupons: CouponItem[];
    if (editingCoupon) {
      updatedCoupons = existing.map(c => c.id === editingCoupon.id ? {
        ...c,
        code: cleanCode,
        discount: Number(couponDiscount),
        type: couponType,
        minOrder: couponMinOrder > 0 ? Number(couponMinOrder) : undefined,
        description: couponDesc.trim() || undefined,
        expiryDate: couponExpiry || undefined,
        usageLimit: couponLimit > 0 ? Number(couponLimit) : undefined
      } : c);
    } else {
      const newItem: CouponItem = {
        id: `coupon-${Date.now()}`,
        code: cleanCode,
        discount: Number(couponDiscount),
        type: couponType,
        active: true,
        minOrder: couponMinOrder > 0 ? Number(couponMinOrder) : undefined,
        description: couponDesc.trim() || undefined,
        expiryDate: couponExpiry || undefined,
        usageLimit: couponLimit > 0 ? Number(couponLimit) : undefined,
        usageCount: 0
      };
      updatedCoupons = [newItem, ...existing];
    }

    setLoading(true);
    const updatedSettings = { ...settingsForm, coupons: updatedCoupons };
    const success = await updateStoreSettingsInFirestore(updatedSettings);
    setLoading(false);

    if (success) {
      setSettings(updatedSettings);
      setSettingsForm(updatedSettings);
      setEditingCoupon(null);
      setCouponCode('');
      setCouponDesc('');
      flash(`Coupon ${cleanCode} saved to Cloud!`);
      logActivity(`Saved coupon ${cleanCode}`);
    } else {
      flash('Failed to save coupon to Cloud', 'error');
    }
  };

  const handleDeleteCouponWithConfirm = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    const existing = settingsForm.coupons || DEFAULT_COUPONS;
    const updated = existing.filter(c => c.id !== couponId);
    const updatedSettings = { ...settingsForm, coupons: updated };
    const success = await updateStoreSettingsInFirestore(updatedSettings);
    if (success) {
      setSettings(updatedSettings);
      setSettingsForm(updatedSettings);
      flash('Coupon deleted.');
      logActivity(`Deleted coupon ID ${couponId}`);
    }
  };

  const handleToggleCouponActive = async (couponId: string) => {
    const existing = settingsForm.coupons || DEFAULT_COUPONS;
    const updated = existing.map(c => c.id === couponId ? { ...c, active: !c.active } : c);
    const updatedSettings = { ...settingsForm, coupons: updated };
    await updateStoreSettingsInFirestore(updatedSettings);
    setSettings(updatedSettings);
    setSettingsForm(updatedSettings);
    flash('Coupon status toggled.');
  };

  // ── Policies Save ─────────────────────────────────────────────────
  const handleSavePolicies = async () => {
    setLoading(true);
    const success = await updateStoreSettingsInFirestore(settingsForm);
    setLoading(false);
    if (success) {
      setSettings(settingsForm);
      flash('Legal policies updated successfully!');
      logActivity('Updated store legal policies');
    } else {
      flash('Failed to save policies', 'error');
    }
  };

  // ── Settings Save (Section 3 & 9) ─────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce future passcode requirements: min 8 chars, letters + numbers
    if (settingsForm.adminPasscode && settingsForm.adminPasscode !== settings.adminPasscode) {
      const p = settingsForm.adminPasscode;
      if (p.length < 8 || !/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) {
        flash('Password must be at least 8 characters and include both letters and numbers.', 'error');
        return;
      }
    }

    setLoading(true);
    const success = await updateStoreSettingsInFirestore(settingsForm);
    setLoading(false);
    if (success) {
      setSettings(settingsForm);
      flash('Storefront settings & fees saved successfully!');
      logActivity('Updated storefront settings');
    } else {
      flash('Failed to update store settings.', 'error');
    }
  };

  // Favicon Upload
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes('svg') || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFaviconPreview(content);
        setSettingsForm(prev => ({ ...prev, faviconUrl: content }));
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFaviconPreview(dataUrl);
        setSettingsForm(prev => ({ ...prev, faviconUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Backup & Restore Full Storefront (Section 12) ──────────────────
  const handleExportFullBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeSettings: settings,
      products,
      orders,
      customers,
      inquiries,
      siteContent
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `house_of_liora_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash('Full studio backup exported successfully.');
  };

  // ---------------------------------------------------------------------------
  // AUTH LOGIN SCREEN (Section 3: Security)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 selection:bg-[#EAE0D5]">
        <div className="w-full max-w-md bg-white border border-[#EAE0D5] rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8C5E35]/10 text-[#8C5E35] text-[11px] font-mono font-medium">
              <span>/studioadmin</span>
              <span>·</span>
              <span>Owner Portal</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#24211D]">
              Studio Admin Portal
            </h2>
            <p className="text-xs text-[#7A6F62] leading-relaxed">
              মাস্টার পাসকোড দিয়ে আনলক করুন। "বিশ্বস্ত ডিভাইস" সিলেক্ট করলে আগামী ৩০ দিন বারবার পাসওয়ার্ড দেওয়ার ঝামেলা ছাড়াই অনায়াসে কাজ করতে পারবেন।
            </p>
          </div>

          {lockoutRemaining > 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-red-800 font-semibold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>পোর্টাল সাময়িকভাবে লক করা হয়েছে</span>
              </div>
              <p className="text-xs text-red-700">
                নিরাপত্তার স্বার্থে ৫ বার ভুল পাসওয়ার্ড দেওয়ার পর পোর্টাল লক করা হয়েছে।
              </p>
              <div className="text-2xl font-mono font-bold text-red-900 bg-red-100/80 py-2 px-4 rounded-md inline-block tracking-wider">
                {formatLockoutTimer(lockoutRemaining)}
              </div>
              <p className="text-[11px] text-red-600">
                কাউন্টডাউন শূন্যে পৌঁছালে পুনরায় চেষ্টার সুযোগ পাবেন।
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-[#24211D] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#8C5E35]" />
                    <span>Master Studio Passcode</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="text-[11px] text-[#8C5E35] hover:text-[#24211D] transition-colors cursor-pointer"
                  >
                    {showPasscode ? 'Hide' : 'Show'}
                  </button>
                </div>
                {/* NEVER DISPLAY DEFAULT PASSCODE IN PLACEHOLDER (Section 3) */}
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="মাস্টার পাসকোড দিন"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#EAE0D5] rounded-md focus:outline-none focus:border-[#8C5E35] focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Trusted Device Option (30 Days) */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="mt-0.5 rounded accent-[#8C5E35] w-4 h-4 cursor-pointer shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#24211D] block">
                      এই ডিভাইসটি ৩০ দিনের জন্য মনে রাখো (বিশ্বস্ত ডিভাইস)
                    </span>
                    <span className="text-[11px] text-[#7A6F62] leading-snug block mt-0.5">
                      সারাদিনে বারবার পাসওয়ার্ড দেওয়ার দরকার হবে না। আপনার ডিভাইস থেকেই সরাসরি খুলবে।
                    </span>
                  </div>
                </label>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-md text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer shadow-xs"
              >
                Unlock Studio Dashboard
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-[#EAE0D5] space-y-2 text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-[#8C5E35] hover:text-[#24211D] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Boutique</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN ADMIN DASHBOARD UI
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24211D] flex flex-col font-sans pb-20 sm:pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE0D5] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#24211D] text-white flex items-center justify-center font-serif text-sm sm:text-base font-bold shadow-xs shrink-0">
            HL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-sm sm:text-lg font-medium text-[#24211D]">House of Líora</h1>
              <span className="text-[10px] font-mono uppercase bg-[#FAF8F5] text-[#8C5E35] border border-[#EAE0D5] px-1.5 py-0.5 rounded hidden sm:inline">
                /studioadmin
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#7A6F62] hidden sm:block">Studio Owner Portal · Real-time Control</p>
          </div>
        </div>

        {/* Desktop Top Tab Navigation (Section 2 & 12) */}
        <nav className="hidden sm:flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#EAE0D5]">
          <button
            onClick={() => setCurrentTab('today')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'today' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#8C5E35]" />
            <span>Today</span>
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'orders' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
            {pendingOrders.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('products')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'products' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products</span>
          </button>
        <button
          onClick={() => setCurrentTab('fragrances')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'fragrances' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-[#C68B59]" />
          <span>Fragrances</span>
        </button>
          <button
            onClick={() => setCurrentTab('fragrances')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'fragrances' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
            <span>Fragrances</span>
          </button>
          <button
            onClick={() => setCurrentTab('inbox')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'inbox' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox</span>
            {newInquiries.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {newInquiries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('more')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'more' ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#EAE0D5]'
            }`}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>More</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToStore}
            className="px-2.5 sm:px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Boutique</span>
          </button>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 sm:p-2 text-[#7A6F62] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Flash Status Notification */}
      {statusMessage && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-3 sm:p-6 space-y-6">

        {/* =================================================================== */}
        {/* TAB 1: TODAY (Dashboard Overview) */}
        {/* =================================================================== */}
        {currentTab === 'today' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Trustworthy Stat Cards (Section 11) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] shadow-xs space-y-1">
                <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#8C5E35]" />
                  Net Revenue
                </span>
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#24211D]">৳{totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-700 font-medium">Revenue from verified, non-test orders only</p>
              </div>

              <div 
                onClick={() => setCurrentTab('orders')}
                className="p-4 bg-white rounded-xl border border-[#EAE0D5] shadow-xs space-y-1 cursor-pointer hover:border-[#8C5E35] transition-colors group"
              >
                <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8C5E35]" />
                    Total Orders
                  </span>
                  <span className="text-[10px] text-[#8C5E35] group-hover:underline font-semibold">View ↗</span>
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl sm:text-2xl font-serif font-bold text-[#24211D]">{orders.length}</p>
                  {pendingOrders.length > 0 && (
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                      {pendingOrders.length} Pending
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#7A6F62]">Live intake in Firestore</p>
              </div>

              <div 
                onClick={() => setCurrentTab('products')}
                className="p-4 bg-white rounded-xl border border-[#EAE0D5] shadow-xs space-y-1 cursor-pointer hover:border-[#8C5E35] transition-colors group"
              >
                <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#8C5E35]" />
                    Active Candles
                  </span>
                  <span className="text-[10px] text-[#8C5E35] group-hover:underline font-semibold">Manage ↗</span>
                </span>
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#24211D]">{products.length}</p>
                <p className="text-[10px] text-[#7A6F62]">Artisanal creations catalog</p>
              </div>

              <div 
                onClick={() => {
                  setCurrentTab('more');
                  setMoreSubTab('customers');
                }}
                className="p-4 bg-white rounded-xl border border-[#EAE0D5] shadow-xs space-y-1 cursor-pointer hover:border-[#8C5E35] transition-colors group"
              >
                <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#8C5E35]" />
                    Patron Circle
                  </span>
                  <span className="text-[10px] text-[#8C5E35] group-hover:underline font-semibold">Profiles ↗</span>
                </span>
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#24211D]">{customers.length}</p>
                <p className="text-[10px] text-[#7A6F62]">Registered customer profiles</p>
              </div>
            </div>

            {/* Attention Cards: Pending Orders & New Inquiries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Orders Widget */}
              <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <h3 className="font-serif text-sm font-semibold text-[#24211D]">
                      Pending Orders Needing Action ({pendingOrders.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setOrderFilter('Pending');
                      setCurrentTab('orders');
                    }}
                    className="text-xs text-[#8C5E35] hover:underline font-medium cursor-pointer"
                  >
                    View All ↗
                  </button>
                </div>

                {pendingOrders.length === 0 ? (
                  <p className="text-xs text-emerald-800 p-3 bg-emerald-50 rounded-lg">
                    ✓ All orders are processed or confirmed!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pendingOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-[#8C5E35]">#{order.id}</span>
                            <span className="font-medium text-[#24211D]">{order.customerName}</span>
                          </div>
                          <p className="text-[11px] text-[#7A6F62]">{order.items.length} items · ৳{order.grandTotal} ({order.paymentMethod.toUpperCase()})</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveInvoiceOrder(order);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#EAE0D5] border border-[#D8CEBE] rounded text-[11px] font-medium cursor-pointer"
                        >
                          Invoice ↗
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bespoke Inquiries Widget */}
              <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-[#8C5E35]" />
                    <h3 className="font-serif text-sm font-semibold text-[#24211D]">
                      Bespoke Inquiries Inbox ({newInquiries.length} New)
                    </h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab('inbox')}
                    className="text-xs text-[#8C5E35] hover:underline font-medium cursor-pointer"
                  >
                    Open Inbox ↗
                  </button>
                </div>

                {newInquiries.length === 0 ? (
                  <p className="text-xs text-[#7A6F62] p-3 bg-[#FAF8F5] rounded-lg">
                    No new custom inquiries awaiting reply.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {newInquiries.slice(0, 3).map(inq => (
                      <div key={inq.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#24211D]">{inq.name}</span>
                            <span className="font-mono text-[10px] text-[#8C5E35]">{inq.phone}</span>
                          </div>
                          <p className="text-[11px] text-[#7A6F62] line-clamp-1">{inq.message}</p>
                        </div>
                        <button
                          onClick={() => setCurrentTab('inbox')}
                          className="px-2.5 py-1 bg-[#8C5E35] text-white rounded text-[11px] font-medium cursor-pointer shrink-0"
                        >
                          Reply ↗
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Warnings */}
            {lowStockProducts.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Low Stock / Sold Out Inventory Alert ({lowStockProducts.length} items)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span 
                      key={p.id}
                      onClick={() => openEditProductModal(p)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-300 rounded text-xs text-[#24211D] cursor-pointer hover:border-[#8C5E35]"
                    >
                      <span>{p.name}</span>
                      <span className="font-mono font-bold text-amber-800">
                        ({p.stockQuantity ?? 0} left)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Navigation to Editor */}
            <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] flex items-center justify-between shadow-xs">
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#24211D]">Live Website & Product Page Editor</h4>
                <p className="text-xs text-[#7A6F62]">WYSIWYG Pencil Mode: preview draft edits directly on storefront components.</p>
              </div>
              <button
                onClick={() => {
                  setCurrentTab('more');
                  setMoreSubTab('editor');
                }}
                className="px-3.5 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Live Editor</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ORDERS (Section 5: Orders, Manual Gateway & Invoices) */}
        {/* =================================================================== */}
        {currentTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Order Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-[#EAE0D5] shadow-xs">
              {/* Order Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                      orderFilter === status ? 'bg-[#24211D] text-white' : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
                    }`}
                  >
                    {status === 'all' ? `All (${orders.length})` : 
                     status === 'Pending' ? `Pending (${pendingOrders.length})` : status}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Export CSV */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportOrdersCSV}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search and Payment Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-3.5 h-3.5 text-[#7A6F62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders by Order ID, Customer Name, Phone, or TrxID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35] cursor-pointer"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="unverified">⏳ Pending Verification</option>
                  <option value="verified">✓ Verified Only</option>
                </select>
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-[#EAE0D5] space-y-2 shadow-xs">
                <ShoppingBag className="w-10 h-10 text-[#8C5E35] mx-auto opacity-30" />
                <p className="text-xs text-[#7A6F62]">No orders matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map(order => {
                  // Recalculate line items so Grand Total = Subtotal + Delivery - Discount (Section 5C)
                  const subtotal = order.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                  const deliveryFee = order.deliveryFee ?? (order.deliveryArea === 'dhaka' ? 70 : 130);
                  const discount = order.discountAmount ?? 0;
                  const computedTotal = Math.max(0, subtotal + deliveryFee - discount);

                  return (
                    <div 
                      key={order.id} 
                      className={`p-4 sm:p-5 bg-white rounded-xl border shadow-xs space-y-4 transition-all ${
                        order.isTestOrder ? 'border-dashed border-gray-400 opacity-80' : 'border-[#EAE0D5] hover:border-[#D8CEBE]'
                      }`}
                    >
                      {/* Top Order Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EAE0D5] pb-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#8C5E35] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#EAE0D5]">
                            #{order.id}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-[#7A6F62]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.createdAt}</span>
                          </div>
                          {order.isTestOrder && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold">
                              TEST ORDER
                            </span>
                          )}
                        </div>

                        {/* Status Transition Control */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#7A6F62]">Stage:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatusWithConfirm(order, e.target.value as OrderRecord['status'])}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer ${
                              order.status === 'Pending' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                              order.status === 'Confirmed' ? 'bg-blue-50 text-blue-900 border-blue-300' :
                              order.status === 'Processing' ? 'bg-indigo-50 text-indigo-900 border-indigo-300' :
                              order.status === 'Shipped' ? 'bg-purple-50 text-purple-900 border-purple-300' :
                              order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleNextStage(order)}
                              className="px-2.5 py-1 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-medium cursor-pointer shadow-xs transition-colors"
                              title="Advance to next workflow stage"
                            >
                              Next Stage →
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3-Column Breakdown (Customer | Items | Payment & Totals) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* 1. Customer & Shipping */}
                        <div className="space-y-1.5 p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
                          <p className="font-semibold text-[#24211D] flex items-center justify-between">
                            <span>{order.customerName}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white border border-[#EAE0D5] text-[#8C5E35]">
                              {order.deliveryArea === 'dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}
                            </span>
                          </p>
                          <p className="text-[#5A5248] font-mono flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                            <span>{order.customerPhone}</span>
                          </p>
                          <p className="text-[#7A6F62] leading-relaxed whitespace-pre-wrap">{order.customerAddress}</p>
                          {order.district && (
                            <p className="text-[11px] text-[#7A6F62]">District: <strong className="text-[#24211D]">{order.district}</strong></p>
                          )}
                        </div>

                        {/* 2. Items List */}
                        <div className="space-y-1.5 p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
                          <p className="font-semibold text-[#24211D]">Items Ordered ({order.items.length})</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {order.items.map((it, idx) => {
                              const fragName = it.fragrance || it.selectedFragrance || it.scent;
                              return (
                                <div key={idx} className="text-[#5A5248] text-xs py-1 border-b border-[#EAE0D5]/50 last:border-0">
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="font-medium text-[#24211D]">• {it.title}</span>
                                    <span className="font-mono text-[#24211D] shrink-0">x{it.quantity} (৳{it.price * it.quantity})</span>
                                  </div>
                                  {fragName && (
                                    <div className="pl-3 text-[11px] text-[#8C5E35] flex items-center gap-1 font-medium mt-0.5">
                                      <Sparkles className="w-3 h-3 text-[#C68B59]" />
                                      <span>Fragrance: {fragName}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Payment & Grand Total Breakdown */}
                        <div className="space-y-2 p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[#7A6F62]">Method:</span>
                              <span className="font-semibold uppercase text-[#24211D]">{order.paymentMethod}</span>
                            </div>
                            {order.transactionId && (
                              <div className="flex justify-between items-center pt-0.5">
                                <span className="text-[#7A6F62]">TrxID:</span>
                                <span className="font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-300">
                                  {order.transactionId}
                                </span>
                              </div>
                            )}
                            {order.senderPhone && (
                              <div className="flex justify-between items-center">
                                <span className="text-[#7A6F62]">Sender:</span>
                                <span className="font-mono font-semibold text-[#5A5248]">{order.senderPhone}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[#7A6F62]">Payment Status:</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  order.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                                  order.paymentStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-900'
                                }`}>
                                  {order.paymentStatus === 'verified' ? 'Verified' : order.paymentStatus === 'rejected' ? 'Rejected' : 'Unverified'}
                                </span>
                                {order.paymentStatus !== 'verified' && (
                                  <button
                                    onClick={() => handleTogglePaymentVerified(order, 'verified')}
                                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-medium cursor-pointer"
                                  >
                                    Mark Verified
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mathematical Total Breakdown */}
                          <div className="pt-2 border-t border-[#EAE0D5] space-y-1">
                            <div className="flex justify-between text-[#7A6F62] text-[11px]">
                              <span>Items Subtotal:</span>
                              <span className="font-mono">৳{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-[#7A6F62] text-[11px]">
                              <span>Delivery Fee:</span>
                              <span className="font-mono">৳{deliveryFee}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-emerald-800 text-[11px] font-medium">
                                <span>Discount:</span>
                                <span className="font-mono">-৳{discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-baseline font-bold text-sm text-[#24211D] pt-1 border-t border-[#EAE0D5]">
                              <span>Grand Total:</span>
                              <span className="font-mono text-base text-[#8C5E35]">৳{computedTotal}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tracking & Notes Inline Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#7A6F62] block mb-0.5">Courier Tracking #:</label>
                          <input
                            type="text"
                            defaultValue={order.courierTracking || ''}
                            onBlur={(e) => handleUpdateOrderTracking(order.id, e.target.value)}
                            placeholder="e.g. STEADFAST-123456"
                            className="w-full px-2.5 py-1 bg-[#FAF8F5] border border-[#EAE0D5] rounded text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#7A6F62] block mb-0.5">Internal Studio Notes:</label>
                          <input
                            type="text"
                            defaultValue={order.internalNotes || ''}
                            onBlur={(e) => handleUpdateOrderNotes(order.id, e.target.value)}
                            placeholder="Add private note about this order..."
                            className="w-full px-2.5 py-1 bg-[#FAF8F5] border border-[#EAE0D5] rounded text-xs"
                          />
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE0D5]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTestOrder(order)}
                            className="text-[11px] text-[#7A6F62] hover:text-[#24211D] underline cursor-pointer"
                          >
                            {order.isTestOrder ? 'Mark as Real Order' : 'Mark as Test Order (Exclude from Revenue)'}
                          </button>
                          <span className="text-[#D8CEBE]">·</span>
                          <button
                            onClick={() => handleCancelOrderWithReason(order)}
                            className="text-[11px] text-rose-600 hover:text-rose-800 underline cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${order.customerPhone}`} 
                            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                            <span>Call</span>
                          </a>
                          <button 
                            onClick={() => handleSendWhatsAppConfirmation(order)} 
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Receipt</span>
                          </button>
                          <button 
                            onClick={() => setActiveInvoiceOrder(order)} 
                            className="px-3 py-1.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PRODUCTS (Section 4: Products Catalog & Management) */}
        {/* =================================================================== */}
        {currentTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Product Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EAE0D5] shadow-xs">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#24211D]">
                  Product Catalog Management
                </h3>
                <p className="text-xs text-[#7A6F62] mt-0.5">
                  সব ক্যান্ডেলের বিবরণ, দাম, স্টক ও ফটো পরিচালনা করুন।
                </p>
              </div>

              {/* SINGLE "Add New Candle" button (Section 4: Remove duplicate Add buttons) */}
              <button
                onClick={openCreateProductModal}
                className="px-4 py-2 bg-[#24211D] hover:bg-[#8C5E35] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>+ Add New Product</span>
              </button>
            </div>

            {/* Filter, Search & Sort Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Search */}
              <div className="sm:col-span-8 relative">
                <Search className="w-3.5 h-3.5 text-[#7A6F62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candles by title, wax, fragrance..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              {/* Sort */}
              <div className="sm:col-span-4">
                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35] cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Sort: Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto border border-[#EAE0D5] rounded-xl bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE0D5] text-[#7A6F62] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 font-semibold">Candle Creation</th>
                    <th className="p-3.5 font-semibold">Formulation</th>
                    <th className="p-3.5 font-semibold">Price</th>
                    <th className="p-3.5 font-semibold">Stock &amp; Qty</th>
                    <th className="p-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D5]">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#EAE0D5] shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#24211D] block text-xs">{p.name}</span>
                            <span className="text-[10px] text-[#7A6F62]">
                              {p.sku ? `SKU: ${p.sku} · ` : ''}{p.scentNotes?.slice(0, 2).join(' · ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded text-[10px] bg-[#FAF8F5] border border-[#EAE0D5] text-[#7A6F62] font-medium">
                          {p.waxType || '100% Pure Soy Wax'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-[#24211D]">
                        ৳{p.price}
                        {p.originalPrice && (
                          <span className="text-[10px] text-[#9E9282] line-through ml-1.5">
                            ৳{p.originalPrice}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                              p.inStock
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            {p.inStock ? 'In Stock' : 'Sold Out'}
                          </button>
                          <span className="text-[11px] font-mono text-[#7A6F62]">
                            ({p.stockQuantity ?? (p.inStock ? 20 : 0)} pcs)
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        {/* ONE clear set of actions per card (Section 4) */}
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleJumpToProductPage(p.id)}
                            className="px-2.5 py-1 bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                            title="Edit Full Page in Visual Editor"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Edit Page ↗</span>
                          </button>
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 text-[#5A5248] hover:text-[#24211D] hover:bg-[#EAE0D5] rounded transition-colors cursor-pointer"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Section 2e: Tables become full-width cards on mobile) */}
            <div className="sm:hidden space-y-3">
              {filteredProducts.map(p => (
                <div key={p.id} className="p-3.5 bg-white rounded-xl border border-[#EAE0D5] shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#EAE0D5] shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[#24211D] truncate">{p.name}</h4>
                      <p className="text-[10px] text-[#7A6F62] truncate mt-0.5">
                        {p.waxType || '100% Pure Soy Wax'}{p.scentFamily ? ` · ${p.scentFamily}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono font-bold text-xs text-[#24211D]">৳{p.price}</span>
                        {p.originalPrice && (
                          <span className="font-mono text-[10px] text-[#9E9282] line-through">৳{p.originalPrice}</span>
                        )}
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                            p.inStock ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Sold Out'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE0D5]">
                    <button
                      onClick={() => openEditProductModal(p)}
                      className="w-full py-2 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => handleJumpToProductPage(p.id)}
                      className="w-full py-2 bg-[#8C5E35] hover:bg-[#734A26] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Page ↗</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3B: GLOBAL FRAGRANCE LIBRARY (Part 1B) */}
        {/* =================================================================== */}
        {currentTab === 'fragrances' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FragranceManager 
              fragrances={fragrances} 
              onFragrancesChange={onFragrancesChange || (() => {})} 
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: INBOX (Section 8: Bespoke & Custom Inquiries Inbox) */}
        {/* =================================================================== */}
        {currentTab === 'inbox' && (
          <div className="animate-in fade-in duration-200">
            <BespokeInbox 
              inquiries={inquiries} 
              onRefresh={() => fetchAllInquiriesFromFirestore().then(setInquiries)}
              onFlash={flash}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: MORE (Coupons, Policies, Settings, Editor, Analytics, Backup) */}
        {/* =================================================================== */}
        {currentTab === 'more' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* More Sub-navigation tabs */}
            <div className="bg-white p-2 rounded-xl border border-[#EAE0D5] flex flex-wrap gap-1 shadow-xs">
              {[
                { id: 'fragrances', label: 'Fragrance Library', icon: <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" /> },
                { id: 'coupons', label: 'Coupons & Vouchers', icon: <Tag className="w-3.5 h-3.5" /> },
                { id: 'policies', label: 'Legal Policies', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'settings', label: 'Store Settings', icon: <Settings className="w-3.5 h-3.5" /> },
                { id: 'customers', label: 'Customer Accounts', icon: <Users className="w-3.5 h-3.5" /> },
                { id: 'editor', label: 'Visual Site Editor', icon: <Eye className="w-3.5 h-3.5" /> },
                { id: 'analytics', label: 'Sales Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                { id: 'backup', label: 'Backup & Restore', icon: <Database className="w-3.5 h-3.5" /> },
                { id: 'activity', label: 'Activity Log', icon: <Activity className="w-3.5 h-3.5" /> },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setMoreSubTab(sub.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    moreSubTab === sub.id ? 'bg-[#24211D] text-white shadow-xs' : 'text-[#5A5248] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>

            {/* SUB-VIEW 1: COUPONS (Section 7: Single-Step Save & Edit) */}
            {moreSubTab === 'fragrances' && (
              <FragranceManager 
                fragrances={fragrances} 
                onFragrancesChange={onFragrancesChange || (() => {})} 
              />
            )}

            {/* SUB-VIEW 1: COUPONS (Section 7: Single-Step Save & Edit) */}
            {moreSubTab === 'coupons' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-6 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#24211D]">Store Discount Coupons</h3>
                  <p className="text-xs text-[#7A6F62] mt-0.5">
                    Single-step save: creating or editing a coupon saves directly to Firestore.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Coupon Form */}
                  <form onSubmit={handleSaveCoupon} className="lg:col-span-5 p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] space-y-3 text-xs">
                    <span className="text-xs font-semibold text-[#24211D] uppercase tracking-wide block">
                      {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </span>

                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. EID15"
                        className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded font-mono font-bold uppercase focus:border-[#8C5E35]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-medium text-[#24211D] block mb-1">Discount Amount *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[#24211D] block mb-1">Type *</label>
                        <select
                          value={couponType}
                          onChange={(e) => setCouponType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded"
                        >
                          <option value="percent">% Percentage Off</option>
                          <option value="flat">৳ Flat Amount Off</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-medium text-[#24211D] block mb-1">Min Order (৳, Optional)</label>
                        <input
                          type="number"
                          min="0"
                          value={couponMinOrder || ''}
                          onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                          placeholder="e.g. 500"
                          className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[#24211D] block mb-1">Usage Limit (Optional)</label>
                        <input
                          type="number"
                          min="0"
                          value={couponLimit || ''}
                          onChange={(e) => setCouponLimit(Number(e.target.value))}
                          placeholder="e.g. 100"
                          className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={couponExpiry}
                        onChange={(e) => setCouponExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Note / Description (Optional)</label>
                      <input
                        type="text"
                        value={couponDesc}
                        onChange={(e) => setCouponDesc(e.target.value)}
                        placeholder="e.g. Eid celebration discount"
                        className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      {editingCoupon && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(null);
                            setCouponCode('');
                            setCouponDesc('');
                          }}
                          className="flex-1 py-2 bg-white border border-[#D8CEBE] rounded font-medium text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {loading ? 'Saving...' : editingCoupon ? 'Update & Save' : 'Save Coupon'}
                      </button>
                    </div>
                  </form>

                  {/* Coupons List */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <span className="text-xs font-semibold text-[#24211D] uppercase tracking-wide block mb-2">
                      Active Coupons ({(settingsForm.coupons || DEFAULT_COUPONS).length})
                    </span>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {(settingsForm.coupons || DEFAULT_COUPONS).map(c => (
                        <div key={c.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#8C5E35] bg-white px-2 py-0.5 rounded border border-[#EAE0D5]">
                                {c.code}
                              </span>
                              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {c.type === 'percent' ? `${c.discount}% OFF` : `৳${c.discount} OFF`}
                              </span>
                              {c.minOrder ? <span className="text-[#7A6F62] text-[10px]">Min ৳{c.minOrder}</span> : null}
                            </div>
                            {c.description && <p className="text-[11px] text-[#5A5248]">{c.description}</p>}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#7A6F62] pt-0.5">
                              {c.expiryDate ? (
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-[#8C5E35]" />
                                  <span>Expires: {c.expiryDate}</span>
                                </span>
                              ) : (
                                <span>No expiration</span>
                              )}
                              <span>•</span>
                              <span>
                                Used: {c.usageCount || 0}{c.usageLimit ? ` / ${c.usageLimit} max` : ' (No limit)'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleCouponActive(c.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                c.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {c.active !== false ? 'Active' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingCoupon(c);
                                setCouponCode(c.code);
                                setCouponDiscount(c.discount);
                                setCouponType(c.type);
                                setCouponMinOrder(c.minOrder || 0);
                                setCouponDesc(c.description || '');
                                setCouponExpiry(c.expiryDate || '');
                                setCouponLimit(c.usageLimit || 0);
                              }}
                              className="p-1.5 text-[#5A5248] hover:text-[#24211D] hover:bg-white rounded cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCouponWithConfirm(c.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: POLICIES (Section 9) */}
            {moreSubTab === 'policies' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#24211D]">Store Legal Policies</h3>
                    <p className="text-xs text-[#7A6F62] mt-0.5">
                      Terms &amp; Conditions, Privacy Policy, and Refund Policy texts.
                    </p>
                  </div>
                  <button
                    onClick={handleSavePolicies}
                    disabled={loading}
                    className="px-4 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Policies to Cloud'}
                  </button>
                </div>

                <div className="flex border-b border-[#EAE0D5] gap-2 pt-2">
                  {[
                    { id: 'terms' as const, label: '📜 Terms and Conditions' },
                    { id: 'privacy' as const, label: '🛡️ Privacy Policy' },
                    { id: 'refund' as const, label: '🔄 Refund & Return Policy' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPolicyTab(tab.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors cursor-pointer ${
                        policyTab === tab.id ? 'bg-[#24211D] text-white' : 'text-[#5A5248] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={12}
                  value={settingsForm.policies?.[policyTab] ?? DEFAULT_STORE_POLICIES[policyTab]}
                  onChange={(e) => {
                    const updatedPolicies = {
                      ...(settingsForm.policies || DEFAULT_STORE_POLICIES),
                      [policyTab]: e.target.value,
                    };
                    setSettingsForm({ ...settingsForm, policies: updatedPolicies });
                  }}
                  className="w-full p-4 bg-white border border-[#D8CEBE] rounded-xl text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:border-[#8C5E35]"
                />
              </div>
            )}

            {/* SUB-VIEW 3: SETTINGS (Section 5D & 9) */}
            {moreSubTab === 'settings' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-6 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#24211D]">Storefront &amp; Payment Settings</h3>
                  <p className="text-xs text-[#7A6F62] mt-0.5">
                    Manual vs Merchant mode, Send Money numbers, Delivery fees, and Favicon.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-3xl text-xs">
                  {/* Payment Mode Selector (Section 5D) */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] space-y-2.5">
                    <span className="font-semibold text-xs text-[#24211D] uppercase tracking-wide block">
                      Payment Mode Configuration
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="p-3 bg-white rounded-lg border border-[#8C5E35] flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={settingsForm.paymentMode !== 'merchant'}
                          onChange={() => setSettingsForm({ ...settingsForm, paymentMode: 'manual' })}

                          className="mt-0.5 accent-[#8C5E35]"
                        />
                        <div>
                          <span className="font-semibold text-[#24211D] block">Manual Mode (Current)</span>
                          <span className="text-[11px] text-[#7A6F62]">Send Money + TrxID verification. Zero merchant fee.</span>
                        </div>
                      </label>

                      <label className="p-3 bg-white rounded-lg border border-[#EAE0D5] flex items-start gap-2.5 cursor-pointer opacity-80">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={settingsForm.paymentMode === 'merchant'}
                          onChange={() => setSettingsForm({ ...settingsForm, paymentMode: 'merchant' })}
                          className="mt-0.5 accent-[#8C5E35]"
                        />
                        <div>
                          <span className="font-semibold text-[#24211D] block">Merchant / API Mode (Future)</span>
                          <span className="text-[11px] text-[#7A6F62]">Auto-verify via bKash/Nagad Merchant APIs.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Manual Payment Numbers (Section 5D: Empty state if not set, no dummy numbers) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-medium text-[#24211D]">bKash Send Money Number</label>
                      <input
                        type="text"
                        value={settingsForm.bkashNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                        placeholder="Not set yet (e.g. 01XXXXXXXXX)"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                      {!settingsForm.bkashNumber && (
                        <p className="text-[10px] text-amber-700">⚠️ Empty: bKash checkout method will be disabled until set.</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-[#24211D]">Nagad Send Money Number</label>
                      <input
                        type="text"
                        value={settingsForm.nagadNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                        placeholder="Not set yet (e.g. 01XXXXXXXXX)"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                      {!settingsForm.nagadNumber && (
                        <p className="text-[10px] text-amber-700">⚠️ Empty: Nagad checkout method will be disabled until set.</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Fees & Minimum Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Delivery Fee (Dhaka, ৳)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryFeeDhaka}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeDhaka: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Delivery Fee (Outside, ৳)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryFeeOutside}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutside: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Minimum Order (৳)</label>
                      <input
                        type="number"
                        value={settingsForm.minimumOrder}
                        onChange={(e) => setSettingsForm({ ...settingsForm, minimumOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                    </div>
                  </div>

                  {/* Announcement Banner (Section 9) */}
                  <div>
                    <label className="font-medium text-[#24211D] block mb-1">Top Announcement Banner Text</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      placeholder="e.g. ✨ 10% Off Eid Pre-orders · Doorstep Delivery Across Bangladesh"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded"
                    />
                  </div>

                  {/* Contact Support */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-[#24211D] block mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        placeholder="Not set yet"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EAE0D5] rounded font-mono"
                      />
                    </div>
                  </div>

                  {/* Master Passcode Change (Section 3: Min 8 chars, letters + numbers, no plain passcode displayed) */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] space-y-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#8C5E35]" />
                      <h4 className="font-semibold uppercase tracking-wider text-[#24211D] text-xs">
                        Change Studio Admin Passcode
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#7A6F62]">
                      পাসকোড পরিবর্তনের ক্ষেত্রে কমপক্ষে ৮ অক্ষর এবং সংখ্যা ও বর্ণের মিশ্রণ আবশ্যক।
                    </p>
                    <div className="max-w-xs space-y-1">
                      <input
                        type="password"
                        value={settingsForm.adminPasscode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adminPasscode: e.target.value })}
                        placeholder="নতুন পাসওয়ার্ড দিন..."
                        className="w-full px-3 py-2 bg-white border border-[#EAE0D5] rounded font-mono"
                      />
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-[#24211D]">Favicon / Browser Tab Icon</h4>
                      <p className="text-[11px] text-[#7A6F62]">Upload custom SVG or PNG icon.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {faviconPreview && (
                        <div className="w-8 h-8 rounded bg-white border border-[#EAE0D5] p-1 shrink-0">
                          <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "/favicon.svg"; }} />
                        </div>
                      )}
                      <label className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-dashed border-[#8C5E35] rounded text-xs font-medium cursor-pointer">
                        <span>Upload Favicon</span>
                        <input type="file" accept="image/*,.svg" className="hidden" onChange={handleFaviconUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save All Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-VIEW 4: CUSTOMERS (Section 6) */}
            {moreSubTab === 'customers' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#24211D]">Patron Customers ({customers.length})</h3>
                    <p className="text-xs text-[#7A6F62] mt-0.5">Customer profiles and order histories.</p>
                  </div>
                  <button
                    onClick={exportCustomersCSV}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-[#EAE0D5] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#EAE0D5] text-[#7A6F62] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5 font-semibold">Name</th>
                        <th className="p-3.5 font-semibold">Phone</th>
                        <th className="p-3.5 font-semibold">Email</th>
                        <th className="p-3.5 font-semibold">City</th>
                        <th className="p-3.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE0D5]">
                      {customers.map((c, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="p-3.5 font-semibold text-[#24211D]">{c.name}</td>
                          <td className="p-3.5 font-mono text-[#8C5E35]">{c.phone}</td>
                          <td className="p-3.5 text-[#5A5248]">{c.email || '—'}</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] bg-[#FAF8F5] border border-[#EAE0D5] text-[#7A6F62]">{c.city || 'Dhaka'}</span></td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setActiveCustomerDetail(c)}
                              className="px-2.5 py-1 bg-white hover:bg-[#EAE0D5] border border-[#D8CEBE] rounded text-[11px] font-medium cursor-pointer"
                            >
                              Detail &amp; History ↗
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: VISUAL SITE EDITOR (Section 1) */}
            {moreSubTab === 'editor' && (
              <div id="visual-site-editor">
                <VisualSiteEditor
                  embedded={true}
                  initialPageView={editorPageView}
                  initialProductId={editorProductId}
                  initialContent={siteContent}
                  storeSettings={settings}
                  products={products}
                  onCreateProduct={openCreateProductModal}
                  onEditProduct={openEditProductModal}
                  onDeleteProduct={handleDeleteProduct}
                  onToggleStock={handleToggleStock}
                  onSave={async (newContent) => {
                    const safe = sanitizeSiteContent(newContent);
                    const ok = await updateSiteContentInFirestore(safe);
                    if (ok) {
                      setSiteContent(safe);
                      try {
                        localStorage.setItem('liora_site_content', JSON.stringify(safe));
                      } catch {}
                      flash('Website texts and font style published successfully!', 'success');
                      logActivity('Published website content changes');
                    } else {
                      flash('Failed to publish website changes to Firestore', 'error');
                    }
                    return ok;
                  }}
                />
              </div>
            )}

            {/* SUB-VIEW 6: ANALYTICS (Section 12) */}
            {moreSubTab === 'analytics' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-6 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#24211D]">Sales Analytics Report</h3>
                  <p className="text-xs text-[#7A6F62] mt-0.5">Revenue from verified, non-test orders only.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5]">
                    <span className="text-[10px] uppercase font-mono text-[#7A6F62]">Gross Revenue</span>
                    <p className="text-2xl font-serif font-bold text-[#8C5E35] mt-1">৳{totalRevenue.toLocaleString()}</p>
                    <p className="text-[11px] text-[#7A6F62] mt-0.5">{orders.length} Total Placed Orders</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5]">
                    <span className="text-[10px] uppercase font-mono text-[#7A6F62]">Completed / Delivered</span>
                    <p className="text-2xl font-serif font-bold text-emerald-800 mt-1">
                      {orders.filter(o => o.status === 'Delivered').length}
                    </p>
                    <p className="text-[11px] text-[#7A6F62] mt-0.5">Successfully fulfilled</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5]">
                    <span className="text-[10px] uppercase font-mono text-[#7A6F62]">Active Patron Circle</span>
                    <p className="text-2xl font-serif font-bold text-[#24211D] mt-1">{customers.length}</p>
                    <p className="text-[11px] text-[#7A6F62] mt-0.5">Registered customer base</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 7: BACKUP & RESTORE (Section 12) */}
            {moreSubTab === 'backup' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-4 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#24211D]">Studio Data Backup &amp; Disaster Recovery</h3>
                  <p className="text-xs text-[#7A6F62] mt-0.5">
                    Export all products, orders, customers, policies, and settings as a portable JSON snapshot.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-[#24211D]">Export Complete Storefront Backup</h4>
                    <p className="text-[11px] text-[#7A6F62]">Downloads complete database snapshot directly to your machine.</p>
                  </div>
                  <button
                    onClick={handleExportFullBackup}
                    className="px-4 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-VIEW 8: ACTIVITY LOG (Section 12) */}
            {moreSubTab === 'activity' && (
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAE0D5] space-y-3 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#24211D]">Audit Trail &amp; Activity Log</h3>
                  <p className="text-xs text-[#7A6F62] mt-0.5">Recent operations and status changes.</p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex items-center justify-between">
                      <span className="text-[#24211D] font-medium">• {log.action}</span>
                      <span className="font-mono text-[10px] text-[#7A6F62]">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Section 2e: Usable with one thumb) */}
      {/* =================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE0D5] flex sm:hidden items-center justify-around py-2 shadow-lg">
        <button
          onClick={() => setCurrentTab('today')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'today' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>Today</span>
        </button>

        <button
          onClick={() => setCurrentTab('orders')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'orders' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
          {pendingOrders.length > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'products' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setCurrentTab('inbox')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'inbox' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Inbox</span>
          {newInquiries.length > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {newInquiries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('more')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'more' ? 'text-[#8C5E35] font-bold' : 'text-[#7A6F62]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* =================================================================== */}
      {/* INVOICE MODAL (Section 5C) */}
      {/* =================================================================== */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          settings={settings}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* =================================================================== */}
      {/* CUSTOMER DETAIL MODAL (Section 6) */}
      {/* =================================================================== */}
      {activeCustomerDetail && (
        <CustomerDetailModal
          customer={activeCustomerDetail}
          orders={orders}
          onClose={() => setActiveCustomerDetail(null)}
          onOpenOrderInvoice={(ord) => setActiveInvoiceOrder(ord)}
          onDeleteCustomer={async (c) => {
            const key = c.phone || c.email;
            await deleteCustomerFromFirestore(key);
            setCustomers(prev => prev.filter(item => (item.phone || item.email) !== key));
            flash(`Customer "${c.name}" deleted.`);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* PRODUCT CREATE / EDIT MODAL (Section 4: Starts COMPLETELY BLANK!) */}
      {/* =================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-[#24211D]">
                  {editingProduct ? 'Edit Candle Creation' : 'Add New Candle Creation'}
                </h3>
                <p className="text-xs text-[#7A6F62]">
                  {editingProduct ? 'Update specifications and pricing' : 'Form starts blank — fill title, price, and photo to publish.'}
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="font-semibold text-[#24211D]">
                  Candle Title / Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber & Oud Sculpted Column"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35]"
                />
                {productFormErrors.name && <p className="text-[11px] text-rose-600">{productFormErrors.name}</p>}
              </div>

              {/* Photo Upload Zone (Section 4) */}
              <div className="space-y-1.5 p-3.5 bg-white rounded-lg border border-[#EAE0D5]">
                <label className="font-semibold text-[#24211D] flex items-center justify-between">
                  <span>Candle Photo (Upload from Mobile or PC) <span className="text-rose-600">*</span></span>
                  {productImagePreview && (
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Image Loaded</span>
                  )}
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-[#FAF8F5] hover:bg-[#EAE0D5]/50 border border-dashed border-[#8C5E35] rounded-lg cursor-pointer transition-colors text-[#24211D]">
                    <Upload className="w-4 h-4 text-[#8C5E35]" />
                    <span>Choose Image from Device</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProductImageUpload} 
                    />
                  </label>

                  {productImagePreview && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#EAE0D5] shrink-0">
                      <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {productFormErrors.image && <p className="text-[11px] text-rose-600">{productFormErrors.image}</p>}
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">
                    Regular Price (৳ BDT) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={productForm.price ?? ''}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg font-mono"
                  />
                  {productFormErrors.price && <p className="text-[11px] text-rose-600">{productFormErrors.price}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Original / Strikethrough Price (৳)</label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 500)"
                    value={productForm.originalPrice ?? ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* SKU & Stock Quantity (Section 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">SKU (Auto or Custom)</label>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. HL-CUBE-01"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Stock Quantity (Pieces)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockQuantity ?? 0}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Scent Family & Product Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Fragrance Family</label>
                  <select
                    value={productForm.scentFamily || 'Floral'}
                    onChange={(e) => setProductForm({ ...productForm, scentFamily: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg cursor-pointer"
                  >
                    <option value="Floral">Floral & Soft</option>
                    <option value="Woody & Warm">Woody & Warm</option>
                    <option value="Fresh & Citrus">Fresh & Citrus</option>
                    <option value="Amber & Spice">Amber & Spice</option>
                    <option value="Sweet & Gourmand">Sweet & Gourmand</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Product Visibility Status</label>
                  <select
                    value={productForm.status || 'published'}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg cursor-pointer font-medium"
                  >
                    <option value="published">Published (Visible on storefront)</option>
                    <option value="draft">Draft (Hidden from storefront)</option>
                  </select>
                </div>
              </div>

              {/* Global Fragrance Notice (Part 1A) */}
              <div className="p-3 bg-[#F5F1EB] border border-[#EAE0D5] rounded-lg flex items-start gap-2.5 text-xs text-[#5A5248]">
                <Sparkles className="w-4 h-4 text-[#8C5E35] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#24211D] block">Global Fragrance Pool Active</span>
                  <p className="text-[11px] text-[#7A6F62] mt-0.5">
                    Fragrances are managed globally in Fragrance Library — this product uses all Active fragrances.
                  </p>
                </div>
              </div>

              {/* Dimensions & Burn Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Dimensions / Net Weight</label>
                  <input
                    type="text"
                    value={productForm.dimensions || ''}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    placeholder="e.g. 6cm x 6cm (150g)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D]">Burn Time</label>
                  <input
                    type="text"
                    value={productForm.burnTime || ''}
                    onChange={(e) => setProductForm({ ...productForm, burnTime: e.target.value })}
                    placeholder="e.g. 20-25 Hours"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-[#24211D]">Description &amp; Sensory Notes</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe the fragrance notes, wax pouring technique, and aesthetic..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-lg leading-relaxed"
                />
              </div>

              {/* Badges & Flags */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock ?? true}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="rounded text-[#8C5E35]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestseller ?? false}
                    onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                    className="rounded text-[#8C5E35]"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival ?? false}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="rounded text-[#8C5E35]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#EAE0D5] flex justify-end gap-2 sticky bottom-0 bg-[#FAF8F5] py-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 border border-[#EAE0D5] rounded-lg text-xs font-medium hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Update Candle' : 'Publish Candle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};