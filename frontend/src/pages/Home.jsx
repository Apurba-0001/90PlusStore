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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Welcome to 90PlusStore
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            Where matchday gear meets everyday wear
          </p>
          <a
            href="/products"
            className="bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-200 transition inline-block text-sm sm:text-base"
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
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
