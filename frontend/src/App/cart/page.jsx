// src/App/cart/page.jsx
"use client";

import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Building2,
  Calculator,
  ArrowRight,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

// --- Simple UI components ---
const Button = ({ children, onClick, disabled, className, type, ...props }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

// --- Main Cart Page ---
export default function CartPage() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  const handleQuantityChange = (id, change) => {
    const item = cart.find((i) => i._id === id);
    if (item) updateQuantity(id, Math.max(1, item.quantity + change));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="mx-auto w-40 h-40 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
            <ShoppingCart className="w-20 h-20 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-6">
            Your Cart is Empty
          </h1>
          <p className="text-emerald-700 text-lg mb-10 max-w-md mx-auto">
            Start building your dream project by adding architectural plans and
            designs
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-lime-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
                <p className="text-emerald-100">
                  Review your architectural selections
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                onClick={clearCart}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
            <div className="p-8 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">
                  Your Items
                </h2>
                <p className="text-emerald-700">
                  {cart.length} architectural design
                  {cart.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="divide-y divide-emerald-100">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="p-8 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-lime-50/50 transition-all duration-300"
                >
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-lime-100 to-emerald-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Building2 className="w-10 h-10 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-emerald-900 mb-2 truncate">
                        {item.name || item.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-emerald-600 font-semibold text-lg">
                          KES {item.price.toLocaleString()}
                        </span>
                        <span className="text-emerald-500">per plan</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gradient-to-r from-emerald-100 to-lime-100 rounded-xl overflow-hidden shadow-inner">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="p-3 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-emerald-700" />
                        </button>
                        <span className="px-6 py-3 font-bold text-emerald-900 min-w-[4rem] text-center bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="p-3 hover:bg-lime-200 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-lime-700" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-emerald-100 flex justify-between items-center">
                    <span className="text-emerald-600 font-medium">
                      Item subtotal:
                    </span>
                    <span className="font-bold text-xl text-emerald-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden sticky top-8">
            <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-lime-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">
                    KES {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-medium">VAT (16%):</span>
                  <span className="font-semibold">
                    KES {vat.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-gradient-to-r from-emerald-200 to-lime-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-emerald-900">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-emerald-900">
                    KES {total.toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={() => (window.location.href = "/checkout")}
                  className="w-full bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-700 hover:from-emerald-700 hover:via-lime-700 hover:to-emerald-800 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center gap-3">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-emerald-700 text-sm text-center font-medium">
                  🏗️ Professional architectural designs ready for construction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
