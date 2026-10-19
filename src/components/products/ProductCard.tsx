import React from "react";
import { Heart, ShoppingBag, Star, CheckCircle, Store, AlertCircle } from "lucide-react";
import { Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useConvex } from "../../context/ConvexContext";

interface ProductCardProps {
  product: Product & { storeName?: string; storeVerified?: boolean; storeSlug?: string };
  onSelect: (product: Product) => void;
  onOpenAuth: () => void;
  onOpenStore?: (slugOrId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onOpenAuth,
  onOpenStore,
}) => {
  const { currentUser } = useAuth();
  const { getFavoriteStatus, toggleFavorite, addToCart } = useConvex();

  const isFavorited = currentUser
    ? getFavoriteStatus(currentUser._id, product._id).isFavorited
    : false;

  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    await toggleFavorite({ userId: currentUser._id, productId: product._id });
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (currentUser._id === product.sellerId) {
      alert("You cannot buy products from your own store.");
      return;
    }

    if (product.inventory <= 0) return;

    setIsAdding(true);
    try {
      await addToCart({ userId: currentUser._id, productId: product._id, quantity: 1 });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err: any) {
      alert(err.message || "Could not add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.inventory <= 0 || product.status === "out_of_stock";

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-[#0d101d] rounded-2xl border border-purple-900/30 hover:border-purple-500/50 shadow-xl hover:shadow-2xl hover:shadow-purple-950/40 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#08090f] overflow-hidden">
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorited
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-[#12162a]/80 hover:bg-[#181d38] text-slate-300 hover:text-rose-400 border border-purple-900/40"
          }`}
          title={isFavorited ? "Saved in favorites" : "Save to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-white" : ""}`} />
        </button>

        {/* Warnings / Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        ) : product.inventory < 5 ? (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 font-black shadow-sm">
              Only {product.inventory} left
            </span>
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Store Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 font-medium">
            <span className="text-purple-400 font-semibold">{product.category}</span>
            {product.storeName && (
              <>
                <span aria-hidden="true" className="text-purple-900">·</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenStore && (product.storeSlug || product.storeId)) {
                      onOpenStore(product.storeSlug || product.storeId);
                    }
                  }}
                  className="flex items-center gap-1 hover:text-purple-300 truncate max-w-[140px] text-slate-400"
                >
                  <Store className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{product.storeName}</span>
                  {product.storeVerified && (
                    <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Product Name in Crisp White */}
          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h4>

          {/* Charcoal description preview */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-white">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Purple-Blue Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 ${
              isOutOfStock
                ? "bg-[#15192e] text-slate-500 border border-purple-900/30 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-900/30"
            }`}
            title="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {justAdded ? "Added" : isOutOfStock ? "Sold Out" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
