import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, MessageSquareQuote, CheckCircle, Edit3 } from 'lucide-react';
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
    <section className="py-16 bg-[#F5F1EB] border-b border-[#EAE0D5] relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Testimonials */}
        <div className="space-y-8 relative">
          {isEditMode && (
            <button
              onClick={onEditReviews}
              className="absolute -top-3 right-0 z-20 px-3 py-1.5 bg-[#8C5E35] text-white rounded-full text-xs font-medium shadow-lg hover:bg-[#24211D] flex items-center gap-1.5 transition-all cursor-pointer border border-white/40 animate-pulse"
              title="Edit Patron Testimonials"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Reviews</span>
            </button>
          )}

          <div className="max-w-2xl mx-auto text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center justify-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4" />
              {reviewsContent.badge}
            </span>
            <h2 className="font-serif text-3xl text-[#24211D]">
              {reviewsContent.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsList.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#FAF8F5] rounded-md border border-[#EAE0D5] flex flex-col justify-between space-y-4 shadow-xs"
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

                <div className="pt-3 border-t border-[#EAE0D5] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#24211D]">{rev.name}</span>
                    <span className="text-[10px] text-emerald-800 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6F62]">{rev.location}</p>
                  <p className="text-[10px] text-[#8C5E35] font-mono mt-1">Purchased: {rev.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-6 pt-4 relative">
          {isEditMode && (
            <button
              onClick={onEditFaq}
              className="absolute -top-1 right-0 z-20 px-3 py-1.5 bg-[#8C5E35] text-white rounded-full text-xs font-medium shadow-lg hover:bg-[#24211D] flex items-center gap-1.5 transition-all cursor-pointer border border-white/40 animate-pulse"
              title="Edit Questions & Answers"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit FAQs</span>
            </button>
          )}

          <div className="text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
              {faqContent.badge}
            </span>
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
                  className="bg-white rounded-md border border-[#EAE0D5] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5]"
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
                    <div className="px-4 pb-4 pt-1 text-xs text-[#5A5248] leading-relaxed border-t border-[#EAE0D5]/50">
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
