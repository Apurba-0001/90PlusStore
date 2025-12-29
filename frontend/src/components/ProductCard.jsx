import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <Link to={`/product/${product._id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="relative aspect-square bg-gray-200 overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-base">No Image</span>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-base">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-base mb-1.5 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-1.5">{product.category}</p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <StarRating rating={product.rating || 0} readonly={true} />
            <span className="text-sm text-gray-600">
              ({product.reviews?.length || 0})
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-blue-600">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500">
              {product.stock} in stock
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 text-white py-1.5 text-base rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
