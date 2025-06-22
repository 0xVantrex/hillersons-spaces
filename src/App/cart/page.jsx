"use client";
import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Building2,
  Calculator,
  CheckCircle,
  ArrowRight,
  Package
} from "lucide-react";
import { saveOrder } from "../../lib/firebase/saveOrder";
import { logPurchase } from "../../lib/firebase/logPurchase";
import { getAuth } from "firebase/auth";

// CartContext hook
const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("hills_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("hills_cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hills_cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id, newQuantity) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return { cart, updateQuantity, removeItem, clearCart };
};

// Simple UI Components
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

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${className}`}
    {...props}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-vertical ${className}`}
    {...props}
  />
);

export default function CartPage() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateTotal, setAnimateTotal] = useState(false);
  const { cart, clearCart, updateQuantity, removeItem } = useCart();
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 300);
    return () => clearTimeout(timer);
  }, [total]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!contact.name || !contact.email || !contact.phone) {
      alert("Please fill in all contact fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await saveOrder({ form: contact, cart, total });

      if (result?.orderRef) {
        clearCart();
        setShowWhatsApp(true);
        setOrderSuccess(true);

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          for (const item of cart) {
            await logPurchase(user.uid, item.id);
          }
        }

        setTimeout(() => {
          const whatsappURL = `https://wa.me/254763831806?text=${encodeURIComponent(result.whatsappMessage)}`;
          window.location.href = whatsappURL;
        }, 2000);
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (error) {
      alert("Order failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mb-8">
              <ShoppingCart className="w-16 h-16 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Cart is Empty</h1>
            <p className="text-slate-600 mb-8">Discover our premium building consultancy services and products</p>
            <Button 
              onClick={() => window.history.back()} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {orderSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-100 border border-emerald-500 text-emerald-800 px-6 py-4 rounded-lg shadow-2xl z-50 animate-in slide-in-from-right-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Order placed successfully! Redirecting to WhatsApp...</span>
          </div>
        </div>
      )}

      {showWhatsApp && (
        <a
          href={`https://wa.me/254763831806`}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all transform hover:scale-110 z-50 animate-bounce"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Your Cart
              </h1>
            </div>
            <p className="text-slate-600 text-lg">Review your selected products and proceed to checkout</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-semibold text-slate-800">
                      Cart Items ({cart.length})
                    </h2>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-200">
                  {cart.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-6 hover:bg-slate-50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1 truncate">
                            {item.name || item.title}
                          </h3>
                          <p className="text-emerald-600 font-bold text-lg">
                            KES {item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="p-2 hover:bg-slate-200 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-2 hover:bg-slate-200 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-semibold text-slate-800">
                            KES {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkout Form & Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-semibold text-slate-800">Order Summary</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (16%):</span>
                    <span>KES {vat.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className={`flex justify-between text-xl font-bold text-slate-800 transition-all duration-300 ${animateTotal ? 'scale-105 text-emerald-600' : ''}`}>
                      <span>Total:</span>
                      <span>KES {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-xl font-semibold text-slate-800">Contact Information</h2>
                  <p className="text-slate-600 text-sm mt-1">We'll use WhatsApp for order processing</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid gap-4">
                    <Input
                      name="name"
                      placeholder="Full Name *"
                      value={contact.name}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address *"
                      value={contact.email}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Input
                      name="phone"
                      placeholder="Phone Number *"
                      value={contact.phone}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <Textarea
                    name="notes"
                    placeholder="Delivery notes or special instructions (optional)"
                    value={contact.notes}
                    onChange={handleChange}
                    rows={4}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Order...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Proceed to WhatsApp
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Your order will be sent via WhatsApp for manual payment processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}