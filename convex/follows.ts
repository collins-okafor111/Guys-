import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFollowStatus = query({
  args: {
    followerId: v.optional(v.id("users")),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Total followers count for this seller
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followed", (q) => q.eq("followedSellerId", args.sellerId))
      .collect();

    const followerCount = followers.length;

    if (!args.followerId) {
      return { isFollowing: false, followerCount };
    }

    if (args.followerId === args.sellerId) {
      return { isFollowing: false, followerCount, isSelf: true };
    }

    const existingFollow = followers.find((f) => f.followerId === args.followerId);

    return {
      isFollowing: !!existingFollow,
      followerCount,
      isSelf: false,
    };
  },
});

export const listFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followedSellers = await Promise.all(
      follows.map(async (f) => {
        const seller = await ctx.db.get(f.followedSellerId);
        const store = f.storeId ? await ctx.db.get(f.storeId) : null;
        return {
          followId: f._id,
          seller,
          store,
          followedAt: f.createdAt,
        };
      })
    );

    return followedSellers;
  },
});

export const followSeller = mutation({
  args: {
    followerId: v.id("users"),
    sellerId: v.id("users"),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    // 1. Prevent user from following themselves
    if (args.followerId === args.sellerId) {
      throw new Error("You cannot follow your own account");
    }

    // 2. Prevent duplicate follow records
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followedSellerId"), args.sellerId))
      .first();

    if (existing) {
      return { success: true, followId: existing._id, alreadyFollowing: true };
    }

    const follower = await ctx.db.get(args.followerId);
    if (!follower) throw new Error("Follower account not found");

    const seller = await ctx.db.get(args.sellerId);
    if (!seller) throw new Error("Seller account not found");

    const now = Date.now();
    const followId = await ctx.db.insert("follows", {
      followerId: args.followerId,
      followedSellerId: args.sellerId,
      storeId: args.storeId,
      createdAt: now,
    });

    // Update store followers count if storeId provided
    if (args.storeId) {
      const store = await ctx.db.get(args.storeId);
      if (store) {
        await ctx.db.patch(args.storeId, {
          followersCount: (store.followersCount || 0) + 1,
        });
      }
    }

    // 7. Generate notification for the seller ONLY (recipient is sellerId)
    await ctx.db.insert("notifications", {
      userId: args.sellerId,
      type: "follow",
      title: "New Store Follower!",
      message: `${follower.name} started following your store.`,
      link: `/profile/${args.followerId}`,
      read: false,
      createdAt: now,
    });

    return { success: true, followId, isFollowing: true };
  },
});

export const unfollowSeller = mutation({
  args: {
    followerId: v.id("users"),
    sellerId: v.id("users"),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followedSellerId"), args.sellerId))
      .first();

    if (!existing) {
      return { success: true, isFollowing: false };
    }

    await ctx.db.delete(existing._id);

    // Decrement store followers count
    if (args.storeId) {
      const store = await ctx.db.get(args.storeId);
      if (store && store.followersCount > 0) {
        await ctx.db.patch(args.storeId, {
          followersCount: Math.max(0, (store.followersCount || 1) - 1),
        });
      }
    }

    return { success: true, isFollowing: false };
  },
});
