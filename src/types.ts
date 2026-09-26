export interface Product {
  id: string;
  name: string;
  category: 'bubble' | 'floating' | 'sculpted' | 'jar' | 'hampers';
  price: number;
  originalPrice?: number;
  image: string;
  scentFamily: 'Floral' | 'Woody & Warm' | 'Fresh & Citrus' | 'Sweet Gourmand';
  scentNotes: string[];
  dimensions: string;
  burnTime: string;
  waxType: string;
  description: string;
  inStock?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedScent?: string;
  customRibbonColor?: string;
  customTagText?: string;
}

export interface CustomFavorItem {
  productTitle: string;
  quantity: number;
  unitPrice: number;
  total: number;
  advanceRequired: number;
  details: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea: 'dhaka' | 'outside';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  transactionId?: string;
  items: {
    title: string;
    quantity: number;
    price: number;
    scent?: string;
  }[];
  customFavors?: CustomFavorItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  advanceRequired: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface StoreSettings {
  faviconUrl?: string;
  announcementText: string;
  minimumOrder: number;
  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
  bkashNumber: string;
  nagadNumber: string;
  supportPhone: string;
  supportEmail: string;
  facebookUrl: string;
  instagramUrl: string;
}

export interface SiteTheme {
  headingFont: string;
  bodyFont: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

export interface ReviewItem {
  name: string;
  location: string;
  comment: string;
  product: string;
  verified?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteContent {
  theme: SiteTheme;
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    btnPrimary: string;
    btnSecondary: string;
    heroImage: string;
    badge1Label: string;
    badge1Value: string;
    badge2Label: string;
    badge2Value: string;
    badge3Label: string;
    badge3Value: string;
    floatingTag: string;
    floatingTitle: string;
    trustText: string;
  };
  catalog: {
    badge: string;
    title: string;
    subtitle: string;
    quizBtnText: string;
  };
  favors: {
    badge: string;
    title: string;
    subtitle: string;
    consultationBtn: string;
  };
  care: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  reviews: {
    badge: string;
    title: string;
    items: ReviewItem[];
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  footer: {
    brandTagline: string;
    deliveryPolicy: string;
    paymentPolicy: string;
    copyright: string;
  };
}

