import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/services";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

export default function Products() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedGender, setSelectedGender] = useState(
    searchParams.get("gender") || "",
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "",
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  // Responsive products per page: 20 for mobile, 30 for desktop
  const getProductsPerPage = () => {
    return windowWidth < 768 ? 20 : 30; // Mobile: 20, Desktop: 30
  };

  const productsPerPage = getProductsPerPage();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getAvailableSizes = () => {
    if (selectedCategory === "Footwear") {
      return ["6", "7", "8", "9", "10", "11", "12", "13", "14"];
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  };

  const isAdmin = user?.isAdmin;
  const sizes = getAvailableSizes();
  const genders = ["Men", "Women", "Kids"];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const searchParam = searchParams.get("search") || "";
    setSearch(searchParam);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedGender, selectedSize, search, productsPerPage]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const genderFilter = !search ? selectedGender || undefined : undefined;
        const sizeFilter = !search ? selectedSize || undefined : undefined;

        const response = await productService.getProducts(
          selectedCategory || undefined,
          page,
          search || undefined,
          productsPerPage, // Responsive: 20 for mobile, 30 for desktop
          genderFilter,
          sizeFilter,
        );

        let filteredProducts = response.data.products || [];

        // Apply sorting
        if (sortBy && sortBy !== "default") {
          filteredProducts = [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
              case "featured":
                return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
              case "price-low-high":
                return a.price - b.price;
              case "price-high-low":
                return b.price - a.price;
              case "name-asc":
                return a.name.localeCompare(b.name);
              case "name-desc":
                return b.name.localeCompare(a.name);
              case "rating":
                return (b.rating || 0) - (a.rating || 0);
              default:
                return 0;
            }
          });
        }

        const pages = Math.max(response.data?.pagination?.pages || 1, 1);
        if (page > pages) {
          setPage(pages);
          return;
        }

        setProducts(filteredProducts);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    selectedCategory,
    search,
    page,
    selectedGender,
    selectedSize,
    sortBy,
    productsPerPage,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories Section - Hidden when searching */}
      {!search && (
        <section className="bg-gradient-to-br from-gray-100 to-gray-50 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isAdmin ? "View by Category" : "Shop by Category"}
              </h2>
              <p className="text-gray-500 mt-2">
                Find exactly what you're looking for
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
              {[
                { name: "Jerseys", emoji: "👕" },
                { name: "Jackets and Sweatshirts", emoji: "🧥" },
                { name: "Footwear", emoji: "👟" },
                { name: "Shorts", emoji: "🩳" },
                { name: "Tracksuits", emoji: "🏃🏻‍♂️" },
                { name: "Special Collectibles", emoji: "🎁" },
                { name: "Accessories", emoji: "⚽" },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setPage(1);
                  }}
                  className={`bg-white p-4 sm:p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    selectedCategory === category.name
                      ? "border-blue-500 shadow-lg shadow-blue-500/20"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="text-2xl sm:text-4xl mb-2">
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                    {category.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Products
            </h1>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            >
              <option value="">Sort by</option>
              <option value="default">Default</option>
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating">Rating: High to Low</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all bg-white"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Floating Filter Panel */}
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
              onClick={() => setShowMobileFilters(false)}
            ></div>

            {/* Floating Filter Tab */}
            <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl z-40 overflow-y-auto">
              {/* Close Button */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-bold text-lg">Filters</h2>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Gender Filter */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-800">Shop for</h3>
                  <select
                    value={selectedGender}
                    onChange={(e) => {
                      setSelectedGender(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">All</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-800">
                    Size{selectedCategory === "Footwear" && " (UK)"}
                  </h3>
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">All Sizes</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories Filter */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-800">
                    Categories
                  </h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                      setShowMobileFilters(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">All Products</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main content full width */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 mb-8">
              {Array.from({ length: productsPerPage }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h2>
              <p className="text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    hideAddToCart={true}
                  />
                ))}
              </div>

              {/* Pagination - Only show if more than 1 page */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-8">
                  {/* Mobile: Simplified pagination (Previous/Next only) */}
                  <div className="flex md:hidden gap-2 w-full">
                    <button
                      onClick={() => {
                        setPage(Math.max(1, page - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === 1}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                    >
                      ← Previous
                    </button>
                    <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        {page} / {totalPages}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setPage(Math.min(totalPages, page + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === totalPages}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Desktop: Full pagination with all page numbers */}
                  <div className="hidden md:flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => {
                        setPage(Math.max(1, page - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === 1}
                      className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`px-4 py-2.5 border-2 rounded-xl text-sm sm:text-base font-medium transition-all ${
                            page === p
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => {
                        setPage(Math.min(totalPages, page + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === totalPages}
                      className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
