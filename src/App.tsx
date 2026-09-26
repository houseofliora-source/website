import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, INITIAL_SAMPLE_ORDERS } from './data/products';
import { DEFAULT_SITE_CONTENT } from './data/defaultContent';
import { Product, CartItem, CustomFavorItem, OrderRecord, StoreSettings, SiteContent } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductQuickView } from './components/ProductQuickView';
import { ScentQuiz } from './components/ScentQuiz';
import { CustomFavorBuilder } from './components/CustomFavorBuilder';
import { CustomerAuthModal, CustomerUser } from './components/CustomerAuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CandleCareGuide } from './components/CandleCareGuide';
import { ReviewsAndFaq } from './components/ReviewsAndFaq';
import { Footer } from './components/Footer';
import { Sparkles, SlidersHorizontal, Flame } from 'lucide-react';
import { 
  fetchLiveProducts, 
  submitOrderToFirestore, 
  syncCustomerProfileToFirestore,
  fetchStoreSettings,
  updateDocumentFavicon,
  subscribeToProducts,
  subscribeToSiteContent,
  applySiteThemeToDOM
} from './services/firebase';
import { AdminDashboard } from './components/admin/AdminDashboard';

const STORAGE_KEYS = {
  PRODUCTS: 'liora_store_products',
  ORDERS: 'liora_store_orders',
  SETTINGS: 'liora_store_settings',
  CUSTOMER_USER: 'liora_current_user',
};

export default function App() {
  // Check if current route is /admin or #admin
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const isNowAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setIsAdminRoute(isNowAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Store products, settings, and dynamic site content & typography
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  // Load real-time catalog, store settings, and site content from Firestore
  useEffect(() => {
    const unsubscribeProds = subscribeToProducts((liveCatalog) => {
      if (liveCatalog && liveCatalog.length > 0) {
        setProducts(liveCatalog);
      }
    });

    const unsubscribeContent = subscribeToSiteContent((liveContent) => {
      if (liveContent) {
        setSiteContent(liveContent);
        if (liveContent.theme) {
          applySiteThemeToDOM(liveContent.theme);
        }
      }
    });

    fetchStoreSettings().then(settings => {
      if (settings) {
        setStoreSettings(settings);
        if (settings.faviconUrl) {
          updateDocumentFavicon(settings.faviconUrl);
        }
      }
    });

    return () => {
      if (unsubscribeProds) unsubscribeProds();
      if (unsubscribeContent) unsubscribeContent();
    };
  }, []);

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_ORDERS;
    } catch {
      return INITIAL_SAMPLE_ORDERS;
    }
  });

  // Customer Authentication state
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScentFamily, setSelectedScentFamily] = useState<string>('all');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: products[0] || INITIAL_PRODUCTS[0],
      quantity: 1,
      selectedScent: 'French Vanilla',
    }
  ]);

  const [customFavors, setCustomFavors] = useState<CustomFavorItem[]>([]);

  // Persist orders and user
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }, [currentUser]);

  // Add standard product to cart
  const handleAddToCart = (product: Product, quantity = 1, selectedScent?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedScent === selectedScent);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedScent === selectedScent
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedScent: selectedScent || product.scentNotes[0] }];
    });
    setIsCartOpen(true);
  };

  // Add custom favor batch
  const handleAddCustomToCart = (customOrder: CustomFavorItem) => {
    setCustomFavors(prev => [...prev, customOrder]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== id));
  };

  const handleRemoveCustomFavor = (index: number) => {
    setCustomFavors(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomFavors([]);
  };

  const handleOrderPlaced = (newOrder: OrderRecord) => {
    setOrders(prev => [newOrder, ...prev]);
    // Asynchronously submit order to Firebase Firestore (Spark Plan)
    submitOrderToFirestore(newOrder);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesScent = selectedScentFamily === 'all' || p.scentFamily === selectedScentFamily;
      return matchesCategory && matchesScent;
    });
  }, [products, selectedCategory, selectedScentFamily]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) + customFavors.length;

  if (isAdminRoute) {
    return (
      <AdminDashboard
        onBackToStore={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#24211D]">
      {/* Primary Top Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        announcementText={storeSettings.announcementText}
      />

      <main className="flex-1">
        {/* Campaign Hero Section */}
        <Hero
          onExplore={() => {
            const el = document.getElementById('collections');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCustomFavors={() => {
            const el = document.getElementById('custom-favors');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          content={siteContent.hero}
        />

        {/* Featured Collection Section */}
        <section id="collections" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#EAE0D5]">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                {siteContent.catalog.badge}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
                {siteContent.catalog.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5248] max-w-xl">
                {siteContent.catalog.subtitle}
              </p>
            </div>

            {/* Scent Quiz Trigger */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded text-xs font-medium transition-colors inline-flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>{siteContent.catalog.quizBtnText}</span>
            </button>
          </div>

          {/* Filter Bar (Segmented Controls) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Category Segmented Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#F3EFEA] rounded-md border border-[#EAE0D5] max-w-full">
              {[
                { id: 'all', label: 'All Pieces' },
                { id: 'bubble', label: 'Bubble Cubes' },
                { id: 'floating', label: 'Floating Blooms' },
                { id: 'sculpted', label: 'Sculpted Columns' },
                { id: 'hampers', label: 'Gift Hampers' },
                { id: 'jar', label: 'Aroma Tablets' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#24211D] text-white shadow-xs'
                      : 'text-[#5A5248] hover:text-[#24211D]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scent Family Dropdown filter */}
            <div className="flex items-center gap-2 text-xs text-[#5A5248]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C5E35]" />
              <span>Scent Family:</span>
              <select
                value={selectedScentFamily}
                onChange={e => setSelectedScentFamily(e.target.value)}
                className="bg-white border border-[#D8CEBE] rounded px-2.5 py-1 text-xs text-[#24211D] focus:border-[#24211D]"
              >
                <option value="all">All Aromas</option>
                <option value="Floral">Floral</option>
                <option value="Woody & Warm">Woody & Warm</option>
                <option value="Fresh & Citrus">Fresh & Citrus</option>
                <option value="Sweet Gourmand">Sweet Gourmand</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#F5F1EB] rounded-lg border border-[#EAE0D5] space-y-3">
              <p className="text-sm text-[#7A6F62]">
                No candles match the selected filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedScentFamily('all');
                }}
                className="px-3.5 py-1.5 text-xs bg-[#24211D] text-white rounded cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={p => setQuickViewProduct(p)}
                  onAddToCart={p => handleAddToCart(p, 1)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Custom Favor & Wedding Builder Studio */}
        <CustomFavorBuilder
          onAddCustomToCart={handleAddCustomToCart}
          facebookUrl={storeSettings.facebookUrl}
          content={siteContent.favors}
        />

        {/* Candle Care Rituals Guide */}
        <CandleCareGuide content={siteContent.care} />

        {/* Social Proof & FAQs */}
        <ReviewsAndFaq 
          reviewsContent={siteContent.reviews}
          faqContent={siteContent.faq}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAuth={() => setIsAuthOpen(true)}
        storeSettings={storeSettings}
        content={siteContent.footer}
      />

      {/* Modals & Overlays */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, q, s) => {
          handleAddToCart(p, q, s);
          setQuickViewProduct(null);
        }}
      />

      <ScentQuiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        products={products}
        onSelectProduct={p => {
          setQuickViewProduct(p);
        }}
      />

      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSignIn={(user) => {
          setCurrentUser(user);
          syncCustomerProfileToFirestore(user);
          setIsAuthOpen(false);
        }}
        onSignOut={() => {
          setCurrentUser(null);
        }}
        orders={orders}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        customFavors={customFavors}
        storeSettings={storeSettings}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onRemoveCustomFavor={handleRemoveCustomFavor}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}
