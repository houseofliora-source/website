import React, { useState } from 'react';
import { Sparkles, Check, Phone, ShieldCheck, HeartHandshake, Info } from 'lucide-react';
import { CustomFavorItem } from '../types';

interface CustomFavorBuilderProps {
  onAddCustomToCart: (customOrder: CustomFavorItem) => void;
  facebookUrl?: string;
}

export const CustomFavorBuilder: React.FC<CustomFavorBuilderProps> = ({
  onAddCustomToCart,
  facebookUrl = 'https://www.facebook.com/houseofliorabd',
}) => {
  const [candleStyle, setCandleStyle] = useState('bubble');
  const [quantity, setQuantity] = useState(50);
  const [scent, setScent] = useState('French Vanilla & Almond');
  const [ribbonColor, setRibbonColor] = useState('Champagne Gold Chiffon');
  const [tagMessage, setTagMessage] = useState('Tanvir & Raisa · 2026');
  const [packagingType, setPackagingType] = useState('luxe_window');
  const [added, setAdded] = useState(false);

  // Pricing calculations
  const basePrices: Record<string, number> = {
    bubble: 280,
    floating: 190,
    sculpted: 390,
    tablet: 220,
  };

  const packagingAddon: Record<string, number> = {
    standard: 25,
    luxe_window: 45,
    kraft_ribbon: 35,
  };

  const baseUnit = (basePrices[candleStyle] || 250) + (packagingAddon[packagingType] || 35);
  // Volume tiers
  const discountMultiplier = quantity >= 200 ? 0.85 : quantity >= 100 ? 0.90 : quantity >= 50 ? 0.95 : 1.0;
  const unitPrice = Math.round(baseUnit * discountMultiplier);
  const subtotal = unitPrice * quantity;
  const advanceRequired = Math.round(subtotal * 0.5); // 50% advance for custom favor batch

  const handleBook = () => {
    const details = `Style: ${candleStyle.toUpperCase()}, Packaging: ${packagingType}, Scent: ${scent}, Ribbon: ${ribbonColor}, Inscription: "${tagMessage}"`;
    onAddCustomToCart({
      productTitle: `Bespoke Event Favors (${quantity} pcs - ${candleStyle.toUpperCase()})`,
      quantity: 1,
      unitPrice: subtotal,
      total: subtotal,
      advanceRequired,
      details,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <section id="custom-favors" className="py-16 md:py-20 bg-[#F5F1EB] border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8C5E35] flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-[#C68B59]" />
            Weddings, Receptions & Bespoke Favors
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24211D]">
            Bespoke Event & Wedding Gifting Studio
          </h2>
          <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
            Create unforgettable olfactory keepsakes for your guests. Select artisanal silhouettes, custom wax stamps, delicate calligraphy tags, and bespoke ribbons.
          </p>
        </div>

        {/* Interactive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls: Left 7 Columns */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 sm:p-8 rounded-lg border border-[#EAE0D5] shadow-xs space-y-6">
            {/* 1. Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                1. Select Candle Mold Form:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'bubble', label: 'Bubble Cube' },
                  { id: 'floating', label: 'Floating Peony' },
                  { id: 'sculpted', label: 'Sculpted Torso' },
                  { id: 'tablet', label: 'Aroma Tablet' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCandleStyle(item.id)}
                    className={`p-3 rounded border text-center transition-all cursor-pointer ${
                      candleStyle === item.id
                        ? 'border-[#24211D] bg-[#24211D] text-white shadow-xs'
                        : 'border-[#D8CEBE] bg-[#FAF8F5] text-[#5A5248] hover:border-[#8C5E35]'
                    }`}
                  >
                    <p className="text-xs font-semibold">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Quantity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider">
                  2. Order Quantity (Pieces):
                </label>
                <span className="font-mono text-base font-semibold text-[#8C5E35] tabular-nums">
                  {quantity} pcs
                  {quantity >= 100 && (
                    <span className="text-[11px] text-emerald-700 ml-2 font-sans font-normal">
                      ({quantity >= 200 ? '15% Tier Discount' : '10% Tier Discount'})
                    </span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-[#EAE0D5] rounded-lg appearance-none cursor-pointer accent-[#24211D]"
              />
              <div className="flex justify-between text-[11px] text-[#7A6F62] font-mono">
                <span>20 pcs</span>
                <span>100 pcs</span>
                <span>250 pcs</span>
                <span>500+ pcs</span>
              </div>
            </div>

            {/* 3. Scent & Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                  3. Signature Aroma:
                </label>
                <select
                  value={scent}
                  onChange={(e) => setScent(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D] text-[#24211D]"
                >
                  <option value="French Vanilla & Almond">French Vanilla & Almond (Sweet)</option>
                  <option value="Wild Peony & Rose Petals">Wild Peony & Rose Petals (Floral)</option>
                  <option value="Amber Sandalwood & Cedar">Amber Sandalwood & Cedar (Warm)</option>
                  <option value="White Tea & Bergamot">White Tea & Bergamot (Fresh)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                  4. Ribbon Material & Tone:
                </label>
                <select
                  value={ribbonColor}
                  onChange={(e) => setRibbonColor(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D] text-[#24211D]"
                >
                  <option value="Champagne Gold Chiffon">Champagne Gold Chiffon</option>
                  <option value="Oat Rustic Linen">Oat Rustic Linen (Minimalist)</option>
                  <option value="Blush Dusty Rose">Blush Dusty Rose (Bridal)</option>
                  <option value="Eucalyptus Sage Green">Eucalyptus Sage Green</option>
                  <option value="Espresso Velvet">Espresso Luxury Velvet</option>
                </select>
              </div>
            </div>

            {/* 4. Packaging Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                5. Packaging Style:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'luxe_window', title: 'Clear View Box', price: '+৳45/pc', desc: 'See-through top with satin ribbon' },
                  { id: 'kraft_ribbon', title: 'Rigid Kraft Box', price: '+৳35/pc', desc: 'Debossed gold foil crest' },
                  { id: 'standard', title: 'Minimalist Wrap', price: '+৳25/pc', desc: 'Eco tissue & wax seal' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPackagingType(b.id)}
                    className={`p-3 rounded border text-left transition-all cursor-pointer ${
                      packagingType === b.id
                        ? 'border-[#24211D] bg-[#F3EFEA]'
                        : 'border-[#D8CEBE] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-[#24211D]">{b.title}</p>
                      <span className="text-[10px] text-[#8C5E35] font-mono">{b.price}</span>
                    </div>
                    <p className="text-[11px] text-[#7A6F62] mt-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Custom Tag Inscription */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#24211D] uppercase tracking-wider block">
                6. Personalized Inscription:
              </label>
              <input
                type="text"
                value={tagMessage}
                onChange={(e) => setTagMessage(e.target.value)}
                placeholder="e.g. Tanvir & Raisa · 2026 or Brand Event Name"
                className="w-full p-2.5 text-xs bg-white border border-[#D8CEBE] rounded focus:border-[#24211D] text-[#24211D]"
              />
              <p className="text-[11px] text-[#7A6F62]">
                Includes personalized foil-accented card and botanical sprig.
              </p>
            </div>
          </div>

          {/* Quotation Summary Card: Right 5 Columns */}
          <div className="lg:col-span-5 bg-[#FAF8F5] p-6 sm:p-7 rounded-lg border border-[#EAE0D5] space-y-6 shadow-xs">
            <div className="border-b border-[#EAE0D5] pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C5E35]">
                Live Estimate & Terms
              </span>
              <h3 className="font-serif text-2xl text-[#24211D] mt-1">
                Order Quotation
              </h3>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-xs text-[#5A5248]">
              <div className="flex justify-between">
                <span>Selected Silhouette:</span>
                <span className="font-medium text-[#24211D] capitalize">{candleStyle}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium text-[#24211D]">{quantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price (Tier Discounted):</span>
                <span className="font-mono font-medium text-[#24211D] tabular-nums">৳{unitPrice} / pc</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & Custom Inscriptions:</span>
                <span className="font-medium text-[#24211D]">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Production Lead Time:</span>
                <span className="font-medium text-[#24211D]">4–7 Business Days</span>
              </div>

              {/* Total & 50% Advance Notice */}
              <div className="pt-3 border-t border-[#EAE0D5] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#24211D]">
                  Total Estimated Cost:
                </span>
                <span className="font-mono text-2xl font-bold text-[#24211D] tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Advance policy note */}
              <div className="p-3 bg-[#F3EFEA] border border-[#D8CEBE] rounded-md space-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-[#8C5E35] font-semibold text-xs">
                  <Info className="w-3.5 h-3.5" />
                  <span>Custom Order Terms: 50% Advance</span>
                </div>
                <p className="text-[11px] text-[#5A5248] leading-relaxed">
                  For customized favor orders, a 50% advance deposit (৳{advanceRequired.toLocaleString()}) is required via bKash or Nagad. The remaining 50% is payable upon doorstep delivery.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleBook}
                className={`w-full py-3 px-4 text-xs sm:text-sm font-medium rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  added
                    ? 'bg-emerald-800 text-white'
                    : 'bg-[#24211D] hover:bg-[#3D3730] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Quotation Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C68B59]" />
                    <span>Add Custom Order to Bag (50% Advance: ৳{advanceRequired})</span>
                  </>
                )}
              </button>

              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 text-xs font-medium text-[#24211D] bg-[#EAE0D5] hover:bg-[#DFD3C5] border border-[#D8CEBE] rounded transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Discuss Directly on Facebook Page</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A6F62] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C5E35]" />
              <span>100% Pure Botanical Soy Wax Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
