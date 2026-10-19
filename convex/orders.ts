import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if caller is authenticated with Convex identity
    const { user: authUser } = await getAuthenticatedUser(ctx);
    if (authUser && authUser._id !== args.userId) {
      throw new Error("Unauthorized: Identity mismatch with caller credentials");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Security: Only buyer, seller, or admin can access
    if (order.buyerId !== args.userId && order.sellerId !== args.userId) {
      throw new Error("Unauthorized: You do not have permission to view this order");
    }

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    const store = await ctx.db.get(order.storeId);
    const buyer = await ctx.db.get(order.buyerId);
    const seller = await ctx.db.get(order.sellerId);

    return {
      ...order,
      items,
      store,
      buyer: { name: buyer?.name, email: buyer?.email },
      seller: { name: seller?.name, email: seller?.email },
    };
  },
});

export const listBuyerOrders = query({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args) => {
    const { user: authUser } = await getAuthenticatedUser(ctx);
    if (authUser && authUser._id !== args.buyerId) {
      throw new Error("Unauthorized: Cannot list orders for another user account");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .collect();

    // Enrich with items and store
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        const store = await ctx.db.get(order.storeId);
        return { ...order, items, storeName: store?.name || "Store" };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listSellerOrders = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        const buyer = await ctx.db.get(order.buyerId);
        return {
          ...order,
          items,
          buyerName: buyer?.name || "Customer",
          buyerEmail: buyer?.email || "",
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createCheckoutOrder = mutation({
  args: {
    buyerId: v.id("users"),
    shippingAddress: v.object({
      fullName: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Fetch user's cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.buyerId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    // Group items by storeId
    const storeMap = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const existing = storeMap.get(item.storeId) || [];
      existing.push(item);
      storeMap.set(item.storeId, existing);
    }

    const createdOrderIds = [];
    const now = Date.now();

    // Process each store order independently
    for (const [storeIdStr, items] of storeMap.entries()) {
      const store = await ctx.db.get(storeIdStr as any);
      if (!store) continue;

      let subtotal = 0;
      const orderItemsToCreate = [];

      // Validate stock and recompute prices securely on backend
      for (const item of items) {
        const product = await ctx.db.get(item.productId);
        if (!product) {
          throw new Error(`Product not found or has been removed`);
        }
        if (product.inventory < item.quantity) {
          throw new Error(`Insufficient stock for "${product.title}" (only ${product.inventory} available)`);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItemsToCreate.push({
          productId: product._id,
          productTitle: product.title,
          productImage: product.images[0] || "",
          price: product.price,
          quantity: item.quantity,
        });

        // Deduct inventory
        await ctx.db.patch(product._id, {
          inventory: product.inventory - item.quantity,
          status: product.inventory - item.quantity <= 0 ? "out_of_stock" : product.status,
          updatedAt: now,
        });
      }

      // Calculate commission (configurable platform rate, e.g. 5%)
      const commissionRate = 0.05;
      const platformCommission = Math.round(subtotal * commissionRate * 100) / 100;
      const shippingFee = subtotal > 100 ? 0 : 9.99;
      const total = Math.round((subtotal + shippingFee) * 100) / 100;

      const orderNumber = `SHP-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderId = await ctx.db.insert("orders", {
        buyerId: args.buyerId,
        storeId: store._id,
        sellerId: store.ownerId,
        orderNumber,
        status: "confirmed",
        paymentStatus: "paid",
        subtotal: Math.round(subtotal * 100) / 100,
        shippingFee,
        platformCommission,
        total,
        shippingAddress: args.shippingAddress,
        createdAt: now,
        updatedAt: now,
      });

      for (const oItem of orderItemsToCreate) {
        await ctx.db.insert("orderItems", {
          orderId,
          ...oItem,
        });
      }

      createdOrderIds.push(orderId);

      // Notify seller
      await ctx.db.insert("notifications", {
        userId: store.ownerId,
        type: "order",
        title: `New Order Received! #${orderNumber}`,
        message: `You have received a new order for $${total.toFixed(2)} from ${args.shippingAddress.fullName}.`,
        link: `/seller/orders`,
        read: false,
        createdAt: now,
      });

      // Notify buyer
      await ctx.db.insert("notifications", {
        userId: args.buyerId,
        type: "order",
        title: `Order #${orderNumber} Confirmed`,
        message: `Your order from "${store.name}" has been placed successfully for $${total.toFixed(2)}.`,
        link: `/buyer/orders`,
        read: false,
        createdAt: now,
      });
    }

    // Clear cart items for this buyer
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { success: true, orderIds: createdOrderIds };
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    sellerId: v.id("users"),
    status: v.string(), // "processing" | "shipped" | "delivered" | "cancelled"
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    if (order.sellerId !== args.sellerId) {
      throw new Error("Unauthorized: Only the fulfilling seller can update this order");
    }

    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.trackingNumber) {
      updates.trackingNumber = args.trackingNumber;
    }

    await ctx.db.patch(args.orderId, updates);

    // Notify buyer of status update
    await ctx.db.insert("notifications", {
      userId: order.buyerId,
      type: "status",
      title: `Order #${order.orderNumber} ${args.status.toUpperCase()}`,
      message: `Your order status has been updated to "${args.status}".${args.trackingNumber ? ` Tracking: ${args.trackingNumber}` : ""}`,
      link: `/buyer/orders`,
      read: false,
      createdAt: Date.now(),
    });

    return await ctx.db.get(args.orderId);
  },
});
