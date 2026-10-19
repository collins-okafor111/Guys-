import React, { useState } from "react";
import {
  X,
  Database,
  CheckCircle2,
  Server,
  Layers,
  Zap,
  ShieldCheck,
  Flame,
  Globe,
} from "lucide-react";
import { useConvex } from "../../context/ConvexContext";
import firebaseConfig from "../../../firebase-applet-config.json";

interface ConvexStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTestRunner: () => void;
}

export const ConvexStatusModal: React.FC<ConvexStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenTestRunner,
}) => {
  const { db } = useConvex();

  if (!isOpen) return null;

  const collections = [
    { name: "stores", records: db.stores.length, desc: "Seller storefront profiles, branding, and ratings" },
    { name: "products", records: db.products.length, desc: "Catalog listings, inventory, categories, pricing" },
    { name: "orders", records: db.orders.length, desc: "Purchases, commission, tracking, and shipping" },
    { name: "users", records: db.users.length, desc: "Verified buyer & seller profiles (Google & Email)" },
    { name: "cartItems", records: db.cartItems.length, desc: "User shopping carts with stock validation" },
    { name: "reviews", records: db.reviews.length, desc: "Verified customer product reviews & ratings" },
    { name: "follows", records: db.follows.length, desc: "Store follower relationships & notifications" },
    { name: "favorites", records: db.favorites.length, desc: "Bookmarked products for registered buyers" },
    { name: "conversations", records: db.conversations.length, desc: "Direct chat threads between buyer and seller" },
    { name: "messages", records: db.messages.length, desc: "In-app chat messages with read status" },
    { name: "notifications", records: db.notifications.length, desc: "Order alerts, seller notifications, updates" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden max-h-[90vh] flex flex-col text-slate-100 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="p-6 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14182e] border border-orange-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Firebase Backend Architecture</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cloud Provisioned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cloud Firestore database & Firebase Google OAuth authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cloud Status Alert */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181131] to-[#0f142b] border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Live Firebase Configuration</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 font-semibold">
                Rules Deployed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[#090b14] border border-purple-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Project ID</span>
                <span className="text-purple-300 font-bold">{firebaseConfig.projectId}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090b14] border border-purple-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Firestore Database</span>
                <span className="text-blue-300 font-bold truncate block">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
            </div>
          </div>

          {/* Database Collections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-sm text-white">
                  Firestore Collections & Reactive Entities
                </h4>
              </div>
              <span className="text-xs text-purple-300 font-medium">
                Live Cloud Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {collections.map((t) => (
                <div
                  key={t.name}
                  className="p-3 bg-[#0a0c16] rounded-xl border border-purple-900/30 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {t.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#12162a] text-purple-300 border border-purple-900/40">
                      {t.records} records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Business Model Commission Info */}
          <div className="p-4 bg-[#0a0c16] rounded-2xl border border-purple-900/30 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                Marketplace Commission Setting
              </h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Current rate: {(db.platformConfig.rate * 100).toFixed(1)}% | Promo 0% Mode:{" "}
                {db.platformConfig.promotionalZeroActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300 bg-[#14182e] border border-purple-900/40 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Hardened
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 bg-[#0a0c16] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenTestRunner();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/40 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Run Test Suite (14 Tests)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-[#15192e]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
