import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          userName: user?.name || "Customer",
          userAvatar: user?.avatarUrl,
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createReview = mutation({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    if (product.sellerId === args.userId) {
      throw new Error("Sellers cannot review their own products");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    const now = Date.now();
    const reviewId = await ctx.db.insert("reviews", {
      productId: args.productId,
      storeId: product.storeId,
      userId: args.userId,
      rating: args.rating,
      comment: args.comment.trim(),
      createdAt: now,
    });

    // Recalculate product rating
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    // Notify seller
    const user = await ctx.db.get(args.userId);
    await ctx.db.insert("notifications", {
      userId: product.sellerId,
      type: "status",
      title: `New Review for "${product.title}"`,
      message: `${user?.name || "A customer"} left a ${args.rating}-star review: "${args.comment.slice(0, 50)}..."`,
      link: `/product/${product._id}`,
      read: false,
      createdAt: now,
    });

    return await ctx.db.get(reviewId);
  },
});
