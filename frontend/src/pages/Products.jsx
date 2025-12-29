import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../services/services";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedGender, setSelectedGender] = useState(
    searchParams.get("gender") || ""
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || ""
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getAvailableSizes = () => {
    if (selectedCategory === "Footwear") {
      return ["6", "7", "8", "9", "10", "11", "12", "13", "14"];
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  };

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
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(
          selectedCategory || undefined,
          page,
          search || undefined
        );
        let filteredProducts = response.data.products;

        // Only apply additional filters if NOT searching
        // When searching, show all matching results
        if (!search) {
          // Filter by gender (only if product has gender field)
          if (selectedGender) {
            filteredProducts = filteredProducts.filter(
              (product) => !product.gender || product.gender === selectedGender
            );
          }

          // Filter by size (only if product has availableSizes)
          if (selectedSize) {
            filteredProducts = filteredProducts.filter(
              (product) =>
                !product.availableSizes ||
                product.availableSizes.includes(selectedSize)
            );
          }
        }

        setProducts(filteredProducts);
        setTotalPages(response.data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, search, page, selectedGender, selectedSize]);

  return (
    <div>
      {/* Categories Section - Hidden when searching */}
      {!search && (
        <section className="bg-gray-100 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name: "Jerseys", emoji: "👕" },
                { name: "Jackets and Sweatshirts", emoji: "🧥" },
                { name: "Footwear", emoji: "👟" },
                { name: "Shorts", emoji: "🩳" },
                { name: "Tracksuits", emoji: "🏃" },
                { name: "Special Collectibles", emoji: "⭐" },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setPage(1);
                  }}
                  className={`bg-white p-4 sm:p-6 rounded-lg text-center hover:shadow-lg transition ${
                    selectedCategory === category.name
                      ? "ring-2 ring-blue-600"
                      : ""
                  }`}
                >
                  <div className="text-2xl sm:text-4xl mb-2">
                    {category.emoji}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {category.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 ${
              showMobileFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="bg-white rounded-lg shadow sticky top-20 overflow-y-auto max-h-screen">
              {/* Gender Filter */}
              <div className="p-4 sm:p-6 border-b">
                <h3 className="font-bold mb-4 text-lg">Shop for</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedGender("");
                      setPage(1);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded text-sm sm:text-base ${
                      selectedGender === ""
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => {
                        setSelectedGender(gender);
                        setPage(1);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded text-sm sm:text-base ${
                        selectedGender === gender
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="p-4 sm:p-6 border-b">
                <h3 className="font-bold mb-4 text-lg">
                  Size{selectedCategory === "Footwear" && " (UK)"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(selectedSize === size ? "" : size)
                      }
                      className={`px-3 py-2 rounded text-sm font-semibold transition ${
                        selectedSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div className="p-4 sm:p-6">
                <h3 className="font-bold mb-4 text-lg">Categories</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                    setShowMobileFilters(false);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
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

          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-gray-100 rounded-lg">
                <p className="text-gray-600">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 sm:px-4 py-2 border rounded text-sm sm:text-base ${
                          page === p
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 sm:px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
