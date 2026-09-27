import React, { useState } from 'react';
import { Product } from '../types';
import { X, Check, Flame, Clock, Sparkles, Shield, ShoppingBag } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedScent?: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedNote, setSelectedNote] = useState(product.scentNotes[0] || 'Original');
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.inStock === false;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity, selectedNote);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl apple-glass rounded-3xl border border-white/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button as Liquid Glass Pill */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 apple-glass-pill flex items-center justify-center text-[#5A5248] hover:text-[#24211D] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Image Canvas */}
        <div className="md:w-1/2 bg-[#F3EFEA]/80 relative flex items-center justify-center min-h-[260px] md:min-h-[420px]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover max-h-[380px] md:max-h-full"
          />
          <div className="absolute bottom-3 left-3 apple-glass-dark text-white text-[11px] px-3 py-1 rounded-full font-medium">
            {product.waxType}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category & Status */}
            <div className="flex items-center gap-2 text-xs text-[#8C5E35] font-semibold uppercase tracking-wider">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.scentFamily}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#24211D]">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold text-[#24211D] tabular-nums">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-sm text-[#9E9282] line-through tabular-nums">
                  ৳{product.originalPrice}
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOutOfStock ? 'text-red-700 bg-red-100/60' : 'text-emerald-800 bg-emerald-100/60'}`}>
                {isOutOfStock ? 'Currently Sold Out' : 'In Stock · Ready to Ship'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
              {product.description}
            </p>

            {/* Scent notes selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                Dominant Fragrance Note:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.scentNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
                      selectedNote === note
                        ? 'apple-glass-dark text-white'
                        : 'apple-glass-pill text-[#5A5248] hover:text-[#24211D]'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications Grid in Liquid Pods */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#EAE0D5]/70 text-xs text-[#5A5248]">
              <div className="apple-glass-card rounded-xl p-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="truncate">{product.burnTime}</span>
              </div>
              <div className="apple-glass-card rounded-xl p-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="truncate">{product.dimensions}</span>
              </div>
              <div className="apple-glass-card rounded-xl p-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="truncate">Pure Cotton Wick</span>
              </div>
              <div className="apple-glass-card rounded-xl p-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="truncate">Phthalate-Free Oils</span>
              </div>
            </div>
          </div>

          {/* Sticky Purchase Actions */}
          <div className="pt-6 border-t border-[#EAE0D5]/70 mt-6 flex items-center gap-3">
            {/* Quantity stepper pill */}
            <div className="flex items-center apple-glass-pill p-1">
              <button
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-sm text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                -
              </button>
              <span className="font-mono text-sm px-2.5 tabular-nums font-semibold text-[#24211D]">
                {quantity}
              </span>
              <button
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-sm text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                +
              </button>
            </div>

            {/* Add to Bag CTA */}
            <button
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 py-3 px-5 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isOutOfStock
                  ? 'bg-[#EAE0D5] text-[#9E9282] cursor-not-allowed'
                  : added
                  ? 'bg-emerald-700 text-white'
                  : 'apple-glass-dark text-white'
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag (৳{product.price * quantity})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
