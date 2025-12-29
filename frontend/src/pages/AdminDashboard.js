import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productsAPI, ordersAPI, usersAPI } from "../services/api";
import Alert from "../components/Alert";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "jerseys",
    price: "",
    image: "",
    sku: "",
    sizes: [{ size: "XS", stock: 0 }],
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === "products") {
        const response = await productsAPI.getAllProducts({ limit: 100 });
        setProducts(response.data.data);
      } else if (activeTab === "orders") {
        const response = await ordersAPI.getAllOrders();
        setOrders(response.data.data);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...productForm.sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === "stock" ? parseInt(value) : value,
    };
    setProductForm((prev) => ({
      ...prev,
      sizes: updatedSizes,
    }));
  };

  const addSizeField = () => {
    setProductForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "M", stock: 0 }],
    }));
  };

  const removeSizeField = (index) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.price ||
      !productForm.image ||
      !productForm.sku
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await productsAPI.createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
      });

      setMessage("Product added successfully!");
      setProductForm({
        name: "",
        description: "",
        category: "jerseys",
        price: "",
        image: "",
        sku: "",
        sizes: [{ size: "XS", stock: 0 }],
      });

      loadDashboardData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productsAPI.deleteProduct(id);
      setMessage("Product deleted successfully!");
      loadDashboardData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      setMessage("Order status updated!");
      loadDashboardData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {message && <Alert type="success" message={message} />}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📋 Orders
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === "products" && (
          <div className="admin-section">
            {/* Add Product Form */}
            <div className="admin-card">
              <h2>Add New Product</h2>
              <form onSubmit={handleAddProduct} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={productForm.sku}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductInputChange}
                      required
                    >
                      <option value="jerseys">Jerseys</option>
                      <option value="boots">Boots</option>
                      <option value="balls">Balls</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductInputChange}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductInputChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="sizes-section">
                  <label>Sizes & Stock</label>
                  {productForm.sizes.map((sizeData, index) => (
                    <div key={index} className="size-row">
                      <input
                        type="text"
                        placeholder="Size (e.g., XS, S, M, L, XL)"
                        value={sizeData.size}
                        onChange={(e) =>
                          handleSizeChange(index, "size", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={sizeData.stock}
                        onChange={(e) =>
                          handleSizeChange(index, "stock", e.target.value)
                        }
                      />
                      {productForm.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSizeField(index)}
                          className="btn btn-danger btn-small"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSizeField}
                    className="btn btn-secondary"
                  >
                    + Add Size
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="admin-card">
              <h2>Products ({products.length})</h2>
              <div className="products-table">
                <div className="table-header">
                  <div className="col-name">Name</div>
                  <div className="col-category">Category</div>
                  <div className="col-price">Price</div>
                  <div className="col-stock">Stock</div>
                  <div className="col-actions">Actions</div>
                </div>

                {products.map((product) => {
                  const totalStock =
                    product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
                  return (
                    <div key={product._id} className="table-row">
                      <div className="col-name">{product.name}</div>
                      <div className="col-category">{product.category}</div>
                      <div className="col-price">₹{product.price}</div>
                      <div className="col-stock">{totalStock}</div>
                      <div className="col-actions">
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="btn btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === "orders" && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>All Orders ({orders.length})</h2>
              <div className="orders-table">
                <div className="table-header">
                  <div className="col-id">Order ID</div>
                  <div className="col-customer">Customer</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>

                {orders.map((order) => (
                  <div key={order._id} className="table-row">
                    <div className="col-id">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="col-customer">{order.user?.name}</div>
                    <div className="col-amount">
                      ₹{order.totalPrice.toFixed(2)}
                    </div>
                    <div className="col-status">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order._id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-actions">
                      <span className="text-small">{order.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
