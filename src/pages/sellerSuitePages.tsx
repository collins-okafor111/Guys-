import React, { useState, useRef } from "react";
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
  Upload,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Users,
  Eye,
  X,
  FileImage,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Product, Store as StoreType, Order, User } from "../types";
import { useAuth } from "../context/AuthContext";
import { useFirebase } from "../context/FirebaseContext";
import { checkProductLegality, POPULAR_LEGAL_CATEGORIES } from "../utils/legalCompliance";
import { compressImageFile } from "../utils/imageUpload";

interface SellerSuiteProps {
  products: Product[];
  stores: StoreType[];
  orders: Order[];
  currentUser: User | null;
  onNavigate: (pageId: string) => void;
  onOpenStore: (slug: string) => void;
  onSelectProduct: (p: Product) => void;
  onOpenAuth: (tab?: any) => void;
  onStartMessage?: (userId: string, storeId?: string) => void;
}

// 33. Seller Portal & Metrics Hub (Page 33)
export const SellerDashboardPage: React.FC<SellerSuiteProps> = ({
  onNavigate,
  onOpenStore,
  onSelectProduct,
  onOpenAuth,
  onStartMessage,
}) => {
  const { currentUser } = useAuth();
  const {
    getStoreByOwner,
    createStore,
    deleteStore,
    listProducts,
    listSellerOrders,
    getStoreFollowers,
    db,
  } = useFirebase();

  // Create store form state (if no store yet)
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategory, setStoreCategory] = useState("Electronics");
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeBannerUrl, setStoreBannerUrl] = useState("");
  const [isUploadingStoreLogo, setIsUploadingStoreLogo] = useState(false);
  const [isUploadingStoreBanner, setIsUploadingStoreBanner] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [createStoreError, setCreateStoreError] = useState<string | null>(null);

  const handleUploadLogoFromDevice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingStoreLogo(true);
    setCreateStoreError(null);
    try {
      const compressed = await compressImageFile(files[0], 600, 600, 0.85);
      setStoreLogoUrl(compressed);
    } catch (err: any) {
      setCreateStoreError(err.message || "Failed to process logo image from device");
    } finally {
      setIsUploadingStoreLogo(false);
    }
  };

  const handleUploadBannerFromDevice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingStoreBanner(true);
    setCreateStoreError(null);
    try {
      const compressed = await compressImageFile(files[0], 1400, 600, 0.82);
      setStoreBannerUrl(compressed);
    } catch (err: any) {
      setCreateStoreError(err.message || "Failed to process background image from device");
    } finally {
      setIsUploadingStoreBanner(false);
    }
  };

  // Store Front Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("Closing my business");
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isDeletingStore, setIsDeletingStore] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <Store className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Merchant Portal Sign-In</h2>
        <p className="text-xs text-slate-400">
          Sign in or create an account to open your store front, list legal products, and view your followers.
        </p>
        <button
          onClick={() => onOpenAuth("login")}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const myStore = getStoreByOwner(currentUser._id);
  const myProducts = listProducts({ sellerId: currentUser._id });
  const myOrders = listSellerOrders(currentUser._id);
  const followersList = myStore ? getStoreFollowers(myStore._id) : [];

  const totalGrossRevenue = myOrders.reduce(
    (sum, o) => sum + (o.subtotal - o.platformCommission),
    0
  );

  const handleLaunchStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStoreError(null);
    setIsCreatingStore(true);
    try {
      if (!storeName.trim() || !storeDesc.trim()) {
        throw new Error("Store name and description are required");
      }
      await createStore({
        ownerId: currentUser._id,
        name: storeName.trim(),
        description: storeDesc.trim(),
        categories: [storeCategory.trim() || "General Goods"],
        logoUrl: storeLogoUrl.trim() || undefined,
        bannerUrl: storeBannerUrl.trim() || undefined,
      });
    } catch (err: any) {
      setCreateStoreError(err.message || "Failed to create store");
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleConfirmDeleteStore = async () => {
    if (!myStore) return;
    if (!confirmCheckbox) {
      alert("Please confirm the deletion acknowledgement checkbox.");
      return;
    }
    setIsDeletingStore(true);
    try {
      await deleteStore({
        storeId: myStore._id,
        ownerId: currentUser._id,
        reason: deleteReason,
        feedback: deleteFeedback.trim() || undefined,
      });
      setIsDeleteModalOpen(false);
      setDeleteSuccessNotice(
        `Storefront "${myStore.name}" and its listings were permanently removed. Your cancellation reason was securely saved in Cloud Firestore.`
      );
    } catch (err: any) {
      alert(err.message || "Failed to delete store front");
    } finally {
      setIsDeletingStore(false);
    }
  };

  // If user does NOT have a storefront yet
  if (!myStore) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto py-8">
        {deleteSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
            <span>{deleteSuccessNotice}</span>
            <button
              onClick={() => setDeleteSuccessNotice(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-[#0F142A] border border-purple-900/40 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#141A36] border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              Merchant Launchpad
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Open Your Shopza Store Front</h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
              Create a flexible storefront to sell all kinds of legal goods to buyers worldwide. Saved directly into Cloud Firestore.
            </p>
          </div>

          {createStoreError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-300 text-xs text-left">
              {createStoreError}
            </div>
          )}

          <form onSubmit={handleLaunchStore} className="space-y-4 text-left text-xs pt-2">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Store Front Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., Nexus Gear Studio"
                className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Store Bio & Description *</label>
              <textarea
                rows={3}
                required
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                placeholder="Tell customers what products you sell, your quality guarantee, and return promise..."
                className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Primary Product Category (Type any category) *
              </label>
              <input
                type="text"
                required
                value={storeCategory}
                onChange={(e) => setStoreCategory(e.target.value)}
                placeholder="e.g. Mechanical Keyboards, Organic Skincare, Artisan Ceramics..."
                className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_LEGAL_CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStoreCategory(cat)}
                    className="px-2 py-0.5 rounded-lg bg-[#141A36] text-[10px] text-purple-300 hover:text-white border border-purple-900/40"
                  >
                    + {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Logo: Upload from Device */}
            <div className="space-y-1.5 pt-1">
              <label className="text-slate-300 block font-semibold">Store Logo (Upload from your device or enter URL)</label>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/40 active:scale-95 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingStoreLogo ? "Uploading..." : "Upload Logo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogoFromDevice}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={storeLogoUrl}
                  onChange={(e) => setStoreLogoUrl(e.target.value)}
                  placeholder="Or paste https:// logo URL..."
                  className="flex-1 px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white text-xs"
                />
              </div>
              {storeLogoUrl && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/40 bg-[#12162a] mt-2">
                  <img src={storeLogoUrl} alt="Store Logo Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setStoreLogoUrl("")}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                    title="Remove logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Store Background / Banner: Upload from Device */}
            <div className="space-y-1.5 pt-1">
              <label className="text-slate-300 block font-semibold">Store Background Banner (Upload from your device or enter URL)</label>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/40 active:scale-95 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingStoreBanner ? "Uploading..." : "Upload Background"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBannerFromDevice}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={storeBannerUrl}
                  onChange={(e) => setStoreBannerUrl(e.target.value)}
                  placeholder="Or paste https:// banner URL..."
                  className="flex-1 px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white text-xs"
                />
              </div>
              {storeBannerUrl && (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-blue-500/40 bg-[#12162a] mt-2">
                  <img src={storeBannerUrl} alt="Store Background Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setStoreBannerUrl("")}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                    title="Remove background banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingStore}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isCreatingStore ? "Creating Store Front in Database..." : "Launch Store Front"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Storefront View
  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Seller Portal Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#140D33] via-[#0E1535] to-[#0A0D1D] border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={
              myStore.logoUrl ||
              "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120"
            }
            alt={myStore.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 bg-[#070914]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{myStore.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-950/70 text-emerald-300 border border-emerald-700/40">
                {myStore.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Managed by {currentUser.name} • store/{myStore.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenStore(myStore.slug)}
            className="px-3.5 py-2 bg-[#0F142A] border border-purple-900/40 text-purple-200 rounded-xl text-xs font-bold hover:bg-[#151C3B] flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>View Public Store</span>
          </button>
          <button
            onClick={() => onNavigate("seller_add_product")}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Product</span>
          </button>
          {/* Delete Storefront Button */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Permanently delete this storefront and account"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete Store Front</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Net Sales
          </span>
          <p className="text-2xl font-black text-[#00C2FF] mt-1">${totalGrossRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Stored in Firestore</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Listed Products
          </span>
          <p className="text-2xl font-black text-white mt-1">{myProducts.length}</p>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Legal & Compliant</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Store Followers
          </span>
          <p className="text-2xl font-black text-purple-300 mt-1">{followersList.length}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Accounts following you</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Customer Orders
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{myOrders.length}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Total orders placed</span>
        </div>
      </div>

      {/* Followers Section: "make the followers name be showing sere can see the acc that follow them" */}
      <div className="p-6 rounded-3xl bg-[#0F142A] border border-purple-900/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Accounts Following Your Store ({followersList.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live database records of buyers and users who follow {myStore.name}
            </p>
          </div>
        </div>

        {followersList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">No followers yet</p>
            <p className="text-[11px] max-w-sm mx-auto text-slate-500">
              When shoppers visit your store front and click "Follow Store", their account names will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {followersList.map(({ user, follow }) => (
              <div
                key={follow._id}
                className="p-3.5 rounded-2xl bg-[#070914] border border-purple-900/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-purple-800/40 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-purple-300 font-mono truncate">{user.email}</p>
                    <p className="text-[9px] text-slate-500">
                      Followed on {new Date(follow.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {onStartMessage && (
                  <button
                    onClick={() => onStartMessage(user._id, myStore._id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141A36] text-[10px] font-bold text-purple-300 hover:text-white border border-purple-800/40 flex-shrink-0 flex items-center gap-1"
                    title="Send direct message to follower"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Nav Suite */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => onNavigate("seller_products")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 hover:border-purple-500/50 text-left transition-all shadow-md group"
        >
          <Boxes className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Manage Products ({myProducts.length})</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Edit inventory, prices & listings</p>
        </button>

        <button
          onClick={() => onNavigate("seller_add_product")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 hover:border-purple-500/50 text-left transition-all shadow-md group"
        >
          <PlusCircle className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">List New Product</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Upload images & custom category</p>
        </button>

        <button
          onClick={() => onNavigate("seller_orders")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 hover:border-purple-500/50 text-left transition-all shadow-md group"
        >
          <Truck className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Orders ({myOrders.length})</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Track fulfillment & deliveries</p>
        </button>

        <button
          onClick={() => onNavigate("seller_store_customizer")}
          className="p-4 rounded-2xl bg-[#0F142A] border border-purple-900/30 hover:border-purple-500/50 text-left transition-all shadow-md group"
        >
          <Sliders className="w-5 h-5 text-[#00C2FF] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Store Settings</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Logo, banner & storefront deletion</p>
        </button>
      </div>

      {/* DELETE STOREFRONT MODAL WITH PROCESS & AUDIT REASON */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0D101D] rounded-3xl border border-rose-500/40 p-6 sm:p-7 shadow-2xl text-slate-100 text-xs space-y-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192E]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Delete Store Front</h3>
                <p className="text-[11px] text-slate-400">
                  Offboarding process for "{myStore.name}"
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-rose-300 leading-relaxed text-[11px]">
              ⚠️ <strong>Warning:</strong> Deleting your storefront will permanently delete your store, unlist all your products ({myProducts.length} items), and remove your storefront from search. Everything will be recorded in the database.
            </div>

            <div className="space-y-3">
              <label className="block font-bold text-white">
                Why do you want to delete this account / storefront? *
              </label>
              {[
                "Closing my business",
                "Switching to another eCommerce platform",
                "Not getting enough sales",
                "Platform fee or commission concerns",
                "Temporary break / hiatus",
                "Personal reasons",
                "Other feedback",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#070914] border border-purple-900/30 hover:border-purple-500/40 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason}
                    checked={deleteReason === reason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="accent-rose-500"
                  />
                  <span className="text-slate-200">{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block font-bold text-white mb-1">
                Additional Comments & Reason Details (Stored in database)
              </label>
              <textarea
                rows={2}
                value={deleteFeedback}
                onChange={(e) => setDeleteFeedback(e.target.value)}
                placeholder="Tell us what could have been better or your primary motivation..."
                className="w-full px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-0.5 accent-rose-500"
              />
              <span className="text-[11px] text-slate-300">
                I understand this action is irreversible. My storefront and products will be permanently wiped from Cloud Firestore, and my exit reason will be recorded in the database.
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-purple-900/30">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
              >
                Keep Store
              </button>
              <button
                type="button"
                disabled={!confirmCheckbox || isDeletingStore}
                onClick={handleConfirmDeleteStore}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-lg shadow-rose-950/60"
              >
                {isDeletingStore ? "Deleting Store Front..." : "Confirm & Delete Storefront"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 34. Store Product Inventory Manager (Page 34)
export const SellerProductsPage: React.FC<SellerSuiteProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { currentUser } = useAuth();
  const { listProducts, deleteProduct, getStoreByOwner } = useFirebase();

  const store = currentUser ? getStoreByOwner(currentUser._id) : null;
  const products = currentUser ? listProducts({ sellerId: currentUser._id }) : [];

  const handleDelete = async (prodId: string, title: string) => {
    if (!currentUser) return;
    if (!confirm(`Are you sure you want to permanently delete "${title}" from the database?`)) {
      return;
    }
    try {
      await deleteProduct({ productId: prodId, sellerId: currentUser._id });
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            <span>Store Product Inventory Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time stock level synchronization, price modifications, and catalog management
          </p>
        </div>

        <button
          onClick={() => onNavigate("seller_add_product")}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40 flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0F142A] border border-purple-900/30 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Products Listed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You haven't listed any items in your store front. Upload photos directly from your device and list legal products now!
          </p>
          <button
            onClick={() => onNavigate("seller_add_product")}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40"
          >
            Create First Product Listing
          </button>
        </div>
      ) : (
        <div className="bg-[#0F142A] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070914] text-slate-400 uppercase text-[10px] tracking-wider border-b border-purple-900/30">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Inventory</th>
                  <th className="py-3 px-3">Likes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-slate-200">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#141A36] transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover bg-[#070914] border border-purple-900/40 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-[200px]">{p.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-purple-300 font-semibold">{p.category}</td>
                    <td className="py-3 px-3 font-bold text-white">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#141A36] text-purple-200 font-mono font-bold">
                        {p.inventory} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-bold">
                      ♥ {p.likesCount || 0}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A2244]"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.title)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 rounded-lg hover:bg-rose-950/40"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// 35. Publish New Product Listing (Page 35)
export const SellerAddProductPage: React.FC<SellerSuiteProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { getStoreByOwner, createProduct } = useFirebase();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("15");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const store = currentUser ? getStoreByOwner(currentUser._id) : null;

  // Real-time automatic legal compliance check:
  // "remember we are selling all legal kind of things if it is not legal the app should automatically detect it, so user can just type the category of the product"
  const legalityCheck = checkProductLegality({
    title,
    description,
    category,
  });

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorNotice(null);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.82);
        newImages.push(compressedDataUrl);
      }
      setImages((prev) => [...prev, ...newImages]);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to process image from device");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!store) {
      alert("Please open a store front before publishing products.");
      onNavigate("seller_dashboard");
      return;
    }

    // Safety guard
    if (!legalityCheck.isLegal) {
      alert(`Cannot publish: Prohibited item detected (${legalityCheck.category}). Only legal goods are allowed on Shopza.`);
      return;
    }

    const priceNum = parseFloat(price);
    const invNum = parseInt(inventory, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorNotice("Price must be a valid number greater than 0");
      return;
    }
    if (isNaN(invNum) || invNum < 0) {
      setErrorNotice("Inventory must be 0 or more");
      return;
    }

    const finalImages = images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"];

    setIsSubmitting(true);
    setErrorNotice(null);
    try {
      const prod = await createProduct({
        sellerId: currentUser._id,
        storeId: store._id,
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim() || "General Goods",
        images: finalImages,
        inventory: invNum,
        status: "published",
      });
      setCreatedProduct(prod);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to publish product to Firestore database");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to List Products</h2>
        <button
          onClick={() => onNavigate("seller_dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Go to Seller Dashboard
        </button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Open Store Front First</h2>
        <p className="text-xs text-slate-400">
          You need an active store front before listing items. Setting up a store takes 10 seconds!
        </p>
        <button
          onClick={() => onNavigate("seller_dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Create Your Store Front
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-purple-400" />
          <span>Publish New Product Listing</span>
        </h1>
        <p className="text-xs text-slate-400">
          Upload photos from your devices, type any category, and list legal products on {store.name}
        </p>
      </div>

      {createdProduct ? (
        <div className="p-8 rounded-3xl bg-[#0F142A] border border-emerald-500/40 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-white">Product Successfully Listed in Database!</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            "{createdProduct.title}" is now permanently recorded in Cloud Firestore and visible to all shoppers on Explore, Categories, and your Store Front.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCreatedProduct(null);
                setTitle("");
                setDescription("");
                setPrice("");
                setImages([]);
              }}
              className="px-5 py-2.5 bg-[#141A36] border border-purple-800/40 text-white rounded-xl text-xs font-bold hover:bg-[#1A2244]"
            >
              List Another Product
            </button>
            <button
              onClick={() => onNavigate("seller_products")}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40"
            >
              View in Inventory
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-[#0F142A] border border-purple-900/30 space-y-4 text-xs shadow-2xl text-slate-200"
        >
          {errorNotice && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-300">
              {errorNotice}
            </div>
          )}

          {/* Automatic Legality Detection Banner */}
          {!legalityCheck.isLegal ? (
            <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-600 text-rose-200 flex items-start gap-3 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm text-white">
                  Prohibited Item Detected: {legalityCheck.category}
                </span>
                <p className="text-[11px] leading-relaxed text-rose-200">
                  {legalityCheck.reason}
                </p>
                <p className="text-[10px] font-semibold text-rose-300">
                  Shopza strictly enforces legal commerce. This listing cannot be published.
                </p>
              </div>
            </div>
          ) : (
            title.trim() && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] font-semibold">
                  Policy Compliant — Legal product verified for marketplace listing
                </span>
              </div>
            )
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wireless Noise-Cancelling Headphones"
              className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Product Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe specifications, build quality, included accessories, and condition..."
              className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Flexible Category: "user can just type the category of the product" */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">
                Product Category (Type any custom category) *
              </label>
              <span className="text-[10px] text-purple-300">Open & Flexible</span>
            </div>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Type any category, e.g., Handmade Jewelry, Mechanical Keyboards, Winter Boots..."
              className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_LEGAL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    category === cat
                      ? "bg-purple-600 text-white border border-purple-400"
                      : "bg-[#141A36] text-slate-300 hover:text-white border border-purple-900/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Retail Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.99"
                className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Units in Stock *</label>
              <input
                type="number"
                required
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Product Image Upload: "put a button that you can use to upload product image from your devices" */}
          <div className="space-y-2 pt-2 border-t border-purple-900/30">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Product Images</label>
              <span className="text-[10px] text-slate-400">
                {images.length} image{images.length === 1 ? "" : "s"} attached
              </span>
            </div>

            {/* Device Upload Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleDeviceFileUpload}
                className="hidden"
                id="device-photo-upload"
              />
              <label
                htmlFor="device-photo-upload"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-900/30 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Processing Image..." : "Upload from Device"}</span>
              </label>

              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="flex-1 px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 rounded-xl bg-[#141A36] text-purple-200 border border-purple-900/40 hover:bg-[#1A2244] font-semibold"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Uploaded images previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-purple-900/40 bg-[#070914] group"
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-600 text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !legalityCheck.isLegal}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isSubmitting
              ? "Saving Product to Cloud Firestore..."
              : !legalityCheck.isLegal
              ? "Cannot Publish Prohibited Product"
              : "Publish Product to Marketplace"}
          </button>
        </form>
      )}
    </div>
  );
};

// 36. Storefront Branding Customizer (Page 36)
export const SellerStoreCustomizerPage: React.FC<SellerSuiteProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { getStoreByOwner, updateStore, deleteStore } = useFirebase();

  const store = currentUser ? getStoreByOwner(currentUser._id) : null;

  const [name, setName] = useState(store?.name || "");
  const [description, setDescription] = useState(store?.description || "");
  const [categories, setCategories] = useState(store?.categories?.join(", ") || "Electronics");
  const [logoUrl, setLogoUrl] = useState(store?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(store?.bannerUrl || "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [status, setStatus] = useState<"open" | "closed">(store?.status === "closed" ? "closed" : "open");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCustomizerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const compressed = await compressImageFile(files[0], 600, 600, 0.85);
      setLogoUrl(compressed);
    } catch (err: any) {
      alert("Failed to process logo image from device");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCustomizerBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingBanner(true);
    try {
      const compressed = await compressImageFile(files[0], 1400, 600, 0.82);
      setBannerUrl(compressed);
    } catch (err: any) {
      alert("Failed to process background image from device");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Deletion modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("Closing my business");
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentUser || !store) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Store Front Found</h2>
        <button
          onClick={() => onNavigate("seller_dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Open a Store Front
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStore({
        storeId: store._id,
        ownerId: currentUser._id,
        name: name.trim(),
        description: description.trim(),
        categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
        logoUrl: logoUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        status,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to update store");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmCheck) return;
    setIsDeleting(true);
    try {
      await deleteStore({
        storeId: store._id,
        ownerId: currentUser._id,
        reason: deleteReason,
        feedback: deleteFeedback.trim() || undefined,
      });
      setIsDeleteOpen(false);
      onNavigate("seller_dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to delete store front");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-400" />
            <span>Storefront Settings & Customizer</span>
          </h1>
          <p className="text-xs text-slate-400">
            Personalize branding, configure categories, or permanently delete this storefront
          </p>
        </div>

        <button
          onClick={() => setIsDeleteOpen(true)}
          className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Store Front</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#0F142A] border border-purple-900/30 space-y-4 text-xs shadow-2xl">
        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Store Brand Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Store Bio & Description</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Categories (Comma separated)</label>
          <input
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-1.5 pt-1">
          <label className="text-slate-300 block font-semibold">Store Logo (Upload from your device or enter URL)</label>
          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/40 active:scale-95 flex-shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomizerLogoUpload}
                className="hidden"
              />
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Or paste https:// logo URL..."
              className="flex-1 px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white text-xs"
            />
          </div>
          {logoUrl && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/40 bg-[#12162a] mt-2">
              <img src={logoUrl} alt="Store Logo Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                title="Remove logo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Banner Upload */}
        <div className="space-y-1.5 pt-1">
          <label className="text-slate-300 block font-semibold">Store Background Banner (Upload from your device or enter URL)</label>
          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/40 active:scale-95 flex-shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingBanner ? "Uploading..." : "Upload Background"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomizerBannerUpload}
                className="hidden"
              />
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="Or paste https:// banner URL..."
              className="flex-1 px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white text-xs"
            />
          </div>
          {bannerUrl && (
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-blue-500/40 bg-[#12162a] mt-2">
              <img src={bannerUrl} alt="Store Background Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setBannerUrl("")}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                title="Remove background banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Store Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
          >
            <option value="open">Open (Accepting customer orders)</option>
            <option value="closed">Closed / Vacation (Catalog visible, orders paused)</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-md shadow-purple-900/40 disabled:opacity-50"
          >
            {isSaving ? "Saving to Database..." : saved ? "Changes Saved!" : "Save Store Customizations"}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0D101D] rounded-3xl border border-rose-500/40 p-6 sm:p-7 shadow-2xl text-slate-100 text-xs space-y-4">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192E]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Delete Store Front</h3>
                <p className="text-[11px] text-slate-400">Delete "{store.name}"</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-white">Why are you deleting this storefront? *</label>
              {[
                "Closing my business",
                "Switching to another eCommerce platform",
                "Not getting enough sales",
                "Platform fee or commission concerns",
                "Personal reasons",
                "Other feedback",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#070914] border border-purple-900/30 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="modalDeleteReason"
                    value={reason}
                    checked={deleteReason === reason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block font-bold text-white mb-1">Feedback (Saved to database)</label>
              <textarea
                rows={2}
                value={deleteFeedback}
                onChange={(e) => setDeleteFeedback(e.target.value)}
                placeholder="Help us understand your reason for leaving..."
                className="w-full px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmCheck}
                onChange={(e) => setConfirmCheck(e.target.checked)}
                className="mt-0.5 accent-rose-500"
              />
              <span className="text-[11px] text-slate-300">
                I understand this will permanently delete my storefront and all its products from Cloud Firestore.
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmCheck || isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-40"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 37. Order Fulfillment & Shipping (Page 37)
export const SellerOrdersPage: React.FC<SellerSuiteProps> = () => {
  const { currentUser } = useAuth();
  const { listSellerOrders, updateOrderStatus } = useFirebase();

  const orders = currentUser ? listSellerOrders(currentUser._id) : [];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-purple-400" />
          <span>Order Fulfillment & Shipping</span>
        </h1>
        <p className="text-xs text-slate-400">Attach tracking numbers, print packing slips, and confirm fulfillment</p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0F142A] border border-purple-900/30 text-center text-slate-400 text-xs">
            No incoming customer orders yet. When customers purchase from your store, orders appear here in real-time.
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o._id}
              className="p-5 rounded-2xl bg-[#0F142A] border border-purple-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-white text-sm">Order #{o.orderNumber}</span>
                <p className="text-slate-400 mt-0.5">
                  {(o.items || []).length} items • ${o.total.toFixed(2)} • Buyer: {o.buyerName}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  {o.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Packing slip printed for Order #${o.orderNumber}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#141A36] text-purple-200 border border-purple-900/40 font-bold"
                >
                  Print Slip
                </button>
                <button
                  onClick={async () => {
                    const track = prompt("Enter tracking number:", o.trackingNumber || "");
                    if (track && currentUser) {
                      await updateOrderStatus({
                        orderId: o._id,
                        sellerId: currentUser._id,
                        status: "shipped",
                        trackingNumber: track,
                      });
                      alert("Order marked shipped with tracking number!");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold"
                >
                  Mark Shipped
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
  const { currentUser } = useAuth();
  const { listSellerOrders } = useFirebase();

  const orders = currentUser ? listSellerOrders(currentUser._id) : [];
  const grossSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const platformFees = orders.reduce((sum, o) => sum + o.platformCommission, 0);
  const netPayout = grossSales - platformFees;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <span>Sales Analytics & Revenue Breakdown</span>
        </h1>
        <p className="text-xs text-slate-400">Real-time revenue by orders, verified marketplace commissions, and net earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Merchandise Volume</span>
          <p className="text-2xl font-black text-white mt-1">${grossSales.toFixed(2)}</p>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> From {orders.length} orders
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Fee (5%)</span>
          <p className="text-2xl font-black text-slate-300 mt-1">${platformFees.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Transparent marketplace rate</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Net Merchant Payout</span>
          <p className="text-2xl font-black text-[#00C2FF] mt-1">${netPayout.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-400 mt-1 block">Stored in Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};

// 39. Customer Inquiries & Chat Desk (Page 39)
export const SellerMessagesPage: React.FC<SellerSuiteProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span>Customer Inquiries & Chat Desk</span>
          </h1>
          <p className="text-xs text-slate-400">Direct real-time buyer chats and product inquiries</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-purple-900/30 text-center space-y-3">
        <MessageSquare className="w-10 h-10 text-purple-400 mx-auto" />
        <h3 className="text-base font-bold text-white">In-App Chat Messaging</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Buyers can contact you directly from any product detail page or storefront card. You can reply instantly in real time.
        </p>
        <button
          onClick={() => onNavigate("messages")}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Open Chat Inbox
        </button>
      </div>
    </div>
  );
};

// 40. Seller Earnings & Payouts (Page 40)
export const SellerPayoutsPage: React.FC<SellerSuiteProps> = () => {
  const { currentUser } = useAuth();
  const { listSellerOrders, listSellerPayoutRequests, requestSellerPayout } = useFirebase();

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const orders = currentUser ? listSellerOrders(currentUser._id) : [];
  const payouts = currentUser ? listSellerPayoutRequests(currentUser._id) : [];

  // Metrics from real orders
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "successful");
  const grossSales = paidOrders.reduce((acc, curr) => acc + curr.subtotal, 0);
  const commission = paidOrders.reduce((acc, curr) => acc + (curr.platformCommission || 0), 0);
  const netEarnings = Math.max(0, grossSales - commission);

  const totalPaidOrPending = payouts
    .filter((p) => p.status === "pending" || p.status === "approved" || p.status === "processed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = Math.max(0, Math.round((netEarnings - totalPaidOrPending) * 100) / 100);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage("");
    setSuccessMessage("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid payout amount greater than $0");
      return;
    }

    if (numAmount > availableBalance && availableBalance > 0) {
      setErrorMessage(`Requested amount ($${numAmount.toFixed(2)}) exceeds available balance ($${availableBalance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestSellerPayout({
        sellerId: currentUser._id,
        amount: numAmount,
        bankName,
        accountNumber,
        accountName,
        notes: notes.trim() || undefined,
      });

      setSuccessMessage(`Payout request for $${numAmount.toFixed(2)} submitted successfully to your ${bankName} account!`);
      setAmount("");
      setNotes("");
      setIsRequestOpen(false);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit payout request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#00C2FF]" />
            <span>Seller Earnings & Payouts</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time verified Paystack revenue, commission breakdown, and direct bank payouts
          </p>
        </div>

        <button
          onClick={() => {
            setAmount(availableBalance.toFixed(2));
            setIsRequestOpen(true);
          }}
          disabled={availableBalance <= 0}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Bank Payout</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Available For Payout
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${availableBalance.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ready for bank transfer</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Gross Sales (Paystack)
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ${grossSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">From {paidOrders.length} verified orders</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Platform Commission
          </span>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            ${commission.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">5% marketplace platform fee</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F142A] border border-purple-900/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Withdrawn
          </span>
          <div className="text-2xl font-black text-purple-400 font-mono">
            ${totalPaidOrPending.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{payouts.length} payout requests</span>
        </div>
      </div>

      {/* Paystack Direct Gateway Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Direct Paystack Verified Payments</div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Customer payments are processed directly via Paystack's PCI-DSS Level 1 certified gateway.
            All escrow holding mechanisms have been retired in favor of fast, transparent payouts straight to your verified bank account.
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="p-6 rounded-3xl bg-[#0F142A] border border-purple-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Payout History</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{payouts.length} total</span>
        </div>

        {payouts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No payout requests recorded yet. Once your orders are paid, you can request bank payouts anytime.
          </div>
        ) : (
          <div className="divide-y divide-purple-900/30">
            {payouts.map((p) => {
              const statusColors = {
                pending: "bg-amber-950/60 text-amber-300 border-amber-800/40",
                approved: "bg-blue-950/60 text-blue-300 border-blue-800/40",
                processed: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
                rejected: "bg-rose-950/60 text-rose-300 border-rose-800/40",
              };
              return (
                <div key={p._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{p.bankName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        (••• {p.accountNumber.slice(-4)})
                      </span>
                      <span className="text-slate-300 font-normal">| {p.accountName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Requested: {new Date(p.createdAt).toLocaleDateString()}
                      {p.paystackReference && (
                        <span className="ml-2 font-mono text-purple-300">Ref: {p.paystackReference}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-sm">${p.amount.toFixed(2)}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        statusColors[p.status] || statusColors.pending
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0D101D] rounded-3xl border border-purple-500/40 p-6 shadow-2xl text-slate-100 text-xs space-y-4">
            <button
              onClick={() => setIsRequestOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192E]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-800/50 flex items-center justify-center text-purple-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Request Bank Payout</h3>
                <p className="text-[11px] text-slate-400">
                  Available: <span className="text-emerald-400 font-bold">${availableBalance.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Payout Amount ($) *</label>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toFixed(2))}
                    className="text-[10px] font-bold text-purple-400 hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableBalance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-[#070914] border border-purple-900/40 rounded-xl text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Access Bank, GTBank, Chase, Wells Fargo"
                  className="w-full px-3.5 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="10-digit account number"
                  className="w-full px-3.5 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name as registered with your bank"
                  className="w-full px-3.5 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Transfer Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Weekly settlement"
                  className="w-full px-3.5 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold disabled:opacity-40 shadow-lg shadow-emerald-900/40"
                >
                  {isSubmitting ? "Submitting..." : "Submit Payout Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 41. Store Discount & Coupon Manager (Page 41)
export const SellerDiscountsPage: React.FC<SellerSuiteProps> = () => {
  const [created, setCreated] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [percent, setPercent] = useState("15");

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-purple-900/30 pb-4">
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
        className="p-6 rounded-3xl bg-[#0F142A] border border-purple-900/30 space-y-4 text-xs"
      >
        <div>
          <label className="text-slate-300 block mb-1 font-semibold">Promotion Code</label>
          <input
            type="text"
            required
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g., SUMMER20"
            className="w-full px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white font-mono uppercase"
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
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder="20"
              className="w-full px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Minimum Cart Size ($)</label>
            <input
              type="number"
              placeholder="50.00"
              className="w-full px-3 py-2 bg-[#070914] border border-purple-900/40 rounded-xl text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-md shadow-purple-900/40"
        >
          {created ? `Promotion Code "${promoCode.toUpperCase()}" Activated!` : "Launch Store Promotion"}
        </button>
      </form>
    </div>
  );
};
