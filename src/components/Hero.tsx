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
    <section className="relative overflow-hidden bg-[#FAF8F5] border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & CTAs */}
          <div className="lg:col-span-6 space-y-6 relative group">
            {isEditMode && (
              <button
                onClick={() => onEdit?.('hero')}
                className="absolute -top-4 -right-2 z-20 px-3 py-1.5 bg-[#8C5E35] text-white rounded-full text-xs font-medium shadow-lg hover:bg-[#24211D] flex items-center gap-1.5 transition-all cursor-pointer border border-white/40 animate-pulse"
                title="Edit Hero Headline, Story & Buttons"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Hero Content</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#8C5E35] font-semibold">
              <span className="w-6 h-px bg-[#8C5E35]"></span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C68B59] animate-flame" />
                {content.badge}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#24211D] font-normal leading-[1.12] tracking-tight">
              {content.title} <br />
              <span className="italic font-light text-[#8C5E35]">{content.titleHighlight}</span> for Modern Living
            </h1>

            <p className="text-base sm:text-lg text-[#5A5248] leading-relaxed max-w-xl font-normal">
              {content.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-[#24211D] hover:bg-[#3D3730] text-white text-sm font-medium rounded transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{content.btnPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCustomFavors}
                className="px-5 py-3.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] text-sm font-medium rounded transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8C5E35]" />
                <span>{content.btnSecondary}</span>
              </button>
            </div>

            {/* Quiet Editorial Proof adjacency */}
            <div className="pt-4 border-t border-[#EAE0D5]/70 grid grid-cols-3 gap-3 text-[#5A5248]">
              <div>
                <p className="text-xs uppercase text-[#8C5E35] font-semibold">{content.badge1Label}</p>
                <p className="text-sm font-medium text-[#24211D]">{content.badge1Value}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[#8C5E35] font-semibold">{content.badge2Label}</p>
                <p className="text-sm font-medium text-[#24211D]">{content.badge2Value}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[#8C5E35] font-semibold">{content.badge3Label}</p>
                <p className="text-sm font-medium text-[#24211D]">{content.badge3Value}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Display */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-lg overflow-hidden border border-[#EAE0D5] bg-[#EAE0D5] shadow-sm">
              <img
                src={content.heroImage || '/images/hero_artisan_candles_1790333552254.jpg'}
                alt="House of Líora artisanal soy wax candles studio collection"
                referrerPolicy="no-referrer"
                className="w-full h-auto aspect-16/9 sm:aspect-4/3 object-cover hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none"></div>

              {/* Quiet overlay label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-serif italic text-base drop-shadow-sm">
                  {content.floatingTitle}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-sans">
                  {content.floatingTag}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#7A6F62]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C5E35]" />
                {content.trustText}
              </span>
              <span className="font-mono text-[#8C5E35]">
                Min Order: ৳200
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Ribbon */}
      <div className="bg-[#F3EFEA] border-t border-[#EAE0D5] py-3.5 px-4 text-xs text-[#5A5248]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#8C5E35]" />
            <span>100% Natural Botanical Soy Wax</span>
          </div>
          <span className="hidden sm:inline text-[#D8CEBE]">·</span>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#8C5E35]" />
            <span>Doorstep Courier (Dhaka ৳70, Outside ৳130)</span>
          </div>
          <span className="hidden sm:inline text-[#D8CEBE]">·</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C5E35]" />
            <span>Bespoke Gifting & Custom Event Favors</span>
          </div>
          <span className="hidden sm:inline text-[#D8CEBE]">·</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C5E35]" />
            <span>Cash on Delivery & Verified bKash</span>
          </div>
        </div>
      </div>
    </section>
  );
};
