import React, { useState, useEffect } from 'react';
import { CartItem, CustomFavorItem, OrderRecord, StoreSettings } from '../types';
import { CustomerUser } from './CustomerAuthModal';
import { X, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Truck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#EAE0D5] relative animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl text-[#24211D]">
              Your Shopping Bag
            </h3>
            <span className="text-xs font-mono text-[#8C5E35] bg-[#EAE0D5] px-2 py-0.5 rounded">
              {items.length + customFavors.length} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {confirmedOrder ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#8C5E35] uppercase tracking-wider font-mono">
                Order #{confirmedOrder.id}
              </span>
              <h4 className="font-serif text-2xl text-[#24211D]">
                Thank You! Order Confirmed
              </h4>
              <p className="text-xs text-[#5A5248] max-w-xs mx-auto">
                {confirmedOrder.customerName}, your artisanal candles are being queued for packaging. Our team will verify via phone shortly.
              </p>
            </div>

            <div className="w-full bg-[#F5F1EB] p-4 rounded-md border border-[#EAE0D5] text-left text-xs space-y-2">
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
              <div className="pt-2 border-t border-[#EAE0D5] flex justify-between font-bold text-sm text-[#24211D]">
                <span>Total Payable:</span>
                <span className="font-mono">৳{confirmedOrder.grandTotal}</span>
              </div>
              {confirmedOrder.advanceRequired > 0 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 mt-1">
                  Bespoke Favor 50% Advance: <strong>৳{confirmedOrder.advanceRequired}</strong> via bKash/Nagad.
                </div>
              )}
            </div>

            <div className="w-full space-y-2 pt-2">
              <a
                href={`https://wa.me/?text=Hello%20House%20of%20Liora,%20I%20just%20placed%20order%20${confirmedOrder.id}%20for%20BDT%20${confirmedOrder.grandTotal}%20under%20the%20name%20${encodeURIComponent(confirmedOrder.customerName)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-medium rounded transition-colors block"
              >
                Send Order Receipt to WhatsApp
              </a>

              <button
                onClick={handleFinish}
                className="w-full py-2.5 px-4 bg-white border border-[#D8CEBE] hover:bg-[#F3EFEA] text-[#24211D] text-xs font-medium rounded transition-colors cursor-pointer"
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
                  className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
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
                  className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
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
                  className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
                />
              </div>

              {/* Delivery Zone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Delivery Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('dhaka')}
                    className={`p-2.5 text-xs rounded border text-left cursor-pointer transition-all ${
                      deliveryArea === 'dhaka'
                        ? 'border-[#24211D] bg-[#F5F1EB] font-semibold text-[#24211D]'
                        : 'border-[#D8CEBE] bg-white text-[#5A5248]'
                    }`}
                  >
                    <span>Inside Dhaka</span>
                    <span className="block font-mono text-[11px] text-[#8C5E35]">৳{storeSettings.deliveryFeeDhaka}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside')}
                    className={`p-2.5 text-xs rounded border text-left cursor-pointer transition-all ${
                      deliveryArea === 'outside'
                        ? 'border-[#24211D] bg-[#F5F1EB] font-semibold text-[#24211D]'
                        : 'border-[#D8CEBE] bg-white text-[#5A5248]'
                    }`}
                  >
                    <span>Outside Dhaka</span>
                    <span className="block font-mono text-[11px] text-[#8C5E35]">৳{storeSettings.deliveryFeeOutside}</span>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay on arrival' },
                    { id: 'bkash', label: 'bKash', sub: 'Personal transfer' },
                    { id: 'nagad', label: 'Nagad', sub: 'Personal transfer' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        paymentMethod === p.id
                          ? 'border-[#24211D] bg-[#F5F1EB] font-semibold text-[#24211D]'
                          : 'border-[#D8CEBE] bg-white text-[#5A5248]'
                      }`}
                    >
                      <p className="text-xs">{p.label}</p>
                      <span className="text-[10px] text-[#7A6F62]">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* bKash / Nagad instructions */}
              {paymentMethod !== 'cod' && (
                <div className="p-3 bg-[#F5F1EB] border border-[#D8CEBE] rounded-md text-xs space-y-2">
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
                    className="w-full p-2 text-xs bg-white border border-[#D8CEBE] rounded uppercase font-mono"
                  />
                </div>
              )}

              {/* Cost Review */}
              <div className="pt-2 border-t border-[#EAE0D5] text-xs space-y-1.5">
                <div className="flex justify-between text-[#5A5248]">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{totalSubtotal}</span>
                </div>
                <div className="flex justify-between text-[#5A5248]">
                  <span>Delivery ({deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span className="font-mono">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#24211D] pt-1 border-t border-[#EAE0D5]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base">৳{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs sm:text-sm font-medium rounded transition-colors shadow-sm cursor-pointer"
              >
                Confirm Order Now
              </button>
            </form>
          </div>
        ) : (
          /* CART ITEMS LIST VIEW */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {items.length === 0 && customFavors.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm text-[#7A6F62]">
                  Your shopping bag is currently empty.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#24211D] text-white text-xs font-medium rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
                >
                  Explore Candle Collections
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Standard Catalog Items */}
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white rounded-md border border-[#EAE0D5] flex gap-3 items-center"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border border-[#EAE0D5]"
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
                        <div className="flex items-center border border-[#D8CEBE] rounded text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2 py-0.5 text-[#5A5248] hover:bg-[#F3EFEA] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="px-2 py-0.5 text-[#5A5248] hover:bg-[#F3EFEA] cursor-pointer"
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
                      className="text-[#9E9282] hover:text-red-700 p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Custom Favors Batches */}
                {customFavors.map((cf, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F5F1EB] rounded-md border border-[#D8CEBE] space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-semibold text-[#8C5E35] uppercase tracking-wider font-mono">
                          BESPOKE EVENT ORDER
                        </span>
                        <h4 className="font-serif text-sm font-medium text-[#24211D]">
                          {cf.productTitle}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveCustomFavor(idx)}
                        className="text-[#9E9282] hover:text-red-700 p-1 cursor-pointer"
                        title="Remove custom order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5A5248] leading-tight">
                      {cf.details}
                    </p>
                    <div className="pt-1 flex justify-between items-baseline text-xs">
                      <span className="text-[#8C5E35] font-medium">50% Advance: ৳{cf.advanceRequired}</span>
                      <span className="font-mono font-bold text-[#24211D]">Total: ৳{cf.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Subtotal & Checkout Trigger */}
        {!confirmedOrder && !showCheckout && totalSubtotal > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAE0D5] bg-[#F5F1EB] space-y-3">
            {/* Delivery Destination */}
            <div className="flex items-center justify-between text-xs text-[#5A5248]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Delivery Area:</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeliveryArea('dhaka')}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    deliveryArea === 'dhaka'
                      ? 'bg-[#24211D] text-white font-medium'
                      : 'bg-white text-[#5A5248] border border-[#D8CEBE]'
                  }`}
                >
                  Dhaka (৳{storeSettings.deliveryFeeDhaka})
                </button>
                <button
                  onClick={() => setDeliveryArea('outside')}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    deliveryArea === 'outside'
                      ? 'bg-[#24211D] text-white font-medium'
                      : 'bg-white text-[#5A5248] border border-[#D8CEBE]'
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
              <div className="flex justify-between text-base font-bold text-[#24211D] pt-2 border-t border-[#EAE0D5]">
                <span>Grand Total:</span>
                <span className="font-mono text-lg">৳{grandTotal}</span>
              </div>
            </div>

            {/* Minimum Order Warning */}
            {isBelowMin ? (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 space-y-1">
                <p className="font-medium">
                  ⚠️ Minimum Order Amount is ৳{minOrderAmount}
                </p>
                <p className="text-[11px] text-amber-800">
                  Please add ৳{minOrderAmount - totalSubtotal} more of candles to reach minimum checkout.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs sm:text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A6F62]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C5E35]" />
              <span>COD Available Nationwide · Verified bKash & Nagad</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
