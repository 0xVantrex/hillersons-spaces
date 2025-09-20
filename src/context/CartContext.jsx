import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../../src/lib/api.js";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);

  // Load cart from backend or localStorage
  useEffect(() => {
    const initCart = async () => {
      if (user && token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.items || []);
          }
        } catch (err) {
          console.error("Failed to load cart:", err);
        }
      } else {
        try {
          let sessionId = localStorage.getItem("guestSessionId");
          if (sessionId) {
            const guestRes = await fetch(
              `${API_BASE_URL}/api/cart/guest?sessionId=${sessionId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (guestRes.ok) {
              const guestData = await guestRes.json();
              setCart(guestData.items || []);
              return;
            }
          }
        } catch (err) {
          console.log("No guest cart found, using localStorage");
        }
        // Fall back to localStorage
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
      }
    };
    initCart();
  }, [user, token]);

  // Persist cart to backend or localStorage
  useEffect(() => {
    const saveCart = async () => {
      if (!cart || cart.length === 0) return;

      if (user && token) {
        try {
          await fetch(`${API_BASE_URL}/api/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: cart }),
          });
        } catch (err) {
          console.error("Failed to sync cart:", err);
        }
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));

        try {
          let sessionId = localStorage.getItem("guestSessionId");
          if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("guestSessionId", sessionId);
          }
          await fetch(`${API_BASE_URL}/api/cart/guest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cart, sessionId }),
          });
        } catch (err) {
          console.error("Failed to save guest cart:", err);
        }
      }
    };
    saveCart();
  }, [cart, user, token]);

  const addToCart = (item) => {
    const itemId = item._id;
    setCart((prev) => {
      const exists = prev.find((i) => i._id === itemId);
      if (exists) {
        return prev.map((i) =>
          i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i._id !== id));

  const updateQuantity = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i))
    );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
