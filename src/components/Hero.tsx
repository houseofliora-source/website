import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame, ShieldCheck, Truck, Sparkles, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteContent, Product } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface HeroProps {
  onExplore: () => void;
  onOpenCustomFavors: () => void;
  content?: SiteContent['hero'];
  products?: Product[];
  onSelectProduct?: (productId: string) => void;
  isEditMode?: boolean;
  onEdit?: (sectionKey: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onOpenCustomFavors,
  content = DEFAULT_SITE_CONTENT.hero,
  products = [],
  onSelectProduct,
  isEditMode = false,
  onEdit,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Products with valid images
  const slideProducts = products.filter(p => p.image);
  const totalSlides = slideProducts.length;

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalSlides, isPaused]);

  const activeProduct = totalSlides > 0 ? slideProducts[currentSlide % totalSlides] : null;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 0) {
      setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 0) {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }
  };

  const handleCardClick = () => {
    if (activeProduct && onSelectProduct) {
      onSelectProduct(activeProduct.id);
    } else {
      onExplore();
    }
  };

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
          </div>

          {/* Right Column: Dynamic Catalog Product Slideshow */}
          <div className="lg:col-span-6 relative">
            <div 
              onClick={handleCardClick}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="apple-glass-card p-2 sm:p-2.5 rounded-3xl overflow-hidden shadow-xl cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:border-white"
              title={activeProduct ? `Click to view ${activeProduct.name}` : 'Explore Collection'}
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#EAE0D5] aspect-16/10 sm:aspect-4/3">
                {activeProduct ? (
                  <>
                    <img
                      key={activeProduct.id}
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-fade-in"
                    />

                    {/* Subtle Gradient Shadow for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Bottom Info Bar: Product Name, Price, and Click Hint */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                      <div className="apple-glass-dark px-3.5 py-1.5 rounded-full text-white flex items-center gap-2 max-w-[75%] shadow-md">
                        <span className="font-serif text-xs sm:text-sm font-medium truncate">
                          {activeProduct.name}
                        </span>
                        <span className="font-mono text-xs text-[#E5A97A] font-semibold shrink-0">
                          ৳{activeProduct.price}
                        </span>
                      </div>

                      <div className="apple-glass-pill px-3 py-1.5 rounded-full text-white text-[11px] font-medium flex items-center gap-1 shrink-0 group-hover:bg-white group-hover:text-[#24211D] transition-colors shadow-md">
                        <span>View Piece</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Controls (visible on hover) */}
                    {totalSlides > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full apple-glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md hover:scale-110"
                          aria-label="Previous candle"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full apple-glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md hover:scale-110"
                          aria-label="Next candle"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Slide Indicators Dots */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 apple-glass-dark px-2.5 py-1 rounded-full shadow-xs">
                          {slideProducts.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentSlide(idx);
                              }}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                (currentSlide % totalSlides) === idx
                                  ? 'w-4 bg-white'
                                  : 'w-1.5 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <img
                    src={content.heroImage || '/images/hero_artisan_candles_1790333552254.jpg'}
                    alt="House of Líora artisanal soy wax candles"
                    className="w-full h-full object-cover"
                  />
                )}
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
            <span className="text-[11px] sm:text-xs font-medium">{content.ribbonItem1 || '100% Natural Botanical Soy Wax'}</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <Truck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">{content.ribbonItem2 || 'Doorstep Courier (Dhaka ৳70, Outside ৳130)'}</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">{content.ribbonItem3 || 'Bespoke Gifting & Custom Event Favors'}</span>
          </div>
          <span className="text-[#D8CEBE] shrink-0">·</span>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8C5E35] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">{content.ribbonItem4 || 'Cash on Delivery & Verified bKash'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
