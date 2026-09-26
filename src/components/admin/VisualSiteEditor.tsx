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
  Star
} from 'lucide-react';
import { SiteContent, SiteTheme, ReviewItem, FaqItem, StoreSettings, Product } from '../../types';
import { DEFAULT_SITE_CONTENT } from '../../data/defaultContent';

interface VisualSiteEditorProps {
  initialContent: SiteContent;
  storeSettings: StoreSettings;
  products: Product[];
  onSave: (newContent: SiteContent) => Promise<boolean>;
  onBackToAdmin: () => void;
}

export const VisualSiteEditor: React.FC<VisualSiteEditorProps> = ({
  initialContent,
  storeSettings,
  products,
  onSave,
  onBackToAdmin,
}) => {
  const [content, setContent] = useState<SiteContent>(initialContent || DEFAULT_SITE_CONTENT);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
          {/* Top Announcement Bar with Pencil */}
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

          {/* 2. Catalog Section Header with Pencil */}
          <section className="p-6 sm:p-12 border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-4 rounded-lg bg-white/40 transition-all flex flex-col md:flex-row md:items-end justify-between gap-4">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('catalog')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Catalog Header</span>
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

              <button className="px-4 py-2 bg-white border border-[#D8CEBE] rounded text-xs text-[#24211D] flex items-center gap-1.5 self-start">
                <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
                <span>{content.catalog.quizBtnText}</span>
              </button>
            </div>

            {/* Product items mini display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.slice(0, 3).map(p => (
                <div key={p.id} className="p-3 bg-white rounded border border-[#EAE0D5] space-y-2">
                  <img src={p.image} alt={p.name} className="w-full h-28 object-cover rounded" />
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-[#8C5E35] font-semibold">৳{p.price}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Bespoke Favors Section with Pencil */}
          <section className="p-6 sm:p-12 bg-[#F5F1EB] border-b border-[#EAE0D5] space-y-6">
            <div className="relative group border-2 border-dashed border-amber-600/30 hover:border-amber-600 p-6 rounded-lg bg-white/40 transition-all text-center space-y-2">
              {isEditMode && (
                <button
                  onClick={() => setActiveModal('favors')}
                  className="absolute -top-3 right-4 z-20 px-3 py-1 bg-[#8C5E35] hover:bg-[#24211D] text-white text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer border border-white/40"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Favors Section</span>
                </button>
              )}

              <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center justify-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#C68B59]" />
                {content.favors.badge}
              </span>
              <h2 
                className="text-2xl sm:text-3xl text-[#24211D]"
                style={{ fontFamily: `'${content.theme.headingFont || 'Cormorant Garamond'}', serif` }}
              >
                {content.favors.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5248] max-w-xl mx-auto">
                {content.favors.subtitle}
              </p>
            </div>
          </section>

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
        </div>
      </main>

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

      {/* MODAL 3: Bespoke Favors Editor */}
      {activeModal === 'favors' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#24211D] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D8CEBE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#8C5E35]" />
                <span>Edit Custom Wedding Favors Section</span>
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
                  value={content.favors.badge}
                  onChange={e => setContent({
                    ...content,
                    favors: { ...content.favors, badge: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Section Main Title:</label>
                <input
                  type="text"
                  value={content.favors.title}
                  onChange={e => setContent({
                    ...content,
                    favors: { ...content.favors, title: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#5A5248] block mb-1">Section Subtitle:</label>
                <textarea
                  rows={3}
                  value={content.favors.subtitle}
                  onChange={e => setContent({
                    ...content,
                    favors: { ...content.favors, subtitle: e.target.value }
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
    </div>
  );
};
