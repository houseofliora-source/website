import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, CheckCircle, Package, LogOut, ArrowRight, ShieldCheck, Upload, Sparkles } from 'lucide-react';
import { OrderRecord } from '../types';
import { updateStoreFaviconInFirestore } from '../services/firebase';

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
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [faviconSuccessMsg, setFaviconSuccessMsg] = useState('');
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    setFaviconSuccessMsg('');

    try {
      if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          setFaviconPreview(content);
          await updateStoreFaviconInFirestore(content);
          setUploadingFavicon(false);
          setFaviconSuccessMsg('Favicon updated & saved to Cloud successfully!');
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          setFaviconPreview(dataUrl);
          await updateStoreFaviconInFirestore(dataUrl);
          setUploadingFavicon(false);
          setFaviconSuccessMsg('Favicon updated & saved to Cloud successfully!');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Failed to upload favicon:', err);
      setUploadingFavicon(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Líora Patron Circle
            </span>
            <h3 className="font-serif text-2xl text-[#24211D]">
              {currentUser ? `Welcome, ${currentUser.name}` : mode === 'signin' ? 'Sign In to Your Account' : 'Create Customer Account'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {currentUser ? (
            /* Logged In Customer Profile View */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 bg-white rounded-md border border-[#EAE0D5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#24211D] text-white flex items-center justify-center font-serif text-lg font-medium">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-[#24211D]">{currentUser.name}</h4>
                      <p className="text-xs text-[#7A6F62]">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C5E35] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE0D5]">
                    Member since {currentUser.joinedAt}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EAE0D5] grid grid-cols-2 gap-2 text-xs text-[#5A5248]">
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

              {/* Atelier Branding - Direct SVG / Photo Favicon Uploader for Owner */}
              {(currentUser.email.toLowerCase().includes('houseofliora') || 
                currentUser.email.toLowerCase().includes('admin') ||
                currentUser.email.toLowerCase() === 'info.houseofliora@gmail.com') && (
                <div className="p-4 bg-[#F5F1EB] rounded-md border border-[#EAE0D5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#8C5E35]" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#24211D]">
                        Atelier Branding & Favicon
                      </h4>
                    </div>
                    <span className="text-[10px] bg-[#8C5E35]/15 text-[#8C5E35] font-semibold px-2 py-0.5 rounded">
                      Owner Controls
                    </span>
                  </div>

                  <p className="text-xs text-[#5A5248] leading-relaxed">
                    Upload your SVG icon or high-res brand photo directly from your device. It will automatically update the browser tab icon across the entire website.
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-[#FAF8F5] border border-dashed border-[#8C5E35] rounded-md cursor-pointer transition-colors text-xs font-medium text-[#24211D]">
                      <Upload className="w-4 h-4 text-[#8C5E35]" />
                      <span>{uploadingFavicon ? 'Updating Favicon...' : 'Choose SVG / Photo'}</span>
                      <input 
                        type="file" 
                        accept=".svg,.png,.jpg,.jpeg,.webp,.ico,image/*" 
                        className="hidden" 
                        onChange={handleFaviconUpload}
                        disabled={uploadingFavicon}
                      />
                    </label>

                    {faviconPreview && (
                      <div className="w-10 h-10 rounded-md bg-white border border-[#EAE0D5] p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {faviconSuccessMsg && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{faviconSuccessMsg}</span>
                    </p>
                  )}
                </div>
              )}

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
                  <div className="p-8 text-center bg-white rounded-md border border-[#EAE0D5] space-y-2">
                    <p className="text-xs text-[#7A6F62]">
                      You haven't placed any candle orders yet.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-3.5 py-1.5 bg-[#24211D] text-white text-xs font-medium rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
                    >
                      Browse Candles
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userOrders.map(order => (
                      <div key={order.id} className="p-3 bg-white rounded border border-[#EAE0D5] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#24211D]">{order.id}</span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
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
              <div className="pt-2 border-t border-[#EAE0D5] flex justify-between items-center">
                <button
                  onClick={onSignOut}
                  className="text-xs text-[#7A6F62] hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-medium rounded cursor-pointer"
                >
                  Back to Boutique
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Sign In / Sign Up) */
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#24211D] block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Raisa Ahmed"
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
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
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
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
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24211D] block">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#24211D] block">Default Delivery City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
                    >
                      <option value="Inside Dhaka">Inside Dhaka</option>
                      <option value="Outside Dhaka">Outside Dhaka</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#24211D] block">Delivery Address (Optional)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Road, Area"
                      className="w-full p-2.5 bg-white border border-[#D8CEBE] rounded focus:border-[#24211D]"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#24211D] hover:bg-[#3D3730] text-white font-medium rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Mode switch */}
              <div className="text-center pt-2 border-t border-[#EAE0D5] text-[#7A6F62]">
                {mode === 'signin' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#8C5E35] font-semibold hover:underline cursor-pointer"
                    >
                      Sign Up here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#8C5E35] font-semibold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A6F62] pt-1">
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
