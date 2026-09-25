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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#5A5248] hover:text-[#24211D] bg-[#FAF8F5]/80 hover:bg-[#EAE0D5] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Canvas */}
        <div className="md:w-1/2 bg-[#F3EFEA] relative flex items-center justify-center min-h-[260px] md:min-h-[420px]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover max-h-[380px] md:max-h-full"
          />
          <div className="absolute bottom-3 left-3 bg-[#24211D]/80 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded">
            {product.waxType}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category & Status */}
            <div className="flex items-center gap-2 text-xs text-[#8C5E35] font-medium uppercase tracking-wider">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.scentFamily}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl font-medium text-[#24211D]">
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
              <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-700' : 'text-emerald-800'}`}>
                {isOutOfStock ? 'Currently Sold Out' : 'In Stock · Ready to Ship'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
              {product.description}
            </p>

            {/* Scent notes selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                Dominant Fragrance Note:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.scentNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all cursor-pointer ${
                      selectedNote === note
                        ? 'border-[#24211D] bg-[#24211D] text-white'
                        : 'border-[#D8CEBE] bg-[#FAF8F5] text-[#5A5248] hover:border-[#8C5E35]'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE0D5] text-xs text-[#5A5248]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>{product.burnTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>{product.dimensions}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Pure Cotton Wick</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Phthalate-Free Oils</span>
              </div>
            </div>
          </div>

          {/* Sticky Purchase Actions */}
          <div className="pt-6 border-t border-[#EAE0D5] mt-6 flex items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center border border-[#D8CEBE] rounded bg-white">
              <button
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2.5 py-2 text-sm text-[#5A5248] hover:bg-[#F3EFEA] transition-colors cursor-pointer disabled:opacity-50"
              >
                -
              </button>
              <span className="font-mono text-sm px-3 tabular-nums font-medium text-[#24211D]">
                {quantity}
              </span>
              <button
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2.5 py-2 text-sm text-[#5A5248] hover:bg-[#F3EFEA] transition-colors cursor-pointer disabled:opacity-50"
              >
                +
              </button>
            </div>

            {/* Add to Bag CTA */}
            <button
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-medium rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isOutOfStock
                  ? 'bg-[#EAE0D5] text-[#9E9282] cursor-not-allowed'
                  : added
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#24211D] hover:bg-[#3D3730] text-white'
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
