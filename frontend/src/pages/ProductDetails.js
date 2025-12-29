import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProductById(id);
      setProduct(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    addToCart(product, quantity, selectedSize);
    setMessage("✓ Added to cart successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading)
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );

  if (error || !product) {
    return (
      <div className="container">
        <Alert type="error" message={error || "Product not found"} />
        <button
          onClick={() => navigate("/products")}
          className="btn btn-secondary"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  const inStock = totalStock > 0;

  return (
    <div className="product-details">
      <div className="container">
        <button onClick={() => navigate("/products")} className="back-btn">
          ← Back to Products
        </button>

        <div className="details-wrapper">
          {/* Image Section */}
          <div className="image-section">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="breadcrumb">{product.category}</div>
            <h1>{product.name}</h1>

            <div className="rating">
              <span>⭐ {product.rating || "N/A"} / 5</span>
            </div>

            <div className="price-section">
              <h2 className="price">₹{product.price}</h2>
              <p
                className={`stock-status ${
                  inStock ? "in-stock" : "out-of-stock"
                }`}
              >
                {inStock ? `${totalStock} in stock` : "Out of stock"}
              </p>
            </div>

            <p className="description">{product.description}</p>

            {message && <Alert type="success" message={message} />}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {inStock && (
              <div className="purchase-section">
                <div className="form-group">
                  <label>Select Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="size-select"
                  >
                    <option value="">-- Choose a size --</option>
                    {product.sizes?.map((sizeData) => (
                      <option key={sizeData.size} value={sizeData.size}>
                        {sizeData.size}{" "}
                        {sizeData.stock > 0
                          ? `(${sizeData.stock} available)`
                          : "(Out of stock)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group quantity-section">
                  <label>Quantity</label>
                  <div className="quantity-control">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-secondary btn-small"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                      className="quantity-input"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="btn btn-secondary btn-small"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="btn btn-primary btn-block"
                  style={{ fontSize: "1.1rem", padding: "15px" }}
                >
                  🛒 Add to Cart
                </button>
              </div>
            )}

            {!inStock && (
              <div className="out-of-stock-message">
                This product is currently out of stock
              </div>
            )}

            <div className="features">
              <h3>Product Features</h3>
              <ul>
                <li>✓ 100% Authentic</li>
                <li>✓ Premium Quality</li>
                <li>✓ Multiple Sizes Available</li>
                <li>✓ Easy Returns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
