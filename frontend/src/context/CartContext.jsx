import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { authService } from "../services/services";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const ADD_TO_CART_COOLDOWN_MS = 1200;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const addCooldownRef = useRef(new Map());

  const getCartItemKey = (product, size = null) => {
    const productId = product?._id || product?.id;
    if (!productId) return null;
    return size ? `${productId}-${size}` : `${productId}`;
  };

  // Fetch cart from server if user is logged in
  useEffect(() => {
    if (user?.isAdmin) {
      setCart([]);
      return;
    }

    if (user) {
      fetchCart();
    } else {
      // Use localStorage for non-logged-in users
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save to localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await authService.getCart();
      const cartItems = response.data.cart
        .map((item) => {
          // Handle cases where productId might not be populated
          if (!item.productId) {
            console.warn("Cart item has no product data:", item);
            return null;
          }
          return {
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.images?.[0]?.url || null,
            quantity: item.quantity,
            size: item.size || null,
          };
        })
        .filter((item) => item !== null); // Remove items with missing product data
      setCart(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]); // Clear cart on error to avoid showing stale data
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, size = null) => {
    if (user?.isAdmin) {
      alert("Admins cannot add items to cart.");
      return false;
    }

    const itemKey = getCartItemKey(product, size);
    if (!itemKey) {
      return false;
    }

    const now = Date.now();
    const lastAttempt = addCooldownRef.current.get(itemKey) || 0;
    if (now - lastAttempt < ADD_TO_CART_COOLDOWN_MS) {
      return false;
    }

    addCooldownRef.current.set(itemKey, now);

    if (user) {
      try {
        await authService.addToCart(product._id, quantity, size);
        await fetchCart();
        return true;
      } catch (error) {
        console.error("Error adding to cart:", error);
        addCooldownRef.current.delete(itemKey);
        return false;
      }
    } else {
      // Local storage for non-logged-in users
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.id === product._id && (!size || item.size === size),
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product._id && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [
          ...prevCart,
          {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || null,
            quantity,
            size: size || null,
          },
        ];
      });
      return true;
    }
  };

  const removeFromCart = async (productId) => {
    if (user?.isAdmin) {
      alert("Admins cannot modify cart.");
      return;
    }
    if (user) {
      try {
        await authService.removeFromCart(productId);
        await fetchCart();
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (user?.isAdmin) {
      alert("Admins cannot modify cart.");
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      try {
        await authService.updateCartQuantity(productId, quantity);
        await fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = async () => {
    if (user?.isAdmin) {
      alert("Admins cannot modify cart.");
      return;
    }
    if (user) {
      try {
        await authService.clearCart();
      } catch (error) {
        console.error("Error clearing cart:", error);
      } finally {
        // Always re-sync from backend so UI matches server state.
        await fetchCart();
      }
    } else {
      setCart([]);
    }
  };

  const syncCart = async () => {
    if (user) {
      await fetchCart();
      return;
    }

    const savedCart = localStorage.getItem("cart");
    setCart(savedCart ? JSON.parse(savedCart) : []);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
        addToCartCooldownMs: ADD_TO_CART_COOLDOWN_MS,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
