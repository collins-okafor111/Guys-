import React, { useState } from "react";
import {
  Sparkles,
  Store as StoreIcon,
  ShoppingBag,
  Zap,
  TrendingUp,
  Percent,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { Product, Store } from "../types";
import { ProductCard } from "../components/products/ProductCard";
import { StoreCard } from "../components/stores/StoreCard";
import { ShopzaLogo } from "../components/layout/ShopzaLogo";

interface MarketplacePageProps {
  products: Product[];
  stores: Store[];
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slugOrId: string) => void;
  onOpenAuth: (tab?: any) => void;
  onNavigate: (pageId: string) => void;
  currentUser: any;
}

// 1. Marketplace Home (Page 1)
export const MarketplaceHomePage: React.FC<MarketplacePageProps> = ({
  products,
  stores,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
  onNavigate,
  currentUser,
}) => {
  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Brand Hero Banner with Speeding Shopping Cart Logo Colors */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1028] via-[#090C1D] to-[#060813] border border-blue-500/25 p-8 sm:p-12 overflow-hidden shadow-2xl shadow-blue-950/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101738] text-blue-300 text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Verified Buy & Sell Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Trade with verified sellers.{" "}
            <span className="bg-gradient-to-r from-[#0066FF] via-[#6366F1] to-[#7928CA] bg-clip-text text-transparent">
              Shop Smarter, Live Better.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Discover independent merchant storefronts, enjoy lightning-fast checkout, real-time inventory validation, and in-app communications.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("all_products")}
              className="px-6 py-3 bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] hover:from-[#0055D6] hover:to-[#6B21A8] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Products ({products.length})</span>
            </button>
            <button
              onClick={() => onNavigate("flash_deals")}
              className="px-5 py-3 bg-[#0F142A] hover:bg-[#151C3B] text-slate-200 border border-blue-900/40 hover:border-blue-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Daily Flash Deals</span>
            </button>
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth("register");
                else onNavigate("seller_dashboard");
              }}
              className="px-5 py-3 bg-[#0F142A] hover:bg-[#151C3B] text-slate-200 border border-purple-900/40 hover:border-purple-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <StoreIcon className="w-4 h-4 text-purple-400" />
              <span>Open Seller Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Stores Rail */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-blue-400" />
              <span>Featured Merchant Stores</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top-rated creators and verified artisans</p>
          </div>
          <button
            onClick={() => onNavigate("stores")}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Stores ({stores.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.slice(0, 3).map((st) => (
            <StoreCard
              key={st._id}
              store={st}
              onViewStore={() => onOpenStore(st.slug)}
              onFollowToggle={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#7928CA]" />
              <span>Trending Marketplace Products</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">In-stock goods from independent stores</p>
          </div>
          <button
            onClick={() => onNavigate("best_sellers")}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>See Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// 2. All Products Catalog (Page 2)
export const AllProductsPage: React.FC<MarketplacePageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState<number>(500);

  const categories = ["All", "Electronics", "Fashion & Apparel", "Home & Living", "Beauty & Health", "Sports & Fitness", "Artisanal & Crafts"];

  const filtered = products
    .filter((p) => {
      const matchCat = category === "All" || p.category.toLowerCase().includes(category.toLowerCase());
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      return matchCat && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/25 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Marketplace Catalog</h1>
          <p className="text-xs text-slate-400">Discover all active listings with real-time stock availability</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400 bg-[#0F142A] border border-blue-900/30 px-3 py-1.5 rounded-xl">
            {filtered.length} Items Available
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#090C1D] border border-blue-900/40 rounded-xl text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-[#090C1D] border border-blue-900/40 rounded-xl text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                category === c
                  ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white"
                  : "bg-[#090C1D] text-slate-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onSelect={(prod) => onSelectProduct(prod)}
            onOpenAuth={() => onOpenAuth("login")}
            onOpenStore={(slug) => onOpenStore(slug)}
          />
        ))}
      </div>
    </div>
  );
};

// 3. Verified Stores Directory (Page 3)
export const StoresDirectoryPage: React.FC<MarketplacePageProps> = ({
  stores,
  onOpenStore,
  onNavigate,
}) => {
  const [search, setSearch] = useState("");

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/25 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Merchant Directory</h1>
          <p className="text-xs text-slate-400">Shop directly from independent store owners</p>
        </div>
        <button
          onClick={() => onNavigate("seller_dashboard")}
          className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold"
        >
          Open Your Own Store
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search merchant stores..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((st) => (
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

// 4. Flash Deals (Page 4)
export const FlashDealsPage: React.FC<MarketplacePageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#180C30] via-[#0D153B] to-[#0A0D1D] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] uppercase">
              Limited Time
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Ending in 08h : 42m : 15s
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Daily Flash Deals</h1>
          <p className="text-xs text-slate-300">Save up to 40% on verified seller inventory for the next 24 hours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <div key={p._id} className="relative group">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black shadow-md">
              SAVE 25%
            </span>
            <ProductCard
              product={{ ...p, price: Math.round(p.price * 0.75 * 100) / 100 }}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. New Arrivals (Page 5)
export const NewArrivalsPage: React.FC<MarketplacePageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  const sorted = [...products].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span>New Arrivals & Drops</span>
        </h1>
        <p className="text-xs text-slate-400">Discover new products listed by merchants this week</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sorted.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onSelect={(prod) => onSelectProduct(prod)}
            onOpenAuth={() => onOpenAuth("login")}
            onOpenStore={(slug) => onOpenStore(slug)}
          />
        ))}
      </div>
    </div>
  );
};

// 6. Best Sellers (Page 6)
export const BestSellersPage: React.FC<MarketplacePageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#7928CA]" />
          <span>Trending & Best Sellers</span>
        </h1>
        <p className="text-xs text-slate-400">The most popular products chosen by verified marketplace shoppers</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {bestSellers.map((p, idx) => (
          <div key={p._id} className="relative group">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white text-[10px] font-black shadow-md">
              #{idx + 1} Best Seller
            </span>
            <ProductCard
              product={p}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Clearance & Overstock (Page 7)
export const ClearancePage: React.FC<MarketplacePageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#180A28] to-[#0A0D1D] border border-rose-500/30 flex items-center justify-between">
        <div>
          <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase">
            Final Markdowns
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Clearance & Outlet Savings</h1>
          <p className="text-xs text-slate-300">Final inventory clearances direct from seller warehouses</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <div key={p._id} className="relative group">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow-md">
              CLEARANCE
            </span>
            <ProductCard
              product={{ ...p, price: Math.round(p.price * 0.6 * 100) / 100 }}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
