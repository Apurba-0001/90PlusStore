import React, { useState, useEffect } from "react";
import { orderService } from "../../services/services";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders on mount and when filters change
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

  // Listen for order status changes from other tabs or user actions
  useEffect(() => {
    const handleOrderStatusChange = (event) => {
      const { orderId, order } = event.detail;
      // Update the order in the list
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === orderId ? order : o))
      );
    };

    const handleStorageChange = () => {
      const cancelledData = localStorage.getItem("orderCancelled");
      if (cancelledData) {
        const { orderId, order } = JSON.parse(cancelledData);
        // Update the order in the list
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === orderId ? order : o))
        );
      }
    };

    window.addEventListener("orderStatusChanged", handleOrderStatusChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("orderStatusChanged", handleOrderStatusChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center cursor-pointer">
                  <div
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="min-w-0"
                  >
                    <p className="text-sm md:text-xs text-gray-600 font-semibold">
                      Order ID
                    </p>
                    <p className="font-bold text-base md:text-sm truncate">
                      {order._id}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-xs text-gray-600 font-semibold">
                      Customer
                    </p>
                    <p className="font-bold text-base md:text-sm truncate">
                      {order.userId?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-xs text-gray-600 font-semibold">
                      Total
                    </p>
                    <p className="font-bold text-base md:text-sm">
                      ₹{order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-xs text-gray-600 font-semibold">
                      Date
                    </p>
                    <p className="font-bold text-base md:text-sm">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm md:text-base text-gray-600 font-semibold whitespace-nowrap">
                        Status:
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, e.target.value)
                        }
                        className={`px-4 py-2 rounded-full text-sm md:text-base font-bold border-0 ${
                          order.status === "delivered"
                            ? "bg-green-500 md:bg-green-200 text-white md:text-green-800"
                            : order.status === "cancelled"
                            ? "bg-red-500 md:bg-red-200 text-white md:text-red-800"
                            : order.status === "shipped"
                            ? "bg-blue-500 md:bg-blue-200 text-white md:text-blue-800"
                            : "bg-yellow-500 md:bg-yellow-200 text-white md:text-yellow-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order._id ? null : order._id
                        )
                      }
                      className="text-gray-600 hover:text-blue-600 transition p-2 rounded-md hover:bg-gray-100"
                      title={
                        expandedOrder === order._id ? "Collapse" : "Expand"
                      }
                    >
                      {expandedOrder === order._id ? (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 14l5-5 5 5z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                              {item.productId ? (
                                <p className="text-xs text-gray-600 font-mono mt-1">
                                  Product ID:{" "}
                                  <span className="font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {item.productId}
                                  </span>
                                </p>
                              ) : item.productObjectId ? (
                                <p className="text-xs text-gray-600 font-mono mt-1">
                                  Product ID:{" "}
                                  <span className="font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                    {typeof item.productObjectId === "string"
                                      ? item.productObjectId.substring(0, 8)
                                      : item.productObjectId._id?.substring(
                                          0,
                                          8
                                        )}
                                  </span>
                                </p>
                              ) : null}
                              <p className="text-sm text-gray-600 mt-2">
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
                              <p className="text-sm text-gray-600"></p>
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
                          {order.shippingAddress.houseNo && (
                            <p className="text-base mb-1 break-words">
                              <span className="font-semibold">
                                House No / Building:
                              </span>{" "}
                              {order.shippingAddress.houseNo}
                            </p>
                          )}
                          <p className="text-base mb-1 break-words">
                            <span className="font-semibold">Street:</span>{" "}
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-sm mb-1 break-words">
                            <span className="font-semibold">City:</span>{" "}
                            {order.shippingAddress.city}
                          </p>
                          <p className="text-sm mb-1 break-words">
                            <span className="font-semibold">State:</span>{" "}
                            {order.shippingAddress.state}
                          </p>
                          <p className="text-sm mb-1 break-words">
                            <span className="font-semibold">Country:</span>{" "}
                            {order.shippingAddress.country}
                          </p>
                          <p className="text-sm break-words">
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
                          order.paymentDetails?.cardHolderName && (
                            <div className="bg-white p-3 rounded border border-blue-200">
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Card Holder Name:
                                </span>{" "}
                                {order.paymentDetails.cardHolderName}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Card Number:
                                </span>{" "}
                                {order.paymentDetails.cardNumber?.slice(-4)
                                  ? `****-****-****-${order.paymentDetails.cardNumber.slice(
                                      -4
                                    )}`
                                  : "Not available"}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-semibold">
                                  Expiry Date:
                                </span>{" "}
                                {order.paymentDetails.expiryDate ||
                                  "Not available"}
                              </p>
                              <p className="text-sm text-red-600">
                                <span className="font-semibold">CVV:</span> ***
                              </p>
                            </div>
                          )}

                        {/* UPI Details */}
                        {order.paymentMethod === "upi" &&
                          order.paymentDetails?.upiId && (
                            <div className="bg-white p-3 rounded border border-purple-200">
                              <p className="text-sm">
                                <span className="font-semibold">UPI ID:</span>{" "}
                                {order.paymentDetails.upiId}
                              </p>
                            </div>
                          )}

                        {!order.paymentDetails?.cardHolderName &&
                          !order.paymentDetails?.upiId && (
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
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
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
