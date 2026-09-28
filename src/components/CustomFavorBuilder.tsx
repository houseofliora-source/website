import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Edit3 
} from 'lucide-react';
import { SiteContent, Product } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import { INITIAL_PRODUCTS } from '../data/products';

interface CustomFavorBuilderProps {
  facebookUrl?: string;
  supportPhone?: string;
  content?: SiteContent['favors'];
  isEditMode?: boolean;
  onEdit?: (tab?: string) => void;
  products?: Product[];
  onSelectProduct?: (productId: string) => void;
}

export const CustomFavorBuilder: React.FC<CustomFavorBuilderProps> = ({
  facebookUrl = 'https://www.facebook.com/houseofliorabd',
  supportPhone = '01700000000',
  content = DEFAULT_SITE_CONTENT.favors,
  isEditMode = false,
  onEdit,
  products = [],
  onSelectProduct,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideProducts = (products && products.length > 0 ? products : INITIAL_PRODUCTS).filter(p => p.image);
  const totalSlides = slideProducts.length;

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalSlides, isPaused]);

  const activeProduct = totalSlides > 0 ? slideProducts[currentSlide % totalSlides] : null;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 0) {
      setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 0) {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }
  };

  const handleCardClick = () => {
    if (activeProduct && onSelectProduct) {
      onSelectProduct(activeProduct.id);
    }
  };

  // WhatsApp link preparation
  const rawPhone = content.whatsappNumber || supportPhone || '01700000000';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  // WhatsApp formatted inquiry message with user inputs
  const userWhatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `Hello House of Líora, I have submitted a custom order inquiry:\n\n• Name: ${name}\n• Phone: ${phone}\n• Email: ${email}\n• Requirements & Details: ${message}`
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
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
        message,
      };
      localStorage.setItem('liora_custom_inquiries', JSON.stringify([newInquiry, ...existingInquiries]));
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

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

        {/* SECTION HEADER: Single line title */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 apple-glass-pill text-xs font-semibold uppercase tracking-widest text-[#8C5E35]">
            <HeartHandshake className="w-4 h-4 text-[#C68B59]" />
            <span>{content.badge || 'Bespoke Atelier & Concierge'}</span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#24211D] font-normal leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {content.title || 'Custom Wedding & Event Favors'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Dynamic Catalog Product Slideshow Photocard          */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div 
              onClick={handleCardClick}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="apple-glass-card p-2 sm:p-3 rounded-3xl overflow-hidden shadow-xl cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:border-white w-full"
              title={activeProduct ? `Click to view ${activeProduct.name}` : 'Explore Collection'}
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#EAE0D5] aspect-4/3 sm:aspect-16/11 lg:aspect-4/3 w-full">
                {activeProduct && (
                  <>
                    <img
                      key={activeProduct.id}
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-fade-in"
                    />

                    {/* Subtle Gradient Shadow for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

                    {/* Top Floating Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="apple-glass-pill px-3 py-1 rounded-full text-white text-[11px] font-medium tracking-wide uppercase shadow-sm">
                        {activeProduct.category || 'Atelier Collection'}
                      </span>
                    </div>

                    {/* Bottom Info Bar: Product Name, Price, and Click Hint */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                      <div className="apple-glass-dark px-3.5 py-1.5 rounded-full text-white flex items-center gap-2 max-w-[70%] sm:max-w-[75%] shadow-md">
                        <span className="font-serif text-xs sm:text-sm font-medium truncate">
                          {activeProduct.name}
                        </span>
                        <span className="font-mono text-xs text-[#E5A97A] font-semibold shrink-0">
                          ৳{activeProduct.price}
                        </span>
                      </div>

                      <div className="apple-glass-pill px-3 py-1.5 rounded-full text-white text-[11px] font-medium flex items-center gap-1 shrink-0 group-hover:bg-white group-hover:text-[#24211D] transition-colors shadow-md">
                        <span>View Piece</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Prev / Next navigation buttons on hover */}
                    {totalSlides > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full apple-glass-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full apple-glass-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 apple-glass-dark rounded-full">
                          {slideProducts.slice(0, 6).map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === currentSlide % Math.min(totalSlides, 6)
                                  ? 'bg-amber-400 w-3'
                                  : 'bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Clean Direct Contact & Message Form                 */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="apple-glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl relative w-full">
              {submitted ? (
                /* SUCCESS CONFIRMATION STATE */
                <div className="py-8 text-center space-y-5 animate-fade-in">
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
                      Your custom order request has been successfully recorded. Our atelier team will review your specifications and contact you shortly.
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 max-w-sm mx-auto">
                    <a
                      href={userWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Directly via WhatsApp Now</span>
                      <ArrowRight className="w-4 h-4" />
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

                  {/* Full Name */}
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

                  {/* Phone Number & Email Address (Side by Side on sm+) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                        <span>Phone Number *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 apple-glass-input rounded-xl text-xs font-sans focus:border-[#8C5E35]"
                      />
                    </div>

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
                  </div>

                  {/* Order Details & Requirements */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#24211D] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#8C5E35]" />
                      <span>Order Details & Requirements *</span>
                    </label>
                    <textarea
                      required
                      rows={4}
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
