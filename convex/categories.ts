import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: "Laptop", description: "Smartphones, laptops, gadgets & audio" },
  { name: "Fashion & Apparel", slug: "fashion", icon: "Shirt", description: "Clothing, shoes, bags & accessories" },
  { name: "Home & Living", slug: "home", icon: "Home", description: "Furniture, decor, kitchen & lighting" },
  { name: "Beauty & Health", slug: "beauty", icon: "Sparkles", description: "Skincare, cosmetics & wellness" },
  { name: "Sports & Fitness", slug: "sports", icon: "Dumbbell", description: "Workout gear, equipment & outdoor" },
  { name: "Books & Media", slug: "books", icon: "BookOpen", description: "Books, stationery & collectibles" },
  { name: "Artisanal & Crafts", slug: "artisanal", icon: "Palette", description: "Handcrafted goods & unique designs" },
];

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) return existing;
    return DEFAULT_CATEGORIES;
  },
});

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").collect();
    if (existing.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await ctx.db.insert("categories", cat);
      }
    }
    return await ctx.db.query("categories").collect();
  },
});
