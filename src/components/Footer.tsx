import React from 'react';
import { Mail, Facebook, Instagram, ArrowUp, User, ShieldCheck, Edit3 } from 'lucide-react';
import { StoreSettings, SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface FooterProps {
  onOpenAuth: () => void;
  storeSettings: StoreSettings;
  content?: SiteContent['footer'];
  isEditMode?: boolean;
  onEdit?: () => void;
  onOpenPolicy?: (type: 'terms' | 'privacy' | 'refund') => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenAuth, 
  storeSettings,
  content = DEFAULT_SITE_CONTENT.footer,
  isEditMode = false,
  onEdit,
  onOpenPolicy,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#24211D] text-[#FAF8F5] pt-14 pb-8 border-t border-[#3D3730] relative group">
      {isEditMode && (
        <button
          onClick={onEdit}
          className="absolute top-4 right-8 z-20 px-3.5 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
          title="Edit Footer Brand Text & Policies"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Footer</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-serif text-2xl tracking-tight block">
              House of Líora
            </span>
            <p className="text-xs text-[#A89E90] leading-relaxed max-w-sm">
              {content.brandTagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={storeSettings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full apple-glass-dark text-[#D8CEBE] hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                title="Facebook @houseofliorabd"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full apple-glass-dark text-[#D8CEBE] hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${storeSettings.supportEmail}`}
                className="w-9 h-9 rounded-full apple-glass-dark text-[#D8CEBE] hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
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
              <p>{content.deliveryPolicy}</p>
              <p>{content.paymentPolicy}</p>
              <p>✨ Minimum Order: ৳{storeSettings.minimumOrder} · Custom Orders: 50% Advance</p>
              <p>✉️ Inquiries: {storeSettings.supportEmail}</p>
              <div className="pt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#C68B59]">
                <button
                  type="button"
                  onClick={() => onOpenPolicy?.('terms')}
                  className="hover:text-white underline cursor-pointer transition-colors"
                >
                  Terms &amp; Conditions
                </button>
                <span className="text-[#5A5248]">·</span>
                <button
                  type="button"
                  onClick={() => onOpenPolicy?.('privacy')}
                  className="hover:text-white underline cursor-pointer transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-[#5A5248]">·</span>
                <button
                  type="button"
                  onClick={() => onOpenPolicy?.('refund')}
                  className="hover:text-white underline cursor-pointer transition-colors"
                >
                  Refund &amp; Return Policy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#38322B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#877E71]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {content.copyright}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#A89E90]">
              <button type="button" onClick={() => onOpenPolicy?.('terms')} className="hover:text-white underline cursor-pointer">Terms</button>
              <span>·</span>
              <button type="button" onClick={() => onOpenPolicy?.('privacy')} className="hover:text-white underline cursor-pointer">Privacy</button>
              <span>·</span>
              <button type="button" onClick={() => onOpenPolicy?.('refund')} className="hover:text-white underline cursor-pointer">Refund &amp; Returns</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="apple-glass-dark px-3 py-1.5 text-xs text-[#FAF8F5] rounded-full hover:text-[#C68B59] transition-all cursor-pointer shadow-xs"
            >
              Sign In / Account
            </button>
            <button
              onClick={scrollToTop}
              className="apple-glass-dark px-3.5 py-1.5 text-xs text-[#FAF8F5] rounded-full hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
