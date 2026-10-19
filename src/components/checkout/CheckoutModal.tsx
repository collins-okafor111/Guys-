import React, { useState } from "react";
import { X, ShieldCheck, CreditCard, ShoppingBag, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { useConvex } from "../../context/ConvexContext";
import { useAuth } from "../../context/AuthContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderIds: string[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { currentUser } = useAuth();
  const { getCart, createCheckoutOrder } = useConvex();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "delivery">("card");
  const [address, setAddress] = useState({
    fullName: currentUser?.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const cart = getCart(currentUser._id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!address.fullName.trim() || !address.address.trim() || !address.city.trim() || !address.zipCode.trim()) {
        throw new Error("Please complete all required shipping fields.");
      }

      const res = await createCheckoutOrder({
        buyerId: currentUser._id,
        shippingAddress: address,
      });

      onOrderSuccess(res.orderIds);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-900/30 overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">Secure Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#15192e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Shipping Address</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="123 Market St, Suite 400"
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Postal / ZIP Code *</label>
                <input
                  type="text"
                  required
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="555-0123"
                  className="w-full px-3 py-2 bg-[#12162a] border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Payment Option</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === "card"
                    ? "border-purple-500 bg-[#171b34] text-white ring-1 ring-purple-500"
                    : "border-purple-900/30 hover:bg-[#12162a] text-slate-400"
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Credit / Debit Card</p>
                  <p className="text-[11px] text-slate-400">Instant verification</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("delivery")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === "delivery"
                    ? "border-purple-500 bg-[#171b34] text-white ring-1 ring-purple-500"
                    : "border-purple-900/30 hover:bg-[#12162a] text-slate-400"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Pay on Delivery</p>
                  <p className="text-[11px] text-slate-400">Pay upon package arrival</p>
                </div>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-[#0a0c16] rounded-2xl border border-purple-900/30 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Order Breakdown ({cart.itemCount} Items)
            </h4>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-white">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Shipping</span>
              <span className="font-semibold text-white">
                {cart.shippingFee === 0 ? "FREE" : `$${cart.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-purple-900/30">
              <span>Grand Total</span>
              <span className="text-purple-300 font-extrabold">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.itemCount === 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Authorizing & Placing Order...</span>
            ) : (
              <>
                <span>Confirm Order (${cart.total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
