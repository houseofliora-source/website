import React, { useState, useMemo } from 'react';
import { Sparkles, Check, Phone, ShieldCheck, HeartHandshake, Info, Edit3, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { CustomFavorItem, SiteContent, Product, CustomCategory, CustomCategoryFlow } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface CustomFavorBuilderProps {
  onAddCustomToCart: (customOrder: CustomFavorItem) => void;
  facebookUrl?: string;
  content?: SiteContent['favors'];
  categories?: CustomCategory[];
  products?: Product[];
  isEditMode?: boolean;
  onEdit?: (tab?: string) => void;
}

export const CustomFavorBuilder: React.FC<CustomFavorBuilderProps> = ({
  onAddCustomToCart,
  facebookUrl = 'https://www.facebook.com/houseofliorabd',
  content = DEFAULT_SITE_CONTENT.favors,
  categories = [
    { id: 'all', label: 'Artisanal Candles' },
    { id: 'bubble', label: 'Bubble Cubes' },
    { id: 'floating', label: 'Floating Blooms' },
    { id: 'sculpted', label: 'Sculpted Columns' },
    { id: 'hampers', label: 'Gift Hampers' },
    { id: 'jar', label: 'Aroma Tablets' },
  ],
  products = [],
  isEditMode = false,
  onEdit,
}) => {
  // ---------------------------------------------------------------------------
  // 1. Category Selection State
  // ---------------------------------------------------------------------------
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || 'all');

  // Filter products for the chosen category
  const categoryProducts = useMemo(() => {
    if (selectedCategoryId === 'all') return products;
    return products.filter(p => (p.category || '').toLowerCase() === selectedCategoryId.toLowerCase());
  }, [products, selectedCategoryId]);

  // Fallback if no products in this category yet
  const availableProducts = categoryProducts.length > 0 ? categoryProducts : products;

  // ---------------------------------------------------------------------------
  // 2. Specific Products Multi-Selection State
  // ---------------------------------------------------------------------------
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    return availableProducts[0] ? [availableProducts[0].id] : [];
  });

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        // Keep at least one selected
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Selected product items
  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // ---------------------------------------------------------------------------
  // 3. Dynamic Category Questions & Answers State
  // ---------------------------------------------------------------------------
  const activeFlow = useMemo(() => {
    const flows = content?.categoryFlows || DEFAULT_SITE_CONTENT.favors.categoryFlows || [];
    const found = flows.find(f => f.categoryId === selectedCategoryId);
    if (found) return found;
    // Fallback to first flow or default
    return flows[0] || (DEFAULT_SITE_CONTENT.favors.categoryFlows ? DEFAULT_SITE_CONTENT.favors.categoryFlows[0] : null);
  }, [content?.categoryFlows, selectedCategoryId]);

  const questions = activeFlow?.questions || [];

  // Dynamic answers keyed by question ID
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelectAnswer = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // ---------------------------------------------------------------------------
  // 4. Batch Quantity & Pricing Calculation (No Packaging Box, No Custom Tag)
  // ---------------------------------------------------------------------------
  const minQty = content?.minQuantity || 20;
  const maxQty = content?.maxQuantity || 500;
  const stepQty = content?.quantityStep || 10;
  const [quantity, setQuantity] = useState(50);
  const [added, setAdded] = useState(false);

  // Calculate average base unit price from selected products or default
  const baseUnitPrice = useMemo(() => {
    if (selectedProducts.length > 0) {
      const sum = selectedProducts.reduce((acc, p) => acc + (p.price || 280), 0);
      return Math.round(sum / selectedProducts.length);
    }
    return 280;
  }, [selectedProducts]);

  // Tiered volume discount
  const discountMultiplier = quantity >= 200 ? 0.85 : quantity >= 100 ? 0.90 : quantity >= 50 ? 0.95 : 1.0;
  const effectiveUnitPrice = Math.round(baseUnitPrice * discountMultiplier);
  const subtotal = effectiveUnitPrice * quantity;
  const advanceRequired = Math.round(subtotal * 0.5); // 50% advance

  // Handle Add Bespoke Batch to Cart
  const handleAddToBag = () => {
    const piecesTitle = selectedProducts.length > 0 
      ? selectedProducts.map(p => p.name).join(', ')
      : 'Artisanal Pieces';

    // Build specs string from dynamic answers
    const specsArray = questions.map(q => {
      const ans = answers[q.id] || q.options[0] || 'Default';
      return `${q.title.replace(':', '')}: ${ans}`;
    });

    const details = `Selected Pieces: [${piecesTitle}] · ${specsArray.join(' · ')}`;

    onAddCustomToCart({
      productTitle: `Bespoke Custom Order (${quantity} pcs)`,
      quantity: 1,
      unitPrice: subtotal,
      total: subtotal,
      advanceRequired,
      details,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  return (
    <section id="custom-favors" className="py-16 md:py-24 bg-[#F5F1EB] border-b border-[#EAE0D5] relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 relative border-2 border-transparent hover:border-amber-600/30 p-4 rounded-xl transition-all">
          {isEditMode && (
            <button
              onClick={() => onEdit?.('general')}
              className="absolute -top-3 right-0 z-20 px-3 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
              title="Edit Custom Favors Headline & Description"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Favors Section</span>
            </button>
          )}

          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
            <HeartHandshake className="w-4 h-4 text-[#C68B59]" />
            <span>{content.badge || 'Bespoke Atelier'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
            {content.title || 'Custom Wedding & Event Favors'}
          </h2>

          <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed max-w-2xl mx-auto">
            {content.subtitle || 'Memorable handcrafted tokens curated with artisanal care for your special celebrations.'}
          </p>
        </div>

        {/* =================================================================== */}
        {/* STEP 1: CATEGORY SELECTION                                          */}
        {/* =================================================================== */}
        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/80 shadow-sm">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#EAE0D5]">
            <span className="w-6 h-6 rounded-full bg-[#8C5E35] text-white flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h3 className="font-serif text-lg sm:text-xl text-[#24211D]">
              Which handcrafted category would you like to customize?
            </h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  // Auto reset selected products to first in category if available
                  const filtered = cat.id === 'all' 
                    ? products 
                    : products.filter(p => (p.category || '').toLowerCase() === cat.id.toLowerCase());
                  if (filtered.length > 0) {
                    setSelectedProductIds([filtered[0].id]);
                  }
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                  selectedCategoryId === cat.id
                    ? 'apple-glass-dark text-white shadow-md'
                    : 'apple-glass-pill text-[#5A5248] hover:text-[#24211D] hover:bg-white/80'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =================================================================== */}
        {/* STEP 2: SPECIFIC PRODUCT(S) MULTI-SELECTION                         */}
        {/* =================================================================== */}
        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-white/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EAE0D5]">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#8C5E35] text-white flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-[#24211D]">
                Select the piece(s) you want to include in this custom order:
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8C5E35] apple-glass-pill px-3 py-1 self-start sm:self-auto">
              {selectedProductIds.length} piece{selectedProductIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <p className="text-xs text-[#7A6F62]">
            You can select one or multiple pieces from this collection for your bespoke batch:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {availableProducts.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProductSelection(p.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                    isSelected
                      ? 'apple-glass-dark text-white shadow-md border-transparent'
                      : 'apple-glass-pill text-[#24211D] hover:bg-white/90 border-white/80'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-white/40 bg-[#FAF8F5]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs sm:text-sm font-medium truncate">
                      {p.name}
                    </h4>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#E5A97A]' : 'text-[#8C5E35]'}`}>
                      {isSelected ? '✓ Selected' : '+ Click to add'}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-[#24211D] border-white' : 'border-[#A89E90]'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* STEP 3: DYNAMIC CUSTOMIZATION QUESTIONS                             */}
        {/* =================================================================== */}
        {questions.length > 0 && (
          <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/80 shadow-sm">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#EAE0D5]">
              <span className="w-6 h-6 rounded-full bg-[#8C5E35] text-white flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-[#24211D]">
                Customize Your Specifications
              </h3>
            </div>

            <div className="space-y-6">
              {questions.map((q) => {
                const selectedOption = answers[q.id] || q.options[0];
                return (
                  <div key={q.id} className="space-y-2.5">
                    <label className="text-xs font-semibold text-[#24211D] block">
                      {q.title}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const isActive = selectedOption === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                              isActive
                                ? 'apple-glass-dark text-white shadow-xs'
                                : 'apple-glass-pill text-[#5A5248] hover:text-[#24211D] hover:bg-white/90'
                            }`}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: ORDER QUANTITY, LIVE ESTIMATE & BOOKING                    */}
        {/* (Excluding Packaging Box and Custom Tag Message as requested)      */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Quantity Slider */}
          <div className="lg:col-span-7 apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/80 shadow-sm">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#EAE0D5]">
              <span className="w-6 h-6 rounded-full bg-[#8C5E35] text-white flex items-center justify-center text-xs font-bold font-mono">
                4
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-[#24211D]">
                Order Quantity (Pieces)
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#5A5248]">Batch Volume:</span>
                <span className="font-mono text-2xl font-bold text-[#8C5E35]">
                  {quantity} <span className="text-xs font-sans text-[#7A6F62] font-normal">pieces</span>
                </span>
              </div>

              <input
                type="range"
                min={minQty}
                max={maxQty}
                step={stepQty}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-[#EAE0D5] rounded-lg appearance-none cursor-pointer accent-[#8C5E35]"
              />

              <div className="flex justify-between text-[11px] text-[#7A6F62] font-mono">
                <span>Min: {minQty} pcs</span>
                <span>Max: {maxQty} pcs</span>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C5E35] shrink-0" />
                <span>
                  {content.tierDiscountText || '50+ pcs: 5% off · 100+ pcs: 10% off · 200+ pcs: 15% off'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Quotation Summary & Booking */}
          <div className="lg:col-span-5 apple-glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-white/80 shadow-md">
            <div className="border-b border-[#EAE0D5] pb-3">
              <span className="text-[10px] font-mono text-[#8C5E35] uppercase tracking-wider apple-glass-pill px-2.5 py-0.5 inline-block">
                LIVE ESTIMATE
              </span>
              <h4 className="font-serif text-xl text-[#24211D] mt-1">
                Bespoke Order Quotation
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-[#5A5248]">
              <div className="flex justify-between">
                <span>Selected Pieces:</span>
                <span className="font-medium text-[#24211D] text-right truncate max-w-[200px]">
                  {selectedProducts.map(p => p.name).join(', ')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Batch Quantity:</span>
                <span className="font-mono font-medium text-[#24211D]">{quantity} pcs</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Unit Price:</span>
                <span className="font-mono font-medium text-[#24211D]">৳{effectiveUnitPrice} / pc</span>
              </div>

              <div className="pt-2 border-t border-[#EAE0D5] flex justify-between items-baseline font-bold text-base text-[#24211D]">
                <span>Total Amount:</span>
                <span className="font-mono text-2xl text-[#8C5E35]">৳{subtotal}</span>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] space-y-1">
                <div className="flex justify-between items-baseline font-semibold text-xs text-[#8C5E35]">
                  <span>50% Advance Required:</span>
                  <span className="font-mono text-base">৳{advanceRequired}</span>
                </div>
                <p className="text-[10px] text-[#7A6F62] leading-tight">
                  {content.advanceNoticeText || '50% advance booking is required via bKash/Nagad upon confirmation.'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={added}
                className="w-full py-3.5 apple-glass-dark text-white rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {added ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Added to Shopping Bag!</span>
                  </>
                ) : (
                  <>
                    <span>Add Bespoke Order to Bag</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=Hello%20House%20of%20Liora,%20I%20would%20like%20to%20consult%20about%20a%20bespoke%20event%20order%20of%20${quantity}%20pieces%20for%20${encodeURIComponent(selectedProducts.map(p => p.name).join(', '))}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 apple-glass-pill text-[#24211D] rounded-full text-xs font-medium transition-all text-center block hover:bg-white/90"
              >
                Consult Atelier on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
