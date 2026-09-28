import React from 'react';
import { ShoppingBag, User } from 'lucide-react';
import { CustomerUser } from './CustomerAuthModal';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz?: () => void;
  onOpenAuth: () => void;
  currentUser: CustomerUser | null;
  announcementText?: string;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  currentUser,
  announcementText,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 apple-glass-nav transition-all duration-300">
      {/* Announcement top ribbon */}
      <div className="bg-[#24211D]/90 backdrop-blur-md text-[#FAF8F5] text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2 border-b border-white/10">
        <span>{announcementText || '✨ 100% Handcrafted Botanical Soy Wax Candles · Nationwide Delivery · Min Order ৳200'}</span>
      </div>

      {/* Top Bar: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="/" 
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="flex flex-col group cursor-pointer"
        >
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#24211D] group-hover:text-[#8C5E35] transition-colors">
            House of Líora
          </span>
          <span className="text-[10px] tracking-[0.25em] text-[#8C5E35] uppercase font-sans -mt-1 font-semibold">
            Artisanal Home Fragrance
          </span>
        </a>

        {/* Zone 2: Navigation Links in Apple Liquid Glass Pill Capsule */}
        <nav className="hidden lg:flex items-center gap-1 p-1.5 apple-glass-pill text-xs font-medium text-[#4A443C]">
          <a 
            href="#collections" 
            onClick={(e) => {
              if (onNavigateHome) {
                onNavigateHome();
              }
            }}
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-[#24211D] transition-all"
          >
            Collections
          </a>
          <a 
            href="#custom-favors" 
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-[#24211D] transition-all"
          >
            Custom Favors & Events
          </a>
          <a 
            href="#candle-care" 
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-[#24211D] transition-all"
          >
            Candle Care
          </a>
        </nav>

        {/* Zone 3: Actions (Customer Account & Shopping Bag as Apple Liquid Glass Buttons) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenAuth}
            aria-label="Customer Account"
            title={currentUser ? `Signed in as ${currentUser.name}` : "Customer Account"}
            className="w-10 h-10 apple-glass-pill inline-flex items-center justify-center text-[#4A443C] hover:text-[#24211D] cursor-pointer"
          >
            <User className="w-4 h-4 text-[#8C5E35]" />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Bag"
            className="h-10 px-4 apple-glass-dark inline-flex items-center gap-2 text-xs font-medium text-white cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="bg-[#C68B59] text-white text-[11px] font-bold rounded-full w-4.5 h-4.5 inline-flex items-center justify-center font-mono shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
