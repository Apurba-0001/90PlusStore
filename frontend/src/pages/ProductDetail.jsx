import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productService, authService } from "../services/services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

const minSwipeDistance = 50;

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  // Categories that require size selection (all except Collectibles)
  const requiresSize =
    product?.category && product.category !== "Special Collectibles";

  const getAllSizeOptions = () => {
    if (product?.category === "Footwear") {
      return ["6", "7", "8", "9", "10", "11", "12", "13", "14"];
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  };

  const getAvailableSizes = () => {
    // If product has availableSizes defined, use those
    if (product?.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes;
    }
    // Otherwise, return all possible sizes for that category
    return getAllSizeOptions();
  };

  const isAvailable = (size) => {
    if (!product?.availableSizes || product.availableSizes.length === 0) {
      return true; // All sizes available if availableSizes is not specified
    }
    return product.availableSizes.includes(size);
  };

  const onTouchStart = (e) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && product?.images) {
      // Swipe left - next image
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }

    if (isRightSwipe && product?.images) {
      // Swipe right - previous image
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id);
        setProduct(response.data);

        // Fetch reviews
        const reviewsRes = await productService.getProductReviews(id);
        setReviews(reviewsRes.data.reviews || []);

        // Check if product is in wishlist
        if (user) {
          try {
            const wishlistRes = await authService.getWishlist();
            const wishlistIds = wishlistRes.data.wishlist;
            setIsInWishlist(wishlistIds.includes(id));
          } catch (err) {
            console.error("Error fetching wishlist:", err);
            // Fall back to checking localStorage
            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            setIsInWishlist(wishlist.includes(id));
          }
        } else {
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          setIsInWishlist(wishlist.includes(id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      setSizeError("⚠️ Please select a size before adding to cart");
      setTimeout(() => setSizeError(""), 3000);
      return;
    }
    setSizeError("");
    addToCart(product, quantity, selectedSize || null);
    setSelectedSize("");
    if (user?.isAdmin) {
      alert("✓ Product added to cart!");
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      // Use localStorage for non-logged-in users
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      if (isInWishlist) {
        wishlist = wishlist.filter((productId) => productId !== id);
        setIsInWishlist(false);
      } else {
        wishlist.push(id);
        setIsInWishlist(true);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } else {
      // Use API for logged-in users
      try {
        const response = await authService.toggleWishlist(id);
        setIsInWishlist(!isInWishlist);
        if (user?.isAdmin) {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        if (user?.isAdmin) {
          alert("Error updating wishlist");
        }
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      if (user?.isAdmin) {
        alert("Please login to submit a review");
      }
      return;
    }

    if (newRating === 0) {
      if (user?.isAdmin) {
        alert("Please select a rating");
      }
      return;
    }

    try {
      setSubmittingReview(true);
      await productService.addReview(id, newRating, newComment);

      // Refresh reviews
      const reviewsRes = await productService.getProductReviews(id);
      setReviews(reviewsRes.data.reviews || []);

      // Refresh product to get updated rating
      const response = await productService.getProductById(id);
      setProduct(response.data);

      // Reset form
      setNewRating(0);
      setNewComment("");
      if (user?.isAdmin) {
        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      // Check if error is about duplicate review
      if (user?.isAdmin) {
        if (error.response?.data?.message?.includes("already reviewed")) {
          alert(error.response.data.message);
        } else {
          alert("Error submitting review. Please try again.");
        }
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Check if current user has already reviewed this product
  const userHasReviewed =
    user && reviews.some((review) => review.userId === user.id);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!product)
    return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Image Carousel */}
        <div className="flex flex-col gap-4">
          {/* Main Image Display */}
          <div
            className="relative overflow-hidden rounded-lg shadow-lg bg-gray-100 touch-pan-y aspect-square"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImageIndex].url}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                />

                {/* Wishlist Heart Button */}
                <button
                  onClick={handleAddToWishlist}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition transform hover:scale-110"
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <svg
                    className={`w-6 h-6 transition ${
                      isInWishlist
                        ? "text-red-600 fill-current"
                        : "text-gray-400"
                    }`}
                    fill={isInWishlist ? "currentColor" : "none"}
                    stroke={isInWishlist ? "none" : "currentColor"}
                    viewBox="0 0 24 24"
                    strokeWidth={isInWishlist ? "0" : "2"}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>

                {/* Navigation Arrows (only show if multiple images) */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? product.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === product.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-center">
                  No Image Available
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Slider (only show if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition snap-start ${
                      index === currentImageIndex
                        ? "border-blue-600 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {product.category}
          </p>

          {/* Rating Display */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating || 0} readonly={true} />
            <span className="text-gray-600">
              {product.rating ? product.rating.toFixed(1) : "0.0"} (
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
              ₹{product.price}
            </span>
            <span
              className={`px-4 py-2 rounded text-sm sm:text-base inline-block ${
                product.stock > 0
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          {product.brand && (
            <p className="mb-4 text-sm sm:text-base">
              <span className="font-bold">Brand:</span> {product.brand}
            </p>
          )}

          {product.sku && (
            <p className="mb-6 text-sm sm:text-base">
              <span className="font-bold">Product ID:</span> {product.sku}
            </p>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <label className="block font-bold text-lg mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden w-fit bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-4 sm:px-5 py-2 hover:bg-blue-100 transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setQuantity(
                          Math.min(Math.max(1, value), product.stock)
                        );
                      }}
                      max={product.stock}
                      min="1"
                      className="w-20 text-center border-l-2 border-r-2 border-gray-300 py-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(quantity + 1, product.stock))
                      }
                      disabled={quantity >= product.stock}
                      className="px-4 sm:px-5 py-2 hover:bg-blue-100 transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Max available: {product.stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Price:</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    ₹{(product.price * quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Size Selector (only for products that require size) */}
          {requiresSize && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                sizeError
                  ? "bg-red-50 border-red-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h3 className="font-bold text-lg mb-4">
                Select Size {product?.category === "Footwear" && "(UK)"}{" "}
                <span className="text-red-600">*</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {getAllSizeOptions().map((size) => {
                  const available = isAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        available && setSelectedSize(size);
                        setSizeError("");
                      }}
                      disabled={!available}
                      className={`px-3 py-2 rounded font-semibold transition ${
                        !available
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : selectedSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-300 hover:border-blue-600 hover:bg-blue-50 cursor-pointer"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="text-red-600 font-semibold mt-3 text-sm">
                  {sizeError}
                </p>
              )}
              {product?.availableSizes && product.availableSizes.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Available sizes shown in white. Out of stock sizes are grayed
                  out.
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400 mb-4 text-sm sm:text-base"
          >
            Add to Cart
          </button>

          {/* Reviews Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {/* Submit Review Form */}
            {user ? (
              userHasReviewed ? (
                <div className="bg-blue-50 p-6 rounded-lg mb-8 text-center border border-blue-200">
                  <p className="text-blue-700 font-medium">
                    ✓ You have already reviewed this product
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Thank you for your feedback! You can only submit one review
                    per product.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <StarRating rating={newRating} onChange={setNewRating} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Your Review (optional)
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Share your thoughts about this product..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview || newRating === 0}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              )
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
                <p className="text-gray-600">Please login to write a review</p>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                reviews.map((review, index) => (
                  <div key={index} className="border-b pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {review.userName || "Anonymous"}
                        </p>
                        <StarRating rating={review.rating} readonly={true} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
