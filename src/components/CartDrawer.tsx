import React from 'react';
import { CartItem, CustomFavorItem, StoreSettings, FragranceItem } from '../types';
import { CustomerUser } from './CustomerAuthModal';
import { X, Trash2, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { FragranceDropdown } from './FragranceDropdown';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customFavors: CustomFavorItem[];
  storeSettings: StoreSettings;
  currentUser?: CustomerUser | null;
  onUpdateQuantity: (lineKey: string, delta: number) => void;
  onRemoveItem: (lineKey: string) => void;
  onRemoveCustomFavor: (index: number) => void;
  onClearCart?: () => void;
  onProceedToCheckout: () => void;
  fragrances?: FragranceItem[];
  onChangeItemFragrance?: (lineKey: string, newFragrance: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  customFavors,
  storeSettings,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveCustomFavor,
  onProceedToCheckout,
  fragrances = [],
  onChangeItemFragrance,
}) => {
  if (!isOpen) return null;

  const activeFragrances = fragrances.filter(f => f.active);

  // Computations
  const itemsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const customSubtotal = customFavors.reduce((acc, cf) => acc + cf.total, 0);
  const totalSubtotal = itemsSubtotal + customSubtotal;

  const minOrderAmount = storeSettings.minimumOrder || 200;
  const isBelowMin = totalSubtotal > 0 && totalSubtotal < minOrderAmount;

  // Check if any cart item has an inactive or missing fragrance
  const invalidFragranceItems = items.filter(item => {
    const scent = item.selectedFragrance || item.selectedScent;
    return !scent || !activeFragrances.some(f => f.name.toLowerCase() === scent.toLowerCase());
  });

  const hasInvalidFragrance = invalidFragranceItems.length > 0;

  const handleCheckoutClick = () => {
    if (hasInvalidFragrance) {
      alert('One or more items in your cart have a fragrance that is no longer available. Please select an available fragrance before proceeding.');
      return;
    }
    onClose();
    onProceedToCheckout();
  };

  const totalItemCount = items.length + customFavors.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 backdrop-blur-md flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md apple-glass h-full shadow-2xl flex flex-col justify-between border-l border-white/80 relative animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE0D5]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl sm:text-2xl text-[#24211D]">
              Your Shopping Bag
            </h3>
            <span className="text-xs font-mono text-[#8C5E35] apple-glass-pill px-2.5 py-0.5">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 apple-glass-pill flex items-center justify-center text-[#5A5248] hover:text-[#24211D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CART ITEMS LIST VIEW */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 && customFavors.length === 0 ? (
            <div className="py-16 text-center space-y-3 apple-glass-card rounded-3xl p-8">
              <p className="text-sm text-[#7A6F62]">
                Your shopping bag is currently empty.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 apple-glass-dark text-white text-xs font-medium rounded-full cursor-pointer"
              >
                Explore Candle Collections
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Standard Catalog Items in Apple Liquid Glass Cards */}
              {items.map((item) => {
                const currentFragrance = item.selectedFragrance || item.selectedScent || '';
                const lineKey = `${item.product.id}:::${currentFragrance}`;
                const isFragranceActive = activeFragrances.some(
                  f => f.name.toLowerCase() === currentFragrance.toLowerCase()
                );

                return (
                  <div
                    key={lineKey}
                    className={`p-3 apple-glass-card rounded-2xl border ${
                      !isFragranceActive ? 'border-amber-300 bg-amber-50/30' : 'border-white/70'
                    } flex gap-3 items-center shadow-xs`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-white/60 shrink-0 bg-[#FAF8F5]"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif text-sm font-medium text-[#24211D] truncate">
                        {item.product.name}
                      </h4>

                      {/* Fragrance Display / Selector */}
                      <div className="pt-0.5 pb-0.5">
                        {onChangeItemFragrance && activeFragrances.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[11px] text-[#8C5E35] font-medium block">Fragrance:</span>
                            <FragranceDropdown
                              variant="compact"
                              label="Fragrance"
                              showDescription={false}
                              showChosenConfirmation={false}
                              fragrances={activeFragrances}
                              selectedFragrance={!isFragranceActive && currentFragrance ? `${currentFragrance} (Unavailable)` : currentFragrance}
                              onSelect={(newFrag) => onChangeItemFragrance(lineKey, newFrag)}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-[#24211D] font-medium">
                            <span className="text-[11px] text-[#8C5E35]">Fragrance: </span>
                            {currentFragrance || 'None selected'}
                          </p>
                        )}
                      </div>

                      {!isFragranceActive && (
                        <p className="text-[10px] text-amber-900 bg-amber-100/80 border border-amber-300 rounded px-1.5 py-0.5 font-medium leading-tight">
                          This fragrance is no longer available — please choose another
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center apple-glass-pill p-0.5 text-xs">
                          <button
                            onClick={() => onUpdateQuantity(lineKey, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono tabular-nums font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(lineKey, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-mono text-xs font-semibold text-[#24211D]">
                          ৳{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(lineKey)}
                      className="text-[#9E9282] hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {/* Custom Favors Batches in Apple Liquid Glass Cards */}
              {customFavors.map((cf, idx) => (
                <div
                  key={idx}
                  className="p-3.5 apple-glass-card rounded-2xl border border-white/80 space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-semibold text-[#8C5E35] uppercase tracking-wider font-mono apple-glass-pill px-2 py-0.5 inline-block">
                        BESPOKE EVENT ORDER
                      </span>
                      <h4 className="font-serif text-sm font-medium text-[#24211D] mt-1">
                        {cf.productTitle}
                      </h4>
                    </div>
                    <button
                      onClick={() => onRemoveCustomFavor(idx)}
                      className="text-[#9E9282] hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 cursor-pointer transition-colors"
                      title="Remove custom order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5A5248] leading-tight">
                    {cf.details}
                  </p>
                  <div className="pt-1 flex justify-between items-baseline text-xs border-t border-[#EAE0D5]/60">
                    <span className="text-[#8C5E35] font-medium">50% Advance: ৳{cf.advanceRequired}</span>
                    <span className="font-mono font-bold text-[#24211D]">Total: ৳{cf.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clean Footer: Only Subtotal & Proceed to Checkout */}
        {totalSubtotal > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/80 apple-glass space-y-3">
            <div className="flex justify-between items-baseline text-sm text-[#24211D]">
              <span className="font-medium text-[#5A5248]">Subtotal:</span>
              <span className="font-mono text-xl font-bold text-[#24211D]">৳{totalSubtotal}</span>
            </div>

            {/* Minimum Order Warning if applicable */}
            {isBelowMin ? (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">
                  ⚠️ Minimum Order Amount is ৳{minOrderAmount}
                </p>
                <p className="text-[11px] text-amber-800">
                  Please add ৳{minOrderAmount - totalSubtotal} more of candles to reach minimum checkout.
                </p>
              </div>
            ) : (
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 apple-glass-dark text-white text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
