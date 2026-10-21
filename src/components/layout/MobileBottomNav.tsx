import React from "react";
import { ShoppingBag, Store, Mic, ShoppingCart, User, Layers } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenVoiceSearch: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenPagesDirectory?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenVoiceSearch,
  onOpenCart,
  onOpenAuth,
  onOpenPagesDirectory,
}) => {
  const { currentUser } = useAuth();
  const { getCart } = useFirebase();

  const cart = currentUser ? getCart(currentUser._id) : { itemCount: 0 };

  const handleDashboardClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else if (currentUser.role === "seller") {
      onNavigate("seller_dashboard");
    } else {
      onNavigate("buyer_dashboard");
    }
  };

  const isDashboardActive =
    currentView === "seller_dashboard" || currentView === "buyer_dashboard";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060813]/95 border-t border-blue-900/30 px-2 py-1 shadow-2xl backdrop-blur-xl font-['Plus_Jakarta_Sans']"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Marketplace */}
        <button
          onClick={() => onNavigate("marketplace")}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 transition-colors ${
            currentView === "marketplace"
              ? "text-blue-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Market</span>
        </button>

        {/* 2. Stores */}
        <button
          onClick={() => onNavigate("stores")}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 transition-colors ${
            currentView === "stores"
              ? "text-blue-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Stores</span>
        </button>

        {/* 3. Voice Action Button */}
        <button
          onClick={onOpenVoiceSearch}
          className="flex flex-col items-center justify-center -mt-3.5"
          title="Voice Search"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] hover:from-[#0055D6] hover:to-[#6B21A8] text-white flex items-center justify-center shadow-lg shadow-blue-900/40 transition-transform active:scale-95 border border-blue-400/30">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-blue-300 mt-0.5">Voice</span>
        </button>

        {/* 4. Cart */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 transition-colors text-slate-400 hover:text-white relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-xs">
                {cart.itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Cart</span>
        </button>

        {/* 5. 50 Pages Directory */}
        {onOpenPagesDirectory ? (
          <button
            onClick={onOpenPagesDirectory}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 transition-colors text-slate-400 hover:text-white"
          >
            <Layers className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] font-semibold tracking-tight">50 Pages</span>
          </button>
        ) : (
          <button
            onClick={handleDashboardClick}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 transition-colors ${
              isDashboardActive
                ? "text-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight">
              {currentUser ? (currentUser.role === "seller" ? "Seller" : "Account") : "Sign In"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
