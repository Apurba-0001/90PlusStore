import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import Alert from "../components/Alert";
import "./ProductListing.css";

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["jerseys", "boots", "balls", "accessories"];

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await productsAPI.getAllProducts(params);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="product-listing">
      <div className="container">
        <h1>Shop Products</h1>

        {error && <Alert type="error" message={error} />}

        <div className="listing-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="filter-section">
              <h3>Categories</h3>
              <div className="category-filters">
                {categories.map((cat) => (
                  <label key={cat} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    <span className="category-label">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="btn btn-primary btn-block">
                  Search
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <section className="products-section">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-products">
                No products found. Try changing your filters.
              </div>
            ) : (
              <>
                <div className="grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn btn-secondary btn-small"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="btn btn-secondary btn-small"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
