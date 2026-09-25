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
