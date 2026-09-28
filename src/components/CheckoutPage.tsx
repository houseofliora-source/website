import React, { useState, useEffect } from 'react';
import { CartItem, CustomFavorItem, OrderRecord, StoreSettings } from '../types';
import { CustomerUser } from './CustomerAuthModal';
import { 
  ArrowLeft, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  Check, 
  Clock, 
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';

interface CheckoutPageProps {
  items: CartItem[];
  customFavors: CustomFavorItem[];
  storeSettings: StoreSettings;
  currentUser?: CustomerUser | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onRemoveCustomFavor: (index: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (newOrder: OrderRecord) => void;
  onNavigateHome: () => void;
  onOpenAuth: () => void;
}

import { BANGLADESH_DISTRICTS, DISTRICT_THANAS } from '../data/bangladeshGeo';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  customFavors,
  storeSettings,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveCustomFavor,
  onClearCart,
  onOrderPlaced,
  onNavigateHome,
  onOpenAuth,
}) => {
  // Form fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [district, setDistrict] = useState(currentUser?.city === 'Outside Dhaka' ? 'Chattogram' : 'Dhaka');
  const [thana, setThana] = useState('');
  const [customThana, setCustomThana] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>(
    district.toLowerCase().includes('dhaka') ? 'dhaka' : 'outside'
  );

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Coupon / Promo Voucher
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percent' | 'flat' } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Special notes & terms
  const [specialNotes, setSpecialNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Order submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  // Sync user info if auth changes
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerEmail && currentUser.email) setCustomerEmail(currentUser.email);
      if (!customerAddress && currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  // Sync delivery area when district changes
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setThana('');
    setCustomThana('');
    if (newDistrict.toLowerCase() === 'dhaka') {
      setDeliveryArea('dhaka');
    } else {
      setDeliveryArea('outside');
    }
  };

  // Computations
  const itemsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const customSubtotal = customFavors.reduce((acc, cf) => acc + cf.total, 0);
  const totalSubtotal = itemsSubtotal + customSubtotal;

  const deliveryFee = totalSubtotal > 0
    ? (deliveryArea === 'dhaka' ? storeSettings.deliveryFeeDhaka : storeSettings.deliveryFeeOutside)
    : 0;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((totalSubtotal * appliedCoupon.discount) / 100);
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const grandTotal = Math.max(0, totalSubtotal + deliveryFee - discountAmount);
  const totalAdvanceRequired = customFavors.reduce((acc, cf) => acc + cf.advanceRequired, 0);

  const minOrderAmount = storeSettings.minimumOrder || 200;
  const isBelowMin = totalSubtotal > 0 && totalSubtotal < minOrderAmount;

  // Apply Coupon Logic
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    if (code === 'LIORA10' || code === 'WELCOME10') {
      setAppliedCoupon({ code, discount: 10, type: 'percent' });
      setCouponInput('');
    } else if (code === 'MR30') {
      setAppliedCoupon({ code, discount: 10, type: 'percent' });
      setCouponInput('');
    } else if (code === 'CANDLE50') {
      setAppliedCoupon({ code, discount: 50, type: 'flat' });
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try LIORA10 or MR30');
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 && customFavors.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    const finalThana = thana === 'Other' ? customThana.trim() : thana.trim();
    if (!customerName.trim() || !customerPhone.trim() || !district.trim() || !finalThana || !customerAddress.trim()) {
      alert('Please fill in your Name, Contact Phone Number, District, Thana/Upazila, and Full Delivery Address.');
      return;
    }

    if (!agreedTerms) {
      alert('Please agree to the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId) {
      alert(`Please provide the ${paymentMethod.toUpperCase()} Transaction ID (TrxID) for verification.`);
      return;
    }

    setIsSubmitting(true);

    const newOrder: OrderRecord = {
      id: `HL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerAddress: `${customerAddress.trim()}, ${finalThana}, ${district}`,
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
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCoupon?.code,
      grandTotal,
      advanceRequired: totalAdvanceRequired,
      specialNotes: specialNotes || undefined,
      district,
      status: 'Pending',
    };

    onOrderPlaced(newOrder);
    setConfirmedOrder(newOrder);
    setIsSubmitting(false);
  };

  const handleFinish = () => {
    onClearCart();
    setConfirmedOrder(null);
    onNavigateHome();
  };

  // ---------------------------------------------------------------------------
  // CONFIRMATION SUCCESS VIEW
  // ---------------------------------------------------------------------------
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 animate-fade-in text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-md border border-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-700" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#8C5E35] uppercase tracking-widest font-mono apple-glass-pill px-4 py-1.5 inline-block">
            Order #{confirmedOrder.id}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
            Thank You, {confirmedOrder.customerName}!
          </h1>
          <p className="text-sm text-[#5A5248] max-w-lg mx-auto">
            Your artisanal botanical order has been successfully placed and recorded. Our atelier team will verify your package and dispatch via express courier shortly.
          </p>
        </div>

        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 border border-white/80 text-left text-xs sm:text-sm space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#EAE0D5] pb-3">
            <span className="text-[#7A6F62]">Order Status:</span>
            <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-semibold text-xs">
              Pending Verification
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[#7A6F62] block mb-1">Delivery Destination:</span>
              <p className="font-medium text-[#24211D]">{confirmedOrder.customerAddress}</p>
              <p className="text-[#7A6F62] text-xs mt-0.5">Phone: {confirmedOrder.customerPhone}</p>
            </div>
            <div>
              <span className="text-[#7A6F62] block mb-1">Payment Selection:</span>
              <p className="font-medium text-[#24211D] uppercase">
                {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (Pay at doorstep)' : `${confirmedOrder.paymentMethod.toUpperCase()} Mobile Payment`}
              </p>
              {confirmedOrder.transactionId && (
                <p className="text-[#8C5E35] text-xs font-mono mt-0.5">TrxID: {confirmedOrder.transactionId}</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE0D5] space-y-2">
            <span className="text-[#7A6F62] block font-semibold">Items Ordered:</span>
            {confirmedOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span>
                  {it.title} {it.scent ? `(${it.scent})` : ''} × {it.quantity}
                </span>
                <span className="font-mono font-medium text-[#24211D]">৳{it.price * it.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EAE0D5] space-y-1">
            <div className="flex justify-between text-xs text-[#7A6F62]">
              <span>Subtotal:</span>
              <span className="font-mono">৳{confirmedOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-[#7A6F62]">
              <span>Delivery Fee ({confirmedOrder.deliveryArea === 'dhaka' ? 'Dhaka' : 'Outside Dhaka'}):</span>
              <span className="font-mono">৳{confirmedOrder.deliveryFee}</span>
            </div>
            {confirmedOrder.discountAmount && confirmedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-mono">-৳{confirmedOrder.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#24211D] pt-2 border-t border-[#EAE0D5]">
              <span>Total Payable:</span>
              <span className="font-mono text-xl text-[#8C5E35]">৳{confirmedOrder.grandTotal}</span>
            </div>
          </div>

          {confirmedOrder.advanceRequired > 0 && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900">
              ⚠️ Custom Event Favors 50% Advance: <strong>৳{confirmedOrder.advanceRequired}</strong> via bKash/Nagad.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/?text=Hello%20House%20of%20Liora,%20I%20just%20placed%20order%20${confirmedOrder.id}%20for%20BDT%20${confirmedOrder.grandTotal}%20under%20the%20name%20${encodeURIComponent(confirmedOrder.customerName)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Send Order to WhatsApp</span>
          </a>

          <button
            onClick={handleFinish}
            className="w-full sm:w-auto px-8 py-3.5 apple-glass-pill hover:bg-white text-[#24211D] rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-xs border border-[#8C5E35]/40"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY CART STATE
  // ---------------------------------------------------------------------------
  if (items.length === 0 && customFavors.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#24211D]">Your Bag is Empty</h2>
        <p className="text-sm text-[#7A6F62]">
          There are no artisanal candle items in your bag. Please select pieces from our collection to checkout.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-4 px-8 py-3 apple-glass-dark text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-md cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // FULL CHECKOUT PAGE (MATCHING DEMO IMAGE 3)
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Top Banner Notice (Matching Demo Top Bar) */}
      <div className="apple-glass-card rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border border-[#EAE0D5]">
        <button
          onClick={onNavigateHome}
          className="text-xs text-[#8C5E35] hover:text-[#24211D] flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Collection</span>
        </button>

        {!currentUser ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5A5248]">
              Have an account? Please login or register:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1 text-xs apple-glass-pill hover:bg-white text-[#24211D] rounded-full border border-[#D8CEBE] font-medium cursor-pointer transition-all"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1 text-xs apple-glass-dark text-white rounded-full font-medium cursor-pointer shadow-xs transition-all"
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#24211D] font-medium">
            <User className="w-3.5 h-3.5 text-[#8C5E35]" />
            <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.phone || currentUser.email})</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Order Review, Shipping Address, Billing Address        */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. ORDER REVIEW (Matching Demo Section 1) */}
          <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-[#EAE0D5] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
              <h3 className="font-serif text-xl sm:text-2xl text-[#24211D] flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#8C5E35] rounded-full inline-block" />
                <span>Order review</span>
              </h3>
              <span className="text-xs font-mono text-[#8C5E35] apple-glass-pill px-3 py-1">
                {items.length + customFavors.length} items
              </span>
            </div>

            <div className="space-y-3 divide-y divide-[#EAE0D5]/70">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl border border-white/80 shrink-0 bg-[#FAF8F5]"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-medium text-[#24211D] truncate">
                        {item.product.name}
                      </h4>
                      {item.selectedScent && (
                        <p className="text-[11px] text-[#8C5E35] italic truncate">
                          Scent: {item.selectedScent}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-[#7A6F62]">Qty:</span>
                        <div className="flex items-center apple-glass-pill p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono tabular-nums font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-white/80 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-semibold text-[#24211D]">
                      ৳{item.product.price * item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-[#9E9282] hover:text-red-700 rounded-full hover:bg-red-50 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {customFavors.map((cf, idx) => (
                <div key={idx} className="pt-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-[#8C5E35] uppercase font-mono apple-glass-pill px-2 py-0.5">
                      BESPOKE EVENT ORDER
                    </span>
                    <h4 className="font-serif text-sm font-medium text-[#24211D] mt-1">
                      {cf.productTitle}
                    </h4>
                    <p className="text-[11px] text-[#5A5248]">{cf.details}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#24211D]">৳{cf.total}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomFavor(idx)}
                      className="p-1.5 text-[#9E9282] hover:text-red-700 rounded-full hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. SHIPPING ADDRESS (Matching Demo Section 2) */}
          <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-[#EAE0D5] space-y-4 shadow-sm">
            <div className="border-b border-[#EAE0D5] pb-3">
              <h3 className="font-serif text-xl sm:text-2xl text-[#24211D] flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#8C5E35] rounded-full inline-block" />
                <span>Shipping Address</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Row 1: Full Name & Phone Number (Both Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-[#24211D] block">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Fahim"
                    className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#24211D] block">
                    Phone Number (bKash / Contact) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#F5F1EB] border border-r-0 border-[#EAE0D5] rounded-l-xl text-xs font-mono text-[#5A5248]">
                      +88
                    </span>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 apple-glass-input rounded-r-xl rounded-l-none focus:border-[#8C5E35] text-xs font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email Address (Optional) */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#24211D] block">
                  Email Address <span className="text-[#7A6F62] font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@gmail.com (Optional)"
                  className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans"
                />
              </div>

              {/* Row 3: Select District & Thana/Upazila (Both Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-[#24211D] block">
                    Select District *
                  </label>
                  <select
                    required
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans bg-white cursor-pointer"
                  >
                    <option value="Dhaka">
                      Dhaka (Inside Dhaka - ৳{storeSettings.deliveryFeeDhaka})
                    </option>
                    {BANGLADESH_DISTRICTS.filter(d => d !== 'Dhaka').map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} (Outside Dhaka - ৳{storeSettings.deliveryFeeOutside})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#24211D] block">
                    Select Thana / Upazila *
                  </label>
                  <select
                    required
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- Select Thana / Upazila * --</option>
                    {(DISTRICT_THANAS[district] || []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Other">Other / Area Not Listed</option>
                  </select>

                  {thana === 'Other' && (
                    <input
                      type="text"
                      required
                      value={customThana}
                      onChange={(e) => setCustomThana(e.target.value)}
                      placeholder="Type your Thana / Upazila name *"
                      className="w-full mt-2 px-3.5 py-2 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans animate-fade-in"
                    />
                  )}
                </div>
              </div>

              {/* Row 4: Full Delivery Address (Required) */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#24211D] block">
                  Full Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House no., Building / Street / Road, Area details"
                  className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Payment, Destination, Coupons, Cost Summary, Order CTA */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4. PAYMENT METHOD (Matching Demo Section 4) */}
          <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-[#EAE0D5] space-y-4 shadow-sm">
            <div className="border-b border-[#EAE0D5] pb-3">
              <h3 className="font-serif text-xl sm:text-2xl text-[#24211D] flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#8C5E35] rounded-full inline-block" />
                <span>Payment method</span>
              </h3>
            </div>

            <div className="space-y-3">
              {/* Cash On Delivery Option */}
              <label 
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'apple-glass-card border-[#8C5E35] bg-white/90 shadow-sm'
                    : 'border-[#EAE0D5] hover:border-[#8C5E35]/50 bg-white/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-[#8C5E35] bg-[#8C5E35]' : 'border-[#A89E90]'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#24211D] block">Cash On Delivery</span>
                    <span className="text-[11px] text-[#7A6F62]">Pay with cash upon doorstep delivery</span>
                  </div>
                </div>
                <Truck className="w-4 h-4 text-[#8C5E35]" />
              </label>

              {/* bKash Option */}
              <label 
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'apple-glass-card border-[#E2136E] bg-white/90 shadow-sm'
                    : 'border-[#EAE0D5] hover:border-[#E2136E]/50 bg-white/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]' : 'border-[#A89E90]'
                  }`}>
                    {paymentMethod === 'bkash' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#24211D] block">bKash Mobile Payment</span>
                    <span className="text-[11px] text-[#7A6F62]">Send Money / Personal Wallet</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#E2136E]">
                  bKash
                </span>
              </label>

              {/* Nagad Option */}
              <label 
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'apple-glass-card border-[#F7941D] bg-white/90 shadow-sm'
                    : 'border-[#EAE0D5] hover:border-[#F7941D]/50 bg-white/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'nagad' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#A89E90]'
                  }`}>
                    {paymentMethod === 'nagad' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#24211D] block">Nagad Mobile Payment</span>
                    <span className="text-[11px] text-[#7A6F62]">Send Money / Personal Wallet</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#F7941D]">
                  Nagad
                </span>
              </label>

              {/* Conditional Instructions for bKash / Nagad */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="p-4 bg-white/80 rounded-2xl border border-[#EAE0D5] space-y-3 text-xs animate-fade-in">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#24211D]">
                      {paymentMethod === 'bkash' ? 'bKash Personal' : 'Nagad Personal'} Number:
                    </p>
                    <p className="font-mono text-base font-bold text-[#8C5E35]">
                      {paymentMethod === 'bkash' 
                        ? (storeSettings.bkashNumber || '01700000000') 
                        : (storeSettings.nagadNumber || storeSettings.bkashNumber || '01700000000')}
                    </p>
                    <p className="text-[11px] text-[#7A6F62]">
                      Please Send Money (৳{grandTotal}) to this number and provide the Transaction ID below:
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-[#24211D] block">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 9K28XA89B"
                      className="w-full px-3.5 py-2 apple-glass-input rounded-xl focus:border-[#8C5E35] text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* 6. HAVE ANY COUPON OR GIFT VOUCHER? (Matching Demo Section 6) */}
          <div className="apple-glass-card rounded-3xl p-5 border border-[#EAE0D5] space-y-3 shadow-xs">
            <span className="font-serif text-base text-[#24211D] block">
              Have any coupon or gift voucher?
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter Coupon"
                className="flex-1 px-3.5 py-2 apple-glass-input rounded-xl text-xs uppercase font-mono focus:border-[#8C5E35]"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                className="px-4 py-2 bg-[#8C5E35] hover:bg-[#A36E3F] text-white rounded-xl text-xs font-semibold tracking-wider uppercase cursor-pointer shadow-xs transition-colors"
              >
                Apply coupon
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] text-red-600">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{appliedCoupon.code} applied (-৳{discountAmount})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-emerald-700 hover:text-emerald-900 underline text-[11px] cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Demo Eligible Promo Codes pill (Matching Demo Image 3) */}
            <div className="pt-1">
              <span className="text-[11px] text-[#7A6F62] block mb-1.5 font-medium">Eligible promo codes:</span>
              <button
                type="button"
                onClick={() => handleApplyCoupon('LIORA10')}
                className="px-3 py-1.5 border border-dashed border-[#8C5E35] bg-[#FAF8F5] hover:bg-[#EAE0D5]/50 rounded-lg text-left transition-colors cursor-pointer group"
              >
                <span className="font-mono text-xs font-bold text-[#8C5E35] block">LIORA10</span>
                <span className="text-[10px] text-[#5A5248]">Flat 10% OFF</span>
              </button>
            </div>
          </div>

          {/* 7. COST SUMMARY TOTALS (Matching Demo Section 7) */}
          <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-[#EAE0D5] space-y-3 shadow-xs">
            <div className="space-y-2 text-xs text-[#5A5248]">
              <div className="flex justify-between items-center">
                <span>Sub total</span>
                <span className="font-mono font-medium text-[#24211D]">৳{totalSubtotal} BDT</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery ({deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-mono font-medium text-[#24211D]">৳{deliveryFee} BDT</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-800">
                  <span>Coupon discount</span>
                  <span className="font-mono font-medium">-৳{discountAmount} BDT</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#EAE0D5] flex justify-between items-baseline font-bold text-base text-[#24211D]">
                <span>Total</span>
                <span className="font-mono text-2xl text-[#8C5E35]">৳{grandTotal} BDT</span>
              </div>
            </div>
          </div>

          {/* 8. SPECIAL NOTES (OPTIONAL) (Matching Demo Section 8) */}
          <div className="apple-glass-card rounded-3xl p-5 border border-[#EAE0D5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-serif text-base text-[#24211D] flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#8C5E35] rounded-full inline-block" />
                <span>Special notes (Optional)</span>
              </span>
              <span className="text-[10px] font-mono text-[#7A6F62]">{specialNotes.length}/90 characters</span>
            </div>

            <textarea
              maxLength={90}
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Gift message, doorstep delivery timing or packaging requests"
              className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans leading-relaxed focus:border-[#8C5E35]"
            />
          </div>

          {/* 9. TERMS AGREEMENT & 10. PLACE ORDER CTA (Matching Demo Section 9 & 10) */}
          <div className="space-y-4 pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#5A5248] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#8C5E35] focus:ring-[#8C5E35] accent-[#8C5E35] shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="leading-snug">
                I have read and agree to the{' '}
                <span className="text-[#8C5E35] underline font-medium">Terms and Conditions</span>,{' '}
                <span className="text-[#8C5E35] underline font-medium">Privacy Policy</span> &amp;{' '}
                <span className="text-[#8C5E35] underline font-medium">Refund and Return Policy</span>.
              </span>
            </label>

            {isBelowMin ? (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">⚠️ Minimum Order Amount is ৳{minOrderAmount}</p>
                <p className="text-[11px] text-amber-800">
                  Please add ৳{minOrderAmount - totalSubtotal} more of candles to place order.
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#8C5E35] hover:bg-[#24211D] text-white rounded-full font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'PLACING ORDER...' : `PLACE ORDER · ৳${grandTotal} BDT`}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
