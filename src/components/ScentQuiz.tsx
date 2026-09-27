import React, { useState } from 'react';
import { Product, ScentQuizContent, ScentQuizOption } from '../types';
import { Sparkles, ArrowRight, RotateCcw, X, ArrowLeft } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface ScentQuizProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  content?: ScentQuizContent;
}

export const ScentQuiz: React.FC<ScentQuizProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  content,
}) => {
  if (!isOpen) return null;

  const quizContent: ScentQuizContent = content || DEFAULT_SITE_CONTENT.scentQuiz || {
    badge: 'The Líora Olfactory Guide',
    title: 'Find Your Signature Candle Profile',
    subtitle: 'Answer brief questions to reveal your ideal artisanal fragrance and sculptural silhouette.',
    triggerBtnText: 'Take Scent Profile Quiz',
    resultBadge: 'Your Ideal Scent Match',
    resultCtaText: 'View & Order Candle',
    retakeBtnText: 'Retake Quiz',
    defaultProductId: 'bubble-classic-ivory',
    questions: [],
  };

  const questions = quizContent.questions || [];
  const totalQuestions = questions.length;

  const [step, setStep] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ScentQuizOption>>({});

  const resetQuiz = () => {
    setStep(1);
    setSelectedAnswers({});
  };

  // Determine the recommended product based on configured mappings
  const getRecommendation = (): Product => {
    if (!products || products.length === 0) {
      return {
        id: 'fallback',
        name: 'Artisanal Bubble Soy Candle',
        category: 'bubble',
        price: 320,
        originalPrice: 380,
        image: '/images/bubble_soy_candle_1790333573183.jpg',
        scentFamily: 'Sweet Gourmand',
        scentNotes: ['French Vanilla', 'Warm Caramel'],
        dimensions: '6cm x 6cm x 6cm',
        burnTime: '18-22 Hours',
        waxType: '100% Pure Botanical Soy Wax',
        description: 'Signature hand-poured candle',
        inStock: true,
      };
    }

    const answersList = Object.values(selectedAnswers);

    for (let i = answersList.length - 1; i >= 0; i--) {
      const opt = answersList[i];
      if (opt.targetProductId) {
        const matched = products.find(p => p.id === opt.targetProductId);
        if (matched) return matched;
      }
    }

    for (let i = answersList.length - 1; i >= 0; i--) {
      const opt = answersList[i];
      if (opt.targetCategory) {
        const matched = products.find(p => p.category === opt.targetCategory);
        if (matched) return matched;
      }
    }

    if (quizContent.defaultProductId) {
      const defaultMatch = products.find(p => p.id === quizContent.defaultProductId);
      if (defaultMatch) return defaultMatch;
    }

    return products[0];
  };

  const currentQuestion = questions[step - 1];
  const isResultStep = step > totalQuestions || !currentQuestion;
  const recommendedProduct = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl apple-glass rounded-3xl border border-white/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button in Liquid Pill */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 apple-glass-pill flex items-center justify-center text-[#7A6F62] hover:text-[#24211D] cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>{quizContent.badge || 'The Líora Olfactory Guide'}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#24211D]">
              {quizContent.title || 'Find Your Signature Candle Profile'}
            </h3>
            <p className="text-xs text-[#5A5248] max-w-md mx-auto">
              {quizContent.subtitle || 'Answer brief questions to reveal your ideal artisanal fragrance.'}
            </p>
          </div>

          {/* Active Question Step */}
          {!isResultStep && currentQuestion && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#24211D]">
                    {currentQuestion.prompt}
                  </p>
                  {currentQuestion.hint && (
                    <p className="text-xs text-[#8C5E35] font-medium mt-0.5">
                      {currentQuestion.hint}
                    </p>
                  )}
                </div>

                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="apple-glass-pill px-3 py-1 text-xs text-[#7A6F62] hover:text-[#24211D] flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const updated = { ...selectedAnswers, [currentQuestion.id]: item };
                      setSelectedAnswers(updated);
                      if (step < totalQuestions) {
                        setStep(step + 1);
                      } else {
                        setStep(totalQuestions + 1);
                      }
                    }}
                    className="p-4 text-left apple-glass-card rounded-2xl border border-white/75 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon && <span className="text-base">{item.icon}</span>}
                        <p className="text-sm font-medium text-[#24211D] group-hover:text-[#8C5E35]">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-[#7A6F62] leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result Step */}
          {isResultStep && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 sm:p-5 apple-glass-card rounded-2xl border border-white/80 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-white/60 shrink-0 shadow-sm"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="apple-glass-pill text-[11px] font-semibold uppercase tracking-wider text-[#8C5E35] px-2.5 py-0.5 inline-block">
                    {quizContent.resultBadge || 'Your Ideal Scent Match'}
                  </span>
                  <h4 className="font-serif text-xl font-medium text-[#24211D]">
                    {recommendedProduct.name}
                  </h4>
                  <p className="text-xs text-[#5A5248]">
                    {recommendedProduct.scentFamily} · Notes: {recommendedProduct.scentNotes?.join(', ') || 'Pure Botanical Essential Oils'}
                  </p>
                  <p className="font-mono text-base font-semibold text-[#24211D]">
                    ৳{recommendedProduct.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2.5 apple-glass-pill text-xs font-medium text-[#5A5248] hover:text-[#24211D] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{quizContent.retakeBtnText || 'Retake Quiz'}</span>
                </button>

                <button
                  onClick={() => {
                    onSelectProduct(recommendedProduct);
                    onClose();
                  }}
                  className="px-6 py-2.5 apple-glass-dark text-white text-xs font-medium rounded-full inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{quizContent.resultCtaText || 'View & Order Candle'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          {!isResultStep && totalQuestions > 0 && (
            <div className="flex items-center justify-between text-xs text-[#7A6F62] pt-3 border-t border-[#EAE0D5]/70">
              <span>Question {step} of {totalQuestions}</span>
              <div className="flex gap-1.5">
                {questions.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-6 h-1 rounded-full transition-all duration-300 ${
                      step > idx ? 'bg-[#8C5E35]' : 'bg-[#D8CEBE]'
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
