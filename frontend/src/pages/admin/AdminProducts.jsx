import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/services";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(
          null,
          page,
          null,
          ITEMS_PER_PAGE
        );
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const response = await productService.toggleFeatured(id);
      // Update product in list
      setProducts(
        products.map((p) =>
          p._id === id
            ? { ...p, isFeatured: response.data.product.isFeatured }
            : p
        )
      );
      alert(response.data.message);
    } catch (err) {
      alert("Error toggling featured status: " + err.message);
    }
  };

  const getSortedProducts = () => {
    const sorted = [...products];

    sorted.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Sort Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 mb-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end flex-1">
                <div>
                  <label className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                    </svg>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-48 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold text-gray-700 transition-all"
                  >
                    <option value="createdAt">📅 Date Added</option>
                    <option value="name">📝 Product Name</option>
                    <option value="price">💰 Price</option>
                    <option value="stock">📦 Stock</option>
                    <option value="category">🏷️ Category</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 18h6v-2H3v2zM3 5v2h18V5H3zm0 7h12v-2H3v2z" />
                    </svg>
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full sm:w-40 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold text-gray-700 transition-all"
                  >
                    <option value="desc">⬇️ Descending</option>
                    <option value="asc">⬆️ Ascending</option>
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-xl px-4 py-2 border-2 border-blue-200 shadow-sm w-full sm:w-auto">
                <p className="text-xs text-gray-600 font-semibold">
                  Total Products
                </p>
                <p className="text-xl font-bold text-blue-600">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Product ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Featured</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedProducts().map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">
                      <span className="font-bold text-blue-600">
                        {product.productId || "-"}
                      </span>
                    </td>
                    <td className="p-4 max-w-[150px] sm:max-w-xs">
                      <div className="truncate" title={product.name}>
                        {product.name}
                      </div>
                    </td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4">₹{product.price}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(product._id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                          product.isFeatured
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md"
                        }`}
                      >
                        {product.isFeatured ? "★ Featured" : "☆ Add"}
                      </button>
                    </td>
                    <td className="p-4 space-x-2 flex">
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            <div className="w-full text-center text-sm text-gray-600 mb-2">
              Showing {total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} -
              {Math.min(page * ITEMS_PER_PAGE, total)} of {total} products
              &nbsp;|&nbsp; Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  page === p
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "border-2 border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
