import React, { useState, useEffect } from "react";
import { productService } from "../../services/services";

export default function AdminFeatured() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(null, page);
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        const featuredRes = await productService.getFeaturedProducts();
        setFeaturedProducts(
          (featuredRes.data.products || []).map((p) => p._id)
        );
      } catch (err) {
        setError("Error loading products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const toggleFeatured = async (productId) => {
    try {
      const res = await productService.toggleFeatured(productId);
      const isNowFeatured = res.data.product?.isFeatured;
      setFeaturedProducts((prev) => {
        const set = new Set(prev);
        if (isNowFeatured) {
          set.add(productId);
        } else {
          set.delete(productId);
        }
        return Array.from(set);
      });
      setSuccess(
        `Product ${isNowFeatured ? "added to" : "removed from"} featured`
      );
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error(err);
      setError("Error updating featured status");
      setTimeout(() => setError(null), 3000);
    }
  };

  const isFeatured = (productId) => featuredProducts.includes(productId);

  if (loading) {
    return <p className="text-center py-8">Loading products...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Featured Products</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded text-green-800">
          ✓ {success}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <p className="text-blue-800">
          <strong>Current Featured Products:</strong> {featuredProducts.length}{" "}
          selected
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Check the products below that you want to feature on the home page
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">
                <input type="checkbox" disabled />
              </th>
              <th className="text-left p-4">Product Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={isFeatured(product._id)}
                    onChange={() => toggleFeatured(product._id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <strong>{product.name}</strong>
                </td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">₹{product.price}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  {isFeatured(product._id) ? (
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-bold">
                      ★ Featured
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm">
                      Not Featured
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-4 py-2 border rounded ${
              page === p ? "bg-blue-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Info */}
      <div className="flex justify-end gap-4 text-sm text-gray-600">
        Changes are saved instantly when you toggle a product.
      </div>
    </div>
  );
}
