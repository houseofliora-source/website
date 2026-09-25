import React from 'react';
import { Mail, Facebook, Instagram, ArrowUp, User, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  onOpenAuth: () => void;
  storeSettings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, storeSettings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#24211D] text-[#FAF8F5] pt-14 pb-8 border-t border-[#3D3730]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-serif text-2xl tracking-tight block">
              House of Líora
            </span>
            <p className="text-xs text-[#A89E90] leading-relaxed max-w-sm">
              Hand-pouring 100% botanical soy candles, floating floral blossoms, and architectural sculptural silhouettes. Clean-burning elegance for modern living spaces.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={storeSettings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#332E28] hover:bg-[#C68B59] hover:text-white text-[#D8CEBE] flex items-center justify-center transition-colors"
                title="Facebook @houseofliorabd"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#332E28] hover:bg-[#C68B59] hover:text-white text-[#D8CEBE] flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${storeSettings.supportEmail}`}
                className="w-8 h-8 rounded bg-[#332E28] hover:bg-[#C68B59] hover:text-white text-[#D8CEBE] flex items-center justify-center transition-colors"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C68B59]">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-[#A89E90]">
              <li>
                <a href="#collections" className="hover:text-white transition-colors">
                  All Candle Collections
                </a>
              </li>
              <li>
                <a href="#custom-favors" className="hover:text-white transition-colors">
                  Wedding & Bespoke Favors
                </a>
              </li>
              <li>
                <a href="#candle-care" className="hover:text-white transition-colors">
                  Candle Care Ritual
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAuth}
                  className="hover:text-white transition-colors text-left cursor-pointer inline-flex items-center gap-1.5 text-[#EAE0D5]"
                >
                  <User className="w-3.5 h-3.5 text-[#C68B59]" />
                  <span>My Account & Orders</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Policy */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C68B59]">
              Store Policies & Fulfillment
            </h4>
            <div className="space-y-1.5 text-xs text-[#A89E90]">
              <p>📦 Delivery: Nationwide Doorstep Delivery (COD Available)</p>
              <p>💳 Payment: Cash on Delivery / bKash / Nagad</p>
              <p>✨ Minimum Order: ৳{storeSettings.minimumOrder} · Custom Orders: 50% Advance</p>
              <p>✉️ Inquiries: {storeSettings.supportEmail}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#38322B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#877E71]">
          <p>© {new Date().getFullYear()} House of Líora (@houseofliorabd). All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAuth}
              className="hover:text-white transition-colors cursor-pointer text-[#C68B59]"
            >
              Sign In / Account
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={scrollToTop}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
