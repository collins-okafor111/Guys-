import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useConvex } from "../../context/ConvexContext";
import { useAuth } from "../../context/AuthContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { getCart, updateCartQuantity, removeFromCart } = useConvex();

  if (!isOpen) return null;

  const cart = currentUser ? getCart(currentUser._id) : { items: [], itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 };
  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, (cart.subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-blue-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d101d] shadow-2xl border-l border-purple-900/30 flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">
                Your Shopping Cart ({cart.itemCount})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#15192e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          {cart.items.length > 0 && (
            <div className="px-5 py-3 bg-[#13162b] border-b border-purple-900/30">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-200 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-purple-400" />
                  {cart.subtotal >= freeShippingThreshold
                    ? "You unlocked FREE standard shipping!"
                    : `Add $${(freeShippingThreshold - cart.subtotal).toFixed(2)} more for FREE shipping`}
                </span>
                <span className="font-bold text-purple-400">{progressToFreeShipping.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0c16] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!currentUser ? (
              <div className="text-center py-12 px-4">
                <ShoppingBag className="w-12 h-12 text-purple-400/60 mx-auto mb-3" />
                <h4 className="font-bold text-white text-sm">Please sign in to view your cart</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Your cart is saved securely to your personal account.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/40"
                >
                  Sign In to Continue
                </button>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-[#12162a] border border-purple-900/40 flex items-center justify-center mx-auto mb-3 text-purple-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Explore products published by verified sellers on Shopza.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/40"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-[#12162a] rounded-xl border border-purple-900/30 shadow-sm flex gap-3 items-center"
                >
                  <img
                    src={item.product?.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                    alt={item.product?.title || "Product"}
                    className="w-16 h-16 rounded-lg object-cover bg-[#090b14] border border-purple-900/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-400 font-medium truncate">
                      {item.product?.storeName}
                    </p>
                    <h5 className="text-xs font-bold text-white truncate">
                      {item.product?.title}
                    </h5>
                    <p className="text-xs font-bold text-purple-300 mt-0.5">
                      ${item.product?.price.toFixed(2)}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-purple-900/40 bg-[#0a0c16] rounded-lg">
                        <button
                          onClick={() =>
                            currentUser &&
                            updateCartQuantity({
                              cartItemId: item._id,
                              userId: currentUser._id,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="p-1 hover:bg-[#1a1f3c] text-purple-300 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            currentUser &&
                            updateCartQuantity({
                              cartItemId: item._id,
                              userId: currentUser._id,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="p-1 hover:bg-[#1a1f3c] text-purple-300 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          currentUser &&
                          removeFromCart({ cartItemId: item._id, userId: currentUser._id })
                        }
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {currentUser && cart.items.length > 0 && (
            <div className="p-5 border-t border-purple-900/30 bg-[#0a0c16] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-white">
                    {cart.shippingFee === 0 ? "FREE" : `$${cart.shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-purple-900/30">
                  <span>Total</span>
                  <span className="text-purple-300">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL encrypted checkout & buyer protection</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
