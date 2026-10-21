import React, { useState } from "react";
import {
  Store as StoreIcon,
  Package,
  Plus,
  ShoppingBag,
  DollarSign,
  Users,
  Settings,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  TrendingUp,
  Upload,
  ShieldCheck,
  ShieldAlert,
  X,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";
import { Product, Order, OrderStatus } from "../../types";
import { checkProductLegality, POPULAR_LEGAL_CATEGORIES } from "../../utils/legalCompliance";
import { compressImageFile } from "../../utils/imageUpload";

export const SellerDashboard: React.FC<{
  onSelectProduct: (p: Product) => void;
  onViewPublicStore: (slug: string) => void;
}> = ({ onSelectProduct, onViewPublicStore }) => {
  const { currentUser } = useAuth();
  const {
    getStoreByOwner,
    createStore,
    updateStore,
    deleteStore,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    listSellerOrders,
    updateOrderStatus,
    getStoreFollowers,
    db,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "followers" | "settings">("overview");

  // Create store form state
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategories, setStoreCategories] = useState<string[]>(["Electronics"]);
  const [storeCustomCategory, setStoreCustomCategory] = useState("Electronics");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [isUploadingStoreLogo, setIsUploadingStoreLogo] = useState(false);
  const [isUploadingStoreBanner, setIsUploadingStoreBanner] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Electronics");
  const [prodInventory, setProdInventory] = useState("10");
  const [prodImage, setProdImage] = useState("");
  const [isUploadingDeviceImage, setIsUploadingDeviceImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Store Front deletion state
  const [isDeleteStoreModalOpen, setIsDeleteStoreModalOpen] = useState(false);
  const [storeDeleteReason, setStoreDeleteReason] = useState("Closing my business");
  const [storeDeleteFeedback, setStoreDeleteFeedback] = useState("");
  const [storeDeleteConfirmed, setStoreDeleteConfirmed] = useState(false);
  const [isDeletingStoreFront, setIsDeletingStoreFront] = useState(false);

  // Order status update tracking
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>("processing");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <StoreIcon className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#1E3A8A]">Please Sign In</h3>
        <p className="text-xs text-[#64748B] mt-1">
          Sign in to your seller account to manage your store, inventory, and sales.
        </p>
      </div>
    );
  }

  const store = getStoreByOwner(currentUser._id);
  const products = listProducts({ sellerId: currentUser._id });
  const orders = listSellerOrders(currentUser._id);

  // Genuine statistics calculated strictly from actual records
  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal - o.platformCommission), 0);
  const followers = store ? getStoreFollowers(store._id) : [];
  const storeFollowers = store ? Math.max(store.followersCount || 0, followers.length) : 0;

  const handleStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingStoreLogo(true);
    setStoreError(null);
    try {
      const compressed = await compressImageFile(files[0], 600, 600, 0.85);
      setStoreLogo(compressed);
    } catch (err: any) {
      setStoreError(err.message || "Failed to process logo image from device");
    } finally {
      setIsUploadingStoreLogo(false);
    }
  };

  const handleStoreBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingStoreBanner(true);
    setStoreError(null);
    try {
      const compressed = await compressImageFile(files[0], 1400, 600, 0.82);
      setStoreBanner(compressed);
    } catch (err: any) {
      setStoreError(err.message || "Failed to process background image from device");
    } finally {
      setIsUploadingStoreBanner(false);
    }
  };

  const handleOpenStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreError(null);
    setIsCreatingStore(true);

    try {
      if (!storeName.trim() || !storeDesc.trim()) {
        throw new Error("Store name and description are required");
      }
      await createStore({
        ownerId: currentUser._id,
        name: storeName.trim(),
        description: storeDesc.trim(),
        categories: [storeCustomCategory.trim() || "General Goods"],
        logoUrl: storeLogo.trim() || undefined,
        bannerUrl: storeBanner.trim() || undefined,
      });
    } catch (err: any) {
      setStoreError(err.message || "Failed to create store");
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleOpenProductModal = (product?: Product) => {
    setProductError(null);
    if (product) {
      setEditingProduct(product);
      setProdTitle(product.title);
      setProdDesc(product.description);
      setProdPrice(product.price.toString());
      setProdCategory(product.category);
      setProdInventory(product.inventory.toString());
      setProdImage(product.images[0] || "");
    } else {
      setEditingProduct(null);
      setProdTitle("");
      setProdDesc("");
      setProdPrice("");
      setProdCategory("Electronics");
      setProdInventory("10");
      setProdImage("");
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setProductError(null);
    setIsSavingProduct(true);

    try {
      const priceNum = parseFloat(prodPrice);
      const invNum = parseInt(prodInventory, 10);

      if (isNaN(priceNum) || priceNum <= 0) throw new Error("Price must be a positive number");
      if (isNaN(invNum) || invNum < 0) throw new Error("Inventory must be 0 or more");
      if (!prodTitle.trim()) throw new Error("Product title is required");

      const legality = checkProductLegality({
        title: prodTitle,
        description: prodDesc,
        category: prodCategory,
      });
      if (!legality.isLegal) {
        throw new Error(`Cannot save: Prohibited item detected (${legality.category}). Only legal products are allowed on Shopza.`);
      }

      const images = prodImage.trim()
        ? [prodImage.trim()]
        : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"];

      if (editingProduct) {
        await updateProduct({
          productId: editingProduct._id,
          sellerId: currentUser._id,
          title: prodTitle.trim(),
          description: prodDesc.trim(),
          price: priceNum,
          category: prodCategory,
          inventory: invNum,
          images,
        });
      } else {
        await createProduct({
          sellerId: currentUser._id,
          storeId: store._id,
          title: prodTitle.trim(),
          description: prodDesc.trim(),
          price: priceNum,
          category: prodCategory,
          inventory: invNum,
          images,
        });
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      setProductError(err.message || "Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingDeviceImage(true);
    setProductError(null);
    try {
      const compressed = await compressImageFile(files[0], 1200, 1200, 0.82);
      setProdImage(compressed);
    } catch (err: any) {
      setProductError(err.message || "Failed to process image from device");
    } finally {
      setIsUploadingDeviceImage(false);
    }
  };

  const handleConfirmDeleteStoreFront = async () => {
    if (!store) return;
    if (!storeDeleteConfirmed) {
      alert("Please acknowledge the confirmation checkbox.");
      return;
    }
    setIsDeletingStoreFront(true);
    try {
      await deleteStore({
        storeId: store._id,
        ownerId: currentUser._id,
        reason: storeDeleteReason,
        feedback: storeDeleteFeedback.trim() || undefined,
      });
      setIsDeleteStoreModalOpen(false);
      alert(`Store front "${store.name}" was permanently deleted and your cancellation reason was recorded in the database.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete store front");
    } finally {
      setIsDeletingStoreFront(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await deleteProduct({ productId: prodId, sellerId: currentUser._id });
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingOrder(true);
    try {
      await updateOrderStatus({
        orderId: selectedOrder._id,
        sellerId: currentUser._id,
        status: newOrderStatus,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      setSelectedOrder(null);
      setTrackingNumber("");
    } catch (err: any) {
      alert(err.message || "Could not update status");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // If no store exists yet, show onboarding with dark black background and purple-blue gradient
  if (!store) {
    return (
      <div className="bg-[#07080e] min-h-[calc(100vh-140px)] py-12 px-4 animate-fadeIn text-slate-100 font-['Plus_Jakarta_Sans']">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0d101d] rounded-3xl border border-purple-900/30 p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#14182e] border border-purple-900/40 flex items-center justify-center text-purple-400 mx-auto mb-4">
              <StoreIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Open Your Shopza Store</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Start selling to buyers globally. Set up your store name, branding, and product categories to get started.
            </p>

            {storeError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{storeError}</span>
              </div>
            )}

            <form onSubmit={handleOpenStore} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Urban Gear Official"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Store Bio & Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  placeholder="Describe your brand, specialty, and shipping promise..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Product Category (Type any category) *
                </label>
                <input
                  type="text"
                  required
                  value={storeCustomCategory}
                  onChange={(e) => setStoreCustomCategory(e.target.value)}
                  placeholder="e.g. Mechanical Keyboards, Organic Skincare, Artisan Ceramics..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_LEGAL_CATEGORIES.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setStoreCustomCategory(cat)}
                      className="px-2 py-0.5 rounded-lg bg-[#1a1f38] text-[10px] text-purple-300 hover:text-white border border-purple-900/30"
                    >
                      + {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Logo: Upload from Device */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Store Logo (Upload from your device or enter URL)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/40 active:scale-95 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingStoreLogo ? "Uploading..." : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    placeholder="Or paste https:// logo URL..."
                    className="flex-1 px-3 py-2 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>
                {storeLogo && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/40 bg-[#080a12] mt-2">
                    <img src={storeLogo} alt="Store Logo Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setStoreLogo("")}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Store Background / Banner Image: Upload from Device */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Store Background Banner (Upload from your device or enter URL)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/40 active:scale-95 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingStoreBanner ? "Uploading..." : "Upload Background"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreBannerUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    value={storeBanner}
                    onChange={(e) => setStoreBanner(e.target.value)}
                    placeholder="Or paste https:// background image URL..."
                    className="flex-1 px-3 py-2 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>
                {storeBanner && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-blue-500/40 bg-[#080a12] mt-2">
                    <img src={storeBanner} alt="Store Background Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setStoreBanner("")}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                      title="Remove background image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreatingStore}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {isCreatingStore ? "Launching Store..." : "Launch My Store"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#07080e] min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 text-slate-100 font-['Plus_Jakarta_Sans']">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Seller Header Card */}
        <div className="bg-[#0d101d] rounded-3xl border border-purple-900/30 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={store.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120"}
              alt={store.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-800/40 shadow-md bg-[#12162a]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{store.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    store.status === "open"
                      ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                      : "bg-[#14182e] text-slate-300 border border-purple-900/40"
                  }`}
                >
                  {store.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-400">
                  Seller Dashboard • Managed by {currentUser.name} ({currentUser.email})
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    currentUser.emailVerified
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
                      : "bg-amber-950/60 text-amber-300 border-amber-800/40"
                  }`}
                >
                  {currentUser.emailVerified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onViewPublicStore(store.slug)}
              className="flex-1 md:flex-initial px-4 py-2 text-xs font-bold text-purple-300 hover:text-white hover:bg-[#15192e] border border-purple-900/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>View Public Store</span>
            </button>

            <button
              onClick={() => handleOpenProductModal()}
              className="flex-1 md:flex-initial px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl shadow-md shadow-purple-900/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => setIsDeleteStoreModalOpen(true)}
              className="px-3 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              title="Delete this store front and account"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Store</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-purple-900/30 pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
            { id: "products", label: `Products (${products.length})`, icon: Package },
            { id: "orders", label: `Incoming Orders (${orders.length})`, icon: ShoppingBag },
            { id: "followers", label: `Followers (${followers.length})`, icon: Users },
            { id: "settings", label: "Store Settings", icon: Settings },
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

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Net Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Calculated from verified orders</p>
              </div>

              <div className="p-5 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white">{orders.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Total customer orders</p>
              </div>

              <div className="p-5 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Followers</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white">{storeFollowers}</p>
                <p className="text-[11px] text-slate-500 mt-1">Active account followers</p>
              </div>

              <div className="p-5 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Products</span>
                  <Package className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white">{products.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">In store catalog</p>
              </div>
            </div>

            {/* Quick Actions / Recent activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-3">Recent Incoming Orders</h4>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    No orders placed yet. When buyers purchase your items, they appear here in real-time.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => (
                      <div
                        key={o._id}
                        className="p-3 bg-[#0a0c16] border border-purple-900/30 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">#{o.orderNumber}</p>
                          <p className="text-slate-400">{o.buyerName} • ${o.total.toFixed(2)}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#14182e] text-purple-300 uppercase border border-purple-900/40">
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#0d101d] rounded-2xl border border-purple-900/30 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-3">Catalog Highlights</h4>
                {products.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-500 italic mb-3">
                      No products listed yet. Click below to add your first item!
                    </p>
                    <button
                      onClick={() => handleOpenProductModal()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40"
                    >
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 3).map((p) => (
                      <div
                        key={p._id}
                        className="p-2.5 bg-[#0a0c16] border border-purple-900/30 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-8 h-8 rounded-lg object-cover bg-[#090b14]"
                          />
                          <div>
                            <p className="font-bold text-white truncate max-w-[150px]">{p.title}</p>
                            <p className="text-slate-400">${p.price.toFixed(2)} • {p.inventory} in stock</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="p-1.5 hover:bg-[#15192e] rounded-lg text-purple-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Manage Products ({products.length})
              </h3>
              <button
                onClick={() => handleOpenProductModal()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-[#0d101d] rounded-2xl border border-purple-900/30 p-8">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No products published yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Add products to your store with images, prices, and inventory to start selling.
                </p>
                <button
                  onClick={() => handleOpenProductModal()}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40"
                >
                  Publish Your First Product
                </button>
              </div>
            ) : (
              <div className="bg-[#0d101d] rounded-2xl border border-purple-900/30 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a0c16] text-slate-400 font-bold uppercase tracking-wider border-b border-purple-900/30">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Inventory</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/30">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-[#12162a]">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover bg-[#090b14] border border-purple-900/40"
                            />
                            <div>
                              <p className="font-bold text-white">{p.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                            </div>
                          </td>
                          <td className="p-4 text-purple-300 font-medium">{p.category}</td>
                          <td className="p-4 font-bold text-white">${p.price.toFixed(2)}</td>
                          <td className="p-4">
                            <span
                              className={`font-semibold ${
                                p.inventory === 0
                                  ? "text-rose-400"
                                  : p.inventory < 5
                                  ? "text-amber-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {p.inventory} units
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === "published"
                                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                                  : "bg-[#14182e] text-slate-400"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 hover:bg-[#15192e] rounded-lg text-purple-400 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-1.5 hover:bg-rose-950/50 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Fulfill Orders ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#0d101d] rounded-2xl border border-purple-900/30 p-8">
                <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No incoming customer orders</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Orders placed by buyers will show here with recipient address, items, and status updater.
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
                            #{o.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase bg-[#14182e] text-purple-300 border border-purple-900/40">
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Placed on {new Date(o.createdAt).toLocaleDateString()} by {o.buyerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-white">
                          ${o.total.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-emerald-400 font-semibold">Paid by Buyer</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-8 h-8 rounded-lg object-cover bg-[#090b14]"
                            />
                            <span className="font-semibold text-slate-200">
                              {item.quantity}x {item.productTitle}
                            </span>
                          </div>
                          <span className="font-bold text-purple-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping address & actions */}
                    <div className="pt-3 border-t border-purple-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-400">
                        <span className="font-bold text-slate-200">Deliver to: </span>
                        {o.shippingAddress.fullName}, {o.shippingAddress.address},{" "}
                        {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zipCode}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setNewOrderStatus(o.status);
                          setTrackingNumber(o.trackingNumber || "");
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/40"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FOLLOWERS */}
        {activeTab === "followers" && (
          <div className="bg-[#0d101d] rounded-2xl border border-purple-900/30 p-6 shadow-xl space-y-4">
            <div className="border-b border-purple-900/30 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Store Followers ({followers.length})</span>
                </h3>
                <p className="text-xs text-slate-400">Live accounts and shoppers following {store.name}</p>
              </div>
            </div>

            {followers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No followers yet</p>
                <p className="text-[11px] text-slate-500">
                  When shoppers visit your store front and follow you, their names and profiles appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {followers.map(({ user, follow }) => (
                  <div
                    key={follow._id}
                    className="p-3.5 rounded-2xl bg-[#12162a] border border-purple-900/40 flex items-center justify-between gap-3 text-xs"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STORE SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-[#0d101d] rounded-2xl border border-purple-900/30 p-6 shadow-xl max-w-2xl space-y-6">
            <h3 className="text-base font-bold text-white">Store Configuration</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateStore({
                    storeId: store._id,
                    ownerId: currentUser._id,
                    name: store.name,
                    description: store.description,
                    status: store.status === "open" ? "closed" : "open",
                  });
                  alert("Store status updated in Cloud Firestore");
                } catch (err: any) {
                  alert(err.message || "Failed to update store");
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Store Name</label>
                <input
                  type="text"
                  disabled
                  value={store.name}
                  className="w-full px-3 py-2 bg-[#080a12] border border-purple-900/30 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Public URL</label>
                <input
                  type="text"
                  disabled
                  value={`shopza.market/store/${store.slug}`}
                  className="w-full px-3 py-2 bg-[#080a12] border border-purple-900/30 rounded-xl text-purple-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-300 mb-1">Store Visibility Status</label>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    store.status === "open"
                      ? "bg-amber-950/70 border border-amber-800/50 hover:bg-amber-900/80 text-amber-300"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-900/40"
                  }`}
                >
                  <span>Toggle Status: Currently {store.status.toUpperCase()}</span>
                </button>
              </div>
            </form>

            {/* Danger Zone: Delete Store Front */}
            <div className="pt-6 border-t border-rose-950/70 space-y-2">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Store Front & Seller Account</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permanently delete this storefront, unlist all your products ({products.length} items), and record your offboarding reason in the database.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteStoreModalOpen(true)}
                className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-950/60 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Store Front</span>
              </button>
            </div>
          </div>
        )}

        {/* PRODUCT CREATE/EDIT MODAL */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-[#0d101d] rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden p-6 max-h-[90vh] overflow-y-auto text-slate-100">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e]"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Publish genuine legal products to {store.name}.
              </p>

              {productError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
                  {productError}
                </div>
              )}

              {/* Real-time Illegal Goods Detection: "remember we are selling all legal kind of things if it is not legal the app should automatically detect it" */}
              {(() => {
                const legality = checkProductLegality({
                  title: prodTitle,
                  description: prodDesc,
                  category: prodCategory,
                });
                if (!legality.isLegal) {
                  return (
                    <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600 text-rose-200 text-xs flex items-start gap-2.5 animate-pulse">
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Prohibited: {legality.category}</span>
                        <p className="text-[11px] text-rose-300 mt-0.5">{legality.reason}</p>
                      </div>
                    </div>
                  );
                } else if (prodTitle.trim()) {
                  return (
                    <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Legal merchandise verified for listing</span>
                    </div>
                  );
                }
                return null;
              })()}

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Describe key features, specs, and materials..."
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="49.99"
                      className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Available Stock *</label>
                    <input
                      type="number"
                      required
                      value={prodInventory}
                      onChange={(e) => setProdInventory(e.target.value)}
                      placeholder="15"
                      className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Flexible Custom Category: "user can just type the category of the product" */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category (Type any custom category) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Type custom category..."
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {POPULAR_LEGAL_CATEGORIES.slice(0, 5).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProdCategory(cat)}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#1a1f38] text-purple-300 hover:text-white border border-purple-900/30"
                      >
                        + {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Image Upload: "put a button that you can use to upload product image from your devices" */}
                <div className="space-y-1.5 pt-1">
                  <label className="block font-semibold text-slate-300">
                    Product Image (Upload from device or enter URL)
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/40 active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingDeviceImage ? "Uploading..." : "Upload from Device"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDeviceImageUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="Or paste https:// image URL..."
                      className="flex-1 px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 text-xs"
                    />
                  </div>

                  {prodImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-500/40 bg-[#080a12] mt-2">
                      <img src={prodImage} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImage("")}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#15192e] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct || !checkProductLegality({ title: prodTitle, description: prodDesc, category: prodCategory }).isLegal}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md shadow-purple-900/40 disabled:opacity-50"
                  >
                    {isSavingProduct ? "Saving..." : editingProduct ? "Update Product" : "Publish to Store"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE STOREFRONT OFFBOARDING MODAL */}
        {isDeleteStoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-[#0d101d] rounded-2xl shadow-2xl border border-rose-500/40 p-6 text-slate-100 text-xs space-y-4">
              <button
                onClick={() => setIsDeleteStoreModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e]"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Delete Store Front</h3>
                  <p className="text-[11px] text-slate-400">
                    Offboarding process for "{store.name}"
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 leading-relaxed text-[11px]">
                ⚠️ <strong>Warning:</strong> Deleting your storefront will permanently delete your store, unlist all your products ({products.length} items), and record your offboarding reason in the database.
              </div>

              <div className="space-y-2">
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
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#12162a] border border-purple-900/30 hover:border-purple-500/40 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="compStoreDeleteReason"
                      value={reason}
                      checked={storeDeleteReason === reason}
                      onChange={(e) => setStoreDeleteReason(e.target.value)}
                      className="accent-rose-500"
                    />
                    <span className="text-slate-200">{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block font-bold text-white mb-1">
                  Additional Comments (Stored in database)
                </label>
                <textarea
                  rows={2}
                  value={storeDeleteFeedback}
                  onChange={(e) => setStoreDeleteFeedback(e.target.value)}
                  placeholder="Share any feedback regarding your decision..."
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeDeleteConfirmed}
                  onChange={(e) => setStoreDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 accent-rose-500"
                />
                <span className="text-[11px] text-slate-300">
                  I understand this will permanently delete my storefront and all associated products from Cloud Firestore.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!storeDeleteConfirmed || isDeletingStoreFront}
                  onClick={handleConfirmDeleteStoreFront}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-40"
                >
                  {isDeletingStoreFront ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE ORDER STATUS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#0d101d] rounded-2xl shadow-2xl border border-purple-500/30 p-6 text-slate-100">
              <h3 className="text-base font-bold text-white mb-1">
                Update Order #{selectedOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Notify {selectedOrder.buyerName} of shipment updates.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="processing" className="bg-[#12162a] text-white">Processing</option>
                    <option value="shipped" className="bg-[#12162a] text-white">Shipped</option>
                    <option value="delivered" className="bg-[#12162a] text-white">Delivered</option>
                    <option value="cancelled" className="bg-[#12162a] text-white">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TRK-98234-US"
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-purple-300 font-mono"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#15192e] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingOrder}
                    onClick={handleUpdateOrderStatus}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md shadow-purple-900/40 disabled:opacity-50"
                  >
                    {isUpdatingOrder ? "Updating..." : "Save Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
