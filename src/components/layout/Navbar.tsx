import React, { useState } from "react";
import {
  Search,
  Mic,
  Bell,
  MessageSquare,
  User as UserIcon,
  Store,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Layers,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";
import { ShopzaLogo } from "./ShopzaLogo";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenVoiceSearch: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onOpenAuth: (tab?: "login" | "register" | "verify" | "recovery") => void;
  onOpenPagesDirectory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenVoiceSearch,
  onOpenCart,
  onOpenNotifications,
  onOpenMessages,
  onOpenAuth,
  onOpenPagesDirectory,
}) => {
  const { currentUser, logout } = useAuth();
  const { getCart, getUnreadNotificationCount } = useFirebase();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cart = currentUser ? getCart(currentUser._id) : { itemCount: 0 };
  const unreadNotifs = currentUser ? getUnreadNotificationCount(currentUser._id) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#060813]/95 backdrop-blur-xl border-b border-blue-900/30 shadow-xl shadow-black/40 font-['Plus_Jakarta_Sans']">
      {/* Top Marketplace Announcement Bar */}
      <div className="bg-gradient-to-r from-[#0C122C] via-[#090C1D] to-[#120B29] text-blue-200 text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-blue-900/30">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
          <span className="font-semibold text-white">
            Shopza Verified Marketplace
          </span>
          <span className="hidden sm:inline text-blue-300/80">
            • Free standard shipping on orders over $50
          </span>
        </div>

        <div className="flex items-center gap-4 text-blue-300/90 text-[11px]">
          <button
            onClick={onOpenPagesDirectory}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white font-bold hover:brightness-110 transition-all shadow-xs"
          >
            <Layers className="w-3 h-3" />
            <span>Marketplace Directory</span>
          </button>
          <span className="hidden md:inline text-slate-300">Paystack Verified Checkout</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo with 3D bag, speed streaks, cart wheels & S ribbon */}
        <button
          onClick={() => onNavigate("marketplace")}
          className="flex items-center text-left group flex-shrink-0"
        >
          <ShopzaLogo variant="compact" />
        </button>

        {/* Global Search Bar with Microphone Voice Action */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, stores, categories..."
              className="w-full pl-10 pr-12 py-2 text-xs bg-[#0F142A] hover:bg-[#151C3B] focus:bg-[#151C3B] border border-blue-900/40 focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={onOpenVoiceSearch}
              className="absolute right-2 p-1.5 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-950/60 transition-colors"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile voice search button */}
          <button
            onClick={onOpenVoiceSearch}
            className="md:hidden p-2 text-blue-400 hover:text-blue-300 rounded-xl hover:bg-[#0F142A]"
            title="Voice Search"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold mr-2">
            <button
              onClick={() => onNavigate("marketplace")}
              className={`px-3 py-2 rounded-xl transition-colors ${
                currentView === "marketplace"
                  ? "text-white bg-blue-950/80 border border-blue-800/50 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#0F142A]"
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => onNavigate("stores")}
              className={`px-3 py-2 rounded-xl transition-colors ${
                currentView === "stores"
                  ? "text-white bg-blue-950/80 border border-blue-800/50 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#0F142A]"
              }`}
            >
              Stores
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth("register");
                } else {
                  onNavigate("seller_dashboard");
                }
              }}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                currentView === "seller_dashboard"
                  ? "text-white bg-purple-950/80 border border-purple-800/50 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#0F142A]"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-purple-400" />
              <span>Seller Hub</span>
            </button>
            <button
              onClick={onOpenPagesDirectory}
              className="px-3 py-2 rounded-xl text-blue-300 hover:text-white hover:bg-[#0F142A] transition-colors flex items-center gap-1.5 border border-blue-900/40"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Directory</span>
            </button>
          </nav>

          {/* In-App Messages */}
          {currentUser && (
            <button
              onClick={onOpenMessages}
              className="p-2 text-slate-300 hover:text-blue-300 rounded-xl hover:bg-[#0F142A] transition-colors relative"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              className="p-2 text-slate-300 hover:text-purple-300 rounded-xl hover:bg-[#0F142A] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="p-2 text-slate-300 hover:text-blue-300 rounded-xl hover:bg-[#0F142A] transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.itemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {cart.itemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-[#0F142A] hover:bg-[#151C3B] border border-blue-900/40 rounded-xl transition-colors"
              >
                <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <img
                  src={
                    currentUser.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-blue-800/40"
                />
                <ChevronDown className="w-3.5 h-3.5 text-blue-400 hidden sm:inline" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0A0D1D] rounded-2xl shadow-2xl border border-blue-800/40 py-2 text-xs z-50 animate-fadeIn text-slate-200">
                  <div className="px-4 py-2.5 border-b border-blue-900/30 bg-[#0F142A]/50">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950/70 text-blue-300 border border-blue-800/40">
                        {currentUser.role} Account
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate("buyer_dashboard");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#151C3B] hover:text-white flex items-center gap-2 font-medium"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                    <span>Buyer Dashboard & Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate("seller_dashboard");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#151C3B] hover:text-white flex items-center gap-2 font-medium"
                  >
                    <Store className="w-4 h-4 text-purple-400" />
                    <span>Seller Hub & Products</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenPagesDirectory();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-blue-300 hover:bg-[#151C3B] hover:text-white flex items-center gap-2 font-medium"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Marketplace Directory</span>
                  </button>

                  <div className="border-t border-blue-900/30 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-3.5 py-1.5 text-xs font-bold text-blue-200 hover:text-white hover:bg-[#0F142A] rounded-xl transition-colors border border-blue-900/40"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] hover:from-[#0055D6] hover:to-[#6B21A8] rounded-xl shadow-md shadow-blue-900/40 transition-all active:scale-95"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-blue-300 rounded-xl hover:bg-[#0F142A] ml-1"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="p-2.5 px-4 md:hidden border-t border-blue-900/30 bg-[#070914]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, stores..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0D1D] border-b border-blue-900/30 px-4 py-3 space-y-2 text-xs font-bold animate-fadeIn text-slate-200">
          <button
            onClick={() => {
              onNavigate("marketplace");
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-slate-200 hover:text-blue-300"
          >
            Marketplace Home
          </button>
          <button
            onClick={() => {
              onNavigate("stores");
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-slate-200 hover:text-blue-300"
          >
            Discover Stores
          </button>
          <button
            onClick={() => {
              onNavigate("seller_dashboard");
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-slate-200 hover:text-blue-300"
          >
            Seller Hub
          </button>
          <button
            onClick={() => {
              onNavigate("buyer_dashboard");
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-slate-200 hover:text-blue-300"
          >
            Buyer Dashboard & Orders
          </button>
          <button
            onClick={() => {
              onOpenPagesDirectory();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-blue-400 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Marketplace Directory</span>
          </button>
        </div>
      )}
    </header>
  );
};
