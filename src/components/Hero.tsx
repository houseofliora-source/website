import React from 'react';
import { ArrowRight, Flame, ShieldCheck, Truck, Sparkles, Edit3 } from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface HeroProps {
  onExplore: () => void;
  onOpenCustomFavors: () => void;
  content?: SiteContent['hero'];
  isEditMode?: boolean;
  onEdit?: (sectionKey: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onOpenCustomFavors,
  content = DEFAULT_SITE_CONTENT.hero,
  isEditMode = false,
  onEdit,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#EAE0D5]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 relative group">
            {isEditMode && (
              <button
                onClick={() => onEdit?.('hero')}
                className="absolute -top-4 -right-2 z-20 px-3.5 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
                title="Edit Hero Headline, Story & Buttons"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Hero Content</span>
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 apple-glass-pill text-[11px] sm:text-xs tracking-wider uppercase text-[#8C5E35] font-semibold">
              <Flame className="w-3.5 h-3.5 text-[#C68B59] animate-flame" />
              <span>{content.badge}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#24211D] font-normal leading-[1.14] tracking-tight">
              {content.title} <br />
              <span className="italic font-light text-[#8C5E35]">{content.titleHighlight}</span> for Modern Living
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#5A5248] leading-relaxed max-w-xl font-normal">
              {content.subtitle}
            </p>

            {/* CTAs - Apple Liquid Glass Side-by-Side Capsules on Mobile without Wrapping */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              <button
                onClick={onExplore}
                className="shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 apple-glass-dark text-white text-xs sm:text-sm font-medium rounded-full inline-flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
              >
                <span>{content.btnPrimary}</span>
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
              </button>

              <button
                onClick={onOpenCustomFavors}
                className="shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 apple-glass-pill text-[#24211D] text-xs sm:text-sm font-medium rounded-full inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
                <span>{content.btnSecondary}</span>
              </button>
            </div>

            {/* Quiet Editorial Proof adjacency - Apple Liquid Cards */}
            <div className="pt-4 border-t border-[#EAE0D5]/70 grid grid-cols-3 gap-2 sm:gap-3 text-[#5A5248]">
              <div className="min-w-0 apple-glass-card rounded-xl p-2.5 sm:p-3 text-center">
                <p className="text-[10px] sm:text-[11px] uppercase text-[#8C5E35] font-semibold tracking-wider truncate">{content.badge1Label}</p>
                <p className="text-xs sm:text-sm font-medium text-[#24211D] truncate mt-0.5">{content.badge1Value}</p>
              </div>
              <div className="min-w-0 apple-glass-card rounded-xl p-2.5 sm:p-3 text-center">
                <p className="text-[10px] sm:text-[11px] uppercase text-[#8C5E35] font-semibold tracking-wider truncate">{content.badge2Label}</p>
                <p className="text-xs sm:text-sm font-medium text-[#24211D] truncate mt-0.5">{content.badge2Value}</p>
              </div>
              <div className="min-w-0 apple-glass-card rounded-xl p-2.5 sm:p-3 text-center">
                <p className="text-[10px] sm:text-[11px] uppercase text-[#8C5E35] font-semibold tracking-wider truncate">{content.badge3Label}</p>
                <p className="text-xs sm:text-sm font-medium text-[#24211D] truncate mt-0.5">{content.badge3Value}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Display */}
          <div className="lg:col-span-6 relative">
            <div className="apple-glass-card p-1.5 sm:p-2 rounded-2xl overflow-hidden shadow-xl">
              <div className="relative rounded-xl overflow-hidden bg-[#EAE0D5]">
                <img
                  src={content.heroImage || '/images/hero_artisan_candles_1790333552254.jpg'}
                  alt="House of Líora artisanal soy wax candles studio collection"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto aspect-16/9 sm:aspect-4/3 object-cover hover:scale-[1.01] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

                {/* Apple Liquid Glass Overlay Labels */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-serif italic text-sm sm:text-base drop-shadow-sm px-3 py-1 apple-glass-dark rounded-full">
                    {content.floatingTitle}
                  </span>
                  <span className="apple-glass-pill text-white px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-sans font-medium">
                    {content.floatingTag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Ribbon - Apple Liquid Glass Bar with side-by-side smooth swipe */}
      <div className="apple-glass border-y border-[#EAE0D5]/80 py-3.5 px-4 text-xs text-[#5A5248]">
        <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-around gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">100% Natural Botanical Soy Wax</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <Truck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Doorstep Courier (Dhaka ৳70, Outside ৳130)</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Bespoke Gifting & Custom Event Favors</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Cash on Delivery & Verified bKash</span>
          </div>
        </div>
      </div>
    </section>
  );
};
