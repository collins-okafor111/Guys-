import React, { useState } from "react";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  ShoppingCart,
  Zap,
  Check,
  Scale,
  Building,
  Search,
  MessageSquare,
  Users,
  ExternalLink,
} from "lucide-react";
import { Product, Store as StoreType, Review } from "../types";
import { ProductCard } from "../components/products/ProductCard";

interface ProductPagesProps {
  products: Product[];
  stores: StoreType[];
  reviews: Review[];
  selectedProduct: Product | null;
  selectedStore: StoreType | null;
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slugOrId: string) => void;
  onAddToCart: (p: Product, qty: number) => void;
  onOpenAuth: () => void;
  onStartMessage: (sellerId: string, storeId?: string) => void;
  currentUser: any;
}

// 16. Interactive Product Showcase (Page 16)
export const ProductDetailPage: React.FC<ProductPagesProps> = ({
  products,
  selectedProduct,
  onOpenStore,
  onAddToCart,
  onStartMessage,
  currentUser,
}) => {
  const p = selectedProduct || products[0];
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!p) return <div className="text-center py-20 text-slate-400">No product selected</div>;

  const handleAdd = () => {
    onAddToCart(p, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0F142A] p-6 sm:p-8 rounded-3xl border border-blue-500/20">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#060813] border border-blue-900/30">
            <img
              src={p.images[selectedImg] || p.images[0]}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>
          {p.images.length > 1 && (
            <div className="flex gap-2">
              {p.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImg === idx ? "border-blue-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400 font-bold uppercase tracking-wider">{p.category}</span>
              <button
                onClick={() => onOpenStore(p.storeSlug || p.storeId)}
                className="text-slate-300 hover:text-white font-medium flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5 text-purple-400" />
                <span>{p.storeName || "Official Merchant Store"}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{p.title}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-amber-400" : "text-slate-600"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{p.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({p.reviewCount} customer reviews)</span>
            </div>

            <div className="text-3xl font-black text-white pt-2">
              ${p.price.toFixed(2)}{" "}
              <span className="text-xs text-slate-400 font-medium">{p.currency}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">{p.description}</p>

            <div className="p-3.5 rounded-2xl bg-[#0A0D1D] border border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-slate-400">Inventory Status:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {p.inventory} Units In Stock (Verified)
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-blue-900/40 rounded-xl bg-[#0A0D1D] text-xs font-bold">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-300 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(p.inventory, quantity + 1))}
                  className="px-3 py-2 text-slate-300 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] hover:from-[#0052CC] hover:to-[#6B21A8] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
              >
                {added ? <Check className="w-4 h-4 text-emerald-300" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{added ? "Added to Cart!" : "Add to Shopping Cart"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartMessage(p.sellerId, p.storeId)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0A0D1D] hover:bg-[#131936] text-slate-200 text-xs font-semibold border border-blue-900/30 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Message Seller</span>
              </button>
              <button
                onClick={() => onOpenStore(p.storeSlug || p.storeId)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0A0D1D] hover:bg-[#131936] text-slate-200 text-xs font-semibold border border-purple-900/30 flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-purple-400" />
                <span>Visit Storefront</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 17. Merchant Storefront (Page 17)
export const StorefrontPage: React.FC<ProductPagesProps> = ({
  stores,
  products,
  selectedStore,
  onSelectProduct,
  onStartMessage,
}) => {
  const st = selectedStore || stores[0];
  if (!st) return <div className="text-center py-20 text-slate-400">Storefront not found</div>;

  const storeProds = products.filter((p) => p.storeId === st._id);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/25 bg-[#0F142A]">
        <div className="h-44 sm:h-56 w-full relative">
          <img src={st.bannerUrl} alt={st.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1D] via-transparent to-transparent" />
        </div>

        <div className="p-6 sm:p-8 relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={st.logoUrl}
              alt={st.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#0A0D1D] shadow-xl bg-black"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{st.name}</h1>
                {st.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 text-[10px] font-bold border border-blue-700/50 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-lg mt-1">{st.description}</p>
            </div>
          </div>

          <button
            onClick={() => onStartMessage(st.ownerId, st._id)}
            className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat With Merchant</span>
          </button>
        </div>
      </div>

      {/* Store Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Store Catalog ({storeProds.length} Products)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {storeProds.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onSelect={onSelectProduct}
              onOpenAuth={() => {}}
              onOpenStore={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 18. Product Comparison Matrix (Page 18)
export const ProductComparePage: React.FC<ProductPagesProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  const compareItems = products.slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-400" />
          <span>Product Comparison Matrix</span>
        </h1>
        <p className="text-xs text-slate-400">Side-by-side technical evaluation of top marketplace picks</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left bg-[#0F142A] rounded-2xl border border-blue-900/30 overflow-hidden">
          <thead>
            <tr className="border-b border-blue-900/30 bg-[#0A0D1D]">
              <th className="p-4 text-slate-400 font-semibold w-40">Attribute</th>
              {compareItems.map((p) => (
                <th key={p._id} className="p-4 font-bold text-white min-w-[200px]">
                  <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover mb-2" />
                  <span className="line-clamp-1">{p.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20 text-slate-300">
            <tr>
              <td className="p-4 font-bold text-white bg-[#0A0D1D]/50">Price</td>
              {compareItems.map((p) => (
                <td key={p._id} className="p-4 font-black text-white text-sm">
                  ${p.price.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-white bg-[#0A0D1D]/50">Rating</td>
              {compareItems.map((p) => (
                <td key={p._id} className="p-4 text-amber-400 font-bold">
                  ★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-white bg-[#0A0D1D]/50">Category</td>
              {compareItems.map((p) => (
                <td key={p._id} className="p-4">{p.category}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-white bg-[#0A0D1D]/50">Inventory</td>
              {compareItems.map((p) => (
                <td key={p._id} className="p-4 text-emerald-400 font-semibold">{p.inventory} in stock</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-white bg-[#0A0D1D]/50">Actions</td>
              {compareItems.map((p) => (
                <td key={p._id} className="p-4">
                  <button
                    onClick={() => onAddToCart(p, 1)}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-lg font-bold text-[11px]"
                  >
                    Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 19. Customer Reviews Hub (Page 19)
export const ReviewsHubPage: React.FC<ProductPagesProps> = ({ reviews, products }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span>Customer Reviews & Ratings Hub</span>
        </h1>
        <p className="text-xs text-slate-400">Authentic feedback from verified marketplace purchases</p>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-[#0F142A] rounded-2xl border border-blue-900/30">
            No customer reviews posted yet. Be the first to review an order!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{r.userName || "Verified Customer"}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 20. Brand & Merchant A-Z Index (Page 20)
export const BrandDirectoryPage: React.FC<ProductPagesProps> = ({ stores, onOpenStore }) => {
  const [filter, setFilter] = useState("");

  const matching = stores.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-400" />
          <span>Brand & Merchant A-Z Index</span>
        </h1>
        <p className="text-xs text-slate-400">Discover all verified brands selling on Shopza</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter brands by name..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {matching.map((s) => (
          <div
            key={s._id}
            onClick={() => onOpenStore(s.slug)}
            className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 hover:border-blue-500/50 cursor-pointer transition-all flex items-center gap-3"
          >
            <img src={s.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-black" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">{s.categories.join(", ")}</p>
              <span className="text-[10px] text-blue-400 font-semibold">{s.followersCount} followers</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </div>
        ))}
      </div>
    </div>
  );
};
