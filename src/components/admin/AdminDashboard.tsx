import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Product, OrderRecord, StoreSettings } from '../../types';
import { CustomerUser } from '../CustomerAuthModal';
import { 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  fetchAllOrdersFromFirestore, 
  updateOrderStatusInFirestore, 
  fetchAllCustomersFromFirestore, 
  fetchStoreSettings, 
  updateStoreSettingsInFirestore,
  subscribeToOrders,
  subscribeToProducts
} from '../../services/firebase';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../../data/products';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

const DEFAULT_ADMIN_PASSCODE = 'liora2026';
const ADMIN_AUTH_KEY = 'liora_admin_auth_token';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers' | 'settings'>('products');

  // Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Products Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'bubble',
    price: 350,
    originalPrice: 400,
    image: '',
    scentFamily: 'Floral',
    scentNotes: ['French Vanilla', 'Rose Petals'],
    dimensions: '6cm x 6cm x 6cm',
    burnTime: '20 Hours',
    waxType: '100% Pure Botanical Soy Wax',
    description: '',
    inStock: true,
    isBestseller: false,
    isNewArrival: false,
  });
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [scentNotesInput, setScentNotesInput] = useState<string>('');

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  // Flash message helper
  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === DEFAULT_ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect Atelier Passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  };

  // Load Real-time Data once Authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to live products
    const unsubProds = subscribeToProducts((liveProds) => {
      setProducts(liveProds);
    });

    // Listen to live orders
    const unsubOrders = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    // Fetch customers
    fetchAllCustomersFromFirestore().then(setCustomers);

    // Fetch settings
    fetchStoreSettings().then(st => {
      if (st) {
        setSettings(st);
        setSettingsForm(st);
        setFaviconPreview(st.faviconUrl || '/favicon.svg');
      }
    });

    return () => {
      unsubProds();
      unsubOrders();
    };
  }, [isAuthenticated]);

  // Product Image Upload Handler (Converts to compressed high-res WebP data URI)
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

  // Favicon Upload Handler
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

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      flash('Please provide at least a product name and price.', 'error');
      return;
    }

    setLoading(true);
    const id = editingProduct ? editingProduct.id : `liora-${Date.now()}`;
    const notesArray = scentNotesInput 
      ? scentNotesInput.split(',').map(s => s.trim()).filter(Boolean)
      : (productForm.scentNotes || ['Botanical Soy']);

    const newProduct: Product = {
      id,
      name: productForm.name || 'Untitled Creation',
      category: productForm.category as Product['category'] || 'bubble',
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      image: productImagePreview || productForm.image || '/images/bubble_soy_candle_1790333573183.jpg',
      scentFamily: productForm.scentFamily as Product['scentFamily'] || 'Floral',
      scentNotes: notesArray,
      dimensions: productForm.dimensions || '6cm x 6cm x 6cm',
      burnTime: productForm.burnTime || '20 Hours',
      waxType: productForm.waxType || '100% Pure Botanical Soy Wax',
      description: productForm.description || '',
      inStock: productForm.inStock ?? true,
      isBestseller: productForm.isBestseller ?? false,
      isNewArrival: productForm.isNewArrival ?? false,
    };

    const success = await saveProductToFirestore(newProduct);
    setLoading(false);

    if (success) {
      flash(editingProduct ? 'Product updated successfully!' : 'New product created and live in catalog!');
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } else {
      flash('Failed to save product to Cloud.', 'error');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    setLoading(true);
    const success = await deleteProductFromFirestore(product.id);
    setLoading(false);
    if (success) {
      flash(`"${product.name}" deleted from catalog.`);
    } else {
      flash('Failed to delete product.', 'error');
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated: Product = { ...product, inStock: !product.inStock };
    await saveProductToFirestore(updated);
    flash(`"${product.name}" is now marked as ${updated.inStock ? 'In Stock' : 'Out of Stock'}.`);
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'bubble',
      price: 350,
      originalPrice: 400,
      image: '',
      scentFamily: 'Floral',
      scentNotes: ['French Vanilla', 'Rose Petals'],
      dimensions: '6cm x 6cm x 6cm',
      burnTime: '20 Hours',
      waxType: '100% Pure Botanical Soy Wax',
      description: 'Handcrafted botanical soy candle poured with organic plant wax and lead-free cotton braided wicks.',
      inStock: true,
      isBestseller: false,
      isNewArrival: true,
    });
    setScentNotesInput('French Vanilla, Rose Petals');
    setProductImagePreview('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setScentNotesInput(product.scentNotes.join(', '));
    setProductImagePreview(product.image);
    setIsProductModalOpen(true);
  };

  // Order Status Updater
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderRecord['status']) => {
    const success = await updateOrderStatusInFirestore(orderId, newStatus);
    if (success) {
      flash(`Order #${orderId} marked as "${newStatus}".`);
    } else {
      flash(`Failed to update status for order #${orderId}.`, 'error');
    }
  };

  // WhatsApp Order Confirmation Trigger
  const handleSendWhatsAppConfirmation = (order: OrderRecord) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('880') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? `88${cleanPhone}` 
        : `880${cleanPhone}`;

    const itemsSummary = order.items.map(i => `• ${i.title} (x${i.quantity}) - ৳${i.price * i.quantity}`).join('%0A');
    const message = `Hello ${order.customerName},%0A%0AThank you for ordering with *House of Líora* (@houseofliorabd)!%0A%0A*Order ID:* ${order.id}%0A*Items:*%0A${itemsSummary}%0A%0A*Delivery Fee:* ৳${order.deliveryFee}%0A*Grand Total:* ৳${order.grandTotal}%0A*Payment Method:* ${order.paymentMethod.toUpperCase()}%0A*Status:* ${order.status}%0A%0AWe are preparing your artisanal botanical soy candle batch with utmost care! ✨`;
    
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateStoreSettingsInFirestore(settingsForm);
    setLoading(false);
    if (success) {
      setSettings(settingsForm);
      flash('Store branding, fees, and favicon saved to Cloud successfully!');
    } else {
      flash('Failed to update store settings.', 'error');
    }
  };

  // Calculated Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.grandTotal, 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'Pending').length;
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = orderFilter === 'all' || order.status.toLowerCase() === orderFilter.toLowerCase();
      const matchesSearch = 
        !orderSearch || 
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerPhone.includes(orderSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  // ---------------------------------------------------------------------------
  // AUTH LOGIN SCREEN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 selection:bg-[#EAE0D5]">
        <div className="w-full max-w-md bg-white border border-[#EAE0D5] rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#24211D] text-white flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C5E35]">
              House of Líora
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#24211D]">
              Atelier Admin Portal
            </h2>
            <p className="text-xs text-[#7A6F62]">
              Enter your master passcode to access product inventory, order processing, and branding controls.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#24211D] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Atelier Passcode</span>
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (default: liora2026)"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#EAE0D5] rounded-md focus:outline-none focus:border-[#8C5E35] focus:bg-white transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-md text-xs font-medium tracking-wide uppercase transition-colors cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-[#EAE0D5] text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-[#8C5E35] hover:text-[#24211D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#24211D] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE0D5] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#24211D] text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
            HL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-medium text-[#24211D]">
                House of Líora
              </h1>
              <span className="text-[10px] font-mono uppercase bg-[#FAF8F5] text-[#8C5E35] border border-[#EAE0D5] px-2 py-0.5 rounded">
                Atelier Admin
              </span>
            </div>
            <p className="text-[11px] text-[#7A6F62] hidden sm:block">
              Zero-Budget Cloud Storefront Controller · Spark Plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Store</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-[#7A6F62] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white rounded-lg border border-[#EAE0D5] shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#8C5E35]" />
              Gross Revenue
            </span>
            <p className="text-xl sm:text-2xl font-serif font-semibold text-[#24211D]">
              ৳{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-700">From verified orders</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#EAE0D5] shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#8C5E35]" />
              Total Orders
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-serif font-semibold text-[#24211D]">
                {orders.length}
              </p>
              {pendingOrdersCount > 0 && (
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                  {pendingOrdersCount} Pending
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#7A6F62]">Live intake in Firestore</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#EAE0D5] shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#8C5E35]" />
              Active Creations
            </span>
            <p className="text-xl sm:text-2xl font-serif font-semibold text-[#24211D]">
              {products.length}
            </p>
            <p className="text-[10px] text-[#7A6F62]">Candles in public catalog</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#EAE0D5] shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-[#7A6F62] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#8C5E35]" />
              Patron Circle
            </span>
            <p className="text-xl sm:text-2xl font-serif font-semibold text-[#24211D]">
              {customers.length}
            </p>
            <p className="text-[10px] text-[#7A6F62]">Registered customer profiles</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EAE0D5] overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#24211D] text-[#24211D]'
                : 'border-transparent text-[#7A6F62] hover:text-[#24211D]'
            }`}
          >
            <Package className="w-4 h-4 text-[#8C5E35]" />
            <span>Candle Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#24211D] text-[#24211D]'
                : 'border-transparent text-[#7A6F62] hover:text-[#24211D]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#8C5E35]" />
            <span>Customer Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'border-[#24211D] text-[#24211D]'
                : 'border-transparent text-[#7A6F62] hover:text-[#24211D]'
            }`}
          >
            <Users className="w-4 h-4 text-[#8C5E35]" />
            <span>Patron Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#24211D] text-[#24211D]'
                : 'border-transparent text-[#7A6F62] hover:text-[#24211D]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#8C5E35]" />
            <span>Storefront Settings</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: PRODUCTS CATALOG MANAGEMENT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#EAE0D5]">
              <div>
                <h3 className="font-serif text-lg text-[#24211D]">Product Catalog</h3>
                <p className="text-xs text-[#7A6F62]">
                  Add new candles, change prices, toggle stock, or upload high-res photos.
                </p>
              </div>

              <button
                onClick={openCreateProductModal}
                className="px-3.5 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-md text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add New Creation</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div 
                  key={product.id}
                  className="bg-white border border-[#EAE0D5] rounded-lg p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-[#D8CEBE] transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-[#FAF8F5] border border-[#EAE0D5] shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C5E35] font-medium">
                        <span className="capitalize">{product.category}</span>
                        <span>·</span>
                        <span>{product.scentFamily}</span>
                      </div>
                      <h4 className="font-serif text-base text-[#24211D] font-medium truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-semibold text-[#24211D]">
                          ৳{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="font-mono text-xs text-[#9E9282] line-through">
                            ৳{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#7A6F62] line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="pt-2 border-t border-[#EAE0D5] flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                        product.inStock 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="p-1.5 text-[#5A5248] hover:text-[#24211D] hover:bg-[#FAF8F5] rounded transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: LIVE ORDERS MANAGEMENT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg border border-[#EAE0D5] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      orderFilter === status
                        ? 'bg-[#24211D] text-white'
                        : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
                    }`}
                  >
                    {status === 'all' ? 'All Orders' : status}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#7A6F62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, Name, Phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md focus:outline-none focus:border-[#8C5E35]"
                />
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-lg border border-[#EAE0D5] space-y-2">
                <ShoppingBag className="w-8 h-8 text-[#8C5E35] mx-auto opacity-50" />
                <h4 className="font-serif text-lg text-[#24211D]">No Orders Found</h4>
                <p className="text-xs text-[#7A6F62]">
                  Orders submitted through the storefront shopping bag will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 bg-white rounded-lg border border-[#EAE0D5] shadow-xs space-y-4 hover:border-[#D8CEBE] transition-all"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE0D5] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-[#8C5E35] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#EAE0D5]">
                          #{order.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#7A6F62]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{order.createdAt}</span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#7A6F62]">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])}
                          className={`text-xs font-medium px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                            order.status === 'Pending' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                            order.status === 'Confirmed' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                            order.status === 'Shipped' ? 'bg-purple-50 text-purple-900 border-purple-200' :
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                            'bg-gray-50 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Info */}
                      <div className="space-y-1.5 p-3 bg-[#FAF8F5] rounded border border-[#EAE0D5]">
                        <p className="font-medium text-[#24211D] flex items-center justify-between">
                          <span>{order.customerName}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-[#8C5E35]">
                            {order.deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                          </span>
                        </p>
                        <p className="text-[#5A5248] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                          <span>{order.customerPhone}</span>
                        </p>
                        <p className="text-[#7A6F62] leading-relaxed">
                          {order.customerAddress}
                        </p>
                      </div>

                      {/* Items Purchased */}
                      <div className="space-y-1.5 p-3 bg-[#FAF8F5] rounded border border-[#EAE0D5]">
                        <p className="font-medium text-[#24211D]">Items ({order.items.length})</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[#5A5248]">
                              <span className="truncate max-w-[140px]">• {item.title}</span>
                              <span className="font-mono">x{item.quantity} (৳{item.price * item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials & Payment */}
                      <div className="space-y-1.5 p-3 bg-[#FAF8F5] rounded border border-[#EAE0D5] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-[#7A6F62]">
                            <span>Payment:</span>
                            <span className="font-medium uppercase text-[#24211D]">{order.paymentMethod}</span>
                          </div>
                          {order.transactionId && (
                            <div className="flex justify-between text-[#7A6F62] pt-0.5">
                              <span>TrxID:</span>
                              <span className="font-mono text-emerald-800 font-semibold">{order.transactionId}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#EAE0D5] flex justify-between items-baseline">
                          <span className="font-medium text-[#24211D]">Grand Total:</span>
                          <span className="font-mono text-base font-bold text-[#24211D]">৳{order.grandTotal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Call Customer</span>
                      </a>

                      <button
                        onClick={() => handleSendWhatsAppConfirmation(order)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: CUSTOMERS DIRECTORY */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-[#EAE0D5]">
              <h3 className="font-serif text-lg text-[#24211D]">Patron Directory</h3>
              <p className="text-xs text-[#7A6F62]">
                Registered customer profiles stored in Firebase Firestore for VIP offers & loyalty outreach.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#EAE0D5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE0D5] text-[#7A6F62] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 font-medium">Customer Name</th>
                    <th className="p-3.5 font-medium">Phone Number</th>
                    <th className="p-3.5 font-medium">Email Address</th>
                    <th className="p-3.5 font-medium">Delivery City</th>
                    <th className="p-3.5 font-medium">Address</th>
                    <th className="p-3.5 font-medium">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D5]">
                  {customers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="p-3.5 font-medium text-[#24211D]">{c.name}</td>
                      <td className="p-3.5 font-mono text-[#8C5E35]">{c.phone}</td>
                      <td className="p-3.5 text-[#5A5248]">{c.email}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#FAF8F5] border border-[#EAE0D5] text-[#7A6F62]">
                          {c.city}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#7A6F62] max-w-xs truncate">{c.address}</td>
                      <td className="p-3.5 text-[#7A6F62] font-mono">{c.joinedAt}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[#7A6F62]">
                        No registered patrons in Firestore yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: STORE SETTINGS & FAVICON CONTROLS */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-3xl">
            <div className="bg-white p-4 rounded-lg border border-[#EAE0D5]">
              <h3 className="font-serif text-lg text-[#24211D]">Storefront Controls & Branding</h3>
              <p className="text-xs text-[#7A6F62]">
                Update top announcement banner, delivery charges, bKash numbers, and website favicon directly.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-lg border border-[#EAE0D5] space-y-6 shadow-xs">
              {/* Dynamic Favicon Uploader */}
              <div className="p-4 bg-[#FAF8F5] rounded-md border border-[#EAE0D5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#24211D] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                      Website Favicon / Tab Icon
                    </h4>
                    <p className="text-[11px] text-[#7A6F62]">
                      Upload any SVG icon or high-res brand photo directly from your device.
                    </p>
                  </div>
                  {faviconPreview && (
                    <div className="w-10 h-10 rounded-md bg-white border border-[#EAE0D5] p-1 flex items-center justify-center shrink-0 shadow-xs">
                      <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#FAF8F5] border border-dashed border-[#8C5E35] rounded-md cursor-pointer transition-colors text-xs font-medium text-[#24211D]">
                    <Upload className="w-4 h-4 text-[#8C5E35]" />
                    <span>Choose SVG or Photo from Device</span>
                    <input 
                      type="file" 
                      accept=".svg,.png,.jpg,.jpeg,.webp,.ico,image/*" 
                      className="hidden" 
                      onChange={handleFaviconUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#24211D]">Top Announcement Banner Text</label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="e.g. ✨ 10% Off Eid Pre-orders · Min Order ৳200"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              {/* Fees & Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Delivery Fee (Dhaka)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFeeDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeDhaka: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Delivery Fee (Outside)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFeeOutside}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutside: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Minimum Order (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.minimumOrder}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minimumOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>
              </div>

              {/* Payment Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">bKash Merchant / Personal No.</label>
                  <input
                    type="text"
                    value={settingsForm.bkashNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Nagad Merchant / Personal No.</label>
                  <input
                    type="text"
                    value={settingsForm.nagadNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#24211D]">Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.supportPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE0D5] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-md text-xs font-medium tracking-wide uppercase transition-colors cursor-pointer"
                >
                  {loading ? 'Saving to Cloud...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ----------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-[#24211D]">
                  {editingProduct ? 'Edit Artisan Creation' : 'Add New Candle Creation'}
                </h3>
                <p className="text-xs text-[#7A6F62]">
                  Configure scent profile, wax specifications, and direct photo upload.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="font-medium text-[#24211D]">Candle Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber & Oud Sculpted Column"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              {/* Photo Upload Zone */}
              <div className="space-y-1.5 p-3 bg-white rounded-md border border-[#EAE0D5]">
                <label className="font-medium text-[#24211D] flex items-center justify-between">
                  <span>Candle Photo (Upload from Mobile or PC)</span>
                  {productImagePreview && (
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Image Loaded</span>
                  )}
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-[#FAF8F5] hover:bg-[#EAE0D5]/50 border border-dashed border-[#8C5E35] rounded-md cursor-pointer transition-colors text-[#24211D]">
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
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-[#FAF8F5] border border-[#EAE0D5] shrink-0">
                      <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Category & Scent Family */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Category</label>
                  <select
                    value={productForm.category || 'bubble'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Product['category'] })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md focus:outline-none"
                  >
                    <option value="bubble">Bubble Soy Cube</option>
                    <option value="floating">Floating Botanical Bloom</option>
                    <option value="sculpted">Sculpted Pillar / Torso</option>
                    <option value="jar">Aroma Jar / Wax Tablet</option>
                    <option value="hampers">Luxe Gift Hamper</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Scent Family</label>
                  <select
                    value={productForm.scentFamily || 'Floral'}
                    onChange={(e) => setProductForm({ ...productForm, scentFamily: e.target.value as Product['scentFamily'] })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md focus:outline-none"
                  >
                    <option value="Floral">Floral</option>
                    <option value="Woody & Warm">Woody & Warm</option>
                    <option value="Fresh & Citrus">Fresh & Citrus</option>
                    <option value="Sweet Gourmand">Sweet Gourmand</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Regular Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Original / Strikethrough Price (৳)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    placeholder="Optional (e.g. 450)"
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md font-mono"
                  />
                </div>
              </div>

              {/* Scent Notes */}
              <div className="space-y-1">
                <label className="font-medium text-[#24211D]">Scent Notes (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. French Vanilla, Cashmere, Sandalwood"
                  value={scentNotesInput}
                  onChange={(e) => setScentNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md"
                />
              </div>

              {/* Dimensions & Burn Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Dimensions / Net Weight</label>
                  <input
                    type="text"
                    value={productForm.dimensions || ''}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    placeholder="e.g. 6cm x 6cm (150g)"
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#24211D]">Burn Time</label>
                  <input
                    type="text"
                    value={productForm.burnTime || ''}
                    onChange={(e) => setProductForm({ ...productForm, burnTime: e.target.value })}
                    placeholder="e.g. 20-25 Hours"
                    className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-medium text-[#24211D]">Description & Sensory Notes</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Artisanal hand-poured candle crafted with organic plant-based soy wax..."
                  className="w-full px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-md leading-relaxed"
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

              <div className="pt-4 border-t border-[#EAE0D5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#EAE0D5] rounded text-xs font-medium hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
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
