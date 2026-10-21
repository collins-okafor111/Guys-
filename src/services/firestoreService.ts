import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
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

/**
 * Recursively cleans undefined fields from objects so Firestore does not reject them
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (item && typeof item === "object" ? cleanFirestoreData(item) : item));
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        result[key] = cleanFirestoreData(value);
      } else if (Array.isArray(value)) {
        result[key] = value
          .filter((item) => item !== undefined)
          .map((item) => (item && typeof item === "object" ? cleanFirestoreData(item) : item));
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function saveStoreToFirestore(store: Store): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "stores", store._id), cleanFirestoreData(store));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stores/${store._id}`);
  }
}

export async function deleteStoreFromFirestore(storeId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestoreDb, "stores", storeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `stores/${storeId}`);
  }
}

export async function recordStoreDeletion(data: {
  storeId: string;
  ownerId: string;
  storeName: string;
  reason: string;
  feedback?: string;
  deletedAt: number;
}): Promise<void> {
  try {
    const deletionId = `deletion_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(firestoreDb, "storeDeletions", deletionId), cleanFirestoreData({ ...data, _id: deletionId }));
  } catch (err) {
    console.warn("Could not record store deletion audit in Firestore:", err);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "products", product._id), cleanFirestoreData(product));
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
    await setDoc(doc(firestoreDb, "orders", order._id), cleanFirestoreData(order));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order._id}`);
  }
}

export async function saveFollowToFirestore(follow: Follow): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "follows", follow._id), cleanFirestoreData(follow));
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
    await setDoc(doc(firestoreDb, "favorites", favorite._id), cleanFirestoreData(favorite));
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
    await setDoc(doc(firestoreDb, "conversations", convo._id), cleanFirestoreData({
      _id: convo._id,
      participantIds: convo.participantIds,
      storeId: convo.storeId || null,
      lastMessage: convo.lastMessage || "",
      lastMessageTimestamp: convo.lastMessageTimestamp,
      updatedAt: convo.updatedAt,
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${convo._id}`);
  }
}

export async function saveMessageToFirestore(message: Message): Promise<void> {
  try {
    await setDoc(
      doc(firestoreDb, "conversations", message.conversationId, "messages", message._id),
      cleanFirestoreData(message)
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
    await setDoc(doc(firestoreDb, "reviews", review._id), cleanFirestoreData(review));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${review._id}`);
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const sanitizedUser: Record<string, any> = {
      _id: user._id,
      name: user.name || "",
      email: (user.email || "").toLowerCase().trim(),
      role: user.role || "buyer",
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`,
      bio: typeof user.bio === "string" ? user.bio : "",
      phone: typeof user.phone === "string" ? user.phone : "",
      emailVerified: Boolean(user.emailVerified),
      authProvider: user.authProvider || "email",
      createdAt: user.createdAt || Date.now(),
      updatedAt: user.updatedAt || Date.now(),
    };
    await setDoc(doc(firestoreDb, "users", user._id), cleanFirestoreData(sanitizedUser), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user._id}`);
  }
}

export async function saveCartItemToFirestore(userId: string, cartItem: CartItem): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, "users", userId, "cartItems", cartItem._id), cleanFirestoreData(cartItem));
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
    await setDoc(doc(firestoreDb, "users", userId, "notifications", notif._id), cleanFirestoreData(notif));
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

// Clean authentic catalog: removed all fake products and mock accounts.
// Authentic listings are stored directly in Cloud Firestore by verified users.
export const INITIAL_CURATED_STORES: Store[] = [];
export const INITIAL_CURATED_PRODUCTS: Product[] = [];

/**
 * Real-time listener for messages in a conversation between a buyer and seller
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: any) => void
) {
  try {
    const messagesRef = collection(firestoreDb, "conversations", conversationId, "messages");
    return onSnapshot(
      messagesRef,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((d) => msgs.push(d.data() as Message));
        msgs.sort((a, b) => a.createdAt - b.createdAt);
        onUpdate(msgs);
      },
      (error) => {
        console.warn("Message subscription error:", error);
        onError?.(error);
      }
    );
  } catch (err) {
    console.warn("Could not attach message listener:", err);
    return () => {};
  }
}

/**
 * Real-time listener for conversations of a specific user (buyer or seller)
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (convos: Conversation[]) => void,
  onError?: (err: any) => void
) {
  try {
    const convosRef = collection(firestoreDb, "conversations");
    const q = query(convosRef, where("participantIds", "array-contains", userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const convos: Conversation[] = [];
        snapshot.forEach((d) => convos.push(d.data() as Conversation));
        convos.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        onUpdate(convos);
      },
      (error) => {
        console.warn("Conversations subscription error:", error);
        onError?.(error);
      }
    );
  } catch (err) {
    console.warn("Could not attach conversations listener:", err);
    return () => {};
  }
}

