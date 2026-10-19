import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validates caller identity using Convex's ctx.auth
 */
export async function getAuthenticatedUser(ctx: any) {
  if (ctx.auth && typeof ctx.auth.getUserIdentity === "function") {
    const identity = await ctx.auth.getUserIdentity();
    if (identity && identity.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", identity.email.toLowerCase().trim()))
        .first();
      return { identity, user };
    }
  }
  return { identity: null, user: null };
}

export const getCurrentUser = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Check genuine Convex authenticated identity first
    const { user: authUser } = await getAuthenticatedUser(ctx);
    if (authUser) return authUser;

    if (!args.email) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email!.toLowerCase().trim()))
      .first();
    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const register = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    authProvider: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      role: args.role || "buyer",
      avatarUrl: args.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(args.name)}`,
      bio: args.bio,
      phone: args.phone,
      passwordHash: args.passwordHash,
      authProvider: args.authProvider || "email",
      emailVerified: args.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    });

    if (args.role === "seller") {
      await ctx.db.insert("sellerProfiles", {
        userId,
        businessName: args.name.trim() + " Goods",
        onboardingCompleted: false,
        createdAt: now,
      });
    }

    // Send welcome notification
    await ctx.db.insert("notifications", {
      userId,
      type: "system",
      title: "Welcome to Shopza!",
      message: `Hi ${args.name}, your ${args.role === "seller" ? "Seller" : "Buyer"} account is now active. Explore the marketplace!`,
      read: false,
      createdAt: now,
    });

    return await ctx.db.get(userId);
  },
});

export const markEmailVerified = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.email.toLowerCase() !== args.email.toLowerCase().trim()) {
      throw new Error("Email does not match user account");
    }

    await ctx.db.patch(args.userId, {
      emailVerified: true,
      updatedAt: Date.now(),
    });

    // Send notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "Email Verified",
      message: "Your email address has been successfully verified. Your Shopza account is in good standing.",
      read: false,
      createdAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

export const setPassword = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (!user) throw new Error("No user found with this email");

    await ctx.db.patch(user._id, {
      passwordHash: args.passwordHash,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.role !== undefined) updates.role = args.role;

    await ctx.db.patch(args.userId, updates);
    return await ctx.db.get(args.userId);
  },
});
