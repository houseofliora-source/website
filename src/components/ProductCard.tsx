import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const isOutOfStock = product.inStock === false;

  // Format category badge label like "ROSE CANDLE" / "BUBBLE CANDLE"
  const tagLabel = product.isBestseller
    ? 'BESTSELLER'
    : product.isNewArrival
    ? 'NEW ARRIVAL'
    : `${product.category} CANDLE`;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col apple-glass-card rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]/80">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />

        {/* Minimalist Top Tag in Apple Liquid Glass Pill */}
        <span className="absolute top-3 left-3 apple-glass-pill px-2.5 py-1 text-[9px] sm:text-[10px] tracking-[0.2em] font-sans uppercase text-[#5A5248] font-medium shadow-xs">
          {tagLabel}
        </span>

        {isOutOfStock && (
          <span className="absolute top-3 right-3 apple-glass-pill px-2.5 py-1 text-[9px] sm:text-[10px] tracking-[0.15em] font-sans uppercase text-red-700 bg-red-50/80 border-red-200">
            Out of Stock
          </span>
        )}
      </div>

      {/* Minimalist Product Details (Name, Price & VIEW Button) */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between gap-2">
        <h3 className="font-serif text-base sm:text-lg font-normal text-[#24211D] group-hover:text-[#8C5E35] transition-colors line-clamp-1 leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-base sm:text-xl font-medium text-[#8C5E35] tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-[#A89E90] line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="apple-glass-pill group-hover:apple-glass-dark group-hover:text-white px-3 py-1 text-[10px] tracking-[0.2em] font-sans uppercase text-[#7A6F62] font-semibold transition-all cursor-pointer"
          >
            VIEW
          </button>
        </div>
      </div>
    </div>
  );
};
