import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStoreById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) return null;
    const owner = await ctx.db.get(store.ownerId);
    return { ...store, owner };
  },
});

export const getStoreBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!store) return null;
    const owner = await ctx.db.get(store.ownerId);
    return { ...store, owner };
  },
});

export const getStoreByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .first();
  },
});

export const listStores = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stores = await ctx.db.query("stores").collect();

    // Filter by status if specified, otherwise include open & closed stores (closed stores are still discoverable)
    if (args.status) {
      stores = stores.filter((s) => s.status === args.status);
    } else {
      // Exclude suspended stores from public view
      stores = stores.filter((s) => s.status !== "suspended");
    }

    if (args.category) {
      stores = stores.filter((s) => s.categories.includes(args.category!));
    }

    if (args.search && args.search.trim() !== "") {
      const q = args.search.toLowerCase().trim();
      stores = stores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      );
    }

    // Sort by verified first, then followers count
    return stores.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
  },
});

export const createStore = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    categories: v.array(v.string()),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) throw new Error("Authenticated owner account not found");
    if (owner.role !== "seller" && owner.role !== "admin") {
      // Upgrade to seller role
      await ctx.db.patch(args.ownerId, { role: "seller" });
    }

    // Check if seller already has a store
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .first();
    if (existing) {
      throw new Error("You already have an active store");
    }

    // Generate unique slug
    let baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!baseSlug) baseSlug = "store";

    let slug = baseSlug;
    let counter = 1;
    while (
      await ctx.db
        .query("stores")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const now = Date.now();
    const storeId = await ctx.db.insert("stores", {
      ownerId: args.ownerId,
      name: args.name.trim(),
      slug,
      description: args.description.trim(),
      logoUrl:
        args.logoUrl ||
        `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&auto=format&fit=crop&q=80`,
      bannerUrl:
        args.bannerUrl ||
        `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80`,
      categories: args.categories,
      status: "open",
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
      followersCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Mark seller onboarding completed
    const sellerProfile = await ctx.db
      .query("sellerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerId))
      .first();
    if (sellerProfile) {
      await ctx.db.patch(sellerProfile._id, { onboardingCompleted: true });
    }

    // Send store created notification
    await ctx.db.insert("notifications", {
      userId: args.ownerId,
      type: "system",
      title: "Store Published!",
      message: `Congratulations! "${args.name}" is now live on Shopza marketplace.`,
      link: `/store/${slug}`,
      read: false,
      createdAt: now,
    });

    return await ctx.db.get(storeId);
  },
});

export const updateStore = mutation({
  args: {
    storeId: v.id("stores"),
    ownerId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.ownerId !== args.ownerId) {
      throw new Error("Unauthorized: You do not own this store");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;
    if (args.bannerUrl !== undefined) updates.bannerUrl = args.bannerUrl;
    if (args.categories !== undefined) updates.categories = args.categories;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.storeId, updates);
    return await ctx.db.get(args.storeId);
  },
});
