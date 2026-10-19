import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    const store = await ctx.db.get(product.storeId);
    const seller = await ctx.db.get(product.sellerId);
    return { ...product, store, seller };
  },
});

export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    sellerId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sort: v.optional(v.string()), // "newest" | "price_asc" | "price_desc" | "rating"
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Filter by storeId
    if (args.storeId) {
      products = products.filter((p) => p.storeId === args.storeId);
    }

    // Filter by sellerId
    if (args.sellerId) {
      products = products.filter((p) => p.sellerId === args.sellerId);
    }

    // Filter by status (default to "published" for marketplace, unless specified)
    if (args.status) {
      products = products.filter((p) => p.status === args.status);
    } else if (!args.sellerId && !args.storeId) {
      products = products.filter((p) => p.status === "published");
    }

    // Filter by category
    if (args.category && args.category !== "All") {
      products = products.filter((p) => p.category.toLowerCase() === args.category!.toLowerCase());
    }

    // Filter by price
    if (args.minPrice !== undefined) {
      products = products.filter((p) => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= args.maxPrice!);
    }

    // Filter by search query
    if (args.search && args.search.trim() !== "") {
      const q = args.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (args.sort === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (args.sort === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (args.sort === "rating") {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // default: newest
      products.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Enrich with store information
    const enriched = await Promise.all(
      products.map(async (p) => {
        const store = await ctx.db.get(p.storeId);
        return {
          ...p,
          storeName: store?.name || "Store",
          storeVerified: store?.isVerified || false,
          storeSlug: store?.slug || "",
        };
      })
    );

    return enriched;
  },
});

export const createProduct = mutation({
  args: {
    sellerId: v.id("users"),
    storeId: v.id("stores"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.optional(v.string()),
    category: v.string(),
    images: v.array(v.string()),
    inventory: v.number(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate owner & store
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.ownerId !== args.sellerId) {
      throw new Error("Unauthorized: You can only publish products to your own store");
    }

    if (args.price <= 0) {
      throw new Error("Product price must be greater than 0");
    }
    if (args.inventory < 0) {
      throw new Error("Inventory cannot be negative");
    }
    if (!args.title.trim()) {
      throw new Error("Product title is required");
    }

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      storeId: args.storeId,
      sellerId: args.sellerId,
      title: args.title.trim(),
      description: args.description.trim(),
      price: Math.round(args.price * 100) / 100,
      currency: args.currency || "USD",
      category: args.category,
      images: args.images.length > 0 ? args.images : [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
      ],
      inventory: Math.floor(args.inventory),
      status: args.status || "published",
      rating: 5.0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Notify followers of this seller about new product
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followed", (q) => q.eq("followedSellerId", args.sellerId))
      .collect();

    for (const f of followers) {
      await ctx.db.insert("notifications", {
        userId: f.followerId,
        type: "status",
        title: `New product in ${store.name}`,
        message: `${store.name} just listed "${args.title.trim()}". Check it out!`,
        link: `/product/${productId}`,
        read: false,
        createdAt: now,
      });
    }

    return await ctx.db.get(productId);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    inventory: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    if (product.sellerId !== args.sellerId) {
      throw new Error("Unauthorized: You cannot edit products from another seller");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.price !== undefined) {
      if (args.price <= 0) throw new Error("Price must be greater than zero");
      updates.price = Math.round(args.price * 100) / 100;
    }
    if (args.category !== undefined) updates.category = args.category;
    if (args.images !== undefined) updates.images = args.images;
    if (args.inventory !== undefined) {
      if (args.inventory < 0) throw new Error("Inventory cannot be negative");
      updates.inventory = Math.floor(args.inventory);
    }
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.productId, updates);
    return await ctx.db.get(args.productId);
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    if (product.sellerId !== args.sellerId) {
      throw new Error("Unauthorized: You cannot delete products from another seller");
    }

    // Clean up cart items referencing this product
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.productId);
    return { success: true };
  },
});
