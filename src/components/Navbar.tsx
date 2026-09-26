import React from 'react';
import { ShoppingBag, Sparkles, User } from 'lucide-react';
import { CustomerUser } from './CustomerAuthModal';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onOpenAuth: () => void;
  currentUser: CustomerUser | null;
  announcementText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenQuiz,
  onOpenAuth,
  currentUser,
  announcementText,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE0D5] transition-all">
      {/* Announcement top ribbon */}
      <div className="bg-[#24211D] text-[#FAF8F5] text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <span>{announcementText || '✨ 100% Handcrafted Botanical Soy Wax Candles · Nationwide Delivery · Min Order ৳200'}</span>
      </div>

      {/* Top Bar: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a href="#" className="flex flex-col group">
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#24211D] group-hover:text-[#8C5E35] transition-colors">
            House of Líora
          </span>
          <span className="text-[10px] tracking-[0.25em] text-[#8C5E35] uppercase font-sans -mt-1 font-semibold">
            Artisanal Home Fragrance
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#4A443C]">
          <a href="#collections" className="hover:text-[#24211D] transition-colors">
            Collections
          </a>
          <button 
            onClick={onOpenQuiz} 
            className="hover:text-[#24211D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
            <span>Scent Finder</span>
          </button>
          <a href="#custom-favors" className="hover:text-[#24211D] transition-colors">
            Custom Favors & Events
          </a>
          <a href="#candle-care" className="hover:text-[#24211D] transition-colors">
            Candle Care
          </a>
        </nav>

        {/* Zone 3: Actions (Customer Account & Shopping Bag) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenAuth}
            aria-label="Customer Account"
            title={currentUser ? `Signed in as ${currentUser.name}` : "Customer Account"}
            className="px-2.5 py-2 text-[#4A443C] hover:text-[#24211D] hover:bg-[#EAE0D5] rounded transition-colors inline-flex items-center justify-center cursor-pointer border border-[#D8CEBE]"
          >
            <User className="w-4 h-4 text-[#8C5E35]" />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Bag"
            className="relative px-3.5 py-2 text-xs font-medium text-white bg-[#24211D] rounded hover:bg-[#3D3730] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="bg-[#C68B59] text-white text-[11px] font-bold rounded-full w-4.5 h-4.5 inline-flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
