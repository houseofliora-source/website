import React, { useState, useEffect } from 'react';
import { CartItem, CustomFavorItem, OrderRecord, StoreSettings } from '../types';
import { CustomerUser } from './CustomerAuthModal';
import { X, Trash2, ArrowRight, CheckCircle2, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customFavors: CustomFavorItem[];
  storeSettings: StoreSettings;
  currentUser?: CustomerUser | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onRemoveCustomFavor: (index: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (newOrder: OrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  customFavors,
  storeSettings,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveCustomFavor,
  onClearCart,
  onOrderPlaced,
}) => {
  if (!isOpen) return null;

  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerAddress && currentUser.address) setCustomerAddress(currentUser.address);
      if (currentUser.city === 'Outside Dhaka') setDeliveryArea('outside');
    }
  }, [currentUser]);

  // Computations
  const itemsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const customSubtotal = customFavors.reduce((acc, cf) => acc + cf.total, 0);
  const totalSubtotal = itemsSubtotal + customSubtotal;

  const deliveryFee = totalSubtotal > 0 
    ? (deliveryArea === 'dhaka' ? storeSettings.deliveryFeeDhaka : storeSettings.deliveryFeeOutside) 
    : 0;
  const grandTotal = totalSubtotal + deliveryFee;

  // Total advance required if custom orders present
  const totalAdvanceRequired = customFavors.reduce((acc, cf) => acc + cf.advanceRequired, 0);

  const minOrderAmount = storeSettings.minimumOrder || 200;
  const isBelowMin = totalSubtotal > 0 && totalSubtotal < minOrderAmount;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Please provide your full name, phone number, and delivery address.');
      return;
    }

    const newOrder: OrderRecord = {
      id: `HL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName,
      customerPhone,
      customerAddress,
      deliveryArea,
      paymentMethod,
      transactionId: transactionId || undefined,
      items: items.map(i => ({
        title: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        scent: i.selectedScent,
      })),
      customFavors: customFavors.length > 0 ? customFavors : undefined,
      subtotal: totalSubtotal,
      deliveryFee,
      grandTotal,
      advanceRequired: totalAdvanceRequired,
      status: 'Pending',
    };

    onOrderPlaced(newOrder);
    setConfirmedOrder(newOrder);
  };

  const handleFinish = () => {
    onClearCart();
    setConfirmedOrder(null);
    setShowCheckout(false);
    onClose();
  };

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
              {items.length + customFavors.length} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 apple-glass-pill flex items-center justify-center text-[#5A5248] hover:text-[#24211D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {confirmedOrder ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#8C5E35] uppercase tracking-wider font-mono apple-glass-pill px-3 py-1 inline-block">
                Order #{confirmedOrder.id}
              </span>
              <h4 className="font-serif text-2xl text-[#24211D]">
                Thank You! Order Confirmed
              </h4>
              <p className="text-xs text-[#5A5248] max-w-xs mx-auto">
                {confirmedOrder.customerName}, your artisanal candles are being queued for packaging. Our team will verify via phone shortly.
              </p>
            </div>

            <div className="w-full apple-glass-card p-4 rounded-2xl border border-white/70 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7A6F62]">Recipient:</span>
                <span className="font-medium text-[#24211D]">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6F62]">Address:</span>
                <span className="font-medium text-[#24211D] text-right max-w-[200px] truncate">{confirmedOrder.customerAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6F62]">Payment Method:</span>
                <span className="font-medium text-[#24211D] uppercase">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-[#EAE0D5]/70 flex justify-between font-bold text-sm text-[#24211D]">
                <span>Total Payable:</span>
                <span className="font-mono text-base">৳{confirmedOrder.grandTotal}</span>
              </div>
              {confirmedOrder.advanceRequired > 0 && (
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 mt-1">
                  Bespoke Favor 50% Advance: <strong>৳{confirmedOrder.advanceRequired}</strong> via bKash/Nagad.
                </div>
              )}
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <a
                href={`https://wa.me/?text=Hello%20House%20of%20Liora,%20I%20just%20placed%20order%20${confirmedOrder.id}%20for%20BDT%20${confirmedOrder.grandTotal}%20under%20the%20name%20${encodeURIComponent(confirmedOrder.customerName)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 apple-glass-dark text-white text-xs font-medium rounded-full transition-all block shadow-md"
              >
                Send Order Receipt to WhatsApp
              </a>

              <button
                onClick={handleFinish}
                className="w-full py-3 px-4 apple-glass-pill text-[#24211D] text-xs font-medium rounded-full transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : showCheckout ? (
          /* CHECKOUT FORM VIEW */
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-2">
              <h4 className="font-serif text-lg text-[#24211D]">
                Delivery & Payment Details
              </h4>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-xs text-[#8C5E35] hover:underline cursor-pointer"
              >
                ← Back to Cart
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Fahim"
                  className="w-full p-2.5 text-xs apple-glass-input rounded-xl focus:border-[#24211D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Phone Number (bKash / Contact) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX / 018XXXXXXXX"
                  className="w-full p-2.5 text-xs apple-glass-input rounded-xl focus:border-[#24211D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Full Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House, Road, Area, City, District"
                  className="w-full p-2.5 text-xs apple-glass-input rounded-xl focus:border-[#24211D]"
                />
              </div>

              {/* Delivery Zone Selection in Liquid Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Delivery Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('dhaka')}
                    className={`p-2.5 text-xs rounded-2xl border text-left cursor-pointer transition-all ${
                      deliveryArea === 'dhaka'
                        ? 'apple-glass-dark text-white shadow-sm'
                        : 'apple-glass-pill text-[#5A5248]'
                    }`}
                  >
                    <span className="font-semibold block">Inside Dhaka</span>
                    <span className="block font-mono text-[11px] opacity-90">৳{storeSettings.deliveryFeeDhaka}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside')}
                    className={`p-2.5 text-xs rounded-2xl border text-left cursor-pointer transition-all ${
                      deliveryArea === 'outside'
                        ? 'apple-glass-dark text-white shadow-sm'
                        : 'apple-glass-pill text-[#5A5248]'
                    }`}
                  >
                    <span className="font-semibold block">Outside Dhaka</span>
                    <span className="block font-mono text-[11px] opacity-90">৳{storeSettings.deliveryFeeOutside}</span>
                  </button>
                </div>
              </div>

              {/* Payment Method in Liquid Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Del.', sub: 'Pay on arrival' },
                    { id: 'bkash', label: 'bKash', sub: 'Personal' },
                    { id: 'nagad', label: 'Nagad', sub: 'Personal' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`p-2 rounded-2xl border text-left cursor-pointer transition-all ${
                        paymentMethod === p.id
                          ? 'apple-glass-dark text-white shadow-sm'
                          : 'apple-glass-pill text-[#5A5248]'
                      }`}
                    >
                      <p className="text-xs font-semibold">{p.label}</p>
                      <span className="text-[10px] opacity-80">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* bKash / Nagad instructions in Apple Liquid Glass Card */}
              {paymentMethod !== 'cod' && (
                <div className="p-3.5 apple-glass-card rounded-2xl border border-white/70 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#24211D]">
                      {paymentMethod === 'bkash' ? 'bKash Number:' : 'Nagad Number:'}
                    </span>
                    <span className="font-mono font-bold text-[#8C5E35]">
                      {paymentMethod === 'bkash' ? storeSettings.bkashNumber : storeSettings.nagadNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A5248]">
                    Send money and enter the Transaction ID below:
                  </p>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9JA2K81M"
                    className="w-full p-2 text-xs apple-glass-input rounded-xl uppercase font-mono"
                  />
                </div>
              )}

              {/* Cost Review */}
              <div className="pt-2 border-t border-[#EAE0D5]/70 text-xs space-y-1.5">
                <div className="flex justify-between text-[#5A5248]">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{totalSubtotal}</span>
                </div>
                <div className="flex justify-between text-[#5A5248]">
                  <span>Delivery ({deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span className="font-mono">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#24211D] pt-1.5 border-t border-[#EAE0D5]/70">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base">৳{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 apple-glass-dark text-white text-xs sm:text-sm font-medium rounded-full transition-all shadow-md cursor-pointer"
              >
                Confirm Order Now
              </button>
            </form>
          </div>
        ) : (
          /* CART ITEMS LIST VIEW */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
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
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 apple-glass-card rounded-2xl border border-white/70 flex gap-3 items-center shadow-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-white/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif text-sm font-medium text-[#24211D] truncate">
                        {item.product.name}
                      </h4>
                      {item.selectedScent && (
                        <p className="text-[11px] text-[#8C5E35] italic truncate">
                          Scent: {item.selectedScent}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center apple-glass-pill p-0.5 text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono tabular-nums font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
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
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#9E9282] hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

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
        )}

        {/* Footer Subtotal & Checkout Trigger in Apple Liquid Glass Bar */}
        {!confirmedOrder && !showCheckout && totalSubtotal > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/80 apple-glass space-y-3">
            {/* Delivery Destination in Liquid Pills */}
            <div className="flex items-center justify-between text-xs text-[#5A5248]">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Delivery Area:</span>
              </span>
              <div className="flex gap-1.5 apple-glass-pill p-1">
                <button
                  onClick={() => setDeliveryArea('dhaka')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    deliveryArea === 'dhaka'
                      ? 'apple-glass-dark text-white shadow-xs'
                      : 'text-[#5A5248] hover:text-[#24211D]'
                  }`}
                >
                  Dhaka (৳{storeSettings.deliveryFeeDhaka})
                </button>
                <button
                  onClick={() => setDeliveryArea('outside')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    deliveryArea === 'outside'
                      ? 'apple-glass-dark text-white shadow-xs'
                      : 'text-[#5A5248] hover:text-[#24211D]'
                  }`}
                >
                  Outside (৳{storeSettings.deliveryFeeOutside})
                </button>
              </div>
            </div>

            {/* Subtotal & Delivery Row */}
            <div className="space-y-1 text-xs text-[#5A5248]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-sm font-semibold text-[#24211D]">৳{totalSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery ({deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                <span className="font-mono text-xs">৳{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#24211D] pt-2 border-t border-[#EAE0D5]/70">
                <span>Grand Total:</span>
                <span className="font-mono text-lg">৳{grandTotal}</span>
              </div>
            </div>

            {/* Minimum Order Warning */}
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
                onClick={() => setShowCheckout(true)}
                className="w-full py-3.5 apple-glass-dark text-white text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
