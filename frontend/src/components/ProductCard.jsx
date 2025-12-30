import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

export default function ProductCard({
  product,
  hideAddToCart = false,
  isFeatured = false,
}) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (user?.isAdmin) return;
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (user?.isAdmin) return;
    toggleWishlist(product);
  };

  const wishlisted = isInWishlist(product._id);

  // Calculate discount percentage if original price exists
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Link to={`/product/${product._id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 ring-1 ring-gray-100 hover:ring-2 hover:ring-gray-200 overflow-hidden group h-full flex flex-col hover:-translate-y-0.5">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-base">No Image</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {!user?.isAdmin && (
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition transform hover:scale-110 border border-gray-100"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  wishlisted
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
                fill={wishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">Sold Out</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 min-h-[3rem]">
            <h3
              className="font-bold text-sm sm:text-base line-clamp-2 flex-1 hover:text-blue-600 transition cursor-pointer"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-1">
            {product.brand || product.category}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <StarRating
              rating={product.rating || 0}
              readonly={true}
              size="small"
            />
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ({product.reviews?.length || 0})
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-bold text-xl text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {!hideAddToCart && !user?.isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
