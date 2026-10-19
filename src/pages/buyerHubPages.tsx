import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  Bookmark,
  Users,
  MapPin,
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  Store,
  ChevronRight,
  Heart,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import { Product, Store as StoreType, Order, User as UserType } from "../types";
import { ProductCard } from "../components/products/ProductCard";
import { StoreCard } from "../components/stores/StoreCard";

interface BuyerHubProps {
  products: Product[];
  stores: StoreType[];
  orders: Order[];
  currentUser: UserType | null;
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slug: string) => void;
  onNavigate: (pageId: string) => void;
  onOpenAuth: (tab?: any) => void;
  onOpenMessages?: (sellerId: string) => void;
}

// 26. Buyer Dashboard (Page 26)
export const BuyerDashboardPage: React.FC<BuyerHubProps> = ({
  orders,
  products,
  stores,
  currentUser,
  onNavigate,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  if (!currentUser) {
    return (
      <div className="text-center py-20 px-4 bg-[#0A0D1D] rounded-3xl border border-blue-900/30 space-y-4 max-w-xl mx-auto">
        <User className="w-12 h-12 text-blue-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Your Buyer Dashboard</h2>
        <p className="text-xs text-slate-400">
          Manage your orders, shipment status, saved bookmarks, and followed merchants in one unified console.
        </p>
        <button
          onClick={() => onOpenAuth("login")}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Buyer Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#101736] via-[#0A0D1D] to-[#101736] border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40"
          />
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Verified Marketplace Member
            </span>
            <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("buyer_orders")}
            className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/40"
          >
            My Orders
          </button>
          <button
            onClick={() => onNavigate("wishlist")}
            className="px-4 py-2 bg-[#0F142A] border border-blue-900/40 text-slate-300 rounded-xl text-xs font-bold hover:bg-[#151C3B]"
          >
            Saved Items
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
          <p className="text-2xl font-black text-white mt-1">{orders.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">In Transit</span>
          <p className="text-2xl font-black text-blue-400 mt-1">1</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Saved Items</span>
          <p className="text-2xl font-black text-purple-400 mt-1">4</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Escrow Protection</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">100%</p>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span>Recent Orders</span>
          </h3>
          <button
            onClick={() => onNavigate("buyer_orders")}
            className="text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            View All ({orders.length})
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No purchases recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord._id}
                className="p-4 rounded-2xl bg-[#070914] border border-blue-900/40 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-white">Order #{ord.orderNumber}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{ord.items.length} items • ${ord.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 uppercase">
                    {ord.status}
                  </span>
                  <button
                    onClick={() => onNavigate("buyer_orders")}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 27. My Orders & Real-Time Tracking (Page 27)
export const OrderTrackingPage: React.FC<BuyerHubProps> = ({ orders, onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            <span>My Orders & Real-Time Tracking</span>
          </h1>
          <p className="text-xs text-slate-400">
            Monitor shipments, view order receipts, and track carrier delivery milestones
          </p>
        </div>
        <button
          onClick={() => onNavigate("returns")}
          className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#0F142A] border border-blue-900/40"
        >
          Request Return / Refund
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-[#0A0D1D] rounded-3xl border border-blue-900/30 space-y-3">
            <Package className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No active orders found</h3>
            <p className="text-xs text-slate-400">Items you purchase will appear here with live tracking.</p>
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord._id} className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-blue-900/30 pb-3 text-xs">
                <div>
                  <span className="font-mono text-sm font-black text-white">Order #{ord.orderNumber}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Placed on {new Date(ord.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950/70 text-blue-300 border border-blue-800/40 uppercase">
                    {ord.status}
                  </span>
                  <span className="font-black text-white text-sm">${ord.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking timeline */}
              <div className="p-4 rounded-2xl bg-[#070914] border border-blue-900/40">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Ordered
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Truck className="w-4 h-4" /> Dispatched
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" /> Delivered
                  </span>
                </div>
                <div className="w-full bg-blue-950/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-[#7928CA] h-full w-2/3" />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {ord.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <img src={it.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-white">{it.productTitle}</p>
                        <p className="text-[10px] text-slate-400">Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 28. Returns & Refund Requests Center (Page 28)
export const ReturnsCenterPage: React.FC<BuyerHubProps> = ({ orders }) => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-amber-400" />
          <span>Returns & Refund Requests Center</span>
        </h1>
        <p className="text-xs text-slate-400">
          Shopza 30-day hassle-free return guarantee with merchant prepaid label authorization
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-[#0F142A] border border-emerald-500/40 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Return Request Received</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your return case #RMA-84912 has been opened. The merchant has 48 hours to issue your prepaid return shipping label.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Select Order for Return</label>
            <select className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white">
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  Order #{o.orderNumber} — ${o.totalAmount.toFixed(2)}
                </option>
              ))}
              <option value="demo">Order #SPZ-99412 — $129.00</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Reason for Return</label>
            <select className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white">
              <option>Item received does not match description</option>
              <option>Damaged or defective upon arrival</option>
              <option>Wrong size or incorrect variant sent</option>
              <option>Arrived too late for intended event</option>
              <option>Changed mind (unopened original packaging)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Additional Details</label>
            <textarea
              rows={3}
              placeholder="Describe the issue with the delivered merchandise..."
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
          >
            Submit Return Merchandise Authorization (RMA)
          </button>
        </form>
      )}
    </div>
  );
};

// 29. Saved Wishlist & Bookmarks (Page 29)
export const WishlistPage: React.FC<BuyerHubProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#7928CA]" />
            <span>Saved Wishlist & Bookmarks</span>
          </h1>
          <p className="text-xs text-slate-400">
            Products you bookmarked for later purchase with live stock & price alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 6).map((p) => (
          <div key={p._id} className="relative group">
            <ProductCard
              product={p}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => {}}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 30. Followed Stores & Activity Feed (Page 30)
export const FollowedStoresPage: React.FC<BuyerHubProps> = ({
  stores,
  onOpenStore,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          <span>Followed Stores & Activity Feed</span>
        </h1>
        <p className="text-xs text-slate-400">
          Updates, new product drops, and announcements from your favorite independent merchants
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((st) => (
          <StoreCard
            key={st._id}
            store={st}
            onViewStore={() => onOpenStore(st.slug)}
            onFollowToggle={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

// 31. Shipping Address Book (Page 31)
export const AddressBookPage: React.FC<BuyerHubProps> = () => {
  const [addresses, setAddresses] = useState([
    { id: "1", name: "Home Primary", recipient: "Collins Okafor", street: "104 Marketplace Way, Apt 3A", city: "Seattle", state: "WA", zip: "98101", isDefault: true },
    { id: "2", name: "Studio Office", recipient: "Shopza Studio", street: "450 Tech Boulevard, Suite 800", city: "San Francisco", state: "CA", zip: "94105", isDefault: false },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <span>Shipping Address Book</span>
          </h1>
          <p className="text-xs text-slate-400">Manage multiple delivery addresses for fast 1-click checkout</p>
        </div>
      </div>

      <div className="space-y-3">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 flex items-start justify-between gap-4"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{a.name}</span>
                {a.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 font-bold text-[10px] border border-blue-800/40">
                    Default Address
                  </span>
                )}
              </div>
              <p className="text-slate-300 font-medium">{a.recipient}</p>
              <p className="text-slate-400">{a.street}</p>
              <p className="text-slate-400">{a.city}, {a.state} {a.zip}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#151C3B]">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 32. Profile & Account Preferences (Page 32)
export const BuyerProfilePage: React.FC<BuyerHubProps> = ({ currentUser, onOpenAuth }) => {
  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-[#0A0D1D] rounded-3xl border border-blue-900/30 space-y-3">
        <User className="w-10 h-10 text-blue-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Sign In to Edit Profile</h3>
        <button
          onClick={() => onOpenAuth("login")}
          className="px-5 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          <span>Profile & Account Preferences</span>
        </h1>
        <p className="text-xs text-slate-400">Update your public marketplace profile, email notifications, and security</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-5 text-xs">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40"
          />
          <div>
            <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 uppercase border border-blue-800/40">
              {currentUser.role} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              defaultValue={currentUser.name}
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              disabled
              defaultValue={currentUser.email}
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-slate-400"
            />
          </div>
        </div>

        <button className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-md shadow-blue-900/40">
          Save Profile Changes
        </button>
      </div>
    </div>
  );
};
