import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, MessageSquareQuote, CheckCircle, Edit3, HelpCircle } from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface ReviewsAndFaqProps {
  reviewsContent?: SiteContent['reviews'];
  faqContent?: SiteContent['faq'];
  isEditMode?: boolean;
  onEditReviews?: () => void;
  onEditFaq?: () => void;
}

export const ReviewsAndFaq: React.FC<ReviewsAndFaqProps> = ({
  reviewsContent = DEFAULT_SITE_CONTENT.reviews,
  faqContent = DEFAULT_SITE_CONTENT.faq,
  isEditMode = false,
  onEditReviews,
  onEditFaq,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const reviewsList = reviewsContent.items && reviewsContent.items.length > 0 
    ? reviewsContent.items 
    : DEFAULT_SITE_CONTENT.reviews.items;

  const faqsList = faqContent.items && faqContent.items.length > 0
    ? faqContent.items
    : DEFAULT_SITE_CONTENT.faq.items;

  return (
    <section className="py-16 md:py-20 border-b border-[#EAE0D5]/80 relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Testimonials */}
        <div className="space-y-8 relative">
          {isEditMode && (
            <button
              onClick={onEditReviews}
              className="absolute -top-3 right-0 z-20 px-3.5 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
              title="Edit Patron Testimonials"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Reviews</span>
            </button>
          )}

          <div className="max-w-2xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
              <MessageSquareQuote className="w-4 h-4" />
              <span>{reviewsContent.badge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
              {reviewsContent.title}
            </h2>
          </div>

          {/* Reviews Row - Horizontally side-by-side on mobile with smooth swipe, 3-cols on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {reviewsList.map((rev, idx) => (
              <div
                key={idx}
                className="w-[84vw] sm:w-[340px] md:w-auto shrink-0 snap-center p-5 sm:p-6 apple-glass-card rounded-3xl border border-white/70 flex flex-col justify-between space-y-4 shadow-sm hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#C68B59]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A5248] italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE0D5]/70 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#24211D]">{rev.name}</span>
                    <span className="apple-glass-pill px-2 py-0.5 text-[10px] text-emerald-800 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified Patron
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6F62]">{rev.location}</p>
                  <p className="text-[10px] text-[#8C5E35] font-mono mt-1">Purchased: {rev.product}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtle mobile swipe indicator pills */}
          <div className="flex md:hidden items-center justify-center gap-1.5 pt-1">
            {reviewsList.map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#8C5E35]/40" />
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-6 pt-4 relative">
          {isEditMode && (
            <button
              onClick={onEditFaq}
              className="absolute -top-1 right-0 z-20 px-3.5 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
              title="Edit Questions & Answers"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit FAQs</span>
            </button>
          )}

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{faqContent.badge}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#24211D]">
              {faqContent.title}
            </h3>
            {faqContent.subtitle && (
              <p className="text-xs text-[#5A5248] max-w-lg mx-auto">
                {faqContent.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {faqsList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="apple-glass-card rounded-2xl border border-white/70 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/40 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#24211D]">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#8C5E35] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A6F62] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-[#5A5248] leading-relaxed border-t border-[#EAE0D5]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
