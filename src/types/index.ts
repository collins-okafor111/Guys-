export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  emailVerified?: boolean;
  passwordHash?: string;
  authProvider?: "email" | "google";
  createdAt: number;
  updatedAt: number;
}

export interface Store {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  categories: string[];
  status: "open" | "closed" | "pending" | "suspended";
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  followersCount: number;
  createdAt: number;
  updatedAt: number;
  owner?: User;
}

export interface Product {
  _id: string;
  storeId: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  inventory: number;
  status: "published" | "draft" | "archived" | "out_of_stock";
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
  storeName?: string;
  storeVerified?: boolean;
  storeSlug?: string;
  likesCount?: number;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface CartItem {
  _id: string;
  userId: string;
  productId: string;
  storeId: string;
  quantity: number;
  priceAtAddition: number;
  createdAt: number;
  product?: Product & { storeName: string };
  currentPrice?: number;
  availableStock?: number;
  itemTotal?: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  _id?: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  buyerId: string;
  storeId: string;
  sellerId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  platformCommission: number;
  total: number;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: number;
  updatedAt: number;
  items?: OrderItem[];
  storeName?: string;
  buyerName?: string;
  buyerEmail?: string;
}

export interface Follow {
  _id: string;
  followerId: string;
  followedSellerId: string;
  storeId?: string;
  createdAt: number;
}

export interface Favorite {
  _id: string;
  userId: string;
  productId: string;
  createdAt: number;
}

export interface Conversation {
  _id: string;
  participantIds: string[];
  storeId?: string;
  lastMessage?: string;
  lastMessageTimestamp: number;
  updatedAt: number;
  otherUser?: User | null;
  store?: Store | null;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachmentUrl?: string;
  read: boolean;
  createdAt: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: "order" | "follow" | "message" | "status" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

export interface Review {
  _id: string;
  productId: string;
  storeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: number;
  userName?: string;
  userAvatar?: string;
}

export interface PlatformConfig {
  rate: number;
  promotionalZeroActive: boolean;
  updatedAt: number;
}
