import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../services/api";
import Alert from "../components/Alert";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Please log in to place an order");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Validate shipping info
    if (
      !shippingInfo.street ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zipCode ||
      !shippingInfo.country
    ) {
      setError("Please fill in all shipping information");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        products: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
        })),
        shippingAddress: shippingInfo,
        paymentMethod,
      };

      const response = await ordersAPI.createOrder(orderData);
      setMessage("Order placed successfully! Redirecting...");
      clearCart();
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !message) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your Cart is Empty</h2>
            <p>Add some football merchandise to get started!</p>
            <button
              onClick={() => navigate("/products")}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {message && <Alert type="success" message={message} />}

        <div className="cart-wrapper">
          {/* Cart Items */}
          <section className="cart-items">
            <div className="items-header">
              <h2>Items in Cart ({cartItems.length})</h2>
            </div>

            <div className="items-list">
              {cartItems.map((item) => (
                <div
                  key={`${item.product._id}-${item.size}`}
                  className="cart-item"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="item-image"
                  />

                  <div className="item-details">
                    <h3>{item.product.name}</h3>
                    <p className="size-info">
                      Size: <strong>{item.size}</strong>
                    </p>
                    <p className="price">₹{item.product.price}</p>
                  </div>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="btn btn-secondary btn-small"
                    >
                      −
                    </button>
                    <span className="qty">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="btn btn-secondary btn-small"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    ₹{item.product.price * item.quantity}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product._id, item.size)}
                    className="btn btn-danger btn-small"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary & Checkout */}
          <aside className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <form onSubmit={handlePlaceOrder}>
                <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
                  Shipping Address
                </h3>

                <div className="form-group">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={shippingInfo.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <h3 style={{ marginTop: "20px", marginBottom: "15px" }}>
                  Payment Method
                </h3>

                <div className="payment-options">
                  {["card", "upi", "netbanking"].map((method) => (
                    <label key={method} className="payment-option">
                      <input
                        type="radio"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{method.toUpperCase()}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                  style={{
                    marginTop: "20px",
                    fontSize: "1.1rem",
                    padding: "15px",
                  }}
                >
                  {loading ? "Placing Order..." : "✓ Place Order"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
