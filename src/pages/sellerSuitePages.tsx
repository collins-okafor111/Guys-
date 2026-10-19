import React, { useState } from "react";
import {
  Store,
  Boxes,
  PlusCircle,
  Sliders,
  Truck,
  BarChart3,
  MessageSquare,
  Wallet,
  BadgePercent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { Product, Store as StoreType, Order, User } from "../types";

interface SellerSuiteProps {
  products: Product[];
  stores: StoreType[];
  orders: Order[];
  currentUser: User | null;
  onNavigate: (pageId: string) => void;
  onOpenStore: (slug: string) => void;
  onSelectProduct: (p: Product) => void;
  onOpenAuth: (tab?: any) => void;
}

// 33. Seller Portal & Metrics Hub (Page 33)
export const SellerDashboardPage: React.FC<SellerSuiteProps> = ({
  products,
  stores,
  orders,
  currentUser,
  onNavigate,
}) => {
  const myStore = stores[0];
  const myProducts = products.filter((p) => !myStore || p.storeId === myStore._id);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Seller Portal Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#140D33] via-[#0E1535] to-[#0A0D1D] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            Shopza Verified Merchant Portal
          </span>
          <h1 className="text-2xl font-black text-white">{myStore?.name || "Merchant Command Center"}</h1>
          <p className="text-xs text-slate-300">Manage catalog inventory, fulfill buyer orders, and view payout milestones</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("seller_add_product")}
            className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/40 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate("seller_orders")}
            className="px-4 py-2 bg-[#0F142A] border border-blue-900/40 text-slate-200 rounded-xl text-xs font-bold hover:bg-[#151C3B]"
          >
            Orders
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Merchandise Value</span>
          <p className="text-2xl font-black text-[#00C2FF] mt-1">$4,820.00</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Listings</span>
          <p className="text-2xl font-black text-white mt-1">{myProducts.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Fulfillment</span>
          <p className="text-2xl font-black text-amber-400 mt-1">2</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Store Rating</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">4.9 ★</p>
        </div>
      </div>

      {/* Quick Nav Suite */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => onNavigate("seller_products")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 hover:border-blue-500/50 text-left transition-all"
        >
          <Boxes className="w-5 h-5 text-blue-400 mb-2" />
          <h4 className="font-bold text-white">Manage Products</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Edit inventory & pricing</p>
        </button>

        <button
          onClick={() => onNavigate("seller_store_customizer")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 hover:border-blue-500/50 text-left transition-all"
        >
          <Sliders className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="font-bold text-white">Store Customizer</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Logo, banners & bio</p>
        </button>

        <button
          onClick={() => onNavigate("seller_analytics")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 hover:border-blue-500/50 text-left transition-all"
        >
          <BarChart3 className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="font-bold text-white">Sales Analytics</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Revenue breakdown</p>
        </button>

        <button
          onClick={() => onNavigate("seller_payouts")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 hover:border-blue-500/50 text-left transition-all"
        >
          <Wallet className="w-5 h-5 text-[#00C2FF] mb-2" />
          <h4 className="font-bold text-white">Escrow & Payouts</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Bank transfer schedule</p>
        </button>
      </div>
    </div>
  );
};

// 34. Store Product Inventory Manager (Page 34)
export const SellerProductsPage: React.FC<SellerSuiteProps> = ({ products, onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-400" />
            <span>Store Product Inventory Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time stock level synchronization, price modifications, and catalog management
          </p>
        </div>
        <button
          onClick={() => onNavigate("seller_add_product")}
          className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Listing</span>
        </button>
      </div>

      <div className="p-4 rounded-3xl bg-[#0F142A] border border-blue-900/30 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-blue-900/30 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 pl-2">Product</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Inventory</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20 text-slate-200">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-[#151C3B]/40 transition-colors">
                <td className="py-3 pl-2 flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="font-bold text-white truncate max-w-xs">{p.title}</span>
                </td>
                <td className="py-3 text-slate-400">{p.category}</td>
                <td className="py-3 font-bold text-white">${p.price.toFixed(2)}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 font-mono font-bold">
                    {p.inventory} in stock
                  </span>
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 font-bold text-[10px]">
                    Active
                  </span>
                </td>
                <td className="py-3 pr-2 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 35. Publish New Product Listing (Page 35)
export const SellerAddProductPage: React.FC<SellerSuiteProps> = ({ onNavigate }) => {
  const [created, setCreated] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-[#7928CA]" />
          <span>Publish New Product Listing</span>
        </h1>
        <p className="text-xs text-slate-400">
          Upload product specifications, multi-angle images, inventory count, and shipping weights
        </p>
      </div>

      {created ? (
        <div className="p-8 rounded-3xl bg-[#0F142A] border border-emerald-500/40 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Product Successfully Listed!</h3>
          <p className="text-xs text-slate-300">
            Your listing is immediately live in the Shopza verified catalog and searchable by buyers worldwide.
          </p>
          <button
            onClick={() => onNavigate("seller_products")}
            className="px-5 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold"
          >
            Back to Inventory
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCreated(true);
          }}
          className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Studio Pro Wireless ANC Headphones"
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Category</label>
              <select className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white">
                <option>Electronics</option>
                <option>Fashion & Apparel</option>
                <option>Home & Living</option>
                <option>Beauty & Health</option>
                <option>Sports & Fitness</option>
                <option>Artisanal & Crafts</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Retail Price ($USD)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="149.00"
                className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Available Units</label>
              <input
                type="number"
                required
                placeholder="25"
                className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Image URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Product Description</label>
            <textarea
              rows={3}
              required
              placeholder="Provide a detailed description of features, materials, and warranty..."
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
          >
            Publish Listing to Marketplace
          </button>
        </form>
      )}
    </div>
  );
};

// 36. Storefront Branding Customizer (Page 36)
export const SellerStoreCustomizerPage: React.FC<SellerSuiteProps> = ({ stores }) => {
  const store = stores[0];
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-400" />
          <span>Storefront Branding Customizer</span>
        </h1>
        <p className="text-xs text-slate-400">Personalize your brand imagery, promotional tagline, and merchant story</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs">
        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Store Brand Name</label>
          <input
            type="text"
            defaultValue={store?.name || "Aura Acoustics"}
            className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Custom Store URL Slug</label>
          <input
            type="text"
            defaultValue={store?.slug || "aura-acoustics"}
            className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white font-mono"
          />
        </div>

        <div>
          <label className="text-slate-300 block mb-1 font-semibold">About Merchant & Brand Story</label>
          <textarea
            rows={3}
            defaultValue={store?.description || "High-end studio grade listening gear crafted for audio professionals."}
            className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
          />
        </div>

        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-md shadow-blue-900/40"
        >
          {saved ? "Saved Brand Changes!" : "Save Store Customizations"}
        </button>
      </div>
    </div>
  );
};

// 37. Order Fulfillment & Shipping (Page 37)
export const SellerOrdersPage: React.FC<SellerSuiteProps> = ({ orders }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-400" />
          <span>Order Fulfillment & Shipping</span>
        </h1>
        <p className="text-xs text-slate-400">Attach tracking numbers, print packing slips, and confirm fulfillment</p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-[#0A0D1D] rounded-3xl border border-blue-900/30">
            <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">All customer orders have been dispatched.</p>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-white text-sm">Order #{o.orderNumber}</span>
                <p className="text-slate-400 mt-0.5">{o.items.length} items • ${o.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-xl bg-blue-950/70 text-blue-300 border border-blue-800/40 font-bold">
                  Print Packing Slip
                </button>
                <button className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white font-bold">
                  Attach Tracking #
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 38. Sales Analytics & Revenue Breakdown (Page 38)
export const SellerAnalyticsPage: React.FC<SellerSuiteProps> = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <span>Sales Analytics & Revenue Breakdown</span>
        </h1>
        <p className="text-xs text-slate-400">Monthly conversion statistics, revenue by category, and payout schedules</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">30-Day Gross Volume</span>
          <p className="text-2xl font-black text-white mt-1">$12,490.00</p>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Fee (3.5%)</span>
          <p className="text-2xl font-black text-slate-300 mt-1">$437.15</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Ultra-low marketplace rate</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Net Merchant Payout</span>
          <p className="text-2xl font-black text-[#00C2FF] mt-1">$12,052.85</p>
          <span className="text-[10px] text-emerald-400 mt-1 block">Scheduled for direct ACH</span>
        </div>
      </div>
    </div>
  );
};

// 39. Customer Inquiries & Chat Desk (Page 39)
export const SellerMessagesPage: React.FC<SellerSuiteProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <span>Customer Inquiries & Chat Desk</span>
          </h1>
          <p className="text-xs text-slate-400">Real-time buyer chats and order support requests</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-3">
        <div className="p-4 rounded-2xl bg-[#070914] border border-blue-900/40 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white">Inquiry from Collins O.</span>
            <p className="text-slate-400 mt-0.5">"Is the mechanical keyboard available in Nordic ISO layout?"</p>
          </div>
          <button
            onClick={() => onNavigate("messages")}
            className="px-3 py-1.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold"
          >
            Reply in Chat
          </button>
        </div>
      </div>
    </div>
  );
};

// 40. Payouts, Escrow & Banking (Page 40)
export const SellerPayoutsPage: React.FC<SellerSuiteProps> = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[#00C2FF]" />
          <span>Payouts, Escrow & Banking</span>
        </h1>
        <p className="text-xs text-slate-400">View escrow balance releases and manage linked bank accounts</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-blue-900/30 pb-3">
          <div>
            <span className="text-slate-400 block text-[10px]">Available For Withdrawal</span>
            <span className="text-2xl font-black text-white">$3,420.00</span>
          </div>
          <button className="px-5 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-md shadow-blue-900/40">
            Request Immediate ACH Transfer
          </button>
        </div>
        <div className="text-slate-400">
          <p>Linked Bank: Chase Business Checking •••• 9102</p>
          <p className="mt-1">Payout Cadence: Every Tuesday (Automated)</p>
        </div>
      </div>
    </div>
  );
};

// 41. Store Discount & Coupon Manager (Page 41)
export const SellerDiscountsPage: React.FC<SellerSuiteProps> = () => {
  const [created, setCreated] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BadgePercent className="w-6 h-6 text-purple-400" />
          <span>Store Discount & Coupon Manager</span>
        </h1>
        <p className="text-xs text-slate-400">Create store-specific promotion codes and flash markdown campaigns</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCreated(true);
        }}
        className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs"
      >
        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Promotion Code</label>
          <input
            type="text"
            required
            placeholder="e.g., SUMMER20"
            className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white font-mono uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Discount Percentage (%)</label>
            <input
              type="number"
              min="1"
              max="90"
              required
              placeholder="20"
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Minimum Cart Size ($)</label>
            <input
              type="number"
              placeholder="50.00"
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-md shadow-blue-900/40"
        >
          {created ? "Promotion Code Activated!" : "Launch Store Promotion"}
        </button>
      </form>
    </div>
  );
};
