import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, CheckCircle, Package, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { OrderRecord } from '../types';

export interface CustomerUser {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: 'Inside Dhaka' | 'Outside Dhaka';
  joinedAt: string;
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerUser | null;
  onSignIn: (user: CustomerUser) => void;
  onSignOut: () => void;
  orders: OrderRecord[];
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  orders,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<'Inside Dhaka' | 'Outside Dhaka'>('Inside Dhaka');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!name || !email || !password || !phone) {
        alert('Please fill in your name, email, password, and phone number.');
        return;
      }
      const newUser: CustomerUser = {
        name,
        email,
        phone,
        address: address || 'Dhaka, Bangladesh',
        city,
        joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };
      onSignIn(newUser);
    } else {
      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }
      // Demo sign in login
      const existingUser: CustomerUser = {
        name: email.split('@')[0].replace('.', ' '),
        email,
        phone: '017XXXXXXXX',
        address: 'House 12, Road 5, Dhaka',
        city: 'Inside Dhaka',
        joinedAt: 'September 2026',
      };
      onSignIn(existingUser);
    }
  };

  const userOrders = currentUser 
    ? orders.filter(o => o.customerPhone === currentUser.phone || o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg apple-glass rounded-3xl border border-white/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EAE0D5]/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 apple-glass-pill text-[10px] font-semibold uppercase tracking-widest text-[#8C5E35]">
              <User className="w-3.5 h-3.5" />
              <span>Líora Patron Circle</span>
            </div>
            <h3 className="font-serif text-2xl text-[#24211D]">
              {currentUser ? `Welcome, ${currentUser.name}` : mode === 'signin' ? 'Sign In to Your Account' : 'Create Customer Account'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 apple-glass-pill flex items-center justify-center text-[#5A5248] hover:text-[#24211D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {currentUser ? (
            /* Logged In Customer Profile View */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 apple-glass-card rounded-2xl border border-white/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full apple-glass-dark text-white flex items-center justify-center font-serif text-lg font-medium shadow-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-[#24211D]">{currentUser.name}</h4>
                      <p className="text-xs text-[#7A6F62]">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C5E35] apple-glass-pill px-2.5 py-1">
                    Member since {currentUser.joinedAt}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EAE0D5]/70 grid grid-cols-2 gap-2 text-xs text-[#5A5248]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                    <span>{currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8C5E35]" />
                    <span className="truncate">{currentUser.city}</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base text-[#24211D] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#8C5E35]" />
                    <span>Your Order History</span>
                  </h4>
                  <span className="text-xs text-[#7A6F62] font-mono">
                    {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-8 text-center apple-glass-card rounded-2xl space-y-2">
                    <p className="text-xs text-[#7A6F62]">
                      You haven't placed any candle orders yet.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 apple-glass-dark text-white text-xs font-medium rounded-full cursor-pointer"
                    >
                      Browse Candles
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userOrders.map(order => (
                      <div key={order.id} className="p-3 apple-glass-card rounded-xl border border-white/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#24211D]">{order.id}</span>
                          <span className="apple-glass-pill px-2 py-0.5 text-[10px] text-emerald-800 font-semibold">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[#5A5248] text-[11px] truncate">
                          {order.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                        </p>
                        <div className="flex justify-between pt-1 text-[11px] border-t border-[#EAE0D5]/60 text-[#7A6F62]">
                          <span>{order.createdAt}</span>
                          <span className="font-mono font-semibold text-[#24211D]">৳{order.grandTotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sign Out */}
              <div className="pt-2 border-t border-[#EAE0D5]/70 flex justify-between items-center">
                <button
                  onClick={onSignOut}
                  className="text-xs text-[#7A6F62] hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 apple-glass-dark text-white text-xs font-medium rounded-full cursor-pointer"
                >
                  Back to Boutique
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Sign In / Sign Up) */
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {/* Segmented Mode Control in Liquid Pill */}
              <div className="apple-glass-pill p-1 flex gap-1 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    mode === 'signin' ? 'apple-glass-dark text-white shadow-xs' : 'text-[#5A5248] hover:text-[#24211D]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    mode === 'signup' ? 'apple-glass-dark text-white shadow-xs' : 'text-[#5A5248] hover:text-[#24211D]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D] block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Raisa Ahmed"
                    className="w-full p-2.5 apple-glass-input rounded-xl focus:border-[#24211D]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-[#24211D] block">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 apple-glass-input rounded-xl focus:border-[#24211D]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#24211D] block">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 apple-glass-input rounded-xl focus:border-[#24211D]"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D] block">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full p-2.5 apple-glass-input rounded-xl focus:border-[#24211D]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 apple-glass-dark text-white font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
              >
                <span>{mode === 'signin' ? 'Sign In to Boutique' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A6F62] pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Your customer data is encrypted and confidential.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
