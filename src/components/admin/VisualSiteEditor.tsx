import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Type, 
  Palette, 
  Check, 
  Sparkles, 
  Flame, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  MessageSquare,
  MessageSquareQuote,
  Star,
  Package,
  Layers,
  ArrowUp,
  ArrowDown,
  Play,
  HelpCircle,
  Tag,
  CheckCircle2,
  Layout,
  ShoppingBag,
  Eye,
  Settings,
  CreditCard
} from 'lucide-react';
import { SiteContent, SiteTheme, ReviewItem, FaqItem, StoreSettings, Product, FavorMoldItem, FavorPackagingItem, CartItem } from '../../types';
import { DEFAULT_SITE_CONTENT, DEFAULT_PRODUCT_PAGE_CONTENT, sanitizeSiteContent } from '../../data/defaultContent';
import { applySiteThemeToDOM } from '../../services/firebase';
import { CustomFavorBuilder } from '../CustomFavorBuilder';
import { ProductDetailPage } from '../ProductDetailPage';
import { CheckoutPage } from '../CheckoutPage';

interface VisualSiteEditorProps {
  initialContent: SiteContent;
  storeSettings: StoreSettings;
  products: Product[];
  onSave: (newContent: SiteContent) => Promise<boolean>;
  onBackToAdmin?: () => void;
  /** When true, renders without its own standalone dark header — embeds inside parent layout */
  embedded?: boolean;
  initialPageView?: 'home' | 'product' | 'checkout';
  initialProductId?: string;
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onToggleStock?: (product: Product) => void;
}

export const VisualSiteEditor: React.FC<VisualSiteEditorProps> = ({
  initialContent,
  storeSettings,
  products,
  onSave,
  onBackToAdmin,
  embedded = false,
  initialPageView,
  initialProductId,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleStock,
}) => {
  const [content, setContent] = useState<SiteContent>(() => {
    return sanitizeSiteContent(initialContent);
  });
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePageView, setActivePageView] = useState<'home' | 'product' | 'checkout'>(initialPageView || 'home');
  const [previewProductId, setPreviewProductId] = useState<string>(() => initialProductId || products[0]?.id || '');
  const [productPageEditTab, setProductPageEditTab] = useState<'details' | 'suggestions'>('details');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [favorEditTab, setFavorEditTab] = useState<'general' | 'form' | 'slideshow' | 'pillars'>('general');

  // Sync external page view or product ID requests
  useEffect(() => {
    if (initialPageView) {
      setActivePageView(initialPageView);
    }
  }, [initialPageView]);

  useEffect(() => {
    if (initialProductId) {
      setPreviewProductId(initialProductId);
    }
  }, [initialProductId]);

  useEffect(() => {
    if (products && products.length > 0 && (!previewProductId || !products.some(p => p.id === previewProductId))) {
      setPreviewProductId(products[0].id);
    }
  }, [products, previewProductId]);

  // Keep editor content in sync whenever initialContent changes from cloud or cache
  useEffect(() => {
    if (initialContent && activeModal === null) {
      setContent(sanitizeSiteContent(initialContent));
    }
  }, [initialContent, activeModal]);

  // Apply typography & colors to DOM whenever theme changes
  useEffect(() => {
    if (content.theme) {
      applySiteThemeToDOM(content.theme);
    }
  }, [content.theme]);

  const handleAddCategory = () => {
    const trimmed = newCategoryLabel.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const currentCats = content.catalog?.categories || DEFAULT_SITE_CONTENT.catalog.categories || [];
    if (currentCats.some(c => c.id.toLowerCase() === slug.toLowerCase() || c.label.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category or slug already exists!');
      return;
    }
    const updated = [...currentCats, { id: slug, label: trimmed }];
    setContent(prev => ({
      ...prev,
      catalog: { ...prev.catalog, categories: updated }
    }));
    setNewCategoryLabel('');
  };

  // Theme modal
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // File upload input ref for hero image
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle image upload for hero
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          setContent(prev => ({
            ...prev,
            hero: { ...prev.hero, heroImage: webpDataUrl }
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Publish handler
  const handlePublish = async () => {
    setIsSaving(true);
    const ok = await onSave(content);
    setIsSaving(false);
    if (ok) {
      try {
        localStorage.setItem('liora_site_content', JSON.stringify(content));
      } catch {}
      if (content.theme) {
        applySiteThemeToDOM(content.theme);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // Reset handler
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all edits to the default curated content?')) {
      setContent(DEFAULT_SITE_CONTENT);
    }
  };

  // Font options for heading and body
  const FONT_OPTIONS = [
    { id: 'Cormorant Garamond', label: 'Cormorant Garamond (Royal French Serif)' },
    { id: 'Playfair Display', label: 'Playfair Display (High Fashion Editorial)' },
    { id: 'Cinzel', label: 'Cinzel (Neoclassical Luxury Roman)' },
    { id: 'Prata', label: 'Prata (Delicate Boutique Serif)' },
    { id: 'Hind Siliguri', label: 'Hind Siliguri (আধুনিক বাংলা ও ইংরেজি)' },
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Crisp Modern Sans)' },
    { id: 'Inter', label: 'Inter (Clean Minimalist Sans)' },
    { id: 'Outfit', label: 'Outfit (Warm Contemporary Sans)' },
  ];

  if (embedded) {
    return (
      <div className="flex flex-col bg-[#1F1B16] rounded-xl overflow-hidden border border-[#3D3730]">
        {/* Embedded Editor Toolbar */}
        <div className="bg-[#29241E] border-b border-[#3D3730] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8C5E35]" />
            <h2 className="font-serif text-sm text-[#FAF8F5] flex items-center gap-2">
              <span>🎨 Live Website Editor</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#8C5E35]/30 text-[#E5A97A] border border-[#8C5E35]/50">
                Pencil Mode
              </span>
            </h2>
            <p className="text-[11px] text-[#A89E90] hidden md:block">
              — পেন্সিল আইকনে ক্লিক করে সরাসরি যেকোনো টেক্সট, ফন্ট ও রঙ পরিবর্তন করুন
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Page View Switcher (Home Page vs Product Page) */}
            <div className="flex items-center bg-[#1F1B16] p-0.5 rounded border border-[#3D3730]">
              <button
                type="button"
                onClick={() => setActivePageView('home')}
                className={`px-2.5 py-1 text-[11px] rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  activePageView === 'home' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
                }`}
                title="Storefront Home View"
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePageView('product')}
                className={`px-2.5 py-1 text-[11px] rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  activePageView === 'product' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
                }`}
                title="Full Product Detail Page View"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Product</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePageView('checkout')}
                className={`px-2.5 py-1 text-[11px] rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  activePageView === 'checkout' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
                }`}
                title="Checkout Page Preview"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Checkout</span>
              </button>
            </div>

            {/* Product Selector dropdown when in Product Page view */}
            {activePageView === 'product' && products.length > 0 && (
              <div className="flex items-center gap-1 bg-[#1F1B16] px-2 py-0.5 rounded border border-[#3D3730] text-[11px]">
                <span className="text-[#A89E90] hidden md:inline text-[10px]">Product:</span>
                <select
                  value={previewProductId}
                  onChange={(e) => setPreviewProductId(e.target.value)}
                  className="bg-[#29241E] text-[#FAF8F5] text-xs border border-[#4D453C] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#8C5E35] max-w-[140px] sm:max-w-[180px] truncate"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Device switcher */}
            <div className="flex items-center bg-[#1F1B16] p-0.5 rounded border border-[#3D3730]">
              {([
                { v: 'desktop', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Desktop' },
                { v: 'tablet', icon: <Tablet className="w-3.5 h-3.5" />, label: 'Tablet' },
                { v: 'mobile', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Mobile' },
              ] as const).map(({ v, icon, label }) => (
                <button
                  key={v}
                  onClick={() => setDeviceView(v)}
                  className={`px-2 py-1 text-[11px] rounded flex items-center gap-1 transition-colors cursor-pointer ${
                    deviceView === v ? 'bg-[#8C5E35] text-white' : 'text-[#A89E90] hover:text-white'
                  }`}
                  title={label}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Fonts & Colors */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#38322B] hover:bg-[#473F37] text-[#FAF8F5] text-xs rounded flex items-center gap-1.5 cursor-pointer border border-[#4D453C]"
            >
              <Type className="w-3.5 h-3.5 text-[#E5A97A]" />
              <span className="hidden sm:inline">Fonts & Colors</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-[#332E28] hover:bg-rose-950/60 text-[#A89E90] hover:text-rose-200 text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Publish */}
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white text-xs font-semibold rounded flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span>Publishing...</span>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Published Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish to Live Site</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="overflow-y-auto p-3 sm:p-5 flex justify-center bg-[#15120E]" style={{ minHeight: '70vh' }}>
          <div
            className={`transition-all duration-300 bg-[#FAF8F5] text-[#24211D] shadow-2xl rounded-lg overflow-hidden border border-[#3D3730] flex flex-col ${
              deviceView === 'mobile'
                ? 'w-[390px] min-h-[844px] my-4 rounded-3xl border-8 border-[#2E2822]'
                : deviceView === 'tablet'
                ? 'w-[1024px] max-w-full my-4'
                : 'w-full max-w-[1400px]'
            }`}
            style={{
              fontFamily: `'${content.theme.bodyFont || 'Plus Jakarta Sans'}', sans-serif`,
              backgroundColor: content.theme.backgroundColor || '#FAF8F5',
              color: content.theme.primaryColor || '#24211D',
            }}
          >
            {renderPreviewContent()}
          </div>
        </div>

        {renderModals()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1B16] text-[#FAF8F5] flex flex-col">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 bg-[#29241E] border-b border-[#3D3730] px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToAdmin}
            className="px-3 py-1.5 bg-[#38322B] hover:bg-[#473F37] text-white text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5"
          >
            ← Admin Dashboard
          </button>
          <div className="h-4 w-px bg-[#4D453C] hidden sm:block"></div>
          <div>
            <h1 className="font-serif text-base sm:text-lg flex items-center gap-2">
              <span>Visual Live Website Editor</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#8C5E35]/30 text-[#E5A97A] border border-[#8C5E35]/50">
                Pencil Mode
              </span>
            </h1>
            <p className="text-[11px] text-[#A89E90] hidden md:block">
              পেন্সিল আইকনে ক্লিক করে সরাসরি যেকোনো টেক্সট, শিরোনাম, ফন্ট ও রঙ পরিবর্তন করুন
            </p>
          </div>
        </div>

        {/* Center: Page View Switcher & Viewport Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Page View Switcher */}
          <div className="flex items-center bg-[#1F1B16] p-1 rounded-md border border-[#3D3730]">
            <button
              type="button"
              onClick={() => setActivePageView('home')}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activePageView === 'home' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Home Page</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePageView('product')}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activePageView === 'product' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Product Page</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePageView('checkout')}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activePageView === 'checkout' ? 'bg-[#8C5E35] text-white font-medium shadow-xs' : 'text-[#A89E90] hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Checkout Page</span>
            </button>
          </div>

          {/* Product Selector Dropdown */}
          {activePageView === 'product' && products.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#1F1B16] px-2.5 py-1 rounded-md border border-[#3D3730] text-xs">
              <span className="text-[#A89E90] hidden md:inline text-[11px]">Product:</span>
              <select
                value={previewProductId}
                onChange={(e) => setPreviewProductId(e.target.value)}
                className="bg-[#29241E] text-white text-xs border border-[#4D453C] rounded px-2 py-0.5 focus:outline-none focus:border-[#8C5E35] max-w-[160px] sm:max-w-[200px] truncate"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (৳{p.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Viewport Switcher */}
          <div className="flex items-center bg-[#1F1B16] p-1 rounded-md border border-[#3D3730]">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`px-2.5 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'desktop' ? 'bg-[#8C5E35] text-white' : 'text-[#A89E90] hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`px-2.5 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'tablet' ? 'bg-[#8C5E35] text-white' : 'text-[#A89E90] hover:text-white'
              }`}
              title="Tablet View (1024px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`px-2.5 py-1 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'mobile' ? 'bg-[#8C5E35] text-white' : 'text-[#A89E90] hover:text-white'
              }`}
              title="Mobile Screen (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Fonts, Reset & Publish */}
        <div className="flex items-center gap-2">
          {/* Typography & Color Customizer */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-3 py-1.5 bg-[#38322B] hover:bg-[#473F37] text-[#FAF8F5] text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer border border-[#4D453C]"
            title="Customize Fonts & Brand Colors"
          >
            <Type className="w-3.5 h-3.5 text-[#E5A97A]" />
            <span className="hidden sm:inline">Fonts & Colors</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#332E28] hover:bg-rose-950/60 text-[#A89E90] hover:text-rose-200 text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Save & Publish */}
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white text-xs font-semibold rounded flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span>Publishing...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish to Live Site</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Preview Work Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#15120E]">
        <div 
          className={`transition-all duration-300 bg-[#FAF8F5] text-[#24211D] shadow-2xl rounded-lg overflow-hidden border border-[#3D3730] flex flex-col ${
            deviceView === 'mobile' 
              ? 'w-[390px] min-h-[844px] my-4 rounded-3xl border-8 border-[#2E2822]' 
              : deviceView === 'tablet' 
              ? 'w-[1024px] max-w-full my-4' 
              : 'w-full max-w-[1400px]'
          }`}
          style={{
            fontFamily: `'${content.theme.bodyFont || 'Plus Jakarta Sans'}', sans-serif`,
            backgroundColor: content.theme.backgroundColor || '#FAF8F5',
            color: content.theme.primaryColor || '#24211D',
          }}
        >
          {renderPreviewContent()}
        </div>
      </main>

      {renderModals()}
    </div>
  );

  // -------------------------------------------------------------------------
  // PREVIEW CONTENT HELPER
  // -------------------------------------------------------------------------
  function renderPreviewContent() {
    if (activePageView === 'checkout') {
      const demoItems: CartItem[] = products.length > 0 ? [
        {
          product: products[0],
          quantity: 2,
          selectedScent: products[0].scentNotes?.[0] || 'French Vanilla'
        }
      ] : [];

      return (
        <div className="relative bg-[#FAF8F5] min-h-[700px] p-4 sm:p-6">
          <div className="bg-[#24211D] text-white px-4 py-3 border-b border-[#3D3730] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md rounded-2xl mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8C5E35]/30 text-[#E5A97A] border border-[#8C5E35]/50 flex items-center justify-center font-bold text-xs">
                💳
              </div>
              <div>
                <span className="font-semibold text-xs text-white">Live Checkout Page Preview</span>
                <p className="text-[11px] text-[#A89E90]">
                  কাস্টমার চেকআউট পেজের লাইভ ডেমো ও ডিজাইন প্রিভিউ।
                </p>
              </div>
            </div>
          </div>

          <CheckoutPage
            items={demoItems}
            customFavors={[]}
            storeSettings={storeSettings}
            onUpdateQuantity={() => {}}
            onRemoveItem={() => {}}
            onRemoveCustomFavor={() => {}}
            onClearCart={() => {}}
            onOrderPlaced={() => {}}
            onNavigateHome={() => setActivePageView('home')}
            onOpenAuth={() => {}}
          />
        </div>
      );
    }

    if (activePageView === 'product') {
      const selectedProduct = products.find(p => p.id === previewProductId) || products[0];

      if (!selectedProduct) {
        return (
          <div className="p-16 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#8C5E35] mx-auto opacity-50" />
            <h3 className="font-serif text-2xl text-[#24211D]">No Products Available</h3>
            <p className="text-xs text-[#7A6F62]">Please add or import products into your catalog to preview product detail pages.</p>
            {onCreateProduct && (
              <button
                type="button"
                onClick={onCreateProduct}
                className="px-4 py-2 bg-[#24211D] text-white rounded text-xs font-medium cursor-pointer"
              >
                + Add First Product
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="relative bg-[#FAF8F5]">
          {/* Top Sticky Editor Banner for Product Page */}
          <div className="bg-[#24211D] text-white px-4 py-3 border-b border-[#3D3730] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8C5E35]/30 text-[#E5A97A] border border-[#8C5E35]/50 flex items-center justify-center font-bold text-xs">
                🛍️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">Live Product Page Editor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#8C5E35] text-white font-medium">
                    {selectedProduct.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#A89E90]">
                  লাইভ প্রোডাক্ট পেজ প্রিভিউ। তথ্য বা পলিসি পরিবর্তন করতে পাশের বাটনে ক্লিক করুন।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onEditProduct && (
                <button
                  type="button"
                  onClick={() => onEditProduct(selectedProduct)}
                  className="px-3 py-1.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Candle (Price, Photos, Scent)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveModal('product_page')}
                className="px-3 py-1.5 bg-[#38322B] hover:bg-[#473F37] text-white border border-[#4D453C] rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[#E5A97A]" />
                <span>Product Page Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePageView('home')}
                className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#332E28] text-[#D8CEBE] hover:text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>← Back to Home View</span>
              </button>
            </div>
          </div>

          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            pageContent={content.productPage}
            isEditMode={isEditMode}
            onEditProduct={onEditProduct}
            onEditPageSettings={() => setActiveModal('product_page')}
            onBack={() => setActivePageView('home')}
            onSelectProduct={(id) => setPreviewProductId(id)}
          />
        </div>
      );
    }

    return (
      <>
          <div className="bg-[#24211D] text-[#FAF8F5] text-xs py-2 px-4 flex items-center justify-between gap-3 relative group border-b border-[#3D3730]">
            <div className="flex-1 text-center font-medium">
              <span>{storeSettings.announcementText}</span>
            </div>
            {isEditMode && (
              <button
                onClick={() => setActiveModal('announcement')}
                className="p-1 rounded bg-[#8C5E35] hover:bg-[#A36E3F] text-white text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
                title="Edit Announcement Bar"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* Boutique Header */}
          <header className="bg-[#FAF8F5] border-b border-[#EAE0D5] py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl font-normal tracking-tight"
                style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
              >
                House of Líora
              </span>
            </div>
            <div className="text-xs text-[#5A5248] hidden sm:flex items-center gap-4">
              <span>Collections</span>
              <span>Bespoke Favors</span>
              <span>Candle Care</span>
              <span>Reviews</span>
            </div>
          </header>

          {/* 1. Hero Section with Pencils */}
          <section className="relative overflow-hidden bg-[#FAF8F5] border-b border-[#EAE0D5] p-6 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5 relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-4 rounded-lg bg-white/40 transition-all">
                {isEditMode && (
                  <button
                    onClick={() => setActiveModal('hero_text')}
                    className="absolute -top-3 -right-2 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Hero Texts & Story</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#8C5E35] font-semibold">
                  <span className="w-6 h-px bg-[#8C5E35]"></span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#C68B59]" />
                    {content.hero.badge}
                  </span>
                </div>

                <h1 
                  className="text-3xl sm:text-5xl font-normal leading-[1.15] tracking-tight"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  {content.hero.title} <br />
                  <span className="italic font-light text-[#8C5E35]">{content.hero.titleHighlight}</span> for Modern Living
                </h1>

                <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed max-w-xl">
                  {content.hero.subtitle}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button className="px-5 py-2.5 bg-[#24211D] text-white text-xs font-medium rounded flex items-center gap-2">
                    <span>{content.hero.btnPrimary}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-4 py-2.5 bg-white border border-[#D8CEBE] text-[#24211D] text-xs font-medium rounded flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                    <span>{content.hero.btnSecondary}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic Live Product Slideshow Preview */}
              <div className="lg:col-span-5 relative group border-2 border-dashed border-[#8C5E35]/40 hover:border-[#8C5E35] p-2 rounded-2xl transition-all bg-white/30">
                <div className="rounded-xl overflow-hidden border border-[#EAE0D5] relative aspect-4/3 bg-[#EAE0D5]">
                  <img
                    src={products[0]?.image || content.hero.heroImage || '/images/hero_artisan_candles_1790333552254.jpg'}
                    alt="Hero Dynamic Slideshow Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Dynamic Product Indicator Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs drop-shadow-md">
                    <span className="font-serif italic text-sm truncate max-w-[70%] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {products[0]?.name || 'Live Catalog Piece'} · ৳{products[0]?.price || 320}
                    </span>
                    <span className="bg-[#8C5E35] text-white px-2.5 py-1 rounded-full text-[10px] font-medium shadow-xs">
                      View Piece →
                    </span>
                  </div>

                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-sans flex items-center gap-1.5 border border-white/20">
                    <Sparkles className="w-3 h-3 text-[#E5A97A]" />
                    <span>Auto-Slideshow ({products.length} Products)</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Hero Bottom Trust Ribbon Bar with Edit Button */}
          <div className="relative group border-b border-[#EAE0D5] bg-[#FAF8F5] py-3.5 px-4 text-xs text-[#5A5248]">
            {isEditMode && (
              <button
                onClick={() => setActiveModal('hero_text')}
                className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit 4 Trust Ribbon Points</span>
              </button>
            )}
            <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-around gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
              <div className="flex items-center gap-2 shrink-0">
                <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">{content.hero.ribbonItem1 || '100% Natural Botanical Soy Wax'}</span>
              </div>
              <span className="text-[#D8CEBE] shrink-0">·</span>
              <div className="flex items-center gap-2 shrink-0">
                <Truck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">{content.hero.ribbonItem2 || 'Doorstep Courier (Dhaka ৳70, Outside ৳130)'}</span>
              </div>
              <span className="text-[#D8CEBE] shrink-0">·</span>
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">{content.hero.ribbonItem3 || 'Bespoke Gifting & Custom Event Favors'}</span>
              </div>
              <span className="text-[#D8CEBE] shrink-0">·</span>
              <div className="flex items-center gap-2 shrink-0">
                <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">{content.hero.ribbonItem4 || 'Cash on Delivery & Verified bKash'}</span>
              </div>
            </div>
          </div>

          {/* 2. Catalog Section Header with Direct Product Management */}
          <section className="p-6 sm:p-12 border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-4 rounded-lg bg-white/40 transition-all flex flex-col md:flex-row md:items-end justify-between gap-4">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('catalog')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Catalog Header Texts</span>
                </button>
              )}

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  {content.catalog.badge}
                </span>
                <h2 
                  className="text-2xl sm:text-3xl text-[#24211D]"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  {content.catalog.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#5A5248] max-w-xl">
                  {content.catalog.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                {onCreateProduct && (
                  <button
                    onClick={onCreateProduct}
                    className="px-4 py-2 bg-[#24211D] hover:bg-[#8C5E35] text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>Add New Candle Product</span>
                  </button>
                )}
                
              </div>
            </div>

            {/* Category Filter Tabs & Add Button */}
            {content.catalog.showFilter === false ? (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span className="italic">⚠️ Filter Section is currently HIDDEN on live storefront (Click 'Edit Catalog Header' to enable).</span>
                <button
                  onClick={() => setActiveModal('catalog')}
                  className="text-xs text-[#8C5E35] underline font-medium cursor-pointer"
                >
                  Configure Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(content.catalog.categories || DEFAULT_SITE_CONTENT.catalog.categories || []).map(cat => {
                    const count = cat.id === 'all' 
                      ? products.length 
                      : products.filter(p => {
                          const pCat = (p.category || '').toLowerCase();
                          const cId = cat.id.toLowerCase();
                          const cLabel = cat.label.toLowerCase();
                          return pCat === cId || pCat === cLabel || (pCat && cLabel.includes(pCat));
                        }).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-[#24211D] text-white border-[#24211D] font-medium shadow-xs'
                            : 'bg-white text-[#5A5248] border-[#D8CEBE] hover:border-[#8C5E35]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {onCreateProduct && (
                  <button
                    onClick={onCreateProduct}
                    className="px-3 py-1.5 text-xs bg-[#8C5E35] hover:bg-[#24211D] text-white rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Product</span>
                  </button>
                )}
              </div>
            )}

            {/* Products Grid with full live cards and direct editing */}
            {(() => {
              const currentCat = (content.catalog.categories || []).find(c => c.id === selectedCategory);
              const filtered = selectedCategory === 'all' 
                ? products 
                : products.filter(p => {
                    const pCat = (p.category || '').toLowerCase();
                    const cId = selectedCategory.toLowerCase();
                    const cLabel = (currentCat?.label || '').toLowerCase();
                    return pCat === cId || pCat === cLabel || (pCat && cLabel.includes(pCat));
                  });
              if (filtered.length === 0) {
                return (
                  <div className="p-8 text-center bg-white rounded-lg border border-[#EAE0D5] space-y-3">
                    <p className="text-xs text-[#7A6F62]">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট নেই।</p>
                    {onCreateProduct && (
                      <button
                        onClick={onCreateProduct}
                        className="px-4 py-2 bg-[#24211D] text-white rounded text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#D4AF37]" />
                        <span>নতুন ক্যান্ডেল যুক্ত করুন</span>
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(p => (
                    <div
                      key={p.id}
                      className="group/card bg-white rounded-lg border border-[#EAE0D5] overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-[#D8CEBE] transition-all relative"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-square overflow-hidden bg-[#FAF8F5]">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          onError={(e) => { const t = e.target as HTMLElement; t.style.display = 'none'; }}
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {p.inStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-600 text-white shadow-xs">
                              Sold Out
                            </span>
                          )}
                          {p.isBestseller && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37] text-[#24211D] shadow-xs">
                              Bestseller
                            </span>
                          )}
                        </div>

                        {/* Direct Card Action Buttons for Live Editor */}
                        {isEditMode && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                            <button
                              onClick={() => {
                                setPreviewProductId(p.id);
                                setActivePageView('product');
                              }}
                              className="p-1.5 bg-[#8C5E35]/90 hover:bg-[#8C5E35] text-white rounded-full shadow-md backdrop-blur-xs cursor-pointer transition-colors"
                              title="Open & Edit Full Product Detail Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {onEditProduct && (
                              <button
                                onClick={() => onEditProduct(p)}
                                className="p-1.5 bg-[#24211D]/80 hover:bg-[#24211D] text-white rounded-full shadow-md backdrop-blur-xs cursor-pointer transition-colors"
                                title="Edit Product Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteProduct && (
                              <button
                                onClick={() => onDeleteProduct(p)}
                                className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-full shadow-md backdrop-blur-xs cursor-pointer transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#8C5E35]">
                            <span className="uppercase tracking-wider font-semibold capitalize">{p.category}</span>
                            <span>{p.scentFamily}</span>
                          </div>
                          <h4 className="font-serif text-base text-[#24211D] font-medium leading-snug truncate">
                            {p.name}
                          </h4>
                          {p.scentNotes && p.scentNotes.length > 0 && (
                            <p className="text-[11px] text-[#7A6F62] truncate">
                              {p.scentNotes.join(' · ')}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#EAE0D5] flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-base font-semibold text-[#24211D]">
                              ৳{p.price}
                            </span>
                            {p.originalPrice && (
                              <span className="font-mono text-xs text-[#9E9282] line-through">
                                ৳{p.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Stock toggle, edit trigger and full page view */}
                          {isEditMode && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewProductId(p.id);
                                  setActivePageView('product');
                                }}
                                className="px-2 py-0.5 text-[10px] bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded font-medium cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                                title="Preview & Edit Full Product Page"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Page</span>
                              </button>
                              {onToggleStock && (
                                <button
                                  onClick={() => onToggleStock(p)}
                                  className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer font-medium transition-colors ${
                                    p.inStock
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                                  }`}
                                >
                                  {p.inStock ? 'Stock On' : 'Stock Off'}
                                </button>
                              )}
                              {onEditProduct && (
                                <button
                                  onClick={() => onEditProduct(p)}
                                  className="px-2 py-0.5 text-[10px] bg-[#FAF8F5] hover:bg-[#EAE0D5] border border-[#D8CEBE] rounded text-[#24211D] font-medium cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>

          {/* 3. Bespoke Concierge Section with Live Preview & Direct Editor */}
          <CustomFavorBuilder
            facebookUrl={storeSettings.facebookUrl}
            supportPhone={storeSettings.supportPhone}
            content={content.favors}
            isEditMode={isEditMode}
            onEdit={() => {
              setActiveModal('favors');
            }}
            products={products}
            onSelectProduct={(id) => {
              setPreviewProductId(id);
              setActivePageView('product');
            }}
          />

          {/* 4. Candle Care Ritual with Pencil */}
          <section className="p-6 sm:p-12 bg-[#FAF8F5] border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-6 rounded-lg bg-white/40 transition-all">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('care')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit 4 Care Rules</span>
                </button>
              )}

              <div className="text-center space-y-1 mb-8">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
                  {content.care.badge}
                </span>
                <h2 
                  className="text-2xl sm:text-3xl text-[#24211D]"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  {content.care.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#5A5248] max-w-md mx-auto">
                  {content.care.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded border border-[#EAE0D5] space-y-1">
                  <h4 className="font-semibold text-xs text-[#24211D]">{content.care.step1Title}</h4>
                  <p className="text-[11px] text-[#5A5248] leading-relaxed">{content.care.step1Desc}</p>
                </div>
                <div className="p-4 bg-white rounded border border-[#EAE0D5] space-y-1">
                  <h4 className="font-semibold text-xs text-[#24211D]">{content.care.step2Title}</h4>
                  <p className="text-[11px] text-[#5A5248] leading-relaxed">{content.care.step2Desc}</p>
                </div>
                <div className="p-4 bg-white rounded border border-[#EAE0D5] space-y-1">
                  <h4 className="font-semibold text-xs text-[#24211D]">{content.care.step3Title}</h4>
                  <p className="text-[11px] text-[#5A5248] leading-relaxed">{content.care.step3Desc}</p>
                </div>
                <div className="p-4 bg-white rounded border border-[#EAE0D5] space-y-1">
                  <h4 className="font-semibold text-xs text-[#24211D]">{content.care.step4Title}</h4>
                  <p className="text-[11px] text-[#5A5248] leading-relaxed">{content.care.step4Desc}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Customer Reviews with Pencil */}
          <section className="p-6 sm:p-12 bg-[#F5F1EB] border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-6 rounded-lg bg-white/40 transition-all">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('reviews')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Reviews</span>
                </button>
              )}

              <div className="text-center space-y-1 mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center justify-center gap-1.5">
                  <MessageSquareQuote className="w-4 h-4" />
                  {content.reviews.badge}
                </span>
                <h2 
                  className="text-2xl sm:text-3xl text-[#24211D]"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  {content.reviews.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(content.reviews?.items || []).map((r, i) => (
                  <div key={i} className="p-4 bg-white rounded border border-[#EAE0D5] space-y-2">
                    <div className="flex gap-0.5 text-[#C68B59]">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[#5A5248] italic">"{r.comment}"</p>
                    <div className="pt-2 border-t border-[#EAE0D5] text-[11px]">
                      <p className="font-semibold text-[#24211D]">{r.name}</p>
                      <p className="text-[#7A6F62]">{r.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. FAQ Section with Pencil */}
          <section className="p-6 sm:p-12 bg-white border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-6 rounded-lg bg-white/40 transition-all max-w-3xl mx-auto">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('faq')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit FAQs</span>
                </button>
              )}

              <div className="text-center space-y-1 mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
                  {content.faq.badge}
                </span>
                <h3 
                  className="text-2xl text-[#24211D]"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  {content.faq.title}
                </h3>
                {content.faq.subtitle && (
                  <p className="text-xs text-[#5A5248]">{content.faq.subtitle}</p>
                )}
              </div>

              <div className="space-y-2">
                {(content.faq?.items || []).map((f, i) => (
                  <div key={i} className="p-3 bg-[#FAF8F5] rounded border border-[#EAE0D5] text-xs">
                    <p className="font-semibold text-[#24211D] mb-1">{f.q}</p>
                    <p className="text-[#5A5248]">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Footer Section with Pencil */}
          <footer className="p-8 bg-[#24211D] text-[#FAF8F5] relative group border-t-4 border-amber-600/30">
            {isEditMode && (
              <button
                onClick={() => setActiveModal('footer')}
                className="absolute top-4 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-black text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Footer Texts</span>
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <span 
                  className="text-xl"
                  style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                >
                  House of Líora
                </span>
                <p className="text-xs text-[#A89E90] leading-relaxed max-w-sm">
                  {content.footer.brandTagline}
                </p>
              </div>
              <div className="space-y-1 text-xs text-[#A89E90]">
                <p className="text-[#C68B59] font-semibold uppercase tracking-wider mb-2">Boutique Policies</p>
                <p>{content.footer.deliveryPolicy}</p>
                <p>{content.footer.paymentPolicy}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#3D3730] text-center text-xs text-[#877E71]">
              <p>© {new Date().getFullYear()} {content.footer.copyright}</p>
            </div>
          </footer>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // MODALS HELPER
  // -------------------------------------------------------------------------
  function renderModals() {
    return (
      <>
      {/* MODAL 1: Hero Texts Editor */}
      {activeModal === 'hero_text' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Hero Title, Story & CTAs</span>
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Small Badge Label:</label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={e => setContent({
                    ...content,
                    hero: { ...content.hero, badge: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs focus:ring-1 focus:ring-[#8C5E35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Main Headline Part 1:</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, title: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Highlighted Keyword (Italic):</label>
                  <input
                    type="text"
                    value={content.hero.titleHighlight}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, titleHighlight: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Hero Subtitle Story:</label>
                <textarea
                  rows={3}
                  value={content.hero.subtitle}
                  onChange={e => setContent({
                    ...content,
                    hero: { ...content.hero, subtitle: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Primary CTA Button Label:</label>
                  <input
                    type="text"
                    value={content.hero.btnPrimary}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, btnPrimary: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Secondary CTA Button Label:</label>
                  <input
                    type="text"
                    value={content.hero.btnSecondary}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, btnSecondary: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Slideshow Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                  <span>লাইভ প্রোডাক্ট স্লাইডশো সিস্টেম:</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  হিরো সেকশনের ফটোটি এখন স্বয়ংক্রিয়ভাবে আপনার ক্যাটালগের সব প্রোডাক্টের ছবি একটার পর একটা স্লাইডশো আকারে প্রদর্শন করে। কোনো ভিজিটর ছবিতে ক্লিক করলেই সরাসরি সেই নির্দিষ্ট প্রোডাক্টের পেজে নিয়ে যায়।
                </p>
              </div>

              {/* Trust Ribbon (Image 3 bar under hero) */}
              <div className="pt-3 border-t border-[#EAE0D5] space-y-2">
                <div>
                  <h4 className="font-semibold text-[#8C5E35] text-xs">
                    Hero Bottom Trust Ribbon / ৪টি সুবিধা ও পলিসির পয়েন্ট:
                  </h4>
                  <p className="text-[11px] text-[#7A6F62]">
                    হিরো সেকশনের ঠিক নিচে থাকা ৪টি সুবিধার টেক্সট এখান থেকে পরিবর্তন করুন:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-[#5A5248] font-medium block mb-1">Point 1 (Flame Icon):</label>
                    <input
                      type="text"
                      value={content.hero.ribbonItem1 ?? '100% Natural Botanical Soy Wax'}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ribbonItem1: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                      placeholder="100% Natural Botanical Soy Wax"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#5A5248] font-medium block mb-1">Point 2 (Courier Icon):</label>
                    <input
                      type="text"
                      value={content.hero.ribbonItem2 ?? 'Doorstep Courier (Dhaka ৳70, Outside ৳130)'}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ribbonItem2: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                      placeholder="Doorstep Courier (Dhaka ৳70, Outside ৳130)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#5A5248] font-medium block mb-1">Point 3 (Sparkles Icon):</label>
                    <input
                      type="text"
                      value={content.hero.ribbonItem3 ?? 'Bespoke Gifting & Custom Event Favors'}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ribbonItem3: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                      placeholder="Bespoke Gifting & Custom Event Favors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#5A5248] font-medium block mb-1">Point 4 (Shield Icon):</label>
                    <input
                      type="text"
                      value={content.hero.ribbonItem4 ?? 'Cash on Delivery & Verified bKash'}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ribbonItem4: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                      placeholder="Cash on Delivery & Verified bKash"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Catalog Header & Dynamic Categories Editor */}
      {activeModal === 'catalog' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-[#D8CEBE] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2 text-[#24211D]">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Catalog Section & Category Filter Control</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            {/* Part A: Master Toggle for Filter Section */}
            <div className="p-3.5 bg-white rounded-xl border border-[#D8CEBE] shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-semibold text-xs text-[#24211D] block">
                  Show Filter Section on Live Website
                </span>
                <p className="text-[11px] text-[#7A6F62] leading-tight">
                  ফিল্টার সেকশন অন বা অফ রাখুন। অফ করলে ওয়েবসাইটে ফিল্টার বারটি হাইড হয়ে যাবে।
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={content.catalog.showFilter !== false}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, showFilter: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C5E35]"></div>
              </label>
            </div>

            {/* Part B: Dynamic Categories Management */}
            <div className="p-4 bg-white rounded-xl border border-[#D8CEBE] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#F0EBE3]">
                <div>
                  <h4 className="font-semibold text-xs text-[#24211D]">
                    Dynamic Store Categories
                  </h4>
                  <p className="text-[10px] text-[#7A6F62]">
                    আপনার ইচ্ছামতো ক্যাটাগরি তৈরি, রিনেম বা রিমুভ করুন (যেমন: Candles, Flower Vase, Gift Sets)
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#FAF8F5] border border-[#D8CEBE] rounded-full text-[#8C5E35]">
                  {(content.catalog.categories || DEFAULT_SITE_CONTENT.catalog.categories || []).length} Categories
                </span>
              </div>

              {/* Categories List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(content.catalog.categories || DEFAULT_SITE_CONTENT.catalog.categories || []).map((cat, idx) => {
                  const currentList = content.catalog.categories || DEFAULT_SITE_CONTENT.catalog.categories || [];
                  return (
                    <div key={cat.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] text-[#7A6F62] uppercase tracking-wider block font-semibold">
                          Category Label:
                        </label>
                        <input
                          type="text"
                          value={cat.label}
                          onChange={e => {
                            const updated = [...currentList];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setContent({
                              ...content,
                              catalog: { ...content.catalog, categories: updated }
                            });
                          }}
                          className="w-full px-2.5 py-1 bg-white border border-[#D8CEBE] rounded text-xs text-[#24211D] font-medium"
                          placeholder="Category Title"
                        />
                        <span className="text-[10px] text-[#A89E90] font-mono">
                          ID: <span className="font-semibold">{cat.id}</span>
                        </span>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 pt-3">
                        {cat.id !== 'all' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentList.filter(c => c.id !== cat.id);
                              setContent({
                                ...content,
                                catalog: { ...content.catalog, categories: updated }
                              });
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Remove Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#8C5E35] font-serif italic px-2 bg-amber-50 rounded border border-amber-200">
                            Default (All Items)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Category Form */}
              <div className="pt-2 border-t border-[#F0EBE3] flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryLabel}
                  onChange={e => setNewCategoryLabel(e.target.value)}
                  placeholder="New Category (e.g. Flower Vase, Luxe Jars)"
                  className="flex-1 p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded-lg text-xs text-[#24211D]"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryLabel.trim()}
                  className="px-4 py-2 bg-[#8C5E35] hover:bg-[#24211D] text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Part C: Section Titles & Descriptions */}
            <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-[#D8CEBE] shadow-xs">
              <h4 className="font-semibold text-xs text-[#24211D] pb-1 border-b border-[#F0EBE3]">
                Section Titles & Descriptions
              </h4>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Badge Tagline:</label>
                <input
                  type="text"
                  value={content.catalog.badge}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, badge: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D8CEBE] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Section Main Title:</label>
                <input
                  type="text"
                  value={content.catalog.title}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, title: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D8CEBE] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Section Description:</label>
                <textarea
                  rows={2}
                  value={content.catalog.subtitle}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, subtitle: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D8CEBE] rounded-lg text-xs"
                />
              </div>
              
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-[#24211D] text-white text-xs font-semibold rounded-lg hover:bg-[#3D3730] cursor-pointer shadow-sm"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bespoke Custom Orders & Concierge Editor */}
      {activeModal === 'favors' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#D8CEBE] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold flex items-center gap-2 text-[#24211D]">
                  <HeartHandshake className="w-5 h-5 text-[#8C5E35]" />
                  <span>Custom Orders & Concierge Studio</span>
                </h3>
                <p className="text-xs text-[#7A6F62] mt-0.5">
                  কাস্টম অর্ডার সেকশনের টাইটেল, হোয়াটসঅ্যাপ ডিরেক্ট বাটন, ইনকোয়ারি ফর্ম এবং ৩টি ক্রাফট পিলার সম্পূর্ণ এডিট করুন।
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-[#EAE0D5] rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-[#EAE0D5] bg-white px-4 py-2 gap-2 scrollbar-thin">
              {[
                { id: 'general', label: '📝 শিরোনাম ও হোয়াটসঅ্যাপ (Titles & WhatsApp)' },
                { id: 'form', label: '📋 ইনকোয়ারি ফর্ম (Inquiry Form)' },
                { id: 'slideshow', label: '🖼️ প্রোডাক্ট স্লাইডশো (Product Slideshow)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFavorEditTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    favorEditTab === tab.id
                      ? 'bg-[#24211D] text-white shadow-xs'
                      : 'text-[#5A5248] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* TAB 1: General Headlines & WhatsApp CTA */}
              {favorEditTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Badge Tagline (উপরে গোল্ডেন ব্যাজ):</label>
                    <input
                      type="text"
                      value={content.favors.badge || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, badge: e.target.value }
                      })}
                      placeholder="e.g. Artisanal Bespoke Concierge"
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Section Main Title (মূল শিরোনাম):</label>
                    <input
                      type="text"
                      value={content.favors.title || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, title: e.target.value }
                      })}
                      placeholder="e.g. Custom & Bulk Orders Inquiry"
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-serif text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Section Subtitle / Description (বিবরণ):</label>
                    <textarea
                      rows={3}
                      value={content.favors.subtitle || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, subtitle: e.target.value }
                      })}
                      placeholder="Enter section description..."
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#EAE0D5] space-y-3">
                    <span className="font-semibold text-xs text-[#8C5E35] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#8C5E35]" />
                      <span>WhatsApp Direct Concierge Button Configuration:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#24211D] block mb-1">WhatsApp Button Text (বাটন টেক্সট):</label>
                        <input
                          type="text"
                          value={content.favors.consultationBtn || ''}
                          onChange={e => setContent({
                            ...content,
                            favors: { ...content.favors, consultationBtn: e.target.value }
                          })}
                          placeholder="e.g. Chat with Atelier on WhatsApp"
                          className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#24211D] block mb-1">WhatsApp Phone Number (হোয়াটসঅ্যাপ নম্বর):</label>
                        <input
                          type="text"
                          value={content.favors.whatsappNumber || ''}
                          onChange={e => setContent({
                            ...content,
                            favors: { ...content.favors, whatsappNumber: e.target.value }
                          })}
                          placeholder="e.g. 01700000000"
                          className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Pre-filled WhatsApp Message (কাস্টমার বাটনে ক্লিক করলে যে মেসেজ তৈরি হবে):</label>
                      <input
                        type="text"
                        value={content.favors.whatsappMessage || ''}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, whatsappMessage: e.target.value }
                        })}
                        placeholder="e.g. Hello House of Líora, I would like to inquire about a custom order."
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Inquiry Form Settings */}
              {favorEditTab === 'form' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                    <p className="font-semibold flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>সরাসরি ইনকোয়ারি ফর্ম ও অটো সেভিং:</span>
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      কাস্টমাররা নাম, ফোন নম্বর, ইমেইল এবং বিস্তারিত লিখে মেসেজ সেন্ড করতে পারবেন। সাবমিট করার পর স্বয়ংক্রিয়ভাবে নিশ্চিতকরণ দেখাবে এবং চাইলে সাথে সাথে মেসেজটি এক ক্লিকে হোয়াটসঅ্যাপে ফরোয়ার্ড করার অপশনও পাবে।
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Inquiry Form Title (ফর্মের শিরোনাম):</label>
                    <input
                      type="text"
                      value={content.favors.formTitle || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, formTitle: e.target.value }
                      })}
                      placeholder="e.g. Send a Custom Inquiry"
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-serif text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Inquiry Form Subtitle (ফর্মের সাবটাইটেল/নির্দেশনা):</label>
                    <textarea
                      rows={3}
                      value={content.favors.formSubtitle || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, formSubtitle: e.target.value }
                      })}
                      placeholder="e.g. Leave your details & custom requirements below. Our lead artisan will review your vision and connect back promptly."
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Product Slideshow Showcase */}
              {(favorEditTab === 'slideshow' || favorEditTab === 'pillars') && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-[#24211D]">
                    <span className="font-semibold text-xs text-[#8C5E35] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#8C5E35]" />
                      <span>অটোমেটিক প্রোডাক্ট ফটোকার্ড স্লাইডশো:</span>
                    </span>
                    <p className="text-xs text-[#5A5248] leading-relaxed">
                      হিরো সেকশনের মতো এই সেকশনের বাম পাশেও আপনার ওয়েবসাইটে বিদ্যমান সকল প্রোডাক্টের মূল ছবি, নাম এবং মূল্য নিয়ে একটি প্রিমিয়াম অটো-স্লাইডশো চলবে।
                    </p>
                    <ul className="text-xs text-[#5A5248] space-y-1 list-disc pl-4">
                      <li>ক্যাটালগে নতুন প্রোডাক্ট যোগ করলে বা ছবি পরিবর্তন করলে এখানেও তা অটোমেটিক আপডেট হয়ে যাবে।</li>
                      <li>ভিজিটররা যেকোনো প্রোডাক্ট কার্ডে ক্লিক করলে সরাসরি সংশ্লিষ্ট প্রোডাক্টের বিস্তারিত পেজ ওপেন হবে।</li>
                      <li>বর্তমানে ক্যাটালগে <strong>{products.length}টি</strong> প্রোডাক্ট সক্রিয় রয়েছে।</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F5F1EB] border-t border-[#EAE0D5] flex items-center justify-between">
              <span className="text-[11px] text-[#7A6F62]">
                এডিট করার পর "Apply to Preview" বাটনে ক্লিক করে প্রিভিউতে দেখুন।
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-[#24211D] text-white text-xs font-medium rounded hover:bg-[#3D3730] cursor-pointer"
                >
                  Apply to Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL 4: Candle Care Ritual Editor */}
      {activeModal === 'care' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit 4 Candle Care Ritual Steps</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Care Section Title:</label>
                  <input
                    type="text"
                    value={content.care.title}
                    onChange={e => setContent({
                      ...content,
                      care: { ...content.care, title: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Badge:</label>
                  <input
                    type="text"
                    value={content.care.badge}
                    onChange={e => setContent({
                      ...content,
                      care: { ...content.care, badge: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Care Section Subtitle / বিবরণ:</label>
                <textarea
                  rows={2}
                  value={content.care.subtitle || ''}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, subtitle: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  placeholder="Pure botanical soy wax is alive with natural plant characteristics. Follow these simple rituals for a clean, prolonged, and soot-free burn."
                />
              </div>

              {/* Step 1 */}
              <div className="p-3 bg-white rounded border border-[#EAE0D5] space-y-2">
                <label className="font-semibold text-[#8C5E35] block">Rule 1:</label>
                <input
                  type="text"
                  value={content.care.step1Title}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step1Title: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
                <textarea
                  rows={2}
                  value={content.care.step1Desc}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step1Desc: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-white rounded border border-[#EAE0D5] space-y-2">
                <label className="font-semibold text-[#8C5E35] block">Rule 2:</label>
                <input
                  type="text"
                  value={content.care.step2Title}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step2Title: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
                <textarea
                  rows={2}
                  value={content.care.step2Desc}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step2Desc: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-white rounded border border-[#EAE0D5] space-y-2">
                <label className="font-semibold text-[#8C5E35] block">Rule 3:</label>
                <input
                  type="text"
                  value={content.care.step3Title}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step3Title: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
                <textarea
                  rows={2}
                  value={content.care.step3Desc}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step3Desc: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-white rounded border border-[#EAE0D5] space-y-2">
                <label className="font-semibold text-[#8C5E35] block">Rule 4:</label>
                <input
                  type="text"
                  value={content.care.step4Title}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step4Title: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
                <textarea
                  rows={2}
                  value={content.care.step4Desc}
                  onChange={e => setContent({
                    ...content,
                    care: { ...content.care, step4Desc: e.target.value }
                  })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Customer Reviews Editor */}
      {activeModal === 'reviews' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Patron Reviews & Testimonials</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Section Title:</label>
                  <input
                    type="text"
                    value={content.reviews.title}
                    onChange={e => setContent({
                      ...content,
                      reviews: { ...content.reviews, title: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Badge Tagline:</label>
                  <input
                    type="text"
                    value={content.reviews.badge}
                    onChange={e => setContent({
                      ...content,
                      reviews: { ...content.reviews, badge: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              </div>

              {(content.reviews?.items || []).map((rev, idx) => (
                <div key={idx} className="p-4 bg-white rounded border border-[#EAE0D5] space-y-2 relative">
                  <span className="font-semibold text-[#8C5E35] text-xs">Review #{idx + 1}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={rev.name}
                      onChange={e => {
                        const updated = [...content.reviews.items];
                        updated[idx].name = e.target.value;
                        setContent({ ...content, reviews: { ...content.reviews, items: updated } });
                      }}
                      className="p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={rev.location}
                      onChange={e => {
                        const updated = [...content.reviews.items];
                        updated[idx].location = e.target.value;
                        setContent({ ...content, reviews: { ...content.reviews, items: updated } });
                      }}
                      className="p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Review Comment"
                    value={rev.comment}
                    onChange={e => {
                      const updated = [...content.reviews.items];
                      updated[idx].comment = e.target.value;
                      setContent({ ...content, reviews: { ...content.reviews, items: updated } });
                    }}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: FAQs Editor */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Frequently Asked Questions</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Section Title:</label>
                  <input
                    type="text"
                    value={content.faq.title}
                    onChange={e => setContent({
                      ...content,
                      faq: { ...content.faq, title: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#5A5248] block mb-1">Badge Tagline:</label>
                  <input
                    type="text"
                    value={content.faq.badge}
                    onChange={e => setContent({
                      ...content,
                      faq: { ...content.faq, badge: e.target.value }
                    })}
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              </div>

              {(content.faq?.items || []).map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded border border-[#EAE0D5] space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#8C5E35] text-xs">FAQ Question #{idx + 1}</span>
                    {content.faq.items.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = content.faq.items.filter((_, i) => i !== idx);
                          setContent({ ...content, faq: { ...content.faq, items: updated } });
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Question"
                    value={item.q}
                    onChange={e => {
                      const updated = [...content.faq.items];
                      updated[idx].q = e.target.value;
                      setContent({ ...content, faq: { ...content.faq, items: updated } });
                    }}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    value={item.a}
                    onChange={e => {
                      const updated = [...content.faq.items];
                      updated[idx].a = e.target.value;
                      setContent({ ...content, faq: { ...content.faq, items: updated } });
                    }}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
              ))}

              <button
                onClick={() => {
                  const updated = [...content.faq.items, { q: 'New Question?', a: 'Answer here...' }];
                  setContent({ ...content, faq: { ...content.faq, items: updated } });
                }}
                className="w-full py-2 bg-[#EAE0D5] hover:bg-[#D8CEBE] text-[#24211D] text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another FAQ Question</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Footer Editor */}
      {activeModal === 'footer' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Footer Texts & Policies</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Brand Tagline Description:</label>
                <textarea
                  rows={3}
                  value={content.footer.brandTagline}
                  onChange={e => setContent({
                    ...content,
                    footer: { ...content.footer, brandTagline: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Delivery Policy Line:</label>
                <input
                  type="text"
                  value={content.footer.deliveryPolicy}
                  onChange={e => setContent({
                    ...content,
                    footer: { ...content.footer, deliveryPolicy: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Payment Policy Line:</label>
                <input
                  type="text"
                  value={content.footer.paymentPolicy}
                  onChange={e => setContent({
                    ...content,
                    footer: { ...content.footer, paymentPolicy: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Copyright Line:</label>
                <input
                  type="text"
                  value={content.footer.copyright}
                  onChange={e => setContent({
                    ...content,
                    footer: { ...content.footer, copyright: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THEME & FONTS MODAL */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Type className="w-4 h-4 text-[#8C5E35]" />
                <span>Brand Fonts & Color Palette</span>
              </h3>
              <button onClick={() => setIsThemeModalOpen(false)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Heading Font */}
              <div>
                <label className="font-semibold text-[#24211D] block mb-1.5">
                  👑 Heading Font Style (শিরোনাম ফন্ট):
                </label>
                <select
                  value={content.theme.headingFont}
                  onChange={e => setContent({
                    ...content,
                    theme: { ...content.theme, headingFont: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs text-[#24211D] font-medium"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#7A6F62] italic" style={{ fontFamily: `'${content.theme.headingFont}', serif` }}>
                  Preview: House of Líora — Elegance Illuminated in Pure Botanical Wax
                </p>
              </div>

              {/* Body Font */}
              <div>
                <label className="font-semibold text-[#24211D] block mb-1.5">
                  📄 Body Font Style (বর্ণনা ফন্ট):
                </label>
                <select
                  value={content.theme.bodyFont}
                  onChange={e => setContent({
                    ...content,
                    theme: { ...content.theme, bodyFont: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs text-[#24211D] font-medium"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#7A6F62]" style={{ fontFamily: `'${content.theme.bodyFont}', sans-serif` }}>
                  Preview: Handcrafted with 100% pure botanical soy wax and phthalate-free aromas.
                </p>
              </div>

              {/* Colors */}
              <div className="pt-2 border-t border-[#EAE0D5] space-y-3">
                <label className="font-semibold text-[#24211D] block">
                  🎨 Brand Color Palette (ব্র্যান্ডের মূল রঙ):
                </label>
                
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#5A5248]">Primary Dark:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.theme.primaryColor}
                      onChange={e => setContent({
                        ...content,
                        theme: { ...content.theme, primaryColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-[#D8CEBE] cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{content.theme.primaryColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#5A5248]">Gold / Bronze Accent:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.theme.accentColor}
                      onChange={e => setContent({
                        ...content,
                        theme: { ...content.theme, accentColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-[#D8CEBE] cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{content.theme.accentColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#5A5248]">Background Tint:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.theme.backgroundColor}
                      onChange={e => setContent({
                        ...content,
                        theme: { ...content.theme, backgroundColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-[#D8CEBE] cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{content.theme.backgroundColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="px-4 py-2 bg-[#24211D] text-white text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                Apply Style to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT PAGE TEMPLATE & GUARANTEES MODAL */}
      {activeModal === 'product_page' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-[#24211D] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#8C5E35]" />
                  <span>Product Detail Page Settings</span>
                </h3>
                <p className="text-xs text-[#7A6F62]">
                  প্রোডাক্ট পেজের 'Product Details' সেকশন শিরোনাম এবং পেয়ারিংস / সাজেশন্স টেক্সট এডিট করুন।
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs inside modal */}
            <div className="flex border-b border-[#EAE0D5] bg-white px-4 pt-2 gap-2 overflow-x-auto">
              {[
                { id: 'details', label: '1. Product Details Section' },
                { id: 'suggestions', label: '2. Pairings & Suggestions' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProductPageEditTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    productPageEditTab === tab.id
                      ? 'border-[#8C5E35] text-[#8C5E35] font-semibold'
                      : 'border-transparent text-[#7A6F62] hover:text-[#24211D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Tab 1: Product Details Section */}
              {productPageEditTab === 'details' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-medium text-[#24211D] block">
                      Product Details Section Heading:
                    </label>
                    <input
                      type="text"
                      value={content.productPage?.detailsHeading || 'Product Details'}
                      onChange={e => setContent({
                        ...content,
                        productPage: {
                          ...(content.productPage || DEFAULT_PRODUCT_PAGE_CONTENT),
                          detailsHeading: e.target.value
                        }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs focus:outline-none focus:border-[#8C5E35]"
                      placeholder="Product Details"
                    />
                    <p className="text-[11px] text-[#7A6F62]">
                      ক্যান্ডেল পেজের নিচের ডিটেইলস সেকশনের মূল শিরোনাম (ডিফল্ট: Product Details)।
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Suggestions Rail */}
              {productPageEditTab === 'suggestions' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-[#24211D] block mb-1">Related Section Heading:</label>
                    <input
                      type="text"
                      value={content.productPage?.relatedHeading || ''}
                      onChange={e => setContent({
                        ...content,
                        productPage: {
                          ...(content.productPage || DEFAULT_PRODUCT_PAGE_CONTENT),
                          relatedHeading: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs font-semibold"
                      placeholder="Complete Your Living Sanctuary"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-[#24211D] block mb-1">Related Section Subtitle:</label>
                    <textarea
                      rows={2}
                      value={content.productPage?.relatedSubtitle || ''}
                      onChange={e => setContent({
                        ...content,
                        productPage: {
                          ...(content.productPage || DEFAULT_PRODUCT_PAGE_CONTENT),
                          relatedSubtitle: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs leading-relaxed"
                      placeholder="Complementary artisanal silhouettes and botanical aromas hand-poured in micro-batches."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#EAE0D5] bg-[#F5F1EB] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setContent({
                    ...content,
                    productPage: DEFAULT_PRODUCT_PAGE_CONTENT
                  });
                }}
                className="text-xs text-rose-700 hover:text-rose-900 underline cursor-pointer"
              >
                Reset Page Defaults
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#24211D] hover:bg-[#8C5E35] text-white rounded text-xs font-medium cursor-pointer shadow-xs transition-colors"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}

      
      </>
    );
  }
};
