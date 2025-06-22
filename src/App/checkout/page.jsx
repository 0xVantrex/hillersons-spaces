"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveOrder } from "../../lib/firebase/checkout";
import { MessageCircle } from "lucide-react";
import { logPurchase } from "../../lib/firebase/logPurchase";
import { auth } from "../../firebase";
import { getAuth } from "firebase/auth";


export default function CheckoutPage() {
const [showWhatsApp, setShowWhatsApp] = useState(false);
const [orderSuccess, setOrderSuccess] = useState(false);
  const { cart, clearCart } = useCart();
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contact.name || !contact.email || !contact.phone) {
      alert("Please fill in all contact fields.");
      return;
    }

    const result = await saveOrder(cart, total, contact);

    if (result?.orderRef) {

        clearCart();
        setShowWhatsApp (true);
        setOrderSuccess (true);

        
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          for (const item of cart) {
            await logPurchase(user.uid, item.id);
            //item.id = product ID
          }
        }
        

        setTimeout(() => {
         
            const whatsappURL = `https://wa.me/${254763831806}?text=
            ${encodeURIComponent(result.whatsappMessage)}`;
              window.location.href = whatsappURL;
            }, 2000);
    }       else {
        alert("Order failed. Please try again.");
    }
  };


  return (
    <>
     {orderSuccess && (
  <div className="fixed top-6 right-6 bg-green-100 border border-green-500 text-green-800 px-4 py-3 rounded shadow-lg z-50">
    ✅ Order placed successfully! Redirecting to WhatsApp...
  </div>
)}

{showWhatsApp && (
  <a
    href={`https://wa.me/254763831806`} 
    className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-50"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
)}

    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty. Please add some products.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="name"
              placeholder="Full Name"
              value={contact.name}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={contact.email}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              placeholder="Phone Number"
              value={contact.phone}
              onChange={handleChange}
              required
            />
          </div>

          <Textarea
            name="notes"
            placeholder="Delivery notes or instructions (optional)"
            value={contact.notes}
            onChange={handleChange}
          />

          <div className="border-t pt-4">
            <p>Subtotal: KES {subtotal.toLocaleString()}</p>
            <p>VAT (16%): KES {vat.toLocaleString()}</p>
            <p className="text-xl font-semibold">Total: KES {total.toLocaleString()}</p>
          </div>

          <Button type="submit" className="mt-4 w-full">
            Place Order
          </Button>
        </form>
      )}
    </div>
    </>
  );
  }
