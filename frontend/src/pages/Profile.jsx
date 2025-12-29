import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/services";

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        setOrders(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Name</p>
            <p className="font-bold break-words">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-bold break-all text-sm sm:text-base">
              {user?.email}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="font-bold">{user?.isAdmin ? "Admin" : "User"}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">My Orders</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-bold">{order._id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Products</p>
                    <p className="font-bold text-sm">
                      {order.products.map((p) => p.name).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-bold capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold">₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {expandedOrder === order._id ? "▲" : "▼"}
                  </button>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-bold mb-4 text-lg">Order Details</h3>
                    <div className="space-y-3">
                      {order.products.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity:{" "}
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-lg">Order Status:</p>
                        <span
                          className={`px-3 py-1 rounded font-semibold capitalize text-sm ${
                            order.status === "delivered"
                              ? "bg-green-200 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-200 text-red-800"
                              : order.status === "shipped"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
