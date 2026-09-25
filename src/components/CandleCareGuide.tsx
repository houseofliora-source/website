import React from 'react';
import { Flame, Scissors, Sparkles, ShieldAlert } from 'lucide-react';

export const CandleCareGuide: React.FC = () => {
  return (
    <section id="candle-care" className="py-16 bg-[#FAF8F5] border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
            Artisan Soy Wisdom
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
            The Líora Candle Care Ritual
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5248]">
            Pure botanical soy wax is alive with natural plant characteristics. Follow these simple rituals for a clean, prolonged, and soot-free burn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rule 1 */}
          <div className="p-5 bg-white rounded-md border border-[#EAE0D5] space-y-2">
            <div className="w-8 h-8 rounded bg-[#F5F1EB] text-[#8C5E35] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              1. The First Burn Memory
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              Allow wax to melt completely across the top on your initial burn (1-2 hours) to avoid tunneling and preserve candle life.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-5 bg-white rounded-md border border-[#EAE0D5] space-y-2">
            <div className="w-8 h-8 rounded bg-[#F5F1EB] text-[#8C5E35] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              2. Trim Cotton Wick (1/4")
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              Trim cotton wick to 1/4 inch before every burn. This prevents high flickering, black smoke, and ensures pure scent throw.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-5 bg-white rounded-md border border-[#EAE0D5] space-y-2">
            <div className="w-8 h-8 rounded bg-[#F5F1EB] text-[#8C5E35] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              3. Soy Frosting is Natural
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              Slight white crystalline film (frosting) on your candle is a natural hallmark of 100% pure botanical soy wax with zero toxic additives.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-5 bg-white rounded-md border border-[#EAE0D5] space-y-2">
            <div className="w-8 h-8 rounded bg-[#F5F1EB] text-[#8C5E35] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              4. Use a Heat-Safe Dish
            </h3>
            <p className="text-xs text-[#5A5248] leading-relaxed">
              Always place free-standing sculptural or pillar candles on a heat-safe ceramic plate or marble tray before lighting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
