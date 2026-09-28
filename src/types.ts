export interface CustomCategory {
  id: string;
  label: string;
}

export interface CatalogContent {
  badge: string;
  title: string;
  subtitle: string;
  quizBtnText: string;
  showFilter?: boolean;
  categories?: CustomCategory[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  scentFamily: string;
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
  customerEmail?: string;
  district?: string;
  specialNotes?: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface StoreSettings {
  adminPasscode?: string;
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

export interface FavorMoldItem {
  id: string;
  label: string;
  basePrice: number;
}

export interface FavorPackagingItem {
  id: string;
  title: string;
  price: string;
  addonPrice: number;
  desc: string;
}

export interface FavorContent {
  badge: string;
  title: string;
  subtitle: string;
  consultationBtn: string;
  moldTitle?: string;
  moldItems?: FavorMoldItem[];
  quantityTitle?: string;
  minQuantity?: number;
  maxQuantity?: number;
  quantityStep?: number;
  tierDiscountText?: string;
  aromaTitle?: string;
  aromaItems?: string[];
  ribbonTitle?: string;
  ribbonItems?: string[];
  packagingTitle?: string;
  packagingItems?: FavorPackagingItem[];
  inscriptionTitle?: string;
  inscriptionNote?: string;
  cardBoxBadge?: string;
  cardBoxTitle?: string;
  leadTimeText?: string;
  advanceNoticeText?: string;
}

export interface ScentQuizOption {
  id: string;
  title: string;
  desc: string;
  icon?: string;
  targetProductId?: string;
  targetCategory?: string;
}

export interface ScentQuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: ScentQuizOption[];
}

export interface ScentQuizContent {
  badge: string;
  title: string;
  subtitle: string;
  triggerBtnText: string;
  resultBadge: string;
  resultCtaText: string;
  retakeBtnText: string;
  defaultProductId?: string;
  questions: ScentQuizQuestion[];
}

export interface ProductPageContent {
  courierGuarantee: string;
  paymentGuarantee: string;
  craftGuarantee: string;
  tab1Label: string;
  tab2Label: string;
  tab3Label: string;
  tab4Label: string;
  philosophyTitle: string;
  philosophyStory1: string;
  philosophyStory2: string;
  olfactorySubtitle: string;
  careRitualsTitle: string;
  ritual1Title: string;
  ritual1Text: string;
  ritual2Title: string;
  ritual2Text: string;
  ritual3Title: string;
  ritual3Text: string;
  ritual4Title: string;
  ritual4Text: string;
  detailsHeading?: string;
  relatedHeading: string;
  relatedSubtitle: string;
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
    ribbonItem1?: string;
    ribbonItem2?: string;
    ribbonItem3?: string;
    ribbonItem4?: string;
  };
  catalog: CatalogContent;
  scentQuiz?: ScentQuizContent;
  productPage?: ProductPageContent;
  favors: FavorContent;
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

