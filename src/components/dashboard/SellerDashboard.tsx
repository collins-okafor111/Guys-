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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useConvex } from "../../context/ConvexContext";
import { Product, Order, OrderStatus } from "../../types";

export const SellerDashboard: React.FC<{
  onSelectProduct: (p: Product) => void;
  onViewPublicStore: (slug: string) => void;
}> = ({ onSelectProduct, onViewPublicStore }) => {
  const { currentUser } = useAuth();
  const {
    getStoreByOwner,
    createStore,
    updateStore,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    listSellerOrders,
    updateOrderStatus,
    db,
  } = useConvex();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "settings">("overview");

  // Create store form state
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategories, setStoreCategories] = useState<string[]>(["Electronics"]);
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
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
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

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
  const storeFollowers = store ? store.followersCount : 0;

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
        categories: storeCategories,
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
                  Primary Product Category
                </label>
                <select
                  value={storeCategories[0]}
                  onChange={(e) => setStoreCategories([e.target.value])}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                >
                  {db.categories.map((c) => (
                    <option key={c.slug} value={c.name} className="bg-[#12162a] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Logo Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={storeBanner}
                    onChange={(e) => setStoreBanner(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>
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
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-purple-900/30 pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
            { id: "products", label: `Products (${products.length})`, icon: Package },
            { id: "orders", label: `Incoming Orders (${orders.length})`, icon: ShoppingBag },
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

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-[#0d101d] rounded-2xl border border-purple-900/30 p-6 shadow-xl max-w-2xl">
            <h3 className="text-base font-bold text-white mb-4">Store Configuration</h3>
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
                  alert("Store status updated");
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
                  className="w-full px-3 py-2 bg-[#080a12] border border-purple-900/30 rounded-xl text-slate-500 cursor-not-allowed"
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
                <p className="text-[11px] text-slate-500 mt-1">
                  When closed, your store remains discoverable in search, but customers cannot place new orders until re-opened.
                </p>
              </div>
            </form>
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
                Enter product details to publish to {store.name}.
              </p>

              {productError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
                  {productError}
                </div>
              )}

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

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                  >
                    {db.categories.map((c) => (
                      <option key={c.slug} value={c.name} className="bg-[#12162a] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-slate-500"
                  />
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
                    disabled={isSavingProduct}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md shadow-purple-900/40 disabled:opacity-50"
                  >
                    {isSavingProduct ? "Saving..." : editingProduct ? "Update Product" : "Publish to Store"}
                  </button>
                </div>
              </form>
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
