import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    if (args.user1Id === args.user2Id) {
      throw new Error("Cannot create a conversation with yourself");
    }

    const convos = await ctx.db.query("conversations").collect();
    const existing = convos.find(
      (c) =>
        c.participantIds.includes(args.user1Id) &&
        c.participantIds.includes(args.user2Id)
    );

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("conversations", {
      participantIds: [args.user1Id, args.user2Id],
      storeId: args.storeId,
      lastMessage: "Conversation started",
      lastMessageTimestamp: now,
      updatedAt: now,
    });
  },
});

export const listUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const convos = await ctx.db.query("conversations").collect();
    const userConvos = convos.filter((c) => c.participantIds.includes(args.userId));

    const enriched = await Promise.all(
      userConvos.map(async (c) => {
        const otherUserId = c.participantIds.find((id) => id !== args.userId);
        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;
        const store = c.storeId ? await ctx.db.get(c.storeId) : null;

        // Count unread messages for this user
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
          .filter((q) =>
            q.and(
              q.neq(q.field("senderId"), args.userId),
              q.eq(q.field("read"), false)
            )
          )
          .collect();

        return {
          ...c,
          otherUser,
          store,
          unreadCount: unreadMessages.length,
        };
      })
    );

    return enriched.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  },
});

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");

    if (!convo.participantIds.includes(args.userId)) {
      throw new Error("Unauthorized: You are not a participant in this conversation");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");

    if (!convo.participantIds.includes(args.senderId)) {
      throw new Error("Unauthorized: You cannot post in this conversation");
    }

    if (!args.text.trim()) {
      throw new Error("Message text cannot be empty");
    }

    const recipientId = convo.participantIds.find((id) => id !== args.senderId);
    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      text: args.text.trim(),
      read: false,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text.trim(),
      lastMessageTimestamp: now,
      updatedAt: now,
    });

    // Notify recipient
    if (recipientId) {
      const sender = await ctx.db.get(args.senderId);
      await ctx.db.insert("notifications", {
        userId: recipientId,
        type: "message",
        title: `New message from ${sender?.name || "User"}`,
        message: args.text.slice(0, 100),
        link: `/messages`,
        read: false,
        createdAt: now,
      });
    }

    return await ctx.db.get(messageId);
  },
});

export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    for (const msg of messages) {
      await ctx.db.patch(msg._id, { read: true });
    }

    return { updated: messages.length };
  },
});
