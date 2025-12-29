import React, { useState, useEffect } from "react";
import { orderService } from "../../services/services";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderService.getAllOrders(
          status || undefined,
          page
        );
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, page]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      alert("Order status updated successfully");
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg font-semibold">
            📦 No orders found
          </p>
          <p className="text-gray-500 mt-2">
            {status
              ? "No orders match the selected status filter."
              : "There are no orders yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center cursor-pointer">
                  <div
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                  >
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-bold">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-bold">
                      {order.userId?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold">₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sizes</p>
                    <p className="font-bold text-sm">
                      {order.products
                        .filter((p) => p.size)
                        .map((p) => p.size)
                        .join(", ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded text-sm font-bold border-0 ${
                        order.status === "delivered"
                          ? "bg-green-200 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="text-gray-600 hover:text-gray-800 transition"
                  >
                    {expandedOrder === order._id ? "▲" : "▼"}
                  </button>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4 pt-4 border-t space-y-6">
                    {/* Products Details */}
                    <div>
                      <h3 className="font-bold text-lg mb-3">
                        Products Ordered
                      </h3>
                      <div className="bg-gray-50 p-4 rounded border">
                        {order.products.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start pb-3 border-b last:border-b-0 last:pb-0"
                          >
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity:{" "}
                                <span className="font-semibold">
                                  {item.quantity}
                                </span>
                              </p>
                              {item.size && (
                                <p className="text-sm text-gray-600">
                                  Size:{" "}
                                  <span className="font-semibold">
                                    {item.size}
                                  </span>
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                Price: ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div>
                        <h3 className="font-bold text-lg mb-3">
                          Shipping Address
                        </h3>
                        <div className="bg-gray-50 p-4 rounded border">
                          <p className="text-sm mb-1">
                            <span className="font-semibold">Street:</span>{" "}
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-sm mb-1">
                            <span className="font-semibold">City:</span>{" "}
                            {order.shippingAddress.city}
                          </p>
                          <p className="text-sm mb-1">
                            <span className="font-semibold">State:</span>{" "}
                            {order.shippingAddress.state}
                          </p>
                          <p className="text-sm mb-1">
                            <span className="font-semibold">Country:</span>{" "}
                            {order.shippingAddress.country}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Zip Code:</span>{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Shipping Details */}
                    {order.shippingAddress && (
                      <div>
                        <h3 className="font-bold text-lg mb-3">
                          Shipping Details
                        </h3>
                        <div className="bg-gray-50 p-4 rounded border">
                          <p className="text-sm mb-2">
                            <span className="font-semibold">
                              Shipping Type:
                            </span>{" "}
                            <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                              {order.shippingAddress.shippingType || "Standard"}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">
                              Contact Number:
                            </span>{" "}
                            {order.shippingAddress.mobile}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Information */}
                    <div>
                      <h3 className="font-bold text-lg mb-3">
                        Payment Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded border">
                        <p className="text-sm mb-3">
                          <span className="font-semibold">Payment Method:</span>{" "}
                          <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {order.paymentMethod}
                          </span>
                        </p>

                        {/* Credit Card Details */}
                        {order.paymentMethod === "credit-card" &&
                          order.shippingAddress?.cardHolderName && (
                            <div className="bg-white p-3 rounded border border-blue-200">
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Card Holder Name:
                                </span>{" "}
                                {order.shippingAddress.cardHolderName}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Card Number:
                                </span>{" "}
                                {order.shippingAddress.cardNumber?.slice(-4)
                                  ? `****-****-****-${order.shippingAddress.cardNumber.slice(
                                      -4
                                    )}`
                                  : "Not available"}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Expiry Date:
                                </span>{" "}
                                {order.shippingAddress.expiryDate ||
                                  "Not available"}
                              </p>
                              <p className="text-sm text-red-600">
                                <span className="font-semibold">CVV:</span> ***
                              </p>
                            </div>
                          )}

                        {/* UPI Details */}
                        {order.paymentMethod === "upi" &&
                          order.shippingAddress?.upiId && (
                            <div className="bg-white p-3 rounded border border-purple-200">
                              <p className="text-sm">
                                <span className="font-semibold">UPI ID:</span>{" "}
                                {order.shippingAddress.upiId}
                              </p>
                            </div>
                          )}

                        {!order.shippingAddress?.cardHolderName &&
                          !order.shippingAddress?.upiId && (
                            <p className="text-sm text-gray-500 italic">
                              No payment details available
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h3 className="font-bold text-lg mb-3">Order Summary</h3>
                      <div className="bg-gray-50 p-4 rounded border">
                        <p className="text-sm mb-2">
                          <span className="font-semibold">Subtotal:</span> ₹
                          {(
                            order.totalPrice -
                            (order.tax || 0) -
                            (order.shippingCost || 0)
                          ).toFixed(2)}
                        </p>
                        {order.tax && (
                          <p className="text-sm mb-2">
                            <span className="font-semibold">Tax:</span> ₹
                            {order.tax.toFixed(2)}
                          </p>
                        )}
                        {order.shippingCost && (
                          <p className="text-sm mb-2">
                            <span className="font-semibold">
                              Shipping Cost:
                            </span>{" "}
                            ₹{order.shippingCost.toFixed(2)}
                          </p>
                        )}
                        <div className="border-t pt-2">
                          <p className="font-bold">
                            <span className="font-semibold">Total Amount:</span>{" "}
                            ₹{order.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">Ordered:</span>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-2 mt-8">
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
        </>
      )}
    </div>
  );
}
