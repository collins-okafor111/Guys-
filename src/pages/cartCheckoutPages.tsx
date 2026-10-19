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
} from "lucide-react";
import { Product, Store, CartItem } from "../types";
import { ProductCard } from "../components/products/ProductCard";

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
              <span>Shopza 100% Escrow Buyer Protection</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 22. Secure Checkout & Payment (Page 22)
export const CheckoutPage: React.FC<CartCheckoutProps> = ({
  cart,
  onNavigate,
  currentUser,
  onOpenAuth,
}) => {
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onNavigate("order_confirmation");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <span>Secure Checkout & Payment</span>
        </h1>
        <p className="text-xs text-slate-400">
          Encrypted 256-bit SSL transaction backed by Shopza Buyer Guarantee
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>1. Shipping Destination</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={currentUser?.name || "Jane Doe"}
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 234-5678"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Street Address</label>
                <input
                  type="text"
                  defaultValue="742 Evergreen Terrace, Suite 4B"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  defaultValue="Springfield"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ZIP / Postal Code</label>
                <input
                  type="text"
                  defaultValue="97477"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7928CA]" />
              <span>2. Payment Method</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-950/40 text-white"
                    : "border-blue-900/40 bg-[#070914] text-slate-400"
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                onClick={() => setPaymentMethod("escrow")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  paymentMethod === "escrow"
                    ? "border-blue-500 bg-blue-950/40 text-white"
                    : "border-blue-900/40 bg-[#070914] text-slate-400"
                }`}
              >
                Shopza Escrow Pay
              </button>
            </div>
            <div className="space-y-3 text-xs pt-1">
              <div>
                <label className="text-slate-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Expiration</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">CVC Code</label>
                  <input
                    type="password"
                    defaultValue="•••"
                    className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Box */}
        <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-5 h-fit">
          <h3 className="text-sm font-bold text-white">Order Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Total</span>
              <span className="font-bold text-white">${cart.grandTotal > 0 ? cart.grandTotal.toFixed(2) : "189.00"}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping</span>
              <span className="font-bold text-emerald-400">FREE</span>
            </div>
            <div className="border-t border-blue-900/30 pt-3 flex justify-between text-sm font-black text-white">
              <span>Total Amount</span>
              <span className="text-[#00C2FF]">${cart.grandTotal > 0 ? cart.grandTotal.toFixed(2) : "189.00"}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Securing Transaction...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 23. Order Receipt & Confirmation (Page 23)
export const OrderConfirmationPage: React.FC<CartCheckoutProps> = ({ onNavigate }) => {
  const orderNumber = "SPZ-" + Math.floor(100000 + Math.random() * 900000);
  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-950/40">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-blue-950/70 text-blue-300 text-xs font-bold border border-blue-800/40">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-black text-white">Thank You For Your Order!</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your order has been placed successfully and dispatched to the merchant's fulfillment queue.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-blue-900/30 pb-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Order Reference</span>
            <span className="font-mono font-bold text-white text-sm">{orderNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Estimated Delivery</span>
            <span className="font-bold text-emerald-400">3-5 Business Days</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Status</span>
            <span className="font-bold text-blue-400">Awaiting Merchant Dispatch</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Escrow Protection</span>
            <span className="font-bold text-emerald-400">Active (Funds Held Securely)</span>
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
