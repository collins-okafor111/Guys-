import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Users table (buyers, sellers, admins)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.string(), // "buyer" | "seller" | "admin"
    phone: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    passwordHash: v.optional(v.string()),
    authProvider: v.optional(v.string()), // "email" | "google"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // 2. Seller Profiles table
  sellerProfiles: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    taxId: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    payoutMethod: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // 3. Stores table
  stores: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    categories: v.array(v.string()),
    status: v.string(), // "open" | "closed" | "pending" | "suspended"
    isVerified: v.boolean(),
    rating: v.number(),
    reviewCount: v.number(),
    followersCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // 4. Products table
  products: defineTable({
    storeId: v.id("stores"),
    sellerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    category: v.string(),
    images: v.array(v.string()),
    inventory: v.number(),
    status: v.string(), // "published" | "draft" | "archived" | "out_of_stock"
    rating: v.number(),
    reviewCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_seller", ["sellerId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_price", ["price"]),

  // 5. Categories table
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  // 6. Carts table
  carts: defineTable({
    userId: v.id("users"),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // 7. Cart Items table
  cartItems: defineTable({
    userId: v.id("users"),
    cartId: v.optional(v.string()),
    productId: v.id("products"),
    storeId: v.id("stores"),
    quantity: v.number(),
    priceAtAddition: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),

  // 8. Orders table
  orders: defineTable({
    buyerId: v.id("users"),
    storeId: v.id("stores"),
    sellerId: v.id("users"),
    orderNumber: v.string(),
    status: v.string(), // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
    paymentStatus: v.string(), // "pending" | "paid" | "failed" | "refunded"
    subtotal: v.number(),
    shippingFee: v.number(),
    platformCommission: v.number(),
    total: v.number(),
    shippingAddress: v.object({
      fullName: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.string(),
    }),
    trackingNumber: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_store", ["storeId"])
    .index("by_status", ["status"]),

  // 9. Order Items table
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    productTitle: v.string(),
    productImage: v.string(),
    price: v.number(),
    quantity: v.number(),
  }).index("by_order", ["orderId"]),

  // 10. Follows table
  follows: defineTable({
    followerId: v.id("users"),
    followedSellerId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_followed", ["followedSellerId"]),

  // 11. Favorites table
  favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),

  // 12. Conversations table
  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    storeId: v.optional(v.id("stores")),
    lastMessage: v.optional(v.string()),
    lastMessageTimestamp: v.number(),
    updatedAt: v.number(),
  }).index("by_last_message", ["lastMessageTimestamp"]),

  // 13. Messages table
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    attachmentUrl: v.optional(v.string()),
    createdAt: v.number(),
    read: v.boolean(),
  }).index("by_conversation", ["conversationId"]),

  // 14. Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "order" | "follow" | "message" | "status" | "system"
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // 15. Reviews table
  reviews: defineTable({
    productId: v.id("products"),
    storeId: v.id("stores"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_store", ["storeId"])
    .index("by_user", ["userId"]),

  // 16. Addresses table
  addresses: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    phone: v.string(),
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  // 17. Platform Settings
  platformSettings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // 18. Verification Tokens (secure email OTP verification & reset codes)
  verificationTokens: defineTable({
    email: v.string(),
    codeHash: v.string(),
    salt: v.string(),
    type: v.string(), // "email_verification" | "password_reset"
    expiresAt: v.number(),
    attempts: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_type", ["type"]),
});
