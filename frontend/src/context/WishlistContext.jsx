import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { authService } from "../services/services";
import { productService } from "../services/services";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist on mount or when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);

        if (user?.isAdmin) {
          setWishlist([]);
          return;
        }

        if (user) {
          // Logged-in user: fetch from database
          try {
            const response = await authService.getWishlist();
            const productIds = response.data.wishlist;

            // Fetch full product details
            if (productIds && productIds.length > 0) {
              const products = await Promise.all(
                productIds.map((id) => productService.getProductById(id))
              );
              setWishlist(
                products.map((p) => p.data).filter((p) => p !== undefined)
              );
            } else {
              setWishlist([]);
            }

            // Clear localStorage when logged in (use DB instead)
            localStorage.removeItem("wishlist");
          } catch (err) {
            console.error("Error fetching wishlist from database:", err);
            // Fallback to localStorage
            const savedWishlist = localStorage.getItem("wishlist");
            if (savedWishlist) {
              setWishlist(JSON.parse(savedWishlist));
            }
          }
        } else {
          // Not logged in: use localStorage
          const savedWishlist = localStorage.getItem("wishlist");
          if (savedWishlist) {
            try {
              setWishlist(JSON.parse(savedWishlist));
            } catch (err) {
              console.error("Error loading wishlist from localStorage:", err);
            }
          } else {
            setWishlist([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  // Save to localStorage only if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = async (product) => {
    if (user?.isAdmin) {
      alert("Admins cannot use wishlist.");
      return;
    }
    setWishlist((prev) => {
      // Check if product already exists
      if (prev.some((item) => item._id === product._id)) {
        return prev;
      }
      return [...prev, product];
    });

    // Sync to database if user is logged in
    if (user) {
      try {
        await authService.toggleWishlist(product._id);
      } catch (err) {
        console.error("Error syncing wishlist to database:", err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (user?.isAdmin) {
      alert("Admins cannot use wishlist.");
      return;
    }
    setWishlist((prev) => prev.filter((item) => item._id !== productId));

    // Sync to database if user is logged in
    if (user) {
      try {
        await authService.toggleWishlist(productId);
      } catch (err) {
        console.error("Error syncing wishlist to database:", err);
      }
    }
  };

  const toggleWishlist = (product) => {
    if (user?.isAdmin) {
      alert("Admins cannot use wishlist.");
      return;
    }
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
