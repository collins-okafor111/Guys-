import React from "react";
import { Store, CheckCircle, Users, ArrowRight, UserCheck, UserPlus } from "lucide-react";
import { Store as StoreType } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";

interface StoreCardProps {
  store: StoreType;
  onSelect: (store: StoreType) => void;
  onOpenAuth: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect, onOpenAuth }) => {
  const { currentUser } = useAuth();
  const { getFollowStatus, followSeller, unfollowSeller } = useFirebase();

  const followStatus = getFollowStatus(currentUser?._id, store.ownerId);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      onClick={() => onSelect(store)}
      className="group bg-[#0d101d] rounded-2xl border border-purple-900/30 hover:border-purple-500/50 shadow-xl hover:shadow-2xl hover:shadow-purple-950/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Banner */}
      <div className="relative h-28 w-full bg-[#08090f] overflow-hidden">
        <img
          src={store.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              store.status === "open"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-purple-950 text-purple-300 border border-purple-800"
            }`}
          >
            {store.status}
          </span>
        </div>
      </div>

      {/* Profile & Info */}
      <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Follow */}
          <div className="flex items-end justify-between -mt-7 mb-3">
            <img
              src={store.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150"}
              alt={store.name}
              className="w-14 h-14 rounded-2xl object-cover border-3 border-[#0d101d] shadow-lg bg-[#12162a]"
            />

            {!followStatus.isSelf && (
              <button
                onClick={handleFollow}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                  followStatus.isFollowing
                    ? "bg-[#161a32] hover:bg-rose-950/40 hover:text-rose-400 text-purple-300 border border-purple-800/40"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-900/30"
                }`}
              >
                {followStatus.isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              {store.name}
            </h4>
            {store.isVerified && <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {store.description}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {store.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            {followStatus.followerCount} followers
          </span>

          <span className="flex items-center gap-1 text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
            Visit Store <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
