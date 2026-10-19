import React, { useState } from "react";
import {
  ShoppingBag,
  Heart,
  Users,
  User as UserIcon,
  Truck,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useConvex } from "../../context/ConvexContext";
import { Product } from "../../types";

interface BuyerDashboardProps {
  onSelectProduct: (product: Product) => void;
  onOpenStore: (slugOrId: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  onSelectProduct,
  onOpenStore,
}) => {
  const { currentUser, updateProfile } = useAuth();
  const { listBuyerOrders, listFavorites, listFollowing, toggleFavorite, unfollowSeller } = useConvex();

  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "following" | "profile">("orders");

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  if (!currentUser) return null;

  const orders = listBuyerOrders(currentUser._id);
  const favorites = listFavorites(currentUser._id);
  const following = listFollowing(currentUser._id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-[#07080e] min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 text-slate-100 font-['Plus_Jakarta_Sans']">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Buyer Header Card */}
        <div className="bg-[#0d101d] rounded-3xl border border-purple-900/30 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-800/40 shadow-md bg-[#12162a]"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-[#14182e] text-purple-300 border-purple-900/40">
                  Buyer Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#13172e] text-purple-300 border border-purple-900/40 rounded-xl text-xs font-bold">
              {orders.length} Orders Placed
            </span>
            <span className="px-3 py-1 bg-[#0a0c16] text-blue-300 border border-indigo-900/40 rounded-xl text-xs font-bold">
              Following {following.length} Stores
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-purple-900/30 pb-2 overflow-x-auto">
          {[
            { id: "orders", label: `Order History (${orders.length})`, icon: ShoppingBag },
            { id: "favorites", label: `Saved Favorites (${favorites.length})`, icon: Heart },
            { id: "following", label: `Followed Stores (${following.length})`, icon: Users },
            { id: "profile", label: "Account Profile", icon: UserIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/30"
                    : "bg-[#0d101d] text-slate-400 hover:text-white hover:bg-[#15192e] border border-purple-900/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#0d101d] rounded-2xl border border-purple-900/30 p-8">
                <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No orders yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Items you buy in the marketplace will be tracked here from confirmation to delivery.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o._id}
                    className="bg-[#0d101d] rounded-2xl border border-purple-900/30 p-5 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">
                            Order #{o.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                              o.status === "delivered"
                                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
                                : o.status === "shipped"
                                ? "bg-purple-950/60 text-purple-300 border-purple-800/40"
                                : "bg-[#14182e] text-slate-300 border-purple-900/30"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Purchased from{" "}
                          <button
                            onClick={() => onOpenStore(o.storeId)}
                            className="font-bold text-purple-400 hover:text-purple-300 hover:underline"
                          >
                            {o.storeName}
                          </button>{" "}
                          • {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-white">
                          ${o.total.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-emerald-400 font-semibold">Paid in full</p>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-2">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-10 h-10 rounded-lg object-cover bg-[#090b14] border border-purple-900/40"
                            />
                            <div>
                              <p className="font-bold text-white">{item.productTitle}</p>
                              <p className="text-slate-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-purple-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking */}
                    {o.trackingNumber && (
                      <div className="p-3 bg-[#0a0c16] border border-purple-900/30 rounded-xl flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300 font-medium">
                          <Truck className="w-4 h-4 text-purple-400" />
                          Tracking Number: <code className="font-mono text-purple-300 font-bold">{o.trackingNumber}</code>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-[#0d101d] rounded-2xl border border-purple-900/30 p-8">
                <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No favorite items saved</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tap the heart on any product in the marketplace to save it to your personal favorites list.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map((prod: Product) => (
                  <div
                    key={prod._id}
                    onClick={() => onSelectProduct(prod)}
                    className="bg-[#0d101d] rounded-2xl border border-purple-900/30 overflow-hidden shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full relative bg-[#090b14]">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleFavorite({ userId: currentUser._id, productId: prod._id });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-[#12162a]/90 rounded-full text-rose-400 hover:text-white hover:bg-rose-600 border border-purple-900/40"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3.5">
                      <p className="text-[11px] text-purple-400 font-medium">Product</p>
                      <h5 className="text-xs font-bold text-white truncate mt-0.5">
                        {prod.title}
                      </h5>
                      <p className="text-xs font-extrabold text-purple-300 mt-1">
                        ${prod.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FOLLOWING TAB */}
        {activeTab === "following" && (
          <div className="space-y-3">
            {following.length === 0 ? (
              <div className="text-center py-16 bg-[#0d101d] rounded-2xl border border-purple-900/30 p-8">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">You are not following any stores yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Follow your favorite sellers to receive new product alerts and updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {following.map((f: any) => (
                  <div
                    key={f.followId}
                    className="p-4 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.store?.logoUrl || f.seller?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Shop"}
                        alt={f.store?.name || f.seller?.name || "Store"}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-900/40 bg-[#12162a]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {f.store?.name || f.seller?.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Followed on {new Date(f.followedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {f.store && (
                        <button
                          onClick={() => onOpenStore(f.store!.slug || f.store!._id)}
                          className="px-3 py-1.5 bg-[#14182e] hover:bg-[#1a203c] text-purple-300 border border-purple-900/40 rounded-lg text-xs font-bold"
                        >
                          Visit
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (f.seller) {
                            await unfollowSeller({
                              followerId: currentUser._id,
                              sellerId: f.seller._id,
                              storeId: f.store?._id,
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-semibold"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="bg-[#0d101d] rounded-2xl border border-purple-900/30 p-6 shadow-xl max-w-lg">
            <h3 className="text-base font-bold text-white mb-1">Edit Account Profile</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update your public buyer name and contact info.
            </p>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email (Registered)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 bg-[#080a12] border border-purple-900/30 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bio / About Me</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A few words about yourself..."
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0123"
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
