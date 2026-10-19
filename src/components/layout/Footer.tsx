import React from "react";
import { ShieldCheck, Truck, Headphones, RotateCcw, Layers } from "lucide-react";
import { ShopzaLogo } from "./ShopzaLogo";

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onOpenPagesDirectory?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenPagesDirectory,
}) => {
  return (
    <footer className="bg-[#060813] text-slate-400 text-xs border-t border-blue-900/30 mt-20 pb-16 md:pb-0 font-['Plus_Jakarta_Sans']">
      {/* Trust Highlights Bar */}
      <div className="border-b border-blue-900/30 bg-[#0A0D1D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200 text-[11px]">Free Shipping Over $50</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200 text-[11px]">Buyer Protection Guaranteed</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200 text-[11px]">30-Day Easy Returns</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Headphones className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-200 text-[11px]">24/7 Dedicated Support</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-2">
            <ShopzaLogo variant="compact" />
            <p className="text-slate-400 leading-relaxed text-[11px] max-w-sm mt-3">
              Shopza is the verified buy & sell marketplace connecting buyers with independent merchants worldwide. Enjoy 1-click checkout, escrow guarantees, and direct merchant messaging.
            </p>
            {onOpenPagesDirectory && (
              <button
                onClick={onOpenPagesDirectory}
                className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white font-bold text-xs shadow-md shadow-blue-900/40"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Browse All 50 Marketplace Pages</span>
              </button>
            )}
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore Market
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate("all_products")}
                  className="hover:text-blue-300 transition-colors"
                >
                  All Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("stores")}
                  className="hover:text-blue-300 transition-colors"
                >
                  Verified Stores Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("flash_deals")}
                  className="hover:text-blue-300 transition-colors"
                >
                  Daily Flash Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("best_sellers")}
                  className="hover:text-blue-300 transition-colors"
                >
                  Trending & Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("gift_guides")}
                  className="hover:text-blue-300 transition-colors"
                >
                  Curated Gift Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Seller Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Sell on Shopza
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate("seller_dashboard")}
                  className="hover:text-purple-300 transition-colors"
                >
                  Seller Portal & Metrics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("seller_products")}
                  className="hover:text-purple-300 transition-colors"
                >
                  Inventory Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("seller_add_product")}
                  className="hover:text-purple-300 transition-colors"
                >
                  Publish New Listing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("seller_payouts")}
                  className="hover:text-purple-300 transition-colors"
                >
                  Escrow & Payouts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("seller_handbook")}
                  className="hover:text-purple-300 transition-colors"
                >
                  Seller Policy Handbook
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Trust & Support
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate("buyer_protection")}
                  className="hover:text-blue-300 transition-colors text-left"
                >
                  Buyer Protection Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("returns")}
                  className="hover:text-blue-300 transition-colors text-left"
                >
                  30-Day Easy Returns Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("help_center")}
                  className="hover:text-blue-300 transition-colors text-left"
                >
                  Help Center & Knowledge Base
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("about")}
                  className="hover:text-blue-300 transition-colors text-left"
                >
                  About Shopza & Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("terms")}
                  className="hover:text-blue-300 transition-colors text-left"
                >
                  Terms of Service & Privacy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Shopza Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Encrypted Escrow Transactions</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
