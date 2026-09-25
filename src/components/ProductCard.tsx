import React from 'react';
import { Product } from '../types';
import { Plus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const isOutOfStock = product.inStock === false;

  return (
    <div className="group relative flex flex-col bg-[#FAF8F5] border border-[#EAE0D5] rounded-md overflow-hidden hover:border-[#D8CEBE] hover:shadow-md transition-all duration-300">
      {/* Product Image Stage */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative aspect-4/3 sm:aspect-1/1 w-full overflow-hidden bg-[#F3EFEA] cursor-pointer"
      >
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

        {/* Quiet editorial text tag */}
        {product.isBestseller && (
          <span className="absolute top-3 left-3 text-[11px] font-medium tracking-wider uppercase text-[#24211D] bg-[#FAF8F5]/90 backdrop-blur-sm px-2 py-0.5 rounded-sm">
            Bestseller
          </span>
        )}
        {product.isNewArrival && !product.isBestseller && (
          <span className="absolute top-3 left-3 text-[11px] font-medium tracking-wider uppercase text-[#8C5E35] bg-[#FAF8F5]/90 backdrop-blur-sm px-2 py-0.5 rounded-sm">
            New Arrival
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 right-3 text-[11px] font-medium tracking-wider uppercase text-red-700 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-red-200">
            Out of Stock
          </span>
        )}

        {/* Quick view hover action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label="Quick View"
          className="absolute bottom-3 right-3 p-2 bg-[#FAF8F5]/95 text-[#24211D] hover:bg-white rounded-md shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C5E35] font-medium">
            <span className="capitalize">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.scentFamily}</span>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif text-lg font-medium text-[#24211D] hover:text-[#8C5E35] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#7A6F62] line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Scent notes inline */}
          <div className="pt-1 text-[11px] text-[#8C5E35] italic flex flex-wrap gap-1">
            <span>Notes:</span>
            <span>{product.scentNotes.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-[#24211D] tabular-nums">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-[#9E9282] line-through tabular-nums">
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isOutOfStock 
                ? 'bg-[#EAE0D5] text-[#9E9282] cursor-not-allowed'
                : 'bg-[#24211D] hover:bg-[#3D3730] text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
