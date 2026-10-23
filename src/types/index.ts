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

export type OrderStatus =
  | "pending confirmation"
  | "pending"
  | "confirmed"
  | "processing"
  | "ready for dispatch"
  | "shipped"
  | "out for delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "successful" | "paid" | "failed" | "refunded" | "cancelled";

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
  paymentMethod?: "paystack" | "card" | "delivery";
  paymentReference?: string;
  paystackTransactionId?: string;
  paystackPaidAt?: string;
  subtotal: number;
  shippingFee: number;
  platformCommission: number;
  total: number;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  deliveryStatus?: "unassigned" | "assigned" | "picked_up" | "in_transit" | "delivered";
  createdAt: number;
  updatedAt: number;
  items?: OrderItem[];
  storeName?: string;
  buyerName?: string;
  buyerEmail?: string;
}

export interface PaymentTransaction {
  _id: string;
  reference: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  gateway: "paystack" | "delivery";
  status: PaymentStatus;
  channel?: string;
  paidAt?: string;
  gatewayResponse?: string;
  createdAt: number;
}

export interface SellerPayoutRequest {
  _id: string;
  sellerId: string;
  storeId?: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "pending" | "approved" | "processed" | "rejected";
  paystackTransferCode?: string;
  paystackReference?: string;
  notes?: string;
  createdAt: number;
  processedAt?: number;
}

export interface DeliveryAgent {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: "motorcycle" | "van" | "bicycle" | "car";
  licensePlate?: string;
  city: string;
  isAvailable: boolean;
  activeDeliveriesCount: number;
  completedDeliveriesCount: number;
  rating?: number;
  createdAt: number;
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
