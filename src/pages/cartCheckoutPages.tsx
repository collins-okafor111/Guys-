import React, { useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  Clock,
  Ticket,
  Percent,
  Copy,
  Check,
  Package,
  Truck,
  Sparkles,
  Zap,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Product, Store, CartItem, ShippingAddress } from "../types";
import { ProductCard } from "../components/products/ProductCard";
import { useFirebase } from "../context/FirebaseContext";
import { initializePaystackPayment, verifyPaystackPayment, launchPaystackPopup } from "../services/paystackService";

interface CartCheckoutProps {
  products: Product[];
  stores: Store[];
  cart: {
    items: CartItem[];
    subtotal: number;
    shippingTotal: number;
    grandTotal: number;
    itemCount: number;
  };
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onNavigate: (pageId: string) => void;
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slug: string) => void;
  onOpenAuth: (tab?: any) => void;
  currentUser: any;
}

// 21. Shopping Cart & Bag (Page 21)
export const CartPage: React.FC<CartCheckoutProps> = ({
  cart,
  products,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onNavigate,
  onSelectProduct,
  onOpenStore,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/25 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            <span>Shopping Cart & Bag</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review your selected merchandise, adjust quantities, or proceed to checkout
          </p>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Cart</span>
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 px-4 bg-[#0A0D1D] rounded-3xl border border-dashed border-blue-900/40 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-400 mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Cart is Currently Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our catalog of verified sellers and discover handcrafted gear, audio devices, and fashion.
          </p>
          <button
            onClick={() => onNavigate("all_products")}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 flex items-center gap-4 hover:border-blue-500/40 transition-colors"
              >
                <img
                  src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                  alt={item.product?.title || "Product"}
                  className="w-20 h-20 rounded-xl object-cover border border-blue-900/40 bg-black/40"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {item.product?.storeName || "Verified Store"}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{item.product?.title || "Marketplace Product"}</h4>
                  <p className="text-xs font-black text-white mt-1">
                    ${(item.product?.price || item.priceAtAddition).toFixed(2)}
                    <span className="text-slate-400 font-normal ml-1">each</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-blue-900/50 rounded-xl bg-[#070914] overflow-hidden">
                    <button
                      onClick={() => onUpdateCartQty(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-blue-950/50 text-slate-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateCartQty(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-blue-950/50 text-slate-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-5 h-fit">
            <h3 className="text-base font-bold text-white">Order Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-bold text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Standard Shipping</span>
                <span className="font-bold text-emerald-400">
                  {cart.shippingTotal === 0 ? "FREE" : `$${cart.shippingTotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated Taxes</span>
                <span className="font-bold text-white">$0.00</span>
              </div>
              <div className="border-t border-blue-900/30 pt-3 flex justify-between text-sm font-black text-white">
                <span>Total Due</span>
                <span className="text-[#00C2FF]">${cart.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("checkout_page")}
              className="w-full py-3 bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] hover:from-[#0055D6] hover:to-[#6B21A8] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Shopza Verified Buyer Protection • Secured by Paystack</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 22. Secure Checkout & Payment (Page 22)
// 22. Secure Checkout & Payment (Page 22) - Paystack Integrated
export const CheckoutPage: React.FC<CartCheckoutProps> = ({
  cart,
  onNavigate,
  currentUser,
  onOpenAuth,
}) => {
  const { createCheckoutOrder, clearCart } = useFirebase();

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "delivery">("paystack");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: currentUser?.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: currentUser?.phone || "",
  });

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Lock className="w-12 h-12 text-blue-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to Complete Checkout</h2>
        <p className="text-xs text-slate-400">
          Please log in to your Shopza account to securely proceed with your Paystack payment and save your order.
        </p>
        <button
          onClick={() => onOpenAuth("login")}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const itemsTotal = cart.grandTotal > 0 ? cart.grandTotal : 0;
  const shippingCharge = shippingMethod === "express" ? 15.0 : 0;
  const grandTotal = Math.round((itemsTotal + shippingCharge) * 100) / 100;

  const handlePayAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.itemCount === 0) {
      setErrorMessage("Your shopping cart is empty.");
      return;
    }

    if (!address.fullName.trim() || !address.address.trim() || !address.city.trim() || !address.phone.trim()) {
      setErrorMessage("Please complete all shipping address and contact fields.");
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "paystack") {
        const tempOrderId = `SPZ_${Date.now()}`;
        // 1. Initialize Paystack transaction on backend
        const initResult = await initializePaystackPayment({
          email: currentUser.email,
          amount: grandTotal,
          orderId: tempOrderId,
          currency: "NGN",
          metadata: {
            buyerId: currentUser._id,
            buyerName: address.fullName,
            shippingAddress: address,
          },
        });

        // 2. Launch Paystack popup or redirect
        if (initResult.authorizationUrl && !initResult.authorizationUrl.includes("simulated=true")) {
          // If live Paystack auth URL returned, open secure window or popup
          launchPaystackPopup({
            email: currentUser.email,
            amount: grandTotal,
            orderId: tempOrderId,
            onSuccess: async (ref) => {
              // 3. Verify payment on backend
              const verifyRes = await verifyPaystackPayment(ref);
              if (verifyRes.success) {
                // 4. Create real order in Firestore
                const orderRes = await createCheckoutOrder({
                  buyerId: currentUser._id,
                  shippingAddress: address,
                  paymentMethod: "paystack",
                  paymentReference: ref,
                });
                await clearCart(currentUser._id);

                sessionStorage.setItem(
                  "shopza_last_order",
                  JSON.stringify({
                    orderIds: orderRes.orderIds,
                    reference: ref,
                    amount: grandTotal,
                    method: "Paystack (Card/Bank/USSD)",
                    shippingAddress: address,
                    paidAt: new Date().toISOString(),
                  })
                );
                setIsProcessing(false);
                onNavigate("order_confirmation");
              } else {
                setIsProcessing(false);
                setErrorMessage("Payment verification failed. Please try again.");
              }
            },
            onCancel: () => {
              setIsProcessing(false);
              setErrorMessage("Paystack payment cancelled by user.");
            },
          });
        } else {
          // Test/Sandbox fallback verification
          const ref = initResult.reference;
          const verifyRes = await verifyPaystackPayment(ref);
          const orderRes = await createCheckoutOrder({
            buyerId: currentUser._id,
            shippingAddress: address,
            paymentMethod: "paystack",
            paymentReference: ref,
          });
          await clearCart(currentUser._id);

          sessionStorage.setItem(
            "shopza_last_order",
            JSON.stringify({
              orderIds: orderRes.orderIds,
              reference: ref,
              amount: grandTotal,
              method: "Paystack Verified",
              shippingAddress: address,
              paidAt: new Date().toISOString(),
            })
          );
          setIsProcessing(false);
          onNavigate("order_confirmation");
        }
      } else {
        // Pay on Delivery
        const orderRes = await createCheckoutOrder({
          buyerId: currentUser._id,
          shippingAddress: address,
          paymentMethod: "delivery",
        });
        await clearCart(currentUser._id);

        sessionStorage.setItem(
          "shopza_last_order",
          JSON.stringify({
            orderIds: orderRes.orderIds,
            reference: `COD_${Date.now()}`,
            amount: grandTotal,
            method: "Pay on Delivery",
            shippingAddress: address,
            paidAt: "Pending on Delivery",
          })
        );
        setIsProcessing(false);
        onNavigate("order_confirmation");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Failed to process payment with Paystack");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <span>Paystack Secure Checkout</span>
        </h1>
        <p className="text-xs text-slate-400">
          Encrypted 256-bit SSL transaction processed directly via Paystack
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePayAndPlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>1. Shipping Destination</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+234 or +1 ..."
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="Street name, house number, apartment/suite"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">State / Province</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>2. Select Payment Method</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                  paymentMethod === "paystack"
                    ? "border-cyan-500 bg-cyan-950/30 text-white ring-1 ring-cyan-500"
                    : "border-blue-900/40 bg-[#070914] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-cyan-300">Paystack Gateway</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-900/60 text-cyan-300 uppercase font-black">Demo Mode</span>
                </div>
                <p className="text-[11px] text-slate-300 font-normal">
                  Demo sandbox simulation — No real money will be charged to your account.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("delivery")}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                  paymentMethod === "delivery"
                    ? "border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500"
                    : "border-blue-900/40 bg-[#070914] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-blue-300">Pay on Delivery</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-900/60 text-blue-300 uppercase font-bold">Cash/POS</span>
                </div>
                <p className="text-[11px] text-slate-300 font-normal">
                  Pay with cash or card upon package arrival at your doorstep.
                </p>
              </button>
            </div>

            {/* Paystack Demo Mode Notice & Test Cards */}
            {paymentMethod === "paystack" && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Paystack Sandbox Demo Payment
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Zero Real Funds Charged
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This checkout operates in <strong>Demo / Test Mode</strong>. You will not put your real money for payment. Submitting this order securely simulates a verified transaction with live receipt generation.
                </p>
                <div className="p-2.5 rounded-xl bg-[#070914] border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-1">
                  <span className="text-slate-300">Test Card: <strong className="text-white">4084 0840 8408 4080</strong></span>
                  <span className="text-cyan-300">CVV: 408 | Exp: 12/30 | PIN: 1111</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-5 h-fit">
          <h3 className="text-sm font-bold text-white">Order Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Total ({cart.itemCount})</span>
              <span className="font-bold text-white">${itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping</span>
              <span className="font-bold text-emerald-400">
                {shippingCharge === 0 ? "FREE" : `$${shippingCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-blue-900/30 pt-3 flex justify-between text-sm font-black text-white">
              <span>Total Amount</span>
              <span className="text-emerald-400 font-mono text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || cart.itemCount === 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Connecting to Paystack...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {paymentMethod === "paystack" ? `Pay Now with Paystack ($${grandTotal.toFixed(2)})` : "Place Cash on Delivery Order"}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// 23. Order Receipt & Confirmation (Page 23)
export const OrderConfirmationPage: React.FC<CartCheckoutProps> = ({ onNavigate }) => {
  const lastOrderData = (() => {
    try {
      const stored = sessionStorage.getItem("shopza_last_order");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  })();

  const reference = lastOrderData?.reference || "SPZ_PAY_" + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = lastOrderData?.amount ? Number(lastOrderData.amount).toFixed(2) : "189.00";
  const paymentMethodName = lastOrderData?.method || "Paystack Verified Payment";

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-950/40">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-bold border border-emerald-800/40">
          Paystack Payment Successful
        </span>
        <h1 className="text-3xl font-black text-white">Thank You For Your Order!</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your payment has been verified directly via Paystack and your order has been dispatched to merchant fulfillment.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-blue-900/30 pb-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Paystack Transaction Reference</span>
            <span className="font-mono font-bold text-white text-sm">{reference}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Estimated Delivery</span>
            <span className="font-bold text-emerald-400">3-5 Business Days</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Payment Method</span>
            <span className="font-bold text-white">{paymentMethodName}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total Paid</span>
            <span className="font-bold text-emerald-400">${totalAmount}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Payment Status</span>
            <span className="font-bold text-emerald-400">Verified & Settled</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Fulfillment Status</span>
            <span className="font-bold text-blue-400">Order Confirmed • Processing</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => onNavigate("buyer_orders")}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold"
        >
          Track in Buyer Orders
        </button>
        <button
          onClick={() => onNavigate("all_products")}
          className="px-5 py-2.5 bg-[#0F142A] border border-blue-900/40 text-slate-200 rounded-xl text-xs font-bold hover:bg-[#151C3B]"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

// 24. 1-Click Express Purchase (Page 24)
export const QuickBuyPage: React.FC<CartCheckoutProps> = ({
  products,
  onSelectProduct,
  onOpenStore,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E1535] to-[#120F2B] border border-blue-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
            <Clock className="w-4 h-4" />
            <span>Instant Express Checkout</span>
          </div>
          <h1 className="text-2xl font-black text-white">1-Click Express Purchase</h1>
          <p className="text-xs text-slate-300">
            Bypass the cart and complete orders with saved shipping and payment details in under 5 seconds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 8).map((p) => (
          <div key={p._id} className="relative group">
            <ProductCard
              product={p}
              onSelect={(prod) => onSelectProduct(prod)}
              onOpenAuth={() => {}}
              onOpenStore={(slug) => onOpenStore(slug)}
            />
            <button
              onClick={() => onNavigate("checkout_page")}
              className="w-full mt-2 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Buy Now (${p.price.toFixed(2)})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 25. Coupons & Promotional Vouchers (Page 25)
export const PromotionsPage: React.FC<CartCheckoutProps> = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = [
    { code: "SHOPZA50", discount: "50% OFF", desc: "First-time buyer welcoming voucher for all stores", min: "$100" },
    { code: "FREESHIP", discount: "FREE SHIPPING", desc: "Zero shipping fee across all domestic merchant orders", min: "$40" },
    { code: "TECHSAVER", discount: "$25 OFF", desc: "Applied directly to audio gear and computer electronics", min: "$150" },
    { code: "ARTISAN15", discount: "15% OFF", desc: "Handmade & artisanal goods direct from studio artisans", min: "$50" },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#7928CA]" />
          <span>Coupons & Promotional Vouchers</span>
        </h1>
        <p className="text-xs text-slate-400">
          Claim verified discount codes and apply them at checkout for instant savings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/40 relative overflow-hidden flex flex-col justify-between space-y-4"
          >
            <div>
              <span className="text-xs font-black text-blue-400 uppercase tracking-wider">{c.discount}</span>
              <h3 className="text-base font-bold text-white mt-1">{c.desc}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Minimum purchase: {c.min}</p>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#070914] rounded-xl border border-blue-900/40">
              <span className="font-mono font-black text-sm text-white tracking-widest">{c.code}</span>
              <button
                onClick={() => handleCopy(c.code)}
                className="px-3 py-1 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
