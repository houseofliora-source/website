import { SiteContent, ProductPageContent } from '../types';

export const DEFAULT_PRODUCT_PAGE_CONTENT: ProductPageContent = {
  courierGuarantee: 'Nationwide Courier: Dhaka ৳70 (24-48 hrs), Outside Dhaka ৳130 (2-4 days).',
  paymentGuarantee: 'Payment Security: Cash on Delivery (COD) & Verified bKash/Nagad available.',
  craftGuarantee: 'Pure Craftsmanship: 100% botanical soy wax, no petroleum paraffin, soot-free burn.',
  tab1Label: 'Artisanal Story & Details',
  tab2Label: 'Fragrance Architecture',
  tab3Label: 'Burn Rituals & Care',
  tab4Label: 'Craft Specifications',
  philosophyTitle: 'The Philosophy Behind',
  philosophyStory1: 'Every piece in the House of Líora collection is an intentional celebration of botanical beauty, slow living, and artisanal craftsmanship. Hand-poured in small numbered micro-batches in Dhaka, each silhouette transforms living spaces into serene, fragrant sanctuaries.',
  philosophyStory2: 'Formulated exclusively with 100% plant-based soy wax and infused with high-potency, IFRA-compliant fine perfumery oils. Unlike commercial paraffin candles, our formulation burns exceptionally clean, cooler, and longer without toxic black soot or petroleum fumes.',
  olfactorySubtitle: 'Our perfumed formulations develop gradually as the wax pool warms, releasing distinct fragrant dimensions into your sanctuary:',
  careRitualsTitle: 'The Líora Candle Care Ritual',
  ritual1Title: 'The First Burn',
  ritual1Text: 'Allow the candle to burn for 2-3 hours until the melted wax pool reaches the edges. This establishes wax memory and prevents future tunneling.',
  ritual2Title: 'Trim the Wick',
  ritual2Text: 'Always trim the cotton braided wick to 5mm (1/4 inch) before each lighting to maintain a stable, soot-free flame.',
  ritual3Title: 'Sculptural Placement',
  ritual3Text: 'For pillar & bubble shapes, place on a heat-resistant tray or ceramic dish to collect natural wax teardrops.',
  ritual4Title: 'Extinguish with Grace',
  ritual4Text: 'Use a candle snuffer or gently dip the wick into the wax pool to prevent lingering smoke.',
  detailsHeading: 'Product Details',
  relatedHeading: 'Complete Your Living Sanctuary',
  relatedSubtitle: 'Complementary artisanal silhouettes and botanical aromas hand-poured in micro-batches.',
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  theme: {
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Plus Jakarta Sans',
    primaryColor: '#24211D',
    accentColor: '#8C5E35',
    backgroundColor: '#FAF8F5',
  },
  hero: {
    badge: 'Artisanal Studio Collection',
    title: 'The Art of Gentle',
    titleHighlight: 'Luminescence',
    subtitle: 'Poured in small artisanal batches using 100% pure botanical soy wax, lead-free braided cotton wicks, and phthalate-free fine fragrance oils. Designed to elevate living rituals and illuminate everyday spaces.',
    btnPrimary: 'Explore Collections',
    btnSecondary: 'Custom Wedding & Event Favors',
    heroImage: '/images/hero_artisan_candles_1790333552254.jpg',
    badge1Label: 'Wax Composition',
    badge1Value: '100% Pure Soy',
    badge2Label: 'Craft Technique',
    badge2Value: 'Hand-Poured',
    badge3Label: 'Fulfillment',
    badge3Value: 'Nationwide Courier',
    floatingTag: 'Organic Plant-Based Wax',
    floatingTitle: 'The Líora Signature Atelier',
    trustText: 'Zero toxic paraffin · Clean soot-free burn',
    ribbonItem1: '100% Natural Botanical Soy Wax',
    ribbonItem2: 'Doorstep Courier (Dhaka ৳70, Outside ৳130)',
    ribbonItem3: 'Bespoke Gifting & Custom Event Favors',
    ribbonItem4: 'Cash on Delivery & Verified bKash',
  },
  catalog: {
    badge: 'Botanical Wax Catalog',
    title: 'Hand-Poured Artisan Creations',
    subtitle: 'Small batch botanical formulations. Pure cotton braided wicks, phthalate-free fine perfumes, and zero petroleum paraffin.',
    quizBtnText: 'Take Scent Profile Quiz',
    showFilter: true,
    categories: [
      { id: 'all', label: 'All Pieces' },
      { id: 'bubble', label: 'Bubble Cubes' },
      { id: 'floating', label: 'Floating Blooms' },
      { id: 'sculpted', label: 'Sculpted Columns' },
      { id: 'hampers', label: 'Gift Hampers' },
      { id: 'jar', label: 'Aroma Tablets' },
    ],
  },
  productPage: DEFAULT_PRODUCT_PAGE_CONTENT,
  scentQuiz: {
    badge: 'The Líora Olfactory Guide',
    title: 'Find Your Signature Candle Profile',
    subtitle: 'Answer 3 brief questions to reveal your ideal artisanal fragrance and sculptural silhouette.',
    triggerBtnText: 'Take Scent Profile Quiz',
    resultBadge: 'Your Ideal Scent Match',
    resultCtaText: 'View & Order Candle',
    retakeBtnText: 'Retake Quiz',
    defaultProductId: 'bubble-classic-ivory',
    questions: [
      {
        id: 'q_mood',
        prompt: '1. What ambiance or atmosphere do you wish to cultivate?',
        hint: 'Ambiance & Emotional Tone',
        options: [
          {
            id: 'relax',
            title: 'Deep Comfort & Relaxation',
            desc: 'Warm vanilla, almond & golden caramel',
            icon: '🕯️',
            targetCategory: 'bubble',
            targetProductId: 'bubble-classic-ivory',
          },
          {
            id: 'romantic',
            title: 'Delicate Botanical Romance',
            desc: 'Dewy peony petals & fresh jasmine',
            icon: '🌸',
            targetCategory: 'floating',
            targetProductId: 'floating-botanical-peony',
          },
          {
            id: 'grounding',
            title: 'Grounding & Meditative',
            desc: 'Rich amber, cedarwood & sandalwood',
            icon: '🌿',
            targetCategory: 'sculpted',
            targetProductId: 'sculpted-aphrodite-torso',
          },
          {
            id: 'energizing',
            title: 'Crisp & Uplifting',
            desc: 'Bergamot blossom & white tea leaves',
            icon: '✨',
            targetCategory: 'sculpted',
            targetProductId: 'fluted-pillar-duo',
          },
        ],
      },
      {
        id: 'q_room',
        prompt: '2. Where will this candle live most of its burning hours?',
        hint: 'Living Sanctuary Placement',
        options: [
          {
            id: 'bedroom',
            title: 'Bedside Nightstand',
            desc: 'Quiet evening unwinding before sleep',
            icon: '🛏️',
            targetCategory: 'bubble',
            targetProductId: 'bubble-classic-ivory',
          },
          {
            id: 'living',
            title: 'Living Room Coffee Table',
            desc: 'Welcoming centerpiece statement piece',
            icon: '🛋️',
            targetCategory: 'sculpted',
            targetProductId: 'sculpted-aphrodite-torso',
          },
          {
            id: 'bath',
            title: 'Spa Bath or Water Uruli',
            desc: 'Serene floating blossoms in water',
            icon: '🛁',
            targetCategory: 'floating',
            targetProductId: 'floating-botanical-peony',
          },
          {
            id: 'study',
            title: 'Creative Studio / Wardrobe Space',
            desc: 'Flameless botanicals or focused column',
            icon: '📚',
            targetCategory: 'jar',
            targetProductId: 'botanical-aroma-sachets',
          },
        ],
      },
      {
        id: 'q_vibe',
        prompt: '3. What sculptural silhouette speaks to your aesthetic?',
        hint: 'Form, Silhouette & Gifting Intent',
        options: [
          {
            id: 'sweet',
            title: 'Geometric Bubble Cube',
            desc: 'Iconic modern playful silhouette',
            icon: '🧊',
            targetCategory: 'bubble',
            targetProductId: 'bubble-classic-ivory',
          },
          {
            id: 'floral',
            title: 'Floating Botanical Petals',
            desc: 'Organic floral elegance on water',
            icon: '🌺',
            targetCategory: 'floating',
            targetProductId: 'floating-botanical-peony',
          },
          {
            id: 'sculpted',
            title: 'Classical Neoclassic Torso',
            desc: 'Gallery art piece on limestone',
            icon: '🏛️',
            targetCategory: 'sculpted',
            targetProductId: 'sculpted-aphrodite-torso',
          },
          {
            id: 'gift',
            title: 'Curated Presentation Hamper',
            desc: 'Multi-piece luxury gifting box',
            icon: '🎁',
            targetCategory: 'hampers',
            targetProductId: 'luxe-festive-hamper',
          },
        ],
      },
    ],
  },
  favors: {
    badge: 'Bespoke Atelier & Concierge',
    title: 'Custom & Bulk Orders Inquiry',
    subtitle: 'From intimate wedding celebrations to corporate gifting and personalized handmade collections—consult directly with our atelier for tailored creations.',
    consultationBtn: 'Chat with Artisan on WhatsApp',
    whatsappNumber: '',
    whatsappMessage: 'Hello House of Líora, I would like to inquire about a custom order.',
    formTitle: 'Send a Custom Inquiry',
    formSubtitle: 'Leave your contact details and requirements below. Our atelier will get back to you promptly with recommendations and a detailed quotation.',
    feature1Title: 'Tailored Artisanal Craft',
    feature1Desc: 'Custom fragrance blends, vessel aesthetics, and personalized finishes curated to match your vision.',
    feature2Title: 'Flexible Batch Quantities',
    feature2Desc: 'From intimate gatherings of 20 pieces to large-scale wedding and corporate celebrations of 500+ pieces.',
    feature3Title: 'Direct Atelier Support',
    feature3Desc: 'Direct conversation with our master crafter, fast quotation, and sample guidance before crafting.',
    minQuantity: 20,
    maxQuantity: 500,
    quantityStep: 10,
    tierDiscountText: '50+ pcs: 5% off · 100+ pcs: 10% off · 200+ pcs: 15% off',
    leadTimeText: '4–7 Business Days',
    advanceNoticeText: '50% advance required upon confirmation.',
    moldTitle: '1. Select Candle Mold Form:',
    moldItems: [
      { id: 'bubble', label: 'Bubble Cube', basePrice: 280 },
      { id: 'floating', label: 'Floating Peony', basePrice: 190 },
      { id: 'sculpted', label: 'Sculpted Torso', basePrice: 390 },
      { id: 'tablet', label: 'Aroma Tablet', basePrice: 220 },
    ],
    quantityTitle: '2. Order Quantity (Pieces):',
    aromaTitle: '3. Signature Aroma:',
    aromaItems: [
      'French Vanilla & Almond (Sweet)',
      'Wild Peony & Rose Petals (Floral)',
      'Amber Sandalwood & Cedar (Warm)',
      'White Tea & Bergamot (Fresh)',
    ],
    ribbonTitle: '4. Ribbon Material & Tone:',
    ribbonItems: [
      'Champagne Gold Chiffon',
      'Oat Rustic Linen (Minimalist)',
      'Blush Dusty Rose (Bridal)',
      'Eucalyptus Sage Green',
      'Espresso Velvet',
    ],
    packagingTitle: '5. Packaging Style:',
    packagingItems: [
      { id: 'luxe_window', title: 'Clear View Box', price: '+৳45/pc', addonPrice: 45, desc: 'See-through top with satin ribbon' },
      { id: 'kraft_ribbon', title: 'Rigid Kraft Box', price: '+৳35/pc', addonPrice: 35, desc: 'Debossed gold foil crest' },
      { id: 'standard', title: 'Minimalist Wrap', price: '+৳25/pc', addonPrice: 25, desc: 'Eco tissue & wax seal' },
    ],
    inscriptionTitle: '6. Personalized Inscription:',
    inscriptionNote: 'Includes personalized foil-accented card and botanical sprig.',
    cardBoxBadge: 'Live Estimate & Terms',
    cardBoxTitle: 'Order Quotation',
    leadTimeText: '4–7 Business Days',
    advanceNoticeText: '50% advance required upon confirmation.',
  },
  care: {
    badge: 'Artisan Soy Wisdom',
    title: 'The Líora Candle Care Ritual',
    subtitle: 'Pure botanical soy wax is alive with natural plant characteristics. Follow these simple rituals for a clean, prolonged, and soot-free burn.',
    step1Title: '1. The First Burn Memory',
    step1Desc: 'Allow wax to melt completely across the top on your initial burn (1-2 hours) to avoid tunneling and preserve candle life.',
    step2Title: '2. Trim Cotton Wick (1/4")',
    step2Desc: 'Trim cotton wick to 1/4 inch before every burn. This prevents high flickering, black smoke, and ensures pure scent throw.',
    step3Title: '3. Soy Frosting is Natural',
    step3Desc: 'Slight white crystalline film (frosting) on your candle is a natural hallmark of 100% pure botanical soy wax with zero toxic additives.',
    step4Title: '4. Use a Heat-Safe Dish',
    step4Desc: 'Always place free-standing sculptural or pillar candles on a heat-safe ceramic plate or marble tray before lighting.',
  },
  reviews: {
    badge: 'Customer Experiences',
    title: 'Voices from Líora Patrons',
    items: [
      {
        name: 'Nusrat Jahan',
        location: 'Dhanmondi, Dhaka',
        comment: 'Ordered the bubble candle and floating flowers. The fragrance fill is subtle and elegant. They make my coffee table look like a curated Pinterest board!',
        product: 'Artisanal Bubble Soy Candle',
        verified: true,
      },
      {
        name: 'Tanvir Hossain & Raisa',
        location: 'Gulshan 2, Dhaka',
        comment: 'We ordered 60 bespoke favor boxes for our wedding celebration. The custom calligraphy tags and champagne ribbon were flawless. Guests loved them!',
        product: 'Bespoke Event Favors (60 pcs)',
        verified: true,
      },
      {
        name: 'Sabrina Rahman',
        location: 'Khulshi, Chittagong',
        comment: 'Received the gift hamper in pristine condition within 3 days. Zero black smoke, true 100% pure soy wax. House of Líora is now my go-to gift brand.',
        product: 'The Líora Luxe Signature Gift Hamper',
        verified: true,
      },
    ],
  },
  faq: {
    badge: 'Frequently Asked Questions',
    title: 'Got Questions? We Have Answers.',
    subtitle: 'Everything you need to know about our ingredients, delivery, and custom orders.',
    items: [
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
    ],
  },
  footer: {
    brandTagline: 'Hand-pouring 100% botanical soy candles, floating floral blossoms, and architectural sculptural silhouettes. Clean-burning elegance for modern living spaces.',
    deliveryPolicy: '📦 Delivery: Nationwide Doorstep Delivery (COD Available)',
    paymentPolicy: '💳 Payment: Cash on Delivery / bKash / Nagad',
    copyright: 'House of Líora (@houseofliorabd). All rights reserved.',
  },
};

export function sanitizeSiteContent(raw: any): SiteContent {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_SITE_CONTENT;
  }
  return {
    theme: {
      ...DEFAULT_SITE_CONTENT.theme,
      ...(raw.theme && typeof raw.theme === 'object' ? raw.theme : {}),
    },
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      ...(raw.hero && typeof raw.hero === 'object' ? raw.hero : {}),
    },
    catalog: {
      ...DEFAULT_SITE_CONTENT.catalog,
      ...(raw.catalog && typeof raw.catalog === 'object' ? raw.catalog : {}),
      showFilter: raw.catalog?.showFilter !== undefined ? Boolean(raw.catalog.showFilter) : true,
      categories: Array.isArray(raw.catalog?.categories) && raw.catalog.categories.length > 0
        ? raw.catalog.categories
        : (DEFAULT_SITE_CONTENT.catalog.categories || [
            { id: 'all', label: 'All Pieces' },
            { id: 'bubble', label: 'Bubble Cubes' },
            { id: 'floating', label: 'Floating Blooms' },
            { id: 'sculpted', label: 'Sculpted Columns' },
            { id: 'hampers', label: 'Gift Hampers' },
            { id: 'jar', label: 'Aroma Tablets' },
          ]),
    },
    favors: {
      ...DEFAULT_SITE_CONTENT.favors,
      ...(raw.favors && typeof raw.favors === 'object' ? raw.favors : {}),
      moldItems: Array.isArray(raw.favors?.moldItems) && raw.favors.moldItems.length > 0 
        ? raw.favors.moldItems 
        : (DEFAULT_SITE_CONTENT.favors.moldItems || []),
      aromaItems: Array.isArray(raw.favors?.aromaItems) && raw.favors.aromaItems.length > 0 
        ? raw.favors.aromaItems 
        : (DEFAULT_SITE_CONTENT.favors.aromaItems || []),
      ribbonItems: Array.isArray(raw.favors?.ribbonItems) && raw.favors.ribbonItems.length > 0 
        ? raw.favors.ribbonItems 
        : (DEFAULT_SITE_CONTENT.favors.ribbonItems || []),
      packagingItems: Array.isArray(raw.favors?.packagingItems) && raw.favors.packagingItems.length > 0 
        ? raw.favors.packagingItems 
        : (DEFAULT_SITE_CONTENT.favors.packagingItems || []),
      categoryFlows: Array.isArray(raw.favors?.categoryFlows) && raw.favors.categoryFlows.length > 0
        ? raw.favors.categoryFlows
        : (DEFAULT_SITE_CONTENT.favors.categoryFlows || []),
    },
    care: {
      ...DEFAULT_SITE_CONTENT.care,
      ...(raw.care && typeof raw.care === 'object' ? raw.care : {}),
    },
    reviews: {
      badge: raw.reviews?.badge !== undefined ? raw.reviews.badge : DEFAULT_SITE_CONTENT.reviews.badge,
      title: raw.reviews?.title !== undefined ? raw.reviews.title : DEFAULT_SITE_CONTENT.reviews.title,
      items: Array.isArray(raw.reviews?.items) && raw.reviews.items.length > 0
        ? raw.reviews.items
        : DEFAULT_SITE_CONTENT.reviews.items,
    },
    faq: {
      badge: raw.faq?.badge !== undefined ? raw.faq.badge : DEFAULT_SITE_CONTENT.faq.badge,
      title: raw.faq?.title !== undefined ? raw.faq.title : DEFAULT_SITE_CONTENT.faq.title,
      subtitle: raw.faq?.subtitle !== undefined ? raw.faq.subtitle : DEFAULT_SITE_CONTENT.faq.subtitle,
      items: Array.isArray(raw.faq?.items) && raw.faq.items.length > 0
        ? raw.faq.items
        : DEFAULT_SITE_CONTENT.faq.items,
    },
    footer: {
      ...DEFAULT_SITE_CONTENT.footer,
      ...(raw.footer && typeof raw.footer === 'object' ? raw.footer : {}),
    },
    scentQuiz: raw.scentQuiz && typeof raw.scentQuiz === 'object'
      ? {
          ...(DEFAULT_SITE_CONTENT.scentQuiz || {}),
          ...raw.scentQuiz,
          questions: Array.isArray(raw.scentQuiz.questions) && raw.scentQuiz.questions.length > 0
            ? raw.scentQuiz.questions
            : (DEFAULT_SITE_CONTENT.scentQuiz?.questions || []),
        }
      : DEFAULT_SITE_CONTENT.scentQuiz,
    productPage: {
      ...DEFAULT_PRODUCT_PAGE_CONTENT,
      ...(raw.productPage && typeof raw.productPage === 'object' ? raw.productPage : {}),
    },
  };
}
