import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Package, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  ArrowRight, 
  Edit3 
} from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface CustomFavorBuilderProps {
  facebookUrl?: string;
  supportPhone?: string;
  content?: SiteContent['favors'];
  isEditMode?: boolean;
  onEdit?: (tab?: string) => void;
}

export const CustomFavorBuilder: React.FC<CustomFavorBuilderProps> = ({
  facebookUrl = 'https://www.facebook.com/houseofliorabd',
  supportPhone = '01700000000',
  content = DEFAULT_SITE_CONTENT.favors,
  isEditMode = false,
  onEdit,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Artisanal Candles');
  const [message, setMessage] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // WhatsApp link preparation
  const rawPhone = content.whatsappNumber || supportPhone || '01700000000';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  
  const baseWhatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    content.whatsappMessage || 'Hello House of Líora, I would like to inquire about a custom order.'
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !message) {
      alert('Please fill in your name, phone number, email address, and order details.');
      return;
    }

    setIsSubmitting(true);

    // Save inquiry to localStorage for store records
    try {
      const existingInquiries = JSON.parse(localStorage.getItem('liora_custom_inquiries') || '[]');
      const newInquiry = {
        id: `INQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name,
        phone,
        email,
        category,
        message,
      };
      localStorage.setItem('liora_custom_inquiries', JSON.stringify([newInquiry, ...existingInquiries]));
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  // WhatsApp formatted inquiry message
  const userWhatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `Hello House of Líora, I have submitted a custom order inquiry:\n\n• Name: ${name}\n• Phone: ${phone}\n• Email: ${email}\n• Category: ${category}\n• Details: ${message}`
  )}`;

  return (
    <section id="custom-favors" className="py-16 md:py-24 bg-[#F5F1EB] border-b border-[#EAE0D5] relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Edit Trigger */}
        {isEditMode && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => onEdit?.('general')}
              className="px-4 py-1.5 apple-glass-dark text-white rounded-full text-xs font-medium shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-white/30"
              title="Edit Bespoke Inquiry Section"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Bespoke Section</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Editorial Presentation, Pillars & Direct WhatsApp CTA */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
                <HeartHandshake className="w-4 h-4 text-[#C68B59]" />
                <span>{content.badge || 'Bespoke Atelier & Concierge'}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#24211D] font-normal leading-tight">
                {content.title || 'Custom & Bulk Orders Inquiry'}
              </h2>

              <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed max-w-xl font-normal">
                {content.subtitle || 'From intimate wedding celebrations to corporate gifting and personalized handmade collections—consult directly with our atelier for tailored creations.'}
              </p>
            </div>

            {/* 3 Luxury Pillars */}
            <div className="space-y-3 pt-2">
              <div className="apple-glass-card rounded-2xl p-4 border border-white/80 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#24211D]">
                    {content.feature1Title || 'Tailored Artisanal Craft'}
                  </h4>
                  <p className="text-xs text-[#5A5248] mt-0.5 leading-relaxed">
                    {content.feature1Desc || 'Custom fragrance blends, vessel aesthetics, and personalized finishes curated to match your vision.'}
                  </p>
                </div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 border border-white/80 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#24211D]">
                    {content.feature2Title || 'Flexible Batch Quantities'}
                  </h4>
                  <p className="text-xs text-[#5A5248] mt-0.5 leading-relaxed">
                    {content.feature2Desc || 'From intimate gatherings of 20 pieces to large-scale wedding and corporate celebrations of 500+ pieces.'}
                  </p>
                </div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 border border-white/80 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#24211D]">
                    {content.feature3Title || 'Direct Atelier Support'}
                  </h4>
                  <p className="text-xs text-[#5A5248] mt-0.5 leading-relaxed">
                    {content.feature3Desc || 'Direct conversation with our master crafter, fast quotation, and sample guidance before crafting.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Instant Consultation Button */}
            <div className="pt-2 space-y-2">
              <a
                href={baseWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase inline-flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Phone className="w-4 h-4" />
                <span>{content.consultationBtn || 'Chat with Artisan on WhatsApp'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-[#7A6F62] flex items-center gap-1.5 pl-1">
                <span>⚡ Instant response · Direct artisan consultation · Custom catalog samples</span>
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Clean Direct Contact & Message Form                 */}
          {/* ================================================================= */}
          <div className="lg:col-span-6">
            <div className="apple-glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl relative">
              {submitted ? (
                /* SUCCESS CONFIRMATION STATE */
                <div className="py-10 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#8C5E35] apple-glass-pill px-3 py-1 uppercase tracking-wider inline-block">
                      Inquiry Received
                    </span>
                    <h3 className="font-serif text-2xl text-[#24211D]">
                      Thank You, {name}!
                    </h3>
                    <p className="text-xs text-[#5A5248] max-w-sm mx-auto leading-relaxed">
                      Your custom order request has been successfully recorded. Our atelier team will review your specifications and contact you via WhatsApp / Phone shortly.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 max-w-xs mx-auto">
                    <a
                      href={userWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full text-xs font-semibold tracking-wider uppercase block shadow-sm transition-all"
                    >
                      Send Directly via WhatsApp Now →
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName('');
                        setPhone('');
                        setEmail('');
                        setMessage('');
                      }}
                      className="w-full py-2.5 apple-glass-pill text-[#24211D] rounded-full text-xs font-medium cursor-pointer transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                /* INQUIRY FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-[#EAE0D5] pb-3">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#24211D]">
                      {content.formTitle || 'Send a Custom Inquiry'}
                    </h3>
                    <p className="text-xs text-[#7A6F62] mt-0.5">
                      {content.formSubtitle || 'Leave your contact details and requirements below. Our atelier will get back to you promptly.'}
                    </p>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Full Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tanvir Fahim"
                        className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans focus:border-[#8C5E35]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Phone (WhatsApp) *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans focus:border-[#8C5E35]"
                      />
                    </div>
                  </div>

                  {/* Email & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Email Address *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans focus:border-[#8C5E35]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Craft / Event Type</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans bg-white focus:border-[#8C5E35] cursor-pointer"
                      >
                        <option value="Artisanal Candles">Artisanal Candles & Favors</option>
                        <option value="Botanical Soaps">Botanical Soaps & Bath</option>
                        <option value="Ceramic & Homeware">Ceramic & Homeware Pieces</option>
                        <option value="Curated Gift Hampers">Curated Gift Hampers</option>
                        <option value="Other Custom Craft">Other Custom Project</option>
                      </select>
                    </div>
                  </div>

                  {/* Message & Requirements */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#8C5E35]" />
                      <span>Order Details & Requirements *</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify estimated quantity (e.g. 50 pcs), event date, preferred scents or styles, or any custom ideas..."
                      className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans focus:border-[#8C5E35] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 apple-glass-dark text-white rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Inquiry...' : 'Send Inquiry to Atelier'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
