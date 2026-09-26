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

    // 1. Check if any selected option has a specific targetProductId (latest chosen first)
    for (let i = answersList.length - 1; i >= 0; i--) {
      const opt = answersList[i];
      if (opt.targetProductId) {
        const matched = products.find(p => p.id === opt.targetProductId);
        if (matched) return matched;
      }
    }

    // 2. Check category match from latest answers backwards
    for (let i = answersList.length - 1; i >= 0; i--) {
      const opt = answersList[i];
      if (opt.targetCategory) {
        const matched = products.find(p => p.category === opt.targetCategory);
        if (matched) return matched;
      }
    }

    // 3. Check configured default fallback product
    if (quizContent.defaultProductId) {
      const defaultMatch = products.find(p => p.id === quizContent.defaultProductId);
      if (defaultMatch) return defaultMatch;
    }

    // 4. Ultimate fallback to first product
    return products[0];
  };

  const currentQuestion = questions[step - 1];
  const isResultStep = step > totalQuestions || !currentQuestion;
  const recommendedProduct = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-xl border border-[#EAE0D5] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7A6F62] hover:text-[#24211D] p-1.5 rounded-full hover:bg-[#EAE0D5] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-[#8C5E35] uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              {quizContent.badge || 'The Líora Olfactory Guide'}
            </span>
            <h3 className="font-serif text-2xl text-[#24211D]">
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
                    className="text-xs text-[#7A6F62] hover:text-[#24211D] flex items-center gap-1 cursor-pointer shrink-0 px-2 py-1 rounded hover:bg-[#EAE0D5]"
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
                    className="p-3.5 text-left border border-[#D8CEBE] hover:border-[#8C5E35] hover:bg-[#F3EFEA] rounded-lg transition-all cursor-pointer group bg-white shadow-2xs hover:shadow-xs flex flex-col justify-between"
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
              <div className="p-4 sm:p-5 bg-[#F3EFEA] rounded-xl border border-[#EAE0D5] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-[#D8CEBE] shrink-0 shadow-xs"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C5E35] bg-[#8C5E35]/10 px-2 py-0.5 rounded">
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
                  className="px-3.5 py-2 text-xs font-medium text-[#5A5248] hover:text-[#24211D] rounded-md border border-[#D8CEBE] hover:bg-[#F3EFEA] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{quizContent.retakeBtnText || 'Retake Quiz'}</span>
                </button>

                <button
                  onClick={() => {
                    onSelectProduct(recommendedProduct);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-medium rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{quizContent.resultCtaText || 'View & Order Candle'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          {!isResultStep && totalQuestions > 0 && (
            <div className="flex items-center justify-between text-xs text-[#7A6F62] pt-3 border-t border-[#EAE0D5]">
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
