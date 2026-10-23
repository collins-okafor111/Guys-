import React, { useState } from "react";
import {
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { FirebaseProvider, useFirebase } from "./context/FirebaseContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { ProductDetailsModal } from "./components/products/ProductDetailsModal";
import { StoreViewModal } from "./components/stores/StoreViewModal";
import { CartDrawer } from "./components/cart/CartDrawer";
import { CheckoutModal } from "./components/checkout/CheckoutModal";
import { MessagingModal } from "./components/messaging/MessagingModal";
import { NotificationsDrawer } from "./components/notifications/NotificationsDrawer";
import { AuthModal } from "./components/auth/AuthModal";
import { VoiceSearchModal } from "./components/voice/VoiceSearchModal";
import { PagesDirectoryModal } from "./components/layout/PagesDirectoryModal";
import { PageRenderer } from "./pages/PageRenderer";
import { ALL_50_PAGES, PageDefinition } from "./pages/PageRegistry";
import { Product, Store } from "./types";
import { VoiceActionResult } from "./hooks/useVoiceAssistant";

function MainApp() {
  const { currentUser } = useAuth();
  const {
    listProducts,
    listStores,
    listBuyerOrders,
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    db,
    getStoreBySlug,
    getStoreById,
  } = useFirebase();

  // Navigation: Active Page out of the 50 Pages
  const [currentPageId, setCurrentPageId] = useState<string>("marketplace");
  const [isPagesDirectoryOpen, setIsPagesDirectoryOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [messageTargetSellerId, setMessageTargetSellerId] = useState<string | undefined>(undefined);
  const [messageTargetStoreId, setMessageTargetStoreId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"login" | "register" | "verify" | "recovery">("login");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [orderConfirmationNotice, setOrderConfirmationNotice] = useState<string | null>(null);

  // Data from Context
  const products = listProducts({ search: searchQuery });
  const stores = listStores({ search: searchQuery });
  const orders = currentUser ? listBuyerOrders(currentUser._id) : (db.orders || []);
  const rawCart = currentUser ? getCart(currentUser._id) : null;
  const cart = {
    items: rawCart?.items || [],
    subtotal: rawCart?.subtotal || 0,
    shippingTotal: rawCart?.shippingFee || 0,
    grandTotal: rawCart?.total || 0,
    itemCount: rawCart?.itemCount || 0,
  };

  // Current page lookup
  const currentPageIndex = ALL_50_PAGES.findIndex((p) => p.id === currentPageId);
  const currentPageDef: PageDefinition =
    currentPageIndex !== -1 ? ALL_50_PAGES[currentPageIndex] : ALL_50_PAGES[0];

  const handlePrevPage = () => {
    const prevIdx = (currentPageIndex - 1 + ALL_50_PAGES.length) % ALL_50_PAGES.length;
    setCurrentPageId(ALL_50_PAGES[prevIdx].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    const nextIdx = (currentPageIndex + 1) % ALL_50_PAGES.length;
    setCurrentPageId(ALL_50_PAGES[nextIdx].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (pageId: string) => {
    setCurrentPageId(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Voice command handler
  const handleVoiceCommand = (action: VoiceActionResult) => {
    if (action.type === "navigate") {
      if (action.target === "cart") setIsCartOpen(true);
      else if (action.target === "orders") handleNavigate("buyer_orders");
      else if (action.target === "messages") setIsMessagesOpen(true);
      else if (action.target === "seller_dashboard") handleNavigate("seller_dashboard");
    } else if (action.type === "category") {
      if (action.query) {
        const queryLower = action.query.toLowerCase();
        if (queryLower.includes("electr") || queryLower.includes("tech") || queryLower.includes("audio")) {
          handleNavigate("cat_electronics");
        } else if (queryLower.includes("fashion") || queryLower.includes("cloth")) {
          handleNavigate("cat_fashion");
        } else if (queryLower.includes("home") || queryLower.includes("kitchen")) {
          handleNavigate("cat_home");
        } else if (queryLower.includes("beauty") || queryLower.includes("cosmetic")) {
          handleNavigate("cat_beauty");
        } else if (queryLower.includes("sport") || queryLower.includes("fitness")) {
          handleNavigate("cat_sports");
        } else {
          handleNavigate("all_products");
        }
      }
    } else if (action.type === "search") {
      setSearchQuery(action.query || action.rawText);
      handleNavigate("all_products");
    }
  };

  const handleOpenStore = (slugOrId: string) => {
    const store = getStoreBySlug(slugOrId) || getStoreById(slugOrId);
    if (store) {
      setSelectedStore(store);
    }
  };

  const handleStartMessage = (sellerId: string, storeId?: string) => {
    setMessageTargetSellerId(sellerId);
    setMessageTargetStoreId(storeId);
    setIsMessagesOpen(true);
  };

  const handleOrderSuccess = () => {
    setOrderConfirmationNotice(`Order successfully placed! Track your items in your Buyer Dashboard.`);
    setTimeout(() => setOrderConfirmationNotice(null), 6000);
    handleNavigate("order_confirmation");
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!currentUser) {
      setAuthDefaultTab("login");
      setIsAuthOpen(true);
      return;
    }
    await addToCart({
      userId: currentUser._id,
      productId: product._id,
      quantity,
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (!currentUser) return;
    const userCart = getCart(currentUser._id);
    const item = userCart.items.find((i) => i.productId === productId);
    if (item) {
      updateCartQuantity({
        userId: currentUser._id,
        cartItemId: item._id,
        quantity,
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    if (!currentUser) return;
    const userCart = getCart(currentUser._id);
    const item = userCart.items.find((i) => i.productId === productId);
    if (item) {
      removeFromCart({
        userId: currentUser._id,
        cartItemId: item._id,
      });
    }
  };

  const handleClearCart = () => {
    if (!currentUser) return;
    clearCart(currentUser._id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060813] text-slate-100 pb-16 md:pb-0 font-['Plus_Jakarta_Sans'] selection:bg-[#0066FF] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentPageId}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenVoiceSearch={() => setIsVoiceModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessages={() => {
          setMessageTargetSellerId(undefined);
          setMessageTargetStoreId(undefined);
          setIsMessagesOpen(true);
        }}
        onOpenAuth={(tab = "login") => {
          setAuthDefaultTab(tab);
          setIsAuthOpen(true);
        }}
        onOpenPagesDirectory={() => setIsPagesDirectoryOpen(true)}
      />

      {/* Marketplace Department & Section Navigation Bar */}
      <div className="bg-[#090C1D] border-b border-blue-900/30 px-4 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white font-extrabold text-[11px] shadow-sm">
              {currentPageDef.group}
            </span>
            <span className="font-bold text-white truncate max-w-xs sm:max-w-md">
              {currentPageDef.title}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrevPage}
              className="p-1.5 rounded-lg bg-[#0F142A] hover:bg-[#151C3B] border border-blue-900/40 text-slate-300 hover:text-white transition-colors"
              title="Previous View"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentPageId}
              onChange={(e) => handleNavigate(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-[#0F142A] border border-blue-900/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[240px] truncate"
            >
              {ALL_50_PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} • {p.group}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextPage}
              className="p-1.5 rounded-lg bg-[#0F142A] hover:bg-[#151C3B] border border-blue-900/40 text-slate-300 hover:text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPagesDirectoryOpen(true)}
              className="ml-1 px-3 py-1 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:brightness-110 transition-all active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Order Success Toast */}
      {orderConfirmationNotice && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-950/50 flex items-center gap-3 animate-fadeIn max-w-md border border-emerald-400/30">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-white" />
          <div>
            <p className="font-bold text-xs">{orderConfirmationNotice}</p>
            <button
              onClick={() => handleNavigate("buyer_orders")}
              className="mt-1 text-[11px] font-semibold text-emerald-100 underline hover:text-white"
            >
              View Orders in Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <PageRenderer
          currentPageId={currentPageId}
          products={products}
          stores={stores}
          orders={orders}
          reviews={db.reviews || []}
          cart={cart}
          currentUser={currentUser}
          selectedProduct={selectedProduct}
          selectedStore={selectedStore}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onOpenStore={handleOpenStore}
          onNavigate={handleNavigate}
          onOpenAuth={(tab = "login") => {
            setAuthDefaultTab(tab);
            setIsAuthOpen(true);
          }}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onStartMessage={handleStartMessage}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAuth={(tab) => {
          setAuthDefaultTab(tab);
          setIsAuthOpen(true);
        }}
        onOpenPagesDirectory={() => setIsPagesDirectoryOpen(true)}
      />

      {/* Mobile Bottom Navigation (Responsive: visible on mobile screens) */}
      <MobileBottomNav
        currentView={currentPageId}
        onNavigate={handleNavigate}
        onOpenVoiceSearch={() => setIsVoiceModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPagesDirectory={() => setIsPagesDirectoryOpen(true)}
      />

      {/* Modals */}
      {/* 1. Product Details */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenStore={(slugOrId) => handleOpenStore(slugOrId)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onStartMessage={handleStartMessage}
      />

      {/* 2. Store View */}
      <StoreViewModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onStartMessage={handleStartMessage}
      />

      {/* 3. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          handleNavigate("checkout_page");
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 4. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 5. In-App Messaging Modal */}
      <MessagingModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        initialSellerId={messageTargetSellerId}
        initialStoreId={messageTargetStoreId}
      />

      {/* 6. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(link) => {
          if (link.includes("seller/orders")) handleNavigate("seller_orders");
          else if (link.includes("buyer/orders")) handleNavigate("buyer_orders");
          else if (link.includes("messages")) setIsMessagesOpen(true);
        }}
      />

      {/* 7. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authDefaultTab}
      />

      {/* 8. Voice Assistant Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleVoiceCommand}
      />

      {/* 9. 50-Pages Directory Modal */}
      <PagesDirectoryModal
        isOpen={isPagesDirectoryOpen}
        onClose={() => setIsPagesDirectoryOpen(false)}
        currentPage={currentPageId}
        onSelectPage={(pageId) => {
          handleNavigate(pageId);
          setIsPagesDirectoryOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </FirebaseProvider>
  );
}
