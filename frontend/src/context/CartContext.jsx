import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Change this to your backend URL once deployed
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://my-shop-backend-z7jb.onrender.com");

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [Cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use localStorage for now since backend endpoints are disabled
  useEffect(() => {
    const fetchCart = () => {
      const localCart = JSON.parse(localStorage.getItem("Cart") || "[]");
      setCart(localCart);
      setLoading(false);
    };

    fetchCart();
  }, [user]);

  // Update localStorage when Cart changes
  useEffect(() => {
    localStorage.setItem("Cart", JSON.stringify(Cart));
  }, [Cart, user]);

  const addToCart = async (product, size) => {
    const newItem = {
      ...product,
      size,
      CartId: `${product.id || product._id}-${size}`,
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.CartId === newItem.CartId);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.CartId === newItem.CartId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item,
        );
      } else {
        updated = [...prev, { ...newItem, quantity: 1 }];
      }
      return updated;
    });

    // Note: Backend sync disabled temporarily
  };

  const removeFromCart = async (CartId) => {
    setCart((prev) => prev.filter((item) => item.CartId !== CartId));

    // Note: Backend sync disabled temporarily
  };

  const updateQuantity = async (CartId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.CartId === CartId) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );

    // Note: Backend sync disabled temporarily
  };

  const getCartTotal = () => {
    return Cart.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.setItem("Cart", JSON.stringify([]));
  };

  const value = {
    Cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

