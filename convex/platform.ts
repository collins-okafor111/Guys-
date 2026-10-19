import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCommissionConfig = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    return {
      rate: setting?.value?.rate ?? 0.05, // default 5%
      promotionalZeroActive: setting?.value?.promotionalZeroActive ?? false,
      updatedAt: setting?.updatedAt ?? Date.now(),
    };
  },
});

export const updateCommissionConfig = mutation({
  args: {
    rate: v.number(),
    promotionalZeroActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    const now = Date.now();
    const val = {
      rate: args.rate,
      promotionalZeroActive: args.promotionalZeroActive,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: val,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("platformSettings", {
        key: "commission_rate",
        value: val,
        updatedAt: now,
      });
    }

    return val;
  },
});
