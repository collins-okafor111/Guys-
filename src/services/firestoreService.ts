import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { firestoreDb, handleFirestoreError, OperationType } from "../firebase";
import {
  User,
  Store,
  Product,
  CartItem,
  Order,
  Follow,
  Favorite,
  Conversation,
  Message,
  Notification,
  Review,
} from "../types";

export interface FirestoreDataSnapshot {
  stores: Store[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  follows: Follow[];
  favorites: Favorite[];
  conversations: Conversation[];
  messages: Message[];
  users: User[];
}

export async function fetchAllFirestoreData(): Promise<FirestoreDataSnapshot> {
  const result: FirestoreDataSnapshot = {
    stores: [],
    products: [],
    reviews: [],
    orders: [],
    follows: [],
    favorites: [],
    conversations: [],
    messages: [],
    users: [],
  };

  try {
    // 1. Stores
    try {
      const storesSnap = await getDocs(collection(firestoreDb, "stores"));
      storesSnap.forEach((d) => result.stores.push(d.data() as Store));
    } catch (e) {
      console.warn("Could not fetch stores from Firestore:", e);
    }

    // 2. Products
    try {
      const prodSnap = await getDocs(collection(firestoreDb, "products"));
      prodSnap.forEach((d) => result.products.push(d.data() as Product));
    } catch (e) {
      console.warn("Could not fetch products from Firestore:", e);
    }

    // 3. Reviews
    try {
      const revSnap = await getDocs(collection(firestoreDb, "reviews"));
      revSnap.forEach((d) => result.reviews.push(d.data() as Review));
    } catch (e) {
      console.warn("Could not fetch reviews from Firestore:", e);
    }

    // 4. Follows
    try {
      const followSnap = await getDocs(collection(firestoreDb, "follows"));
      followSnap.forEach((d) => result.follows.push(d.data() as Follow));
    } catch (e) {
      console.warn("Could not fetch follows from Firestore:", e);
    }
  } catch (err) {
    console.error("Error in fetchAllFirestoreData:", err);
  }

  return result;
}

export async function saveStoreToFirestore(store: Store): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "stores", store._id), store);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stores/${store._id}`);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "products", product._id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product._id}`);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestoreDb, "products", productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "orders", order._id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order._id}`);
  }
}

export async function saveFollowToFirestore(follow: Follow): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "follows", follow._id), follow);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `follows/${follow._id}`);
  }
}

export async function deleteFollowFromFirestore(followId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestoreDb, "follows", followId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `follows/${followId}`);
  }
}

export async function saveFavoriteToFirestore(favorite: Favorite): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "favorites", favorite._id), favorite);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `favorites/${favorite._id}`);
  }
}

export async function deleteFavoriteFromFirestore(favoriteId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestoreDb, "favorites", favoriteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `favorites/${favoriteId}`);
  }
}

export async function saveConversationToFirestore(convo: Conversation): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "conversations", convo._id), {
      _id: convo._id,
      participantIds: convo.participantIds,
      storeId: convo.storeId || null,
      lastMessage: convo.lastMessage || "",
      lastMessageTimestamp: convo.lastMessageTimestamp,
      updatedAt: convo.updatedAt,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${convo._id}`);
  }
}

export async function saveMessageToFirestore(message: Message): Promise<void> {
  try {
    await setDoc(
      doc(firestoreDb, "conversations", message.conversationId, "messages", message._id),
      message
    );
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `conversations/${message.conversationId}/messages/${message._id}`
    );
  }
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "reviews", review._id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${review._id}`);
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "users", user._id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user._id}`);
  }
}

export async function saveCartItemToFirestore(userId: string, cartItem: CartItem): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "users", userId, "cartItems", cartItem._id), cartItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/cartItems/${cartItem._id}`);
  }
}

export async function deleteCartItemFromFirestore(userId: string, cartItemId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestoreDb, "users", userId, "cartItems", cartItemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}/cartItems/${cartItemId}`);
  }
}

export async function saveNotificationToFirestore(userId: string, notif: Notification): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "users", userId, "notifications", notif._id), notif);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/notifications/${notif._id}`);
  }
}

export async function markNotificationReadInFirestore(userId: string, notifId: string): Promise<void> {
  try {
    await updateDoc(doc(firestoreDb, "users", userId, "notifications", notifId), { read: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/notifications/${notifId}`);
  }
}

// Initial Curated Marketplace Data for initial Firestore Seed
export const INITIAL_CURATED_STORES: Store[] = [
  {
    _id: "store_lumina_audio",
    ownerId: "usr_collins_google",
    name: "Lumina Acoustic Studio",
    slug: "lumina-acoustic-studio",
    description: "Handcrafted audiophile headphones, studio monitors, and precision acoustic gear for music producers and sound purists.",
    logoUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
    categories: ["Electronics"],
    status: "open",
    isVerified: true,
    rating: 4.95,
    reviewCount: 48,
    followersCount: 312,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    _id: "store_velvet_atelier",
    ownerId: "usr_seller_sarah",
    name: "Velvet & Thread Atelier",
    slug: "velvet-thread-atelier",
    description: "Ethically woven minimalist garments, Japanese selvedge outerwear, and bespoke everyday fashion essentials.",
    logoUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    categories: ["Fashion & Apparel"],
    status: "open",
    isVerified: true,
    rating: 4.88,
    reviewCount: 32,
    followersCount: 245,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    _id: "store_nordic_living",
    ownerId: "usr_collins_google",
    name: "Nordic Living Crafts",
    slug: "nordic-living-crafts",
    description: "Scandinavian interior design, ceramic stoneware, and artisanal solid wood workspace goods.",
    logoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80",
    categories: ["Home & Living", "Artisanal & Crafts"],
    status: "open",
    isVerified: true,
    rating: 4.92,
    reviewCount: 27,
    followersCount: 189,
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

export const INITIAL_CURATED_PRODUCTS: Product[] = [
  {
    _id: "prod_lumina_pro_anc",
    storeId: "store_lumina_audio",
    sellerId: "usr_collins_google",
    title: "Lumina Pro Wireless Studio Headphones",
    description: "Engineered with 45mm beryllium drivers, hybrid active noise cancellation, lossless LDAC codec support, and 42-hour continuous battery life. Memory foam ear cushions wrapped in breathable lambskin.",
    price: 289,
    currency: "USD",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 18,
    status: "published",
    rating: 4.95,
    reviewCount: 34,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Lumina Acoustic Studio",
    storeVerified: true,
    storeSlug: "lumina-acoustic-studio",
  },
  {
    _id: "prod_artisan_mechanical_kbd",
    storeId: "store_lumina_audio",
    sellerId: "usr_collins_google",
    title: "Aura 75% Custom Mechanical Keyboard",
    description: "Solid CNC anodized aluminum chassis, factory-lubed custom tactile switches, sound-dampening poron foam gaskets, and wireless triple-mode connectivity.",
    price: 195,
    currency: "USD",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 12,
    status: "published",
    rating: 4.9,
    reviewCount: 19,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Lumina Acoustic Studio",
    storeVerified: true,
    storeSlug: "lumina-acoustic-studio",
  },
  {
    _id: "prod_merino_oversized_hoodie",
    storeId: "store_velvet_atelier",
    sellerId: "usr_seller_sarah",
    title: "Heavyweight Organic French Terry Hoodie",
    description: "480 GSM pure combed organic cotton French terry. Garment dyed in mineral charcoal. Double-lined hood, seamless kangaroo pocket, and ribbed side gussets.",
    price: 115,
    currency: "USD",
    category: "Fashion & Apparel",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 24,
    status: "published",
    rating: 4.85,
    reviewCount: 22,
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Velvet & Thread Atelier",
    storeVerified: true,
    storeSlug: "velvet-thread-atelier",
  },
  {
    _id: "prod_nordic_stoneware_vase",
    storeId: "store_nordic_living",
    sellerId: "usr_collins_google",
    title: "Minimalist Sculptural Ceramic Vase",
    description: "Hand-thrown ceramic vase with a textured matte sandstone finish. Elegant sculptural silhouette designed for dried botanicals or fresh floral arrangements.",
    price: 68,
    currency: "USD",
    category: "Home & Living",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 15,
    status: "published",
    rating: 4.93,
    reviewCount: 15,
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Nordic Living Crafts",
    storeVerified: true,
    storeSlug: "nordic-living-crafts",
  },
  {
    _id: "prod_natural_glow_serum",
    storeId: "store_nordic_living",
    sellerId: "usr_collins_google",
    title: "Botanical Radiance Face Oil Serum",
    description: "Cold-pressed rosehip seed, squalane, and vitamin C ester. Deeply hydrates and repairs the lipid barrier without leaving greasy residue. Cruelty-free and vegan.",
    price: 48,
    currency: "USD",
    category: "Beauty & Health",
    images: [
      "https://images.unsplash.com/photo-1608248597359-0097721867c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 30,
    status: "published",
    rating: 4.89,
    reviewCount: 28,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Nordic Living Crafts",
    storeVerified: true,
    storeSlug: "nordic-living-crafts",
  },
  {
    _id: "prod_smart_fitness_tracker",
    storeId: "store_lumina_audio",
    sellerId: "usr_collins_google",
    title: "PulseFit GPS Activity & Sleep Tracker",
    description: "AMOLED curved display with real-time heart rate monitoring, VO2 max estimation, 5ATM water resistance, and 10-day battery endurance.",
    price: 139,
    currency: "USD",
    category: "Sports & Fitness",
    images: [
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80",
    ],
    inventory: 20,
    status: "published",
    rating: 4.82,
    reviewCount: 16,
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    storeName: "Lumina Acoustic Studio",
    storeVerified: true,
    storeSlug: "lumina-acoustic-studio",
  },
];
