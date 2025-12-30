import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/services";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getFeaturedProducts();
        setFeaturedProducts(response.data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-10 sm:py-12 md:py-16 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-blue-900 to-transparent"></div>

        {/* Football Field Background */}
        <div className="absolute inset-0 opacity-15">
          {/* Field lines pattern */}
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1200 400"
          >
            {/* Horizontal lines (field width) */}
            <line
              x1="0"
              y1="50"
              x2="1200"
              y2="50"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="350"
              x2="1200"
              y2="350"
              stroke="white"
              strokeWidth="1"
            />
            {/* Vertical lines (field divisions) */}
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="400"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="400"
              y1="0"
              x2="400"
              y2="400"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="600"
              y1="0"
              x2="600"
              y2="400"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="800"
              y1="0"
              x2="800"
              y2="400"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="1000"
              y1="0"
              x2="1000"
              y2="400"
              stroke="white"
              strokeWidth="2"
            />
            {/* Center circle */}
            <circle
              cx="600"
              cy="200"
              r="100"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            />
            <circle cx="600" cy="200" r="6" fill="white" />
            {/* Penalty areas */}
            <rect
              x="30"
              y="75"
              width="120"
              height="250"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x="1050"
              y="75"
              width="120"
              height="250"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            {/* Goal areas */}
            <rect
              x="30"
              y="120"
              width="60"
              height="160"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x="1110"
              y="120"
              width="60"
              height="160"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Decorative football icons */}
        <div className="absolute -top-20 -left-20 opacity-20 animate-pulse">
          <svg
            className="w-48 h-48 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <ellipse cx="12" cy="12" rx="10" ry="8" />
            <line x1="8" y1="6" x2="8" y2="18" stroke="white" strokeWidth="1" />
            <line
              x1="12"
              y1="6"
              x2="12"
              y2="18"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="16"
              y1="6"
              x2="16"
              y2="18"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div
          className="absolute -bottom-24 -right-24 opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        >
          <svg
            className="w-72 h-72 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <ellipse cx="12" cy="12" rx="10" ry="8" />
            <line x1="8" y1="6" x2="8" y2="18" stroke="white" strokeWidth="1" />
            <line
              x1="12"
              y1="6"
              x2="12"
              y2="18"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="16"
              y1="6"
              x2="16"
              y2="18"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Stars/sparkles */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full opacity-30 animate-pulse"></div>
        <div
          className="absolute top-32 left-32 w-2 h-2 bg-white rounded-full opacity-25"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-32 right-40 w-2 h-2 bg-white rounded-full opacity-20"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 drop-shadow-lg tracking-tight">
            Welcome to 90PlusStore
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 drop-shadow-md font-light max-w-2xl mx-auto">
            Where matchday gear meets everyday wear
          </p>
          <a
            href="/products"
            className="bg-white text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-base sm:text-lg shadow-xl shadow-blue-900/30"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {isAdmin ? "View Products" : "Shop Now"}
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-md border border-red-100 p-8 text-center">
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
          ) : featuredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No featured products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Check back soon for our top picks!
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Browse All Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  hideAddToCart={true}
                  isFeatured={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
