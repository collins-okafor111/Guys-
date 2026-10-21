import React, { useState } from "react";
import {
  X,
  CheckCircle,
  Users,
  Package,
  Calendar,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Store as StoreType, Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";
import { ProductCard } from "../products/ProductCard";

interface StoreViewModalProps {
  store: StoreType | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenAuth: () => void;
  onStartMessage: (sellerId: string, storeId?: string) => void;
}

export const StoreViewModal: React.FC<StoreViewModalProps> = ({
  store,
  onClose,
  onSelectProduct,
  onOpenAuth,
  onStartMessage,
}) => {
  const { currentUser } = useAuth();
  const { listProducts, getFollowStatus, followSeller, unfollowSeller, getStoreFollowers } = useFirebase();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  if (!store) return null;

  const followersList = getStoreFollowers(store._id);

  const allProducts = listProducts({ storeId: store._id });
  const products = allProducts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const followStatus = getFollowStatus(currentUser?._id, store.ownerId);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (followStatus.isFollowing) {
      await unfollowSeller({
        followerId: currentUser._id,
        sellerId: store.ownerId,
        storeId: store._id,
      });
    } else {
      await followSeller({
        followerId: currentUser._id,
        sellerId: store.ownerId,
        storeId: store._id,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-[#131627]/90 backdrop-blur-md rounded-full shadow-sm hover:bg-[#1a1e38] border border-purple-900/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Store Content */}
        <div className="overflow-y-auto">
          {/* Banner */}
          <div className="relative h-44 sm:h-64 w-full bg-[#08090f]">
            <img
              src={store.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d101d] via-[#0d101d]/40 to-transparent" />
          </div>

          {/* Store Info Header */}
          <div className="px-6 sm:px-10 pb-6 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <img
                  src={store.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200"}
                  alt={store.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#0d101d] shadow-xl bg-[#12162a]"
                />
                <div className="mb-1 text-white">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {store.name}
                    </h2>
                    {store.isVerified && (
                      <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-purple-300 font-medium mt-0.5">
                    store/{store.slug} • {store.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {!followStatus.isSelf && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      followStatus.isFollowing
                        ? "bg-[#181d38] hover:bg-rose-950/40 hover:text-rose-400 text-purple-300 border border-purple-800/40"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-900/30"
                    }`}
                  >
                    {followStatus.isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow Store</span>
                      </>
                    )}
                  </button>
                )}

                {currentUser?._id !== store.ownerId && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth();
                        return;
                      }
                      onStartMessage(store.ownerId, store._id);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-purple-900/40 hover:bg-[#151930] hover:border-purple-500 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>Contact Seller</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio & Details */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-purple-900/30">
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  About the Store
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{store.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {store.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#13162b] text-purple-300 border border-purple-900/40"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0a0c16] border border-purple-900/30 space-y-2.5 text-xs">
                <div
                  onClick={() => setShowFollowersModal(true)}
                  className="flex items-center justify-between text-slate-400 hover:text-white cursor-pointer group transition-colors"
                  title="Click to view accounts following this store"
                >
                  <span className="flex items-center gap-1.5 group-hover:text-purple-300">
                    <Users className="w-4 h-4 text-purple-400" /> Followers (View List)
                  </span>
                  <span className="font-bold text-white group-hover:text-purple-300 underline">
                    {Math.max(followStatus.followerCount, followersList.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-400" /> Products Listed
                  </span>
                  <span className="font-bold text-white">{products.length}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" /> Member Since
                  </span>
                  <span className="font-bold text-white">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Products Section */}
            <div className="mt-8 pt-6 border-t border-purple-900/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Store Catalog ({products.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    All items available directly from {store.name}
                  </p>
                </div>

                {/* Filter within store */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search this store..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-purple-900/30 rounded-2xl bg-[#0a0c16]">
                  <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">No products match your filter</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try searching for another term or check back later for new inventory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onSelect={() => {
                        onSelectProduct(p);
                        onClose();
                      }}
                      onOpenAuth={onOpenAuth}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Followers List Popup */}
        {showFollowersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#0d101d] rounded-3xl border border-purple-500/40 p-6 text-slate-100 text-xs space-y-4">
              <button
                onClick={() => setShowFollowersModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e]"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Accounts Following {store.name}</h3>
              </div>
              {followersList.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No followers yet. Be the first to follow this store!</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {followersList.map(({ user, follow }) => (
                    <div key={follow._id} className="p-2.5 rounded-xl bg-[#12162a] border border-purple-900/40 flex items-center gap-2.5">
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-purple-300 truncate">{user.email}</p>
                      </div>
                      <span className="text-[9px] text-slate-500">{new Date(follow.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
