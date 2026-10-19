import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const getCart = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { user: authUser } = await getAuthenticatedUser(ctx);
    if (authUser && authUser._id !== args.userId) {
      throw new Error("Unauthorized: Cannot access cart of another user");
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        const store = await ctx.db.get(item.storeId);
        enrichedItems.push({
          ...item,
          product: {
            ...product,
            storeName: store?.name || "Store",
          },
          currentPrice: product.price,
          availableStock: product.inventory,
          itemTotal,
        });
      } else {
        // Product no longer exists, remove it
        await ctx.db.delete(item._id);
      }
    }

    const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;

    return {
      items: enrichedItems,
      itemCount: enrichedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100,
      shippingFee,
      total,
    };
  },
});

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    if (product.sellerId === args.userId) {
      throw new Error("You cannot add your own products to your cart");
    }

    if (product.inventory < args.quantity) {
      throw new Error(`Only ${product.inventory} items available in stock`);
    }

    // Check if already in cart
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existing) {
      const newQty = existing.quantity + args.quantity;
      if (product.inventory < newQty) {
        throw new Error(`Cannot add more than available stock (${product.inventory})`);
      }
      await ctx.db.patch(existing._id, { quantity: newQty });
      return existing._id;
    } else {
      return await ctx.db.insert("cartItems", {
        userId: args.userId,
        productId: args.productId,
        storeId: product.storeId,
        quantity: args.quantity,
        priceAtAddition: product.price,
        createdAt: Date.now(),
      });
    }
  },
});

export const updateCartQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    userId: v.id("users"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.cartItemId);
    if (!item) throw new Error("Cart item not found");
    if (item.userId !== args.userId) throw new Error("Unauthorized");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return { removed: true };
    }

    const product = await ctx.db.get(item.productId);
    if (product && args.quantity > product.inventory) {
      throw new Error(`Only ${product.inventory} units available in stock`);
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    return { success: true };
  },
});

export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.cartItemId);
    if (!item) return { success: true };
    if (item.userId !== args.userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.cartItemId);
    return { success: true };
  },
});

export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return { success: true };
  },
});
