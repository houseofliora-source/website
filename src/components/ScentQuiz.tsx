import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ArrowRight, RotateCcw, X } from 'lucide-react';

interface ScentQuizProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ScentQuiz: React.FC<ScentQuizProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [vibe, setVibe] = useState<string>('');

  const resetQuiz = () => {
    setStep(1);
    setMood('');
    setRoom('');
    setVibe('');
  };

  const getRecommendation = (): Product => {
    if (mood === 'relax' || vibe === 'sweet') {
      return products.find(p => p.category === 'bubble') || products[0];
    }
    if (mood === 'romantic' || vibe === 'floral') {
      return products.find(p => p.category === 'floating') || products[1] || products[0];
    }
    if (mood === 'grounding' || room === 'study') {
      return products.find(p => p.category === 'sculpted') || products[2] || products[0];
    }
    if (vibe === 'gift') {
      return products.find(p => p.category === 'hampers') || products[3] || products[0];
    }
    return products[0];
  };

  const recommendedProduct = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7A6F62] hover:text-[#24211D] p-1.5 rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-[#8C5E35] uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              The Líora Olfactory Guide
            </span>
            <h3 className="font-serif text-2xl text-[#24211D]">
              Find Your Signature Candle Profile
            </h3>
            <p className="text-xs text-[#5A5248]">
              Answer 3 brief questions to reveal your ideal artisanal fragrance and sculptural silhouette.
            </p>
          </div>

          {/* Step 1: Mood */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#24211D]">
                1. What ambiance or atmosphere do you wish to cultivate?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'relax', title: 'Deep Comfort & Relaxation', desc: 'Warm vanilla, almond & golden caramel' },
                  { id: 'romantic', title: 'Delicate Botanical Romance', desc: 'Dewy peony petals & fresh jasmine' },
                  { id: 'grounding', title: 'Grounding & Meditative', desc: 'Rich amber, cedarwood & sandalwood' },
                  { id: 'energizing', title: 'Crisp & Uplifting', desc: 'Bergamot blossom & white tea leaves' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMood(item.id);
                      setStep(2);
                    }}
                    className="p-3.5 text-left border border-[#D8CEBE] hover:border-[#8C5E35] hover:bg-[#F3EFEA] rounded-md transition-all cursor-pointer group"
                  >
                    <p className="text-sm font-medium text-[#24211D] group-hover:text-[#8C5E35]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#7A6F62] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Room Placement */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#24211D]">
                2. Where will this candle live most of its burning hours?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'bedroom', title: 'Bedside Nightstand', desc: 'Quiet evening unwinding before sleep' },
                  { id: 'living', title: 'Living Room Coffee Table', desc: 'Welcoming centerpiece statement piece' },
                  { id: 'bath', title: 'Spa Bath or Water Uruli', desc: 'Serene floating blossoms in water' },
                  { id: 'study', title: 'Creative Studio / Desk', desc: 'Refined architectural focus' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRoom(item.id);
                      setStep(3);
                    }}
                    className="p-3.5 text-left border border-[#D8CEBE] hover:border-[#8C5E35] hover:bg-[#F3EFEA] rounded-md transition-all cursor-pointer group"
                  >
                    <p className="text-sm font-medium text-[#24211D] group-hover:text-[#8C5E35]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#7A6F62] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Aesthetic Form */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#24211D]">
                3. What sculptural silhouette speaks to your aesthetic?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'sweet', title: 'Geometric Bubble Cube', desc: 'Iconic modern playful silhouette' },
                  { id: 'floral', title: 'Floating Botanical Petals', desc: 'Organic floral elegance on water' },
                  { id: 'sculpted', title: 'Classical Neoclassic Torso', desc: 'Gallery art piece on limestone' },
                  { id: 'gift', title: 'Curated Presentation Hamper', desc: 'Multi-piece luxury gifting box' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setVibe(item.id);
                      setStep(4);
                    }}
                    className="p-3.5 text-left border border-[#D8CEBE] hover:border-[#8C5E35] hover:bg-[#F3EFEA] rounded-md transition-all cursor-pointer group"
                  >
                    <p className="text-sm font-medium text-[#24211D] group-hover:text-[#8C5E35]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#7A6F62] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Recommended Result */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-[#F3EFEA] rounded-lg border border-[#EAE0D5] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md border border-[#D8CEBE]"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C5E35]">
                    Your Ideal Scent Match
                  </span>
                  <h4 className="font-serif text-xl font-medium text-[#24211D]">
                    {recommendedProduct.name}
                  </h4>
                  <p className="text-xs text-[#5A5248]">
                    {recommendedProduct.scentFamily} · Notes: {recommendedProduct.scentNotes.join(', ')}
                  </p>
                  <p className="font-mono text-base font-semibold text-[#24211D]">
                    ৳{recommendedProduct.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={resetQuiz}
                  className="px-3.5 py-2 text-xs font-medium text-[#5A5248] hover:text-[#24211D] rounded border border-[#D8CEBE] hover:bg-[#F3EFEA] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={() => {
                    onSelectProduct(recommendedProduct);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-medium rounded transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>View & Order Candle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          {step < 4 && (
            <div className="flex items-center justify-between text-xs text-[#7A6F62] pt-2 border-t border-[#EAE0D5]">
              <span>Question {step} of 3</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`w-5 h-1 rounded-full ${
                      step >= s ? 'bg-[#8C5E35]' : 'bg-[#D8CEBE]'
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
