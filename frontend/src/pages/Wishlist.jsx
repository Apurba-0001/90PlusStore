import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { productService, authService } from "../services/services";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);
        let wishlistIds = [];

        if (user) {
          // Fetch from server for logged-in users
          try {
            const wishlistRes = await authService.getWishlist();
            wishlistIds = wishlistRes.data.wishlist;
          } catch (err) {
            console.error("Error fetching wishlist from server:", err);
            // Fall back to localStorage
            wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
          }
        } else {
          // Get from localStorage for non-logged-in users
          wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
        }

        if (wishlistIds.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all products
        const response = await productService.getProducts(null, 1);
        const allProducts = response.data.products;

        // Filter to only show wishlist products
        const wishlist = allProducts.filter((product) =>
          wishlistIds.includes(product._id)
        );

        setWishlistProducts(wishlist);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [user]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      if (user) {
        // Remove from server for logged-in users
        await authService.toggleWishlist(productId);
      } else {
        // Remove from localStorage for non-logged-in users
        const wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
        const updatedWishlist = wishlistIds.filter((id) => id !== productId);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      }

      // Refresh wishlist data after removal
      setWishlistProducts(wishlistProducts.filter((p) => p._id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      if (user?.isAdmin) {
        alert("Error removing from wishlist");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">My Wishlist</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
          <a
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => handleRemoveFromWishlist(product._id)}
                className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition z-10"
                title="Remove from wishlist"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
