import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productService, authService } from "../services/services";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import ProductDetailSkeleton from "../components/ProductDetailSkeleton";

const minSwipeDistance = 50;

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mobileScrollRef, setMobileScrollRef] = useState(null);
  const [desktopScrollRef, setDesktopScrollRef] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [adminReviewError, setAdminReviewError] = useState("");
  const [adminReviewSaving, setAdminReviewSaving] = useState(false);
  const [reviewSort, setReviewSort] = useState("newest");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Dynamic similar products count based on screen size
  const getSimilarProductsCount = () => {
    if (windowWidth < 640) return 6; // Mobile: XS
    if (windowWidth < 768) return 8; // Mobile: SM
    if (windowWidth < 1024) return 10; // Tablet: MD
    if (windowWidth < 1280) return 12; // Laptop: LG
    return 15; // Desktop: XL+
  };

  const similarProductsCount = getSimilarProductsCount();

  // Handle window resize for responsive products count
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Categories that require size selection (all except Accessories and Special Collectibles)
  const requiresSize =
    product?.category &&
    product.category !== "Special Collectibles" &&
    product.category !== "Accessories";

  const scrollLeft = (ref) => {
    if (ref) {
      ref.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (ref) => {
    if (ref) {
      ref.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

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

        // Fetch related products from the same category
        if (response.data.category) {
          const allProductsRes = await productService.getProducts(
            undefined,
            1,
            undefined,
            1000 // Request all products with high limit
          );
          const products =
            allProductsRes.data.products || allProductsRes.data || [];
          const sameCategoryProducts = products.filter(
            (p) =>
              p.category === response.data.category &&
              p._id !== response.data._id
          );
          setRelatedProducts(sameCategoryProducts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const refreshReviews = async () => {
    try {
      const reviewsRes = await productService.getProductReviews(id);
      setReviews(reviewsRes.data.reviews || []);
      setProduct((prev) =>
        prev ? { ...prev, rating: reviewsRes.data.rating ?? prev.rating } : prev
      );
    } catch (err) {
      setAdminReviewError(
        err?.response?.data?.message || "Failed to refresh reviews"
      );
    }
  };

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    switch (reviewSort) {
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "rating-high":
        return list.sort((a, b) => {
          if (b.rating === a.rating) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return b.rating - a.rating;
        });
      case "rating-low":
        return list.sort((a, b) => {
          if (a.rating === b.rating) {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
          return a.rating - b.rating;
        });
      case "newest":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [reviews, reviewSort]);

  const handleAddToCart = () => {
    if (user?.isAdmin) {
      alert("Admins cannot add to cart.");
      return;
    }
    if (requiresSize && !selectedSize) {
      setSizeError("⚠️ Please select a size before adding to cart");
      setTimeout(() => setSizeError(""), 3000);
      return;
    }
    setSizeError("");
    addToCart(product, quantity, selectedSize || null);
    setSelectedSize("");
  };

  const handleAddToWishlist = () => {
    if (user?.isAdmin) {
      alert("Admins cannot use wishlist.");
      return;
    }
    if (product) {
      toggleWishlist(product);
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

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setAdminReviewError("");
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
    setAdminReviewError("");
  };

  const handleUpdateReview = async () => {
    if (!editRating || editRating < 1 || editRating > 5) {
      setAdminReviewError("Rating must be between 1 and 5");
      return;
    }

    setAdminReviewSaving(true);
    try {
      await productService.updateReview(
        product._id,
        editingReviewId,
        editRating,
        editComment
      );
      await refreshReviews();
      cancelEditReview();
    } catch (err) {
      setAdminReviewError(
        err?.response?.data?.message ||
          "Failed to update review. Please try again."
      );
    } finally {
      setAdminReviewSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("Delete this review?");
    if (!confirmDelete) return;

    setAdminReviewSaving(true);
    try {
      await productService.deleteReview(product._id, reviewId);
      await refreshReviews();
      cancelEditReview();
    } catch (err) {
      setAdminReviewError(
        err?.response?.data?.message ||
          "Failed to delete review. Please try again."
      );
    } finally {
      setAdminReviewSaving(false);
    }
  };

  // Check if current user has already reviewed this product
  const userHasReviewed =
    user && reviews.some((review) => review.userId === user.id);

  if (loading) return <ProductDetailSkeleton />;

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center max-w-md">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Product not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Image Carousel */}
          <div className="flex flex-col gap-4 md:max-w-md md:mx-auto">
            {/* Main Image Display */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-lg bg-gray-100 touch-pan-y aspect-square border-2 border-gray-200 ring-1 ring-gray-300 w-full max-w-sm mx-auto"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex].url}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain select-none"
                    draggable="false"
                  />

                  {/* Wishlist Heart Button (hidden for admins) */}
                  {!user?.isAdmin && (
                    <button
                      onClick={handleAddToWishlist}
                      className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition transform hover:scale-110"
                      aria-label={
                        product && isInWishlist(product._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <svg
                        className={`w-6 h-6 transition ${
                          product && isInWishlist(product._id)
                            ? "text-red-600 fill-current"
                            : "text-gray-400"
                        }`}
                        fill={
                          product && isInWishlist(product._id)
                            ? "currentColor"
                            : "none"
                        }
                        stroke={
                          product && isInWishlist(product._id)
                            ? "none"
                            : "currentColor"
                        }
                        viewBox="0 0 24 24"
                        strokeWidth={
                          product && isInWishlist(product._id) ? "0" : "2"
                        }
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>
                  )}

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

            {/* Thumbnail Slider */}
            {product.images && product.images.length > 0 && (
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
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="font-bold text-base mb-2">Description:</p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </div>

            {product.brand && (
              <p className="mb-4 text-sm sm:text-base">
                <span className="font-bold">Brand:</span> {product.brand}
              </p>
            )}

            {product.productId && (
              <p className="mb-6 text-sm sm:text-base">
                <span className="font-bold">Product ID:</span>{" "}
                {product.productId}
              </p>
            )}

            {!user?.isAdmin && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Quantity Selector */}
                  <div className="flex-1">
                    <label className="block font-bold text-base mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden w-fit bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 hover:bg-blue-100 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-16 text-center border-l-2 border-r-2 border-gray-300 py-1.5 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(quantity + 1, product.stock))
                        }
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 hover:bg-blue-100 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Max available: {product.stock}
                    </p>
                  </div>

                  {/* Size Selector (only for products that require size) */}
                  {requiresSize && (
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-4">
                        Select Size {product?.category === "Footwear" && "(UK)"}{" "}
                        <span className="text-red-600">*</span>
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {getAllSizeOptions().map((size) => {
                          const available = isAvailable(size);
                          return (
                            <button
                              key={size}
                              onClick={() => {
                                available && setSelectedSize(size);
                                available && setSizeError(false);
                              }}
                              disabled={!available}
                              className={`py-2 px-2 text-sm border-2 rounded-lg font-semibold transition-all ${
                                selectedSize === size
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : available
                                  ? "border-gray-300 hover:border-blue-400"
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              } ${
                                sizeError && !selectedSize
                                  ? "ring-2 ring-red-300"
                                  : ""
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      {sizeError && (
                        <p className="text-red-600 text-sm mt-2">
                          Please select a size
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Centered on Page (hidden for admins) */}
        {!user?.isAdmin && (
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl px-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400 text-base shadow-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`flex-1 py-3 px-6 rounded-lg font-bold transition text-base shadow-lg border-2 flex items-center justify-center gap-2 ${
                  product && isInWishlist(product._id)
                    ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {product && isInWishlist(product._id)
                  ? "In Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>
          </div>
        )}

        {/* Related Products Section (hidden for admins) */}
        {!user?.isAdmin && relatedProducts.length > 0 && (
          <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Similar Products from {product.category}
            </h2>

            {/* Mobile: Horizontal scroll with max 10 cards */}
            <div className="relative md:hidden">
              {/* Left Arrow */}
              <button
                onClick={() => scrollLeft(mobileScrollRef)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition transform hover:scale-110"
                aria-label="Scroll left"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
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

              {/* Scrollable Container */}
              <div
                ref={(el) => setMobileScrollRef(el)}
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-6"
              >
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    to={`/product/${relatedProduct._id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-400 overflow-hidden group flex-shrink-0 w-32 hover:-translate-y-1"
                  >
                    {/* 1:1 Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3
                        className="text-sm font-semibold text-gray-800 mb-1.5 truncate"
                        title={relatedProduct.name}
                      >
                        {relatedProduct.name}
                      </h3>
                      <p className="text-base font-bold text-blue-600">
                        ₹{relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollRight(mobileScrollRef)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition transform hover:scale-110"
                aria-label="Scroll right"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
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
            </div>

            {/* Desktop: Horizontal scroll with max 15 cards */}
            <div className="relative hidden md:block">
              {/* Left Arrow */}
              <button
                onClick={() => scrollLeft(desktopScrollRef)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition transform hover:scale-110"
                aria-label="Scroll left"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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

              {/* Scrollable Container */}
              <div
                ref={(el) => setDesktopScrollRef(el)}
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-10"
              >
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    to={`/product/${relatedProduct._id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-400 overflow-hidden group flex-shrink-0 w-40 hover:-translate-y-1"
                  >
                    {/* 1:1 Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3
                        className="text-sm font-semibold text-gray-800 mb-1.5 truncate"
                        title={relatedProduct.name}
                      >
                        {relatedProduct.name}
                      </h3>
                      <p className="text-base font-bold text-blue-600">
                        ₹{relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollRight(desktopScrollRef)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition transform hover:scale-110"
                aria-label="Scroll right"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 pt-6 border-t bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sort</span>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating-high">Rating: High to Low</option>
                <option value="rating-low">Rating: Low to High</option>
              </select>
            </div>
          </div>

          {user?.isAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-yellow-800">
                  Admin Review Management
                </h3>
                {adminReviewSaving && (
                  <span className="text-sm text-yellow-700">Saving...</span>
                )}
              </div>
              {adminReviewError && (
                <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded">
                  {adminReviewError}
                </div>
              )}

              {sortedReviews.length === 0 ? (
                <p className="text-yellow-700">
                  No reviews for this product yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedReviews.map((review) => (
                    <div
                      key={review._id || review.userId || Math.random()}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.userName || "Anonymous"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-700">
                            {review.rating} ★
                          </span>
                          {editingReviewId !== review._id && (
                            <button
                              onClick={() => startEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {editingReviewId === review._id ? (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Rating (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={editRating}
                              onChange={(e) =>
                                setEditRating(parseInt(e.target.value) || 0)
                              }
                              className="w-24 border border-gray-300 rounded px-3 py-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Comment
                            </label>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              rows="3"
                              placeholder="Update comment"
                            ></textarea>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleUpdateReview}
                              disabled={adminReviewSaving}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditReview}
                              disabled={adminReviewSaving}
                              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        review.comment && (
                          <p className="text-gray-700 mt-2">{review.comment}</p>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!user?.isAdmin &&
            (user ? (
              userHasReviewed ? (
                <div className="bg-blue-50 p-6 rounded-lg mb-8 text-center border border-blue-200 shadow-sm">
                  <p className="text-blue-700 font-medium">
                    ✓ You have already reviewed this product
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Thank you for your feedback! You can only submit one review
                    per product.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 shadow-sm">
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
              <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center border border-gray-200 shadow-sm">
                <p className="text-gray-600">Please login to write a review</p>
              </div>
            ))}

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              sortedReviews.map((review, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white ring-1 ring-gray-100 hover:ring-2 hover:ring-blue-200 transition-all"
                >
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
  );
}
