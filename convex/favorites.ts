import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFavoriteStatus = query({
  args: {
    userId: v.optional(v.id("users")),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return { isFavorited: false };
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    return { isFavorited: !!existing };
  },
});

export const listFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const products = await Promise.all(
      favorites.map(async (f) => {
        const product = await ctx.db.get(f.productId);
        if (!product) return null;
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          favoriteId: f._id,
          storeName: store?.name || "Store",
        };
      })
    );

    return products.filter(Boolean);
  },
});

export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFavorited: false };
    } else {
      await ctx.db.insert("favorites", {
        userId: args.userId,
        productId: args.productId,
        createdAt: Date.now(),
      });
      return { isFavorited: true };
    }
  },
});
