import React, { useState, useEffect } from 'react';
import { Product, ProductPageContent } from '../types';
import { DEFAULT_PRODUCT_PAGE_CONTENT } from '../data/defaultContent';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  ChevronRight,
  Heart,
  Share2,
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
        </div>

        {/* Right Column: Title, Price, Variants, and Purchase Controls (6-7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            {isEditMode && onEditProduct && (
              <div className="flex justify-end pb-1">
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="apple-glass-pill px-3 py-1 text-xs text-[#8C5E35] font-semibold hover:bg-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all border border-[#8C5E35]/40"
                  title="Edit Candle Price, Photos & Specifications"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Candle Info</span>
                </button>
              </div>
            )}

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
          </div>

          <div className="h-px bg-[#EAE0D5]/80" />

          {/* Short Narrative */}
          <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Fragrance / Scent Notes Selection */}
          {product.scentNotes && product.scentNotes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-xs">
                <label className="font-semibold text-[#24211D] uppercase tracking-wider">
                  Select Fragrance Note / Aroma Profile:
                </label>
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
        </div>
      </div>

      {/* Product Details Section */}
      <div className="space-y-6 pt-8 border-t border-[#EAE0D5]/80">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#24211D]">
            {content.detailsHeading || 'Product Details'}
          </h2>
          {isEditMode && onEditPageSettings && (
            <button
              type="button"
              onClick={onEditPageSettings}
              className="apple-glass-pill px-3 py-1 text-xs text-[#8C5E35] font-semibold hover:bg-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all border border-[#8C5E35]/40"
              title="Edit Product Page Settings"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details Settings</span>
            </button>
          )}
        </div>

        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6 text-[#5A5248]">
          {/* Main Description */}
          {product.description && (
            <div className="space-y-2 max-w-3xl">
              <h3 className="font-serif text-xl sm:text-2xl text-[#24211D]">
                {product.name}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-[#5A5248]">
                {product.description}
              </p>
            </div>
          )}

          {/* Clean Key Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#EAE0D5]/80 text-xs sm:text-sm">
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest block">Wax Formulation</span>
              <p className="font-medium text-[#24211D]">{product.waxType || '100% Pure Botanical Soy Wax'}</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest block">Burn Time</span>
              <p className="font-medium text-[#24211D]">{product.burnTime || '20-25 Hours'}</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest block">Dimensions</span>
              <p className="font-medium text-[#24211D]">{product.dimensions || 'Handcrafted Small Batch'}</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE0D5] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#8C5E35] tracking-widest block">Fragrance Notes</span>
              <p className="font-medium text-[#24211D]">{product.scentNotes && product.scentNotes.length > 0 ? product.scentNotes.join(' · ') : 'Pure Botanical Essential Oils'}</p>
            </div>
          </div>
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
