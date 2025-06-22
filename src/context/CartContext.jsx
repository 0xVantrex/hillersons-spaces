//src/context/CartContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
const CART_LOCALSTORAGE_KEY = "hills_cart";


export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(CART_LOCALSTORAGE_KEY);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(CART_LOCALSTORAGE_KEY);
      }
    }
  }, []);

  const updateQuantity = (id,newQuantity) => {
    setCart(prev => prev.map (item => item.id === id ? { ...item, quantity: Math.max(1,newQuantity) } : item
  ));
  };

  const addItem = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider 
    value={{ 
      cart,
      addItem, 
      removeItem, 
      clearCart,
      updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
