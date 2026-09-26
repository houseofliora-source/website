import React, { useState, useRef } from 'react';
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
  MessageSquareQuote,
  Star,
  Package,
  Layers
} from 'lucide-react';
import { SiteContent, SiteTheme, ReviewItem, FaqItem, StoreSettings, Product, FavorMoldItem, FavorPackagingItem } from '../../types';
import { DEFAULT_SITE_CONTENT } from '../../data/defaultContent';
import { CustomFavorBuilder } from '../CustomFavorBuilder';

interface VisualSiteEditorProps {
  initialContent: SiteContent;
  storeSettings: StoreSettings;
  products: Product[];
  onSave: (newContent: SiteContent) => Promise<boolean>;
  onBackToAdmin?: () => void;
  /** When true, renders without its own standalone dark header — embeds inside parent layout */
  embedded?: boolean;
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
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleStock,
}) => {
  const [content, setContent] = useState<SiteContent>(initialContent || DEFAULT_SITE_CONTENT);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorEditTab, setFavorEditTab] = useState<'general' | 'molds' | 'quantity' | 'aromas' | 'ribbons' | 'packaging' | 'quotation'>('general');

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

        {/* Center: Device Viewport Switcher */}
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

                {/* Proof badges */}
                <div className="pt-3 border-t border-[#EAE0D5] grid grid-cols-3 gap-2 text-[#5A5248]">
                  <div>
                    <p className="text-[10px] uppercase text-[#8C5E35] font-semibold">{content.hero.badge1Label}</p>
                    <p className="text-xs font-medium text-[#24211D]">{content.hero.badge1Value}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#8C5E35] font-semibold">{content.hero.badge2Label}</p>
                    <p className="text-xs font-medium text-[#24211D]">{content.hero.badge2Value}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#8C5E35] font-semibold">{content.hero.badge3Label}</p>
                    <p className="text-xs font-medium text-[#24211D]">{content.hero.badge3Value}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Photo */}
              <div className="lg:col-span-5 relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-2 rounded-lg transition-all">
                {isEditMode && (
                  <button
                    onClick={() => heroImageInputRef.current?.click()}
                    className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Change Photo</span>
                  </button>
                )}
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  className="hidden"
                />

                <div className="rounded-lg overflow-hidden border border-[#EAE0D5] relative aspect-4/3 bg-[#EAE0D5]">
                  <img
                    src={content.hero.heroImage || '/images/hero_artisan_candles_1790333552254.jpg'}
                    alt="Hero Studio Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs drop-shadow-md">
                    <span 
                      className="italic text-sm"
                      style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
                    >
                      {content.hero.floatingTitle}
                    </span>
                    <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
                      {content.hero.floatingTag}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
                <button className="px-3.5 py-2 bg-white border border-[#D8CEBE] rounded text-xs text-[#24211D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
                  <span>{content.catalog.quizBtnText}</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs & Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Creations' },
                  { id: 'bubble', label: 'Bubble Cubes' },
                  { id: 'floating', label: 'Floating Blooms' },
                  { id: 'sculpted', label: 'Sculpted Columns' },
                  { id: 'jar', label: 'Aroma Jars & Tablets' },
                  { id: 'hampers', label: 'Gift Sets' },
                ].map(cat => {
                  const count = cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length;
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

            {/* Products Grid with full live cards and direct editing */}
            {(() => {
              const filtered = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
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

                          {/* Stock toggle and edit trigger */}
                          {isEditMode && (
                            <div className="flex items-center gap-1.5 text-xs">
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

          {/* 3. Bespoke Favors Section with Full Live Matrix & Granular Pencils */}
          <CustomFavorBuilder
            onAddCustomToCart={() => {}}
            facebookUrl={storeSettings.facebookUrl}
            content={content.favors}
            isEditMode={isEditMode}
            onEdit={(tab) => {
              setFavorEditTab((tab as any) || 'general');
              setActiveModal('favors');
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
                {content.reviews.items.map((r, i) => (
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
                {content.faq.items.map((f, i) => (
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

              {/* Badges */}
              <div className="pt-2 border-t border-[#EAE0D5] grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-[#7A6F62] block mb-1 text-[11px]">Badge 1 Value:</label>
                  <input
                    type="text"
                    value={content.hero.badge1Value}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, badge1Value: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#7A6F62] block mb-1 text-[11px]">Badge 2 Value:</label>
                  <input
                    type="text"
                    value={content.hero.badge2Value}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, badge2Value: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#7A6F62] block mb-1 text-[11px]">Badge 3 Value:</label>
                  <input
                    type="text"
                    value={content.hero.badge3Value}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, badge3Value: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-[#D8CEBE] rounded text-xs"
                  />
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

      {/* MODAL 2: Catalog Header Editor */}
      {activeModal === 'catalog' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Catalog Section Titles</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#EAE0D5] rounded cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Badge Tagline:</label>
                <input
                  type="text"
                  value={content.catalog.badge}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, badge: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
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
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Section Description:</label>
                <textarea
                  rows={3}
                  value={content.catalog.subtitle}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, subtitle: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Scent Quiz Button Label:</label>
                <input
                  type="text"
                  value={content.catalog.quizBtnText}
                  onChange={e => setContent({
                    ...content,
                    catalog: { ...content.catalog, quizBtnText: e.target.value }
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

      {/* MODAL 3: Bespoke Favors Comprehensive Editor */}
      {activeModal === 'favors' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#D8CEBE] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold flex items-center gap-2 text-[#24211D]">
                  <HeartHandshake className="w-5 h-5 text-[#8C5E35]" />
                  <span>Custom Wedding & Event Favors Studio</span>
                </h3>
                <p className="text-xs text-[#7A6F62] mt-0.5">
                  ক্যান্ডেল মোল্ড ফর্ম, কোয়ান্টিটি রেঞ্জ, সেন্ট অ্যারোমা, কার্ড ভিউ বক্স এবং কোটেশন শর্তাবলী এডিট করুন।
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-[#EAE0D5] rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#5A5248]" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-[#EAE0D5] bg-white px-4 py-2 gap-1.5 scrollbar-thin">
              {[
                { id: 'general', label: '📝 সাধারণ / General' },
                { id: 'molds', label: '🕯️ মোল্ড ফর্ম' },
                { id: 'quantity', label: '🔢 কোয়ান্টিটি' },
                { id: 'aromas', label: '🌸 সুবাস / অ্যারোমা' },
                { id: 'ribbons', label: '🎀 ফিতা / রিবন' },
                { id: 'packaging', label: '📦 কার্ড ভিউ বক্স' },
                { id: 'quotation', label: '📜 কোটেশন কার্ড' },
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
              {/* TAB 1: General Texts */}
              {favorEditTab === 'general' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Badge Tagline:</label>
                    <input
                      type="text"
                      value={content.favors.badge || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, badge: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Section Main Title:</label>
                    <input
                      type="text"
                      value={content.favors.title || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, title: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-serif text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Section Subtitle / Description:</label>
                    <textarea
                      rows={3}
                      value={content.favors.subtitle || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, subtitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Facebook Consultation Button Label:</label>
                    <input
                      type="text"
                      value={content.favors.consultationBtn || ''}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, consultationBtn: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Candle Mold Forms */}
              {favorEditTab === 'molds' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Step 1 Title (Heading):</label>
                    <input
                      type="text"
                      value={content.favors.moldTitle || '1. Select Candle Mold Form:'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, moldTitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#24211D]">Available Candle Mold Forms / Categories:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = content.favors.moldItems || DEFAULT_SITE_CONTENT.favors.moldItems || [];
                          const newItem: FavorMoldItem = {
                            id: 'mold_' + Date.now(),
                            label: 'New Sculpted Form',
                            basePrice: 260,
                          };
                          setContent({
                            ...content,
                            favors: { ...content.favors, moldItems: [...list, newItem] }
                          });
                        }}
                        className="px-2.5 py-1 text-xs bg-[#24211D] hover:bg-[#8C5E35] text-white rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Add Mold Form</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(content.favors.moldItems || DEFAULT_SITE_CONTENT.favors.moldItems || []).map((m, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-[#EAE0D5] flex items-center gap-3">
                          <span className="font-mono text-xs text-[#8C5E35] font-semibold w-5">{idx + 1}.</span>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Mold / Category Name</label>
                            <input
                              type="text"
                              value={m.label}
                              onChange={e => {
                                const list = [...(content.favors.moldItems || DEFAULT_SITE_CONTENT.favors.moldItems || [])];
                                list[idx] = { ...list[idx], label: e.target.value };
                                setContent({
                                  ...content,
                                  favors: { ...content.favors, moldItems: list }
                                });
                              }}
                              className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-medium"
                            />
                          </div>
                          <div className="w-28 space-y-1">
                            <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Base Price (৳)</label>
                            <input
                              type="number"
                              value={m.basePrice}
                              onChange={e => {
                                const list = [...(content.favors.moldItems || DEFAULT_SITE_CONTENT.favors.moldItems || [])];
                                list[idx] = { ...list[idx], basePrice: Number(e.target.value) };
                                setContent({
                                  ...content,
                                  favors: { ...content.favors, moldItems: list }
                                });
                              }}
                              className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-mono font-medium"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const list = (content.favors.moldItems || DEFAULT_SITE_CONTENT.favors.moldItems || []).filter((_, i) => i !== idx);
                              setContent({
                                ...content,
                                favors: { ...content.favors, moldItems: list }
                              });
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer self-end"
                            title="Delete Mold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Quantity & Discount */}
              {favorEditTab === 'quantity' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Step 2 Title (Heading):</label>
                    <input
                      type="text"
                      value={content.favors.quantityTitle || '2. Order Quantity (Pieces):'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, quantityTitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Minimum Order (Pieces):</label>
                      <input
                        type="number"
                        value={content.favors.minQuantity ?? 20}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, minQuantity: Number(e.target.value) }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Maximum Order (Pieces):</label>
                      <input
                        type="number"
                        value={content.favors.maxQuantity ?? 500}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, maxQuantity: Number(e.target.value) }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Slider Step:</label>
                      <input
                        type="number"
                        value={content.favors.quantityStep ?? 10}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, quantityStep: Number(e.target.value) }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Volume Tier Discount Note:</label>
                    <input
                      type="text"
                      value={content.favors.tierDiscountText || '50+ pcs: 5% off · 100+ pcs: 10% off · 200+ pcs: 15% off'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, tierDiscountText: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Signature Aromas */}
              {favorEditTab === 'aromas' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Step 3 Title (Heading):</label>
                    <input
                      type="text"
                      value={content.favors.aromaTitle || '3. Signature Aroma:'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, aromaTitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#24211D]">Currently Available Fragrances / Scents:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = content.favors.aromaItems || DEFAULT_SITE_CONTENT.favors.aromaItems || [];
                          setContent({
                            ...content,
                            favors: { ...content.favors, aromaItems: [...list, 'New Scent Aroma (Fresh)'] }
                          });
                        }}
                        className="px-2.5 py-1 text-xs bg-[#24211D] hover:bg-[#8C5E35] text-white rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Add Aroma</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(content.favors.aromaItems || DEFAULT_SITE_CONTENT.favors.aromaItems || []).map((a, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded border border-[#EAE0D5] flex items-center gap-3">
                          <span className="font-mono text-xs text-[#8C5E35] font-semibold w-5">{idx + 1}.</span>
                          <input
                            type="text"
                            value={a}
                            onChange={e => {
                              const list = [...(content.favors.aromaItems || DEFAULT_SITE_CONTENT.favors.aromaItems || [])];
                              list[idx] = e.target.value;
                              setContent({
                                ...content,
                                favors: { ...content.favors, aromaItems: list }
                              });
                            }}
                            className="flex-1 p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = (content.favors.aromaItems || DEFAULT_SITE_CONTENT.favors.aromaItems || []).filter((_, i) => i !== idx);
                              setContent({
                                ...content,
                                favors: { ...content.favors, aromaItems: list }
                              });
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Aroma"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Ribbons */}
              {favorEditTab === 'ribbons' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Step 4 Title (Heading):</label>
                    <input
                      type="text"
                      value={content.favors.ribbonTitle || '4. Ribbon Material & Tone:'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, ribbonTitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#24211D]">Available Ribbon Materials & Colors:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = content.favors.ribbonItems || DEFAULT_SITE_CONTENT.favors.ribbonItems || [];
                          setContent({
                            ...content,
                            favors: { ...content.favors, ribbonItems: [...list, 'New Satin Ribbon Color'] }
                          });
                        }}
                        className="px-2.5 py-1 text-xs bg-[#24211D] hover:bg-[#8C5E35] text-white rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Add Ribbon</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(content.favors.ribbonItems || DEFAULT_SITE_CONTENT.favors.ribbonItems || []).map((r, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded border border-[#EAE0D5] flex items-center gap-3">
                          <span className="font-mono text-xs text-[#8C5E35] font-semibold w-5">{idx + 1}.</span>
                          <input
                            type="text"
                            value={r}
                            onChange={e => {
                              const list = [...(content.favors.ribbonItems || DEFAULT_SITE_CONTENT.favors.ribbonItems || [])];
                              list[idx] = e.target.value;
                              setContent({
                                ...content,
                                favors: { ...content.favors, ribbonItems: list }
                              });
                            }}
                            className="flex-1 p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = (content.favors.ribbonItems || DEFAULT_SITE_CONTENT.favors.ribbonItems || []).filter((_, i) => i !== idx);
                              setContent({
                                ...content,
                                favors: { ...content.favors, ribbonItems: list }
                              });
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Ribbon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Card View Box / Packaging */}
              {favorEditTab === 'packaging' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Step 5 Title (Heading):</label>
                    <input
                      type="text"
                      value={content.favors.packagingTitle || '5. Packaging Style:'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, packagingTitle: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#24211D]">Card View Boxes & Packaging Styles:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || [];
                          const newItem: FavorPackagingItem = {
                            id: 'pkg_' + Date.now(),
                            title: 'New Luxury Box',
                            price: '+৳40/pc',
                            addonPrice: 40,
                            desc: 'Custom ribbon and sealed tag',
                          };
                          setContent({
                            ...content,
                            favors: { ...content.favors, packagingItems: [...list, newItem] }
                          });
                        }}
                        className="px-2.5 py-1 text-xs bg-[#24211D] hover:bg-[#8C5E35] text-white rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Add Packaging Box</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || []).map((p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-[#EAE0D5] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[#8C5E35] font-semibold">Box #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const list = (content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || []).filter((_, i) => i !== idx);
                                setContent({
                                  ...content,
                                  favors: { ...content.favors, packagingItems: list }
                                });
                              }}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Box Title</label>
                              <input
                                type="text"
                                value={p.title}
                                onChange={e => {
                                  const list = [...(content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || [])];
                                  list[idx] = { ...list[idx], title: e.target.value };
                                  setContent({
                                    ...content,
                                    favors: { ...content.favors, packagingItems: list }
                                  });
                                }}
                                className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Price Display Tag</label>
                              <input
                                type="text"
                                value={p.price}
                                onChange={e => {
                                  const list = [...(content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || [])];
                                  list[idx] = { ...list[idx], price: e.target.value };
                                  setContent({
                                    ...content,
                                    favors: { ...content.favors, packagingItems: list }
                                  });
                                }}
                                className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Addon Price (৳ / pc)</label>
                              <input
                                type="number"
                                value={p.addonPrice}
                                onChange={e => {
                                  const list = [...(content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || [])];
                                  list[idx] = { ...list[idx], addonPrice: Number(e.target.value) };
                                  setContent({
                                    ...content,
                                    favors: { ...content.favors, packagingItems: list }
                                  });
                                }}
                                className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs font-mono font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#7A6F62] uppercase font-semibold">Box Description</label>
                            <input
                              type="text"
                              value={p.desc}
                              onChange={e => {
                                const list = [...(content.favors.packagingItems || DEFAULT_SITE_CONTENT.favors.packagingItems || [])];
                                list[idx] = { ...list[idx], desc: e.target.value };
                                setContent({
                                  ...content,
                                  favors: { ...content.favors, packagingItems: list }
                                });
                              }}
                              className="w-full p-2 bg-[#FAF8F5] border border-[#D8CEBE] rounded text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Quotation & Terms */}
              {favorEditTab === 'quotation' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Card Box Badge:</label>
                      <input
                        type="text"
                        value={content.favors.cardBoxBadge || 'Live Estimate & Terms'}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, cardBoxBadge: e.target.value }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Card Box Title:</label>
                      <input
                        type="text"
                        value={content.favors.cardBoxTitle || 'Order Quotation'}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, cardBoxTitle: e.target.value }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs font-serif text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Production Lead Time:</label>
                      <input
                        type="text"
                        value={content.favors.leadTimeText || '4–7 Business Days'}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, leadTimeText: e.target.value }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#24211D] block mb-1">Inscription Step Title:</label>
                      <input
                        type="text"
                        value={content.favors.inscriptionTitle || '6. Personalized Inscription:'}
                        onChange={e => setContent({
                          ...content,
                          favors: { ...content.favors, inscriptionTitle: e.target.value }
                        })}
                        className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">Inscription Note / Description:</label>
                    <input
                      type="text"
                      value={content.favors.inscriptionNote || 'Includes personalized foil-accented card and botanical sprig.'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, inscriptionNote: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24211D] block mb-1">50% Advance Notice Text:</label>
                    <textarea
                      rows={2}
                      value={content.favors.advanceNoticeText || 'For customized favor orders, a 50% advance deposit is required via bKash or Nagad. The remaining 50% is payable upon doorstep delivery.'}
                      onChange={e => setContent({
                        ...content,
                        favors: { ...content.favors, advanceNoticeText: e.target.value }
                      })}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs leading-relaxed"
                    />
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

              {content.reviews.items.map((rev, idx) => (
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

              {content.faq.items.map((item, idx) => (
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
      </>
    );
  }
};
