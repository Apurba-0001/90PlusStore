import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f7931e",
      confirmed: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#666";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {error && <Alert type="error" message={error} />}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <button
              onClick={() => navigate("/products")}
              className="btn btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="order-status"
                    style={{ borderColor: getStatusColor(order.status) }}
                  >
                    <span style={{ color: getStatusColor(order.status) }}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items</h4>
                  {order.products?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.product?.name}</span>
                      <span>Size: {item.size}</span>
                      <span>Qty: {item.quantity}</span>
                      <span className="price">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-address">
                  <h4>Shipping Address</h4>
                  <p>
                    {order.shippingAddress?.street}
                    <br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.zipCode}
                    <br />
                    {order.shippingAddress?.country}
                  </p>
                </div>

                <div className="order-total">
                  <span>Total Amount:</span>
                  <span className="amount">₹{order.totalPrice.toFixed(2)}</span>
                </div>

                <div className="order-footer">
                  <p>
                    Payment Method:{" "}
                    <strong>{order.paymentMethod?.toUpperCase()}</strong>
                  </p>
                  <p>
                    Payment Status:{" "}
                    <strong>{order.paymentStatus?.toUpperCase()}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
