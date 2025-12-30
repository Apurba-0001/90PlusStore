import React, { useState, useEffect } from "react";
import { productService } from "../services/services";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch featured products from database
        const response = await productService.getProducts(null, 1);
        const allProducts = response.data.products;

        // Filter for featured products (from isFeatured field)
        const featured = allProducts.filter((product) => product.isFeatured);

        setFeaturedProducts(featured);
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
            className="bg-white text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold hover:bg-gray-100 transition transform hover:scale-105 inline-block text-base sm:text-lg shadow-lg"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Featured Products
        </h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-lg">
              No featured products yet. Check back soon!
            </p>
            <a
              href="/products"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Browse All Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
      </section>
    </div>
  );
}
