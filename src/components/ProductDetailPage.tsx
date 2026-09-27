import React, { useState, useEffect } from 'react';
import { Product, ProductPageContent } from '../types';
import { DEFAULT_PRODUCT_PAGE_CONTENT } from '../data/defaultContent';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Flame, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Check, 
  ChevronRight,
  Heart,
  Share2,
  Droplets,
  Wind,
  Edit3
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart?: (product: Product, quantity: number, selectedScent?: string) => void;
  onBuyNow?: (product: Product, quantity: number, selectedScent?: string) => void;
  pageContent?: ProductPageContent;
  isEditMode?: boolean;
  onEditProduct?: (product: Product) => void;
  onEditPageSettings?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  pageContent,
  isEditMode = false,
  onEditProduct,
  onEditPageSettings,
}) => {
  const content = pageContent || DEFAULT_PRODUCT_PAGE_CONTENT;
  const [quantity, setQuantity] = useState(1);
  const [selectedNote, setSelectedNote] = useState<string>(
    product.scentNotes?.[0] || 'Artisanal Botanical Blend'
  );
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'rituals' | 'specs'>('description');

  // Scroll to top whenever the product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setSelectedNote(product.scentNotes?.[0] || 'Artisanal Botanical Blend');
    setAdded(false);
  }, [product.id]);

  const isOutOfStock = product.inStock === false;

  const handleAddToCart = () => {
    if (isOutOfStock || !onAddToCart) return;
    onAddToCart(product, quantity, selectedNote);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleInstantBuy = () => {
    if (isOutOfStock || !onBuyNow) return;
    onBuyNow(product, quantity, selectedNote);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Other products for recommendations (excluding current product)
  const relatedProducts = allProducts.filter(p => p.id !== product.id);

  // Duplicate list for seamless train glide animation on mobile
  const marqueeProducts = [...relatedProducts, ...relatedProducts];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fade-in">
      {/* Breadcrumb Navigation & Back Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A5248]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="apple-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-xs text-[#24211D] hover:text-[#8C5E35] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collection</span>
          </button>
          <span className="text-[#D8CEBE]">/</span>
          <span className="capitalize text-[#7A6F62]">{product.category}</span>
          <span className="text-[#D8CEBE]">/</span>
          <span className="text-[#24211D] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="apple-glass-pill px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#5A5248] hover:text-[#24211D] cursor-pointer"
          title="Copy Product Link"
        >
          <Share2 className="w-3.5 h-3.5 text-[#8C5E35]" />
          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Top Section: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Product Stage & Gallery (5-6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden apple-glass-card shadow-xl bg-[#FAF8F5]/80 group">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isBestseller && (
                <span className="apple-glass-dark text-white px-3 py-1 text-[10px] tracking-[0.2em] font-sans uppercase font-medium shadow-md">
                  BESTSELLER
                </span>
              )}
              {product.isNewArrival && (
                <span className="apple-glass-pill px-3 py-1 text-[10px] tracking-[0.2em] font-sans uppercase text-[#8C5E35] font-semibold shadow-xs">
                  NEW ARRIVAL
                </span>
              )}
            </div>

            {isOutOfStock ? (
              <span className="absolute top-4 right-4 apple-glass-pill px-3 py-1 text-[10px] tracking-[0.15em] font-sans uppercase text-red-700 bg-red-50/90 border-red-200 shadow-xs">
                Out of Stock
              </span>
            ) : (
              <span className="absolute bottom-4 left-4 apple-glass-pill px-3 py-1 text-[10px] tracking-wider text-[#5A5248] font-medium shadow-xs">
                {product.waxType || '100% Pure Botanical Soy Wax'}
              </span>
            )}
          </div>

          {/* Quick Specifications Pods */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-[#5A5248]">
            <div className="apple-glass-card rounded-xl p-3 flex flex-col items-center text-center gap-1">
              <Flame className="w-4 h-4 text-[#8C5E35]" />
              <span className="text-[10px] uppercase tracking-wider text-[#7A6F62]">Burn Time</span>
              <span className="font-semibold text-[#24211D] text-[11px] truncate">{product.burnTime || '20-25 Hours'}</span>
            </div>
            <div className="apple-glass-card rounded-xl p-3 flex flex-col items-center text-center gap-1">
              <Clock className="w-4 h-4 text-[#8C5E35]" />
              <span className="text-[10px] uppercase tracking-wider text-[#7A6F62]">Dimensions</span>
              <span className="font-semibold text-[#24211D] text-[11px] truncate">{product.dimensions || 'Handcrafted'}</span>
            </div>
            <div className="apple-glass-card rounded-xl p-3 flex flex-col items-center text-center gap-1">
              <Droplets className="w-4 h-4 text-[#8C5E35]" />
              <span className="text-[10px] uppercase tracking-wider text-[#7A6F62]">Wax Formulation</span>
              <span className="font-semibold text-[#24211D] text-[11px] truncate">100% Botanical Soy</span>
            </div>
            <div className="apple-glass-card rounded-xl p-3 flex flex-col items-center text-center gap-1">
              <Wind className="w-4 h-4 text-[#8C5E35]" />
              <span className="text-[10px] uppercase tracking-wider text-[#7A6F62]">Braided Wick</span>
              <span className="font-semibold text-[#24211D] text-[11px] truncate">Lead-Free Cotton</span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Price, Variants, and Purchase Controls (6-7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="apple-glass-pill px-3 py-1 text-[10px] tracking-[0.25em] font-sans uppercase text-[#8C5E35] font-semibold inline-block">
                {product.category} COLLECTION
              </span>
              {isEditMode && onEditProduct && (
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="apple-glass-pill px-3 py-1 text-xs text-[#8C5E35] font-semibold hover:bg-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all border border-[#8C5E35]/40"
                  title="Edit Candle Price, Photos & Specifications"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Candle Info</span>
                </button>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#24211D] leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-serif text-3xl sm:text-4xl font-medium text-[#8C5E35] tracking-tight">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-base sm:text-lg text-[#A89E90] line-through">
                  ৳{product.originalPrice}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="apple-glass-pill px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 border-emerald-200">
                  Save ৳{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className={`font-medium ${isOutOfStock ? 'text-red-700' : 'text-emerald-800'}`}>
                {isOutOfStock ? 'Currently Sold Out · Back-orders on request' : 'In Stock · Handcrafted in Dhaka'}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#EAE0D5]/80" />

          {/* Short Narrative */}
          <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Fragrance / Scent Notes Selection */}
          {product.scentNotes && product.scentNotes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#24211D] uppercase tracking-wider">
                  Select Fragrance Note / Aroma Profile:
                </label>
                <span className="text-[#8C5E35] font-serif italic text-sm">{selectedNote}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.scentNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className={`px-4 py-2 text-xs rounded-full transition-all cursor-pointer font-medium ${
                      selectedNote === note
                        ? 'apple-glass-dark text-white shadow-md scale-105'
                        : 'apple-glass-pill text-[#5A5248] hover:text-[#24211D] hover:bg-white/80'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter & Action Buttons */}
          <div className="space-y-3.5 pt-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center justify-between apple-glass-pill p-1.5 sm:w-36">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-lg text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-mono text-base px-3 tabular-nums font-semibold text-[#24211D]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-lg text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wider uppercase ${
                  isOutOfStock
                    ? 'bg-[#EAE0D5] text-[#9E9282] cursor-not-allowed'
                    : added
                    ? 'bg-emerald-700 text-white'
                    : 'apple-glass-dark text-white'
                }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · ৳{product.price * quantity}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant Buy Now Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleInstantBuy}
                className="w-full py-3.5 px-6 text-xs sm:text-sm font-semibold rounded-full apple-glass-pill text-[#24211D] hover:bg-white/90 hover:text-[#8C5E35] border border-[#8C5E35]/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs tracking-wider uppercase"
              >
                <Sparkles className="w-4 h-4 text-[#8C5E35]" />
                <span>Instant Checkout / Buy Now</span>
              </button>
            )}
          </div>

          {/* Artisanal Service Guarantees */}
          <div className="apple-glass-card rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-[#5A5248] relative group">
            {isEditMode && onEditPageSettings && (
              <button
                type="button"
                onClick={onEditPageSettings}
                className="absolute top-3 right-3 px-2.5 py-1 bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                title="Edit Product Page Guarantees"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Guarantees</span>
              </button>
            )}
            <div className="flex items-center gap-3 pr-24 sm:pr-0">
              <Truck className="w-4 h-4 text-[#8C5E35] shrink-0" />
              <span>{content.courierGuarantee}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#8C5E35] shrink-0" />
              <span>{content.paymentGuarantee}</span>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="w-4 h-4 text-[#8C5E35] shrink-0" />
              <span>{content.craftGuarantee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details & Candle Rituals Section */}
      <div className="space-y-6 pt-8 border-t border-[#EAE0D5]/80">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE0D5] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'description', label: content.tab1Label || 'Artisanal Story & Details' },
              { id: 'notes', label: content.tab2Label || 'Fragrance Architecture' },
              { id: 'rituals', label: content.tab3Label || 'Burn Rituals & Care' },
              { id: 'specs', label: content.tab4Label || 'Craft Specifications' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'apple-glass-dark text-white shadow-xs'
                    : 'text-[#5A5248] hover:text-[#24211D] hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isEditMode && onEditPageSettings && (
            <button
              type="button"
              onClick={onEditPageSettings}
              className="px-3 py-1.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Tabs & Rituals</span>
            </button>
          )}
        </div>

        {/* Tab Content Panes */}
        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 text-sm leading-relaxed text-[#5A5248]">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-2xl text-[#24211D]">
                {(content.philosophyTitle || 'The Philosophy Behind {name}').replace('{name}', product.name)}
              </h3>
              <p>
                {content.philosophyStory1}
              </p>
              <p>
                {content.philosophyStory2}
              </p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6 max-w-3xl">
              <h3 className="font-serif text-2xl text-[#24211D]">{content.tab2Label || 'Fragrance Architecture'}</h3>
              <p className="text-xs text-[#7A6F62]">
                {content.olfactorySubtitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest">Top Notes</span>
                  <p className="font-serif text-base text-[#24211D]">Immediate Impression</p>
                  <p className="text-xs text-[#5A5248]">
                    {product.scentNotes?.[0] || 'Fresh Bergamot & Botanical Blossom'}
                  </p>
                </div>
                <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest">Heart Notes</span>
                  <p className="font-serif text-base text-[#24211D]">Core Personality</p>
                  <p className="text-xs text-[#5A5248]">
                    {product.scentNotes?.[1] || 'Velvet Rose, Peony & Creamy Jasmine'}
                  </p>
                </div>
                <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest">Base Notes</span>
                  <p className="font-serif text-base text-[#24211D]">Lingering Warmth</p>
                  <p className="text-xs text-[#5A5248]">
                    {product.scentNotes?.[2] || 'Golden Amber, Vanilla Bean & Soft Cedar'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rituals' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-2xl text-[#24211D]">{content.careRitualsTitle}</h3>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">1</span>
                  <span><strong>{content.ritual1Title}:</strong> {content.ritual1Text}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">2</span>
                  <span><strong>{content.ritual2Title}:</strong> {content.ritual2Text}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">3</span>
                  <span><strong>{content.ritual3Title}:</strong> {content.ritual3Text}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">4</span>
                  <span><strong>{content.ritual4Title}:</strong> {content.ritual4Text}</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-2xl text-[#24211D]">Craft & Formulation Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/70 rounded-xl border border-[#EAE0D5]">
                  <span className="text-[#7A6F62] block">Wax Composition:</span>
                  <span className="font-semibold text-[#24211D] text-sm">{product.waxType || '100% Pure Plant Soy Wax'}</span>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-[#EAE0D5]">
                  <span className="text-[#7A6F62] block">Burn Duration:</span>
                  <span className="font-semibold text-[#24211D] text-sm">{product.burnTime || '20-25 Hours'}</span>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-[#EAE0D5]">
                  <span className="text-[#7A6F62] block">Dimensions:</span>
                  <span className="font-semibold text-[#24211D] text-sm">{product.dimensions || 'Handcrafted Small Batch'}</span>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-[#EAE0D5]">
                  <span className="text-[#7A6F62] block">Origin:</span>
                  <span className="font-semibold text-[#24211D] text-sm">Artisanal Studio, Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-[#EAE0D5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
                <span>Pairings & Suggestions</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#24211D]">
                {content.relatedHeading || 'You May Also Adore'}
              </h2>
            </div>
            <p className="text-xs text-[#7A6F62]">
              {content.relatedSubtitle || 'Handcrafted artisanal pieces curated to complement your olfactory sanctuary.'}
            </p>
          </div>

          {/* DESKTOP SCREEN: Responsive Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel.id)}
                className="group relative flex flex-col apple-glass-card rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]/80">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="absolute top-3 left-3 apple-glass-pill px-2.5 py-1 text-[9px] tracking-[0.2em] font-sans uppercase text-[#5A5248] font-medium shadow-xs">
                    {rel.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col justify-between gap-2">
                  <h4 className="font-serif text-base font-normal text-[#24211D] group-hover:text-[#8C5E35] transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-serif text-lg font-medium text-[#8C5E35]">
                      ৳{rel.price}
                    </span>
                    <span className="apple-glass-pill group-hover:apple-glass-dark group-hover:text-white px-3 py-1 text-[10px] tracking-[0.2em] font-sans uppercase text-[#7A6F62] font-semibold transition-all">
                      VIEW
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MOBILE SCREEN: Continuous Smooth Train / Marquee Motion */}
          {/* As requested: "মোবাইল স্ক্রিন হবে তখন একটার পাশে একটা তো সাজানো সম্ভব না, তো তাহলে মনে করো যে ওখানে রেলগাড়ির মতো প্রোডাক্টগুলো আস্তে আস্তে আস্তে আস্তে একটার সাথে একটা পাশাপাশি এরকম করে চলতে থাকবে" */}
          <div className="md:hidden overflow-hidden relative py-2">
            <div className="animate-train-glide flex gap-4">
              {marqueeProducts.map((rel, idx) => (
                <div
                  key={`${rel.id}-${idx}`}
                  onClick={() => onSelectProduct(rel.id)}
                  className="w-56 shrink-0 group relative flex flex-col apple-glass-card rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]/80">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 apple-glass-pill px-2 py-0.5 text-[8px] tracking-[0.2em] font-sans uppercase text-[#5A5248] font-medium">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col justify-between gap-1.5">
                    <h4 className="font-serif text-sm font-normal text-[#24211D] truncate">
                      {rel.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-medium text-[#8C5E35]">
                        ৳{rel.price}
                      </span>
                      <span className="apple-glass-dark text-white px-2.5 py-0.5 text-[9px] tracking-wider font-semibold rounded-full">
                        VIEW
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-2">
              <span className="text-[10px] text-[#8C5E35]/80 italic">
                (Touch or tap any product to view details · Smooth auto-glide active)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
