import { Product, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'bubble-classic-ivory',
    name: 'Artisanal Bubble Soy Candle',
    category: 'bubble',
    price: 320,
    originalPrice: 380,
    image: '/images/bubble_soy_candle_1790333573183.jpg',
    scentFamily: 'Sweet Gourmand',
    scentNotes: ['French Vanilla', 'Warm Caramel', 'Toasted Almond'],
    dimensions: '6cm x 6cm x 6cm (approx. 150g)',
    burnTime: '18-22 Hours',
    waxType: '100% Pure Botanical Soy Wax',
    description: 'Our signature geometric 6x6 bubble cube, hand-poured with 100% organic plant-based soy wax and a lead-free braided cotton wick for an even, soot-free burn.',
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'floating-botanical-peony',
    name: 'Floating Botanical Bloom Candles (Set of 4)',
    category: 'floating',
    price: 450,
    originalPrice: 520,
    image: '/images/floating_flower_candle_1790333589595.jpg',
    scentFamily: 'Floral',
    scentNotes: ['Wild Peony', 'Dewy Rose Petals', 'White Jasmine'],
    dimensions: 'Set of 4 floating flowers (7cm diameter each)',
    burnTime: '4-5 Hours each on water',
    waxType: '100% Soy Wax with Fine Essential Oils',
    description: 'Delicately sculpted flower blossoms designed to float gracefully in decorative glass bowls or traditional water urulis. Ideal for candlelit dinners and tranquil home accents.',
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'sculpted-aphrodite-torso',
    name: 'Aphrodite Classical Sculpted Torso',
    category: 'sculpted',
    price: 490,
    originalPrice: 550,
    image: '/images/sculpted_torso_pillar_1790333600915.jpg',
    scentFamily: 'Woody & Warm',
    scentNotes: ['Amber Sandalwood', 'Cashmere Musk', 'Dry Cedar'],
    dimensions: '10cm x 5.5cm x 4.5cm',
    burnTime: '15-18 Hours (Decorative recommended)',
    waxType: '100% Natural Soy & Beeswax Blend',
    description: 'Museum-inspired neoclassical torso sculpture. Crafted as both a functional aromatic candle and an architectural mantelpiece art object for contemporary interiors.',
    isNewArrival: true,
    inStock: true,
  },
  {
    id: 'luxe-festive-hamper',
    name: 'The Líora Luxe Signature Gift Hamper',
    category: 'hampers',
    price: 1450,
    originalPrice: 1650,
    image: '/images/luxury_gift_hamper_1790333614919.jpg',
    scentFamily: 'Floral',
    scentNotes: ['English Pear & Freesia', 'Amber Noir', 'Warm Cardamom'],
    dimensions: 'Premium Rigid Presentation Box (24cm x 18cm x 9cm)',
    burnTime: '55+ Combined Hours',
    waxType: '100% Pure Soy Wax Collection',
    description: 'A curated gift box containing 1 Signature Bubble Candle, 2 Floating Floral Candles, 1 Botanical Wax Sachet, luxury glass match bottle with black striker, and a custom inscription card.',
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'fluted-pillar-duo',
    name: 'Nordic Ribbed & Fluted Pillar Duo',
    category: 'sculpted',
    price: 580,
    originalPrice: 650,
    image: '/images/hero_artisan_candles_1790333552254.jpg',
    scentFamily: 'Fresh & Citrus',
    scentNotes: ['Bergamot Blossom', 'White Tea Leaf', 'Crisp Cotton'],
    dimensions: 'Pair: 15cm & 10cm height (5cm diameter)',
    burnTime: '30-35 Hours',
    waxType: '100% Soy Wax (Cotton Braided Wick)',
    description: 'Minimalist Scandinavian fluted column pillars. Elegant vertical fluting that casts warm architectural shadows across dining tables and consoles.',
    inStock: true,
  },
  {
    id: 'botanical-aroma-sachets',
    name: 'Handcrafted Botanical Wax Tablet (Pack of 2)',
    category: 'jar',
    price: 380,
    originalPrice: 420,
    image: '/images/bubble_soy_candle_1790333573183.jpg',
    scentFamily: 'Woody & Warm',
    scentNotes: ['Lavender Woods', 'Eucalyptus', 'French Rosemary'],
    dimensions: '9cm x 5cm x 1cm with velvet hanging ribbon',
    burnTime: 'Flameless Fragrance (Lasts 90+ days)',
    waxType: 'Soy Wax infused with real dried botanicals',
    description: 'Flameless scented wax tablets embedded with delicate botanicals. Hang in wardrobes, closets, drawers, or vehicles to keep textiles smelling like a boutique sanctuary.',
    isNewArrival: true,
    inStock: true,
  }
];

export const PRODUCTS = INITIAL_PRODUCTS;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  announcementText: '✨ Handcrafted 100% Botanical Soy Wax Candles · Nationwide Delivery · Min Order ৳200',
  minimumOrder: 200,
  deliveryFeeDhaka: 70,
  deliveryFeeOutside: 130,
  bkashNumber: '01700-000000',
  nagadNumber: '01800-000000',
  supportPhone: '+880 1700-000000',
  supportEmail: 'info.houseofliora@gmail.com',
  facebookUrl: 'https://www.facebook.com/houseofliorabd',
  instagramUrl: 'https://www.instagram.com/_liora.bd_',
};

export const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'HL-8291',
    createdAt: '2026-09-24 16:30',
    customerName: 'Raisa Ahmed',
    customerPhone: '01711223344',
    customerAddress: 'House 42, Road 11, Banani, Dhaka',
    deliveryArea: 'dhaka' as const,
    paymentMethod: 'cod' as const,
    items: [
      { title: 'Artisanal Bubble Soy Candle', quantity: 2, price: 320, scent: 'French Vanilla' },
      { title: 'Floating Botanical Bloom Candles (Set of 4)', quantity: 1, price: 450, scent: 'Wild Peony' },
    ],
    subtotal: 1090,
    deliveryFee: 70,
    grandTotal: 1160,
    advanceRequired: 0,
    status: 'Confirmed' as const,
  },
  {
    id: 'HL-7430',
    createdAt: '2026-09-23 11:15',
    customerName: 'Tanvir Chowdhury',
    customerPhone: '01819556677',
    customerAddress: 'Apartment 5B, Khulshi Hill, Chittagong',
    deliveryArea: 'outside' as const,
    paymentMethod: 'bkash' as const,
    transactionId: 'BK79182LA',
    items: [
      { title: 'The Líora Luxe Signature Gift Hamper', quantity: 1, price: 1450, scent: 'English Pear & Freesia' },
    ],
    subtotal: 1450,
    deliveryFee: 130,
    grandTotal: 1580,
    advanceRequired: 0,
    status: 'Shipped' as const,
  }
];

export const SCENT_FAMILIES = [
  {
    name: 'Floral',
    description: 'Romantic, delicate notes of wild peony, dewy rose, and evening jasmine.',
    recommendedFor: 'Evening relaxation, candlelit dinners, and wedding keepsakes.'
  },
  {
    name: 'Woody & Warm',
    description: 'Grounding base notes of sandalwood, amber, cashmere, and cedarwood.',
    recommendedFor: 'Bedtime reading, rainy evenings, and mindful meditation.'
  },
  {
    name: 'Fresh & Citrus',
    description: 'Invigorating bursts of bergamot, green tea leaves, lemongrass, and crisp air.',
    recommendedFor: 'Morning work sessions, creative desks, and kitchen freshness.'
  },
  {
    name: 'Sweet Gourmand',
    description: 'Indulgent, dessert-like aromas of warm French vanilla and roasted caramel.',
    recommendedFor: 'Cozy gatherings, festive celebrations, and gift boxes.'
  }
];
