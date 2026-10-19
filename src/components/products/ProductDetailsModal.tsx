import React, { useState } from "react";
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  CheckCircle,
  MessageSquare,
  Plus,
  Minus,
  AlertCircle,
  Send,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useConvex } from "../../context/ConvexContext";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenStore: (slugOrId: string) => void;
  onOpenAuth: () => void;
  onStartMessage: (sellerId: string, storeId?: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onOpenStore,
  onOpenAuth,
  onStartMessage,
}) => {
  const { currentUser } = useAuth();
  const {
    getStoreById,
    addToCart,
    getFavoriteStatus,
    toggleFavorite,
    getFollowStatus,
    followSeller,
    unfollowSeller,
    listProductReviews,
    createReview,
  } = useConvex();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!product) return null;

  const store = getStoreById(product.storeId);
  const sellerId = product.sellerId || store?.ownerId;

  const isFavorited = currentUser
    ? getFavoriteStatus(currentUser._id, product._id).isFavorited
    : false;

  const followStatus = sellerId
    ? getFollowStatus(currentUser?._id, sellerId)
    : { isFollowing: false, followerCount: 0, isSelf: false };

  const reviews = listProductReviews(product._id);
  const isOutOfStock = product.inventory <= 0 || product.status === "out_of_stock";

  const handleFollowToggle = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!sellerId) return;

    if (followStatus.isFollowing) {
      await unfollowSeller({
        followerId: currentUser._id,
        sellerId,
        storeId: product.storeId,
      });
    } else {
      await followSeller({
        followerId: currentUser._id,
        sellerId,
        storeId: product.storeId,
      });
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (currentUser._id === product.sellerId) {
      alert("You cannot buy your own products");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({ userId: currentUser._id, productId: product._id, quantity });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setReviewError(null);
    setIsSubmittingReview(true);

    try {
      if (!newComment.trim()) throw new Error("Please write a review comment");
      await createReview({
        productId: product._id,
        userId: currentUser._id,
        rating: newRating,
        comment: newComment.trim(),
      });
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-[#131627]/90 backdrop-blur-md rounded-full shadow-sm hover:bg-[#1a1e38] border border-purple-900/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-2xl bg-[#090b14] overflow-hidden border border-purple-900/30">
                <img
                  src={
                    product.images[selectedImage] ||
                    product.images[0] ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImage === i
                          ? "border-purple-500 ring-2 ring-purple-500/30"
                          : "border-purple-900/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Section */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Store Profile Header */}
                {store && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#13162b] border border-purple-900/30 mb-4">
                    <button
                      onClick={() => onOpenStore(store.slug || store._id)}
                      className="flex items-center gap-2.5 text-left group"
                    >
                      <img
                        src={store.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100"}
                        alt={store.name}
                        className="w-10 h-10 rounded-xl object-cover border border-purple-800/40"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                          <span>{store.name}</span>
                          {store.isVerified && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {followStatus.followerCount} followers • Open Store
                        </p>
                      </div>
                    </button>

                    {!followStatus.isSelf && (
                      <button
                        onClick={handleFollowToggle}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          followStatus.isFollowing
                            ? "bg-[#181d38] hover:bg-rose-950/40 hover:text-rose-400 text-purple-300 border border-purple-800/40"
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
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-purple-400">
                    {product.category}
                  </span>
                  <span className="text-slate-500" aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  {product.title}
                </h2>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">USD • Tax included</span>
                </div>

                <div className="mt-4 prose prose-sm text-slate-300 leading-relaxed text-xs">
                  {product.description}
                </div>

                {/* Inventory Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      isOutOfStock ? "bg-rose-500" : product.inventory < 5 ? "bg-amber-500" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${product.inventory} units available in stock`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-purple-900/30 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-purple-900/40 bg-[#090b14] rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                      disabled={isOutOfStock || quantity >= product.inventory}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? "bg-[#14172e] text-slate-500 border border-purple-900/30 cursor-not-allowed"
                        : addedSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/35 active:scale-95"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {addedSuccess
                        ? "Added to Cart!"
                        : isOutOfStock
                        ? "Sold Out"
                        : `Add to Cart ($${(product.price * quantity).toFixed(2)})`}
                    </span>
                  </button>

                  {/* Favorite */}
                  <button
                    onClick={async () => {
                      if (!currentUser) {
                        onOpenAuth();
                        return;
                      }
                      await toggleFavorite({ userId: currentUser._id, productId: product._id });
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      isFavorited
                        ? "border-rose-900/50 bg-rose-950/40 text-rose-400"
                        : "border-purple-900/40 bg-[#12162a] hover:bg-[#181d38] text-slate-400"
                    }`}
                    title={isFavorited ? "Saved in favorites" : "Save to favorites"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>

                {/* Contact Seller Button */}
                {sellerId && currentUser?._id !== sellerId && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth();
                        return;
                      }
                      onStartMessage(sellerId, product.storeId);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-purple-900/40 hover:border-purple-500 hover:bg-[#151930] text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>Message Seller about this Item</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-10 pt-8 border-t border-purple-900/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)} out of 5</span>
              </div>
            </div>

            {/* Write a review form */}
            {currentUser && currentUser._id !== product.sellerId && (
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 rounded-2xl bg-[#0a0c16] border border-purple-900/30 space-y-3">
                <h4 className="text-xs font-bold text-white">Write an Honest Review</h4>

                {reviewError && (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 mr-2 font-medium">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this item..."
                    className="w-full p-2.5 text-xs border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500/20 bg-[#12162a] text-slate-100 placeholder-slate-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md shadow-purple-900/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? "Posting..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No reviews yet. Be the first customer to leave feedback on this product!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 rounded-xl bg-[#12162a] border border-purple-900/30 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.userName}`}
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full border border-purple-800/40"
                        />
                        <span className="text-xs font-bold text-white">{rev.userName}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pl-8">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
