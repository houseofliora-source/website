import React from 'react';
import { Flame, Scissors, Sparkles, ShieldAlert, Edit3 } from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface CandleCareGuideProps {
  content?: SiteContent['care'];
  isEditMode?: boolean;
  onEdit?: () => void;
}

export const CandleCareGuide: React.FC<CandleCareGuideProps> = ({
  content = DEFAULT_SITE_CONTENT.care,
  isEditMode = false,
  onEdit,
}) => {
  return (
    <section id="candle-care" className="py-16 md:py-20 border-b border-[#EAE0D5]/80 relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 relative">
          {isEditMode && (
            <button
              onClick={onEdit}
              className="absolute -top-4 right-0 z-20 px-3.5 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
              title="Edit Candle Care Wisdom & Steps"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Care Guide</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
            <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
            <span>{content.badge}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
            {content.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5248]">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rule 1 in Apple Liquid Glass Card */}
          <div className="p-6 apple-glass-card rounded-3xl border border-white/70 space-y-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 rounded-full apple-glass-pill text-[#8C5E35] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              {content.step1Title}
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              {content.step1Desc}
            </p>
          </div>

          {/* Rule 2 in Apple Liquid Glass Card */}
          <div className="p-6 apple-glass-card rounded-3xl border border-white/70 space-y-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 rounded-full apple-glass-pill text-[#8C5E35] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              {content.step2Title}
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              {content.step2Desc}
            </p>
          </div>

          {/* Rule 3 in Apple Liquid Glass Card */}
          <div className="p-6 apple-glass-card rounded-3xl border border-white/70 space-y-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 rounded-full apple-glass-pill text-[#8C5E35] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              {content.step3Title}
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              {content.step3Desc}
            </p>
          </div>

          {/* Rule 4 in Apple Liquid Glass Card */}
          <div className="p-6 apple-glass-card rounded-3xl border border-white/70 space-y-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 rounded-full apple-glass-pill text-[#8C5E35] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              {content.step4Title}
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              {content.step4Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
