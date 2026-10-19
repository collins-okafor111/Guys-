import React from "react";
import {
  Cpu,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  Palette,
  Gift,
  Leaf,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Product } from "../types";
import { ProductCard } from "../components/products/ProductCard";

interface CategoryPageProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slug: string) => void;
  onOpenAuth: (tab?: any) => void;
}

// Helper to filter and render a category
const CategoryTemplate: React.FC<{
  title: string;
  categorySlug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slug: string) => void;
  onOpenAuth: (tab?: any) => void;
}> = ({ title, categorySlug, description, icon: Icon, products, onSelectProduct, onOpenStore, onOpenAuth }) => {
  const matching = products.filter(
    (p) => p.category.toLowerCase().includes(categorySlug.toLowerCase()) || categorySlug === "all"
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F142A] to-[#141A38] border border-blue-500/20 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Icon className="w-4 h-4" />
            <span>Marketplace Category</span>
          </div>
          <h1 className="text-2xl font-black text-white">{title}</h1>
          <p className="text-xs text-slate-300 max-w-xl">{description}</p>
        </div>
        <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-[#0A0D1D] text-blue-300 border border-blue-900/30 text-xs font-bold">
          {matching.length} Items Listed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {matching.map((p) => (
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

// 8. Electronics & Tech (Page 8)
export const CategoryElectronicsPage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Electronics, Gadgets & Audio"
    categorySlug="electronics"
    description="Wireless headphones, mechanical keyboards, studio monitors, activity trackers, and computer accessories."
    icon={Cpu}
    {...props}
  />
);

// 9. Fashion & Apparel (Page 9)
export const CategoryFashionPage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Fashion, Apparel & Shoes"
    categorySlug="fashion"
    description="Heavyweight organic cotton apparel, artisanal outerwear, and designer garments."
    icon={Shirt}
    {...props}
  />
);

// 10. Home & Living (Page 10)
export const CategoryHomePage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Home, Kitchen & Interior Living"
    categorySlug="home"
    description="Handcrafted ceramic vases, sculptural kitchenware, minimalist decor, and home essentials."
    icon={Home}
    {...props}
  />
);

// 11. Beauty & Wellness (Page 11)
export const CategoryBeautyPage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Beauty, Skincare & Wellness"
    categorySlug="beauty"
    description="Cold-pressed botanical serums, organic lip care, essential oils, and cruelty-free cosmetics."
    icon={Heart}
    {...props}
  />
);

// 12. Sports & Fitness (Page 12)
export const CategorySportsPage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Sports, Fitness & Outdoor Adventure"
    categorySlug="sports"
    description="Activity monitors, ergonomic workout gear, athletic recovery, and outdoor exploration equipment."
    icon={Dumbbell}
    {...props}
  />
);

// 13. Artisanal & Crafts (Page 13)
export const CategoryArtisanalPage: React.FC<CategoryPageProps> = (props) => (
  <CategoryTemplate
    title="Artisanal, Handcrafted & Custom Creations"
    categorySlug="artisanal"
    description="Handmade goods, custom woodwork, studio pottery, and independent creator merchandise."
    icon={Palette}
    {...props}
  />
);

// 14. Curated Gift Guides (Page 14)
export const GiftGuidesPage: React.FC<CategoryPageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1A0E38] via-[#0D153B] to-[#0A0D1D] border border-purple-500/30">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4" /> Editorial Curation
          </span>
          <h1 className="text-3xl font-black text-white">Curated Gift Guides</h1>
          <p className="text-xs text-slate-300">
            Hand-picked selections for birthdays, holidays, creators, and design enthusiasts.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Top Gift Ideas Under $150</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.filter((p) => p.price <= 150).map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onSelect={onSelectProduct}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={onOpenStore}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 15. Sustainable & Eco-Friendly Market (Page 15)
export const SustainableMarketPage: React.FC<CategoryPageProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0C241E] via-[#0A1A2E] to-[#0A0D1D] border border-emerald-500/30">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="w-4 h-4" /> Green Certified Marketplace
          </span>
          <h1 className="text-3xl font-black text-white">Eco-Friendly & Sustainable Market</h1>
          <p className="text-xs text-slate-300">
            Support carbon-neutral sellers, circular materials, organic textiles, and plastic-free packaging.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p._id} className="relative group">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black flex items-center gap-1 shadow-md">
              <Leaf className="w-3 h-3" /> ECO VERIFIED
            </span>
            <ProductCard
              product={p}
              onSelect={onSelectProduct}
              onOpenAuth={() => onOpenAuth("login")}
              onOpenStore={onOpenStore}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
