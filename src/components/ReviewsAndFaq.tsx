import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, MessageSquareQuote, CheckCircle } from 'lucide-react';

export const ReviewsAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const REVIEWS = [
    {
      name: 'Nusrat Jahan',
      location: 'Dhanmondi',
      comment: 'Ordered the bubble candle and floating flowers. The fragrance fill is subtle and elegant. They make my coffee table look like a curated Pinterest board!',
      product: 'Artisanal Bubble Soy Candle',
      verified: true,
    },
    {
      name: 'Tanvir Hossain & Raisa',
      location: 'Gulshan 2',
      comment: 'We ordered 60 bespoke favor boxes for our wedding celebration. The custom calligraphy tags and champagne ribbon were flawless. Guests loved them!',
      product: 'Bespoke Event Favors (60 pcs)',
      verified: true,
    },
    {
      name: 'Sabrina Rahman',
      location: 'Chittagong',
      comment: 'Received the gift hamper in pristine condition within 3 days. Zero black smoke, true 100% pure soy wax. House of Líora is now my go-to gift brand.',
      product: 'The Líora Luxe Signature Gift Hamper',
      verified: true,
    },
  ];

  const FAQS = [
    {
      q: 'What is the minimum order threshold for House of Líora?',
      a: 'As per our boutique policy, our minimum order threshold is ৳200. You can mix and match any individual candles or accessories to easily complete checkout.',
    },
    {
      q: 'How do custom event orders & wedding favor payments work?',
      a: 'Custom event orders require a 50% advance deposit via bKash or Nagad upon order confirmation. The remaining 50% balance is collected via Cash on Delivery upon doorstep receipt. Please order 4–7 days in advance.',
    },
    {
      q: 'What are the delivery charges and transit times?',
      a: 'Inside Dhaka doorstep delivery is ৳70 (24–48 hours transit). Outside Dhaka nationwide delivery is ৳130 (2–4 business days via verified couriers).',
    },
    {
      q: 'Why is 100% botanical soy wax superior to ordinary paraffin candles?',
      a: 'Ordinary commercial candles are made from petroleum-derived paraffin wax that releases toxic soot and benzene fumes. Pure soy wax is cold-pressed from natural plant oils, burns 30–50% longer, and produces a soot-free burn that is safe for indoor air, children, and pets.',
    },
  ];

  return (
    <section className="py-16 bg-[#F5F1EB] border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Testimonials */}
        <div className="space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center justify-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4" />
              Customer Experiences
            </span>
            <h2 className="font-serif text-3xl text-[#24211D]">
              Voices from Líora Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
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
        <div className="max-w-3xl mx-auto space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
              Questions & Answers
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#24211D]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
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
