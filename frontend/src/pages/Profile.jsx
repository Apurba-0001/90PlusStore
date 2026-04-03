import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService, orderService } from "../services/services";
import { isValidAddressNameField } from "../utils/validationRules";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [addressData, setAddressData] = useState({
    houseNo: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    countryCode: "+91",
    phone: "",
  });

  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showPopup, setShowPopup] = useState(false);

  const isValidZipCode = (value) => /^[a-zA-Z0-9\s-]{3,12}$/.test(value);
  const isValidStreet = (value) =>
    typeof value === "string" && value.trim().length >= 3;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 15);
      setAddressData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    if (name === "countryCode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      setAddressData((prev) => ({
        ...prev,
        countryCode: digitsOnly ? `+${digitsOnly}` : "+",
      }));
      return;
    }

    if (name === "zipCode") {
      const zipSanitized = value.replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 12);
      setAddressData((prev) => ({ ...prev, zipCode: zipSanitized }));
      return;
    }

    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    try {
      if (!isValidStreet(addressData.street)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid street address.");
        setShowPopup(true);
        return;
      }

      if (!isValidAddressNameField(addressData.city)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid city name.");
        setShowPopup(true);
        return;
      }

      if (!isValidAddressNameField(addressData.state)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid state name.");
        setShowPopup(true);
        return;
      }

      if (!isValidAddressNameField(addressData.country)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid country name.");
        setShowPopup(true);
        return;
      }

      if (!isValidZipCode(addressData.zipCode)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid zip code.");
        setShowPopup(true);
        return;
      }

      if (!/^\+[0-9]{1,4}$/.test(addressData.countryCode)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid country code (e.g., +91).");
        setShowPopup(true);
        return;
      }

      if (!/^[0-9]{6,15}$/.test(addressData.phone)) {
        setPopupType("error");
        setPopupMessage("Please enter a valid mobile number (6-15 digits).");
        setShowPopup(true);
        return;
      }

      await authService.updateProfile({
        address: { ...addressData },
        phone: addressData.phone,
      });

      setPopupType("success");
      setPopupMessage("Address saved successfully.");
      setShowPopup(true);
      setEditingAddress(false);
    } catch (err) {
      setPopupType("error");
      setPopupMessage(
        err?.response?.data?.message ||
          "Failed to save address. Please try again.",
      );
      setShowPopup(true);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Cancel this order?");
    if (!confirmCancel) return;

    setCancellingOrderId(orderId);
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order,
        ),
      );
      setPopupType("success");
      setPopupMessage("Order cancelled successfully.");
      setShowPopup(true);
    } catch (err) {
      setPopupType("error");
      setPopupMessage(
        err?.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      );
      setShowPopup(true);
    } finally {
      setCancellingOrderId(null);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const [ordersResponse, profileResponse] = await Promise.all([
          orderService.getMyOrders(),
          authService.getProfile(),
        ]);

        setOrders(ordersResponse.data || []);

        const savedAddress = profileResponse.data?.address;
        if (savedAddress) {
          setAddressData((prev) => ({
            ...prev,
            ...savedAddress,
            phone: savedAddress.phone || profileResponse.data?.phone || "",
            countryCode: savedAddress.countryCode || prev.countryCode,
          }));
        } else {
          setAddressData((prev) => ({
            ...prev,
            phone: profileResponse.data?.phone || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Profile Information
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-semibold transform hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Name</p>
              <p className="font-bold text-gray-900 break-words">
                {user?.name}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Email</p>
              <p className="font-bold text-gray-900 break-all text-sm sm:text-base">
                {user?.email}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Status</p>
              <p className="font-bold">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user?.isAdmin
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user?.isAdmin ? "Admin" : "User"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {!user?.isAdmin && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <button
                onClick={() => setEditingAddress((prev) => !prev)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-semibold transform hover:scale-105 active:scale-95"
              >
                {editingAddress ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingAddress ? (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    House No / Building Name{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    value={addressData.houseNo}
                    onChange={handleAddressChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 hover:bg-white"
                    placeholder="e.g., 123, Apartment 4B"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={addressData.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 hover:bg-white"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-semibold">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 hover:bg-white"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-semibold">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 hover:bg-white"
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-semibold">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 hover:bg-white"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-semibold">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      required
                      maxLength={12}
                      pattern="[a-zA-Z0-9\s-]{3,12}"
                      className="w-full border rounded px-3 py-2 mt-1"
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Mobile Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="countryCode"
                      value={addressData.countryCode}
                      onChange={handleAddressChange}
                      required
                      maxLength={5}
                      pattern="^\+[0-9]{1,4}$"
                      className="w-24 border rounded px-3 py-2 mt-1"
                      placeholder="+91"
                      list="countryCodes"
                    />
                    <datalist id="countryCodes">
                      <option value="+91">India</option>
                      <option value="+1">USA/Canada</option>
                      <option value="+44">UK</option>
                      <option value="+61">Australia</option>
                      <option value="+971">UAE</option>
                      <option value="+65">Singapore</option>
                    </datalist>
                    <input
                      type="tel"
                      name="phone"
                      value={addressData.phone}
                      onChange={handleAddressChange}
                      required
                      className="flex-1 border rounded px-3 py-2 mt-1"
                      placeholder="Mobile number"
                      pattern="[0-9]{6,15}"
                      maxLength={15}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addressData.street || addressData.city ? (
                  <>
                    {addressData.houseNo && (
                      <div>
                        <p className="text-gray-600 text-sm">
                          House No / Building
                        </p>
                        <p className="font-semibold">{addressData.houseNo}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 text-sm">Street</p>
                      <p className="font-semibold">
                        {addressData.street || "Not set"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">City</p>
                        <p className="font-semibold">
                          {addressData.city || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">State</p>
                        <p className="font-semibold">
                          {addressData.state || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Country</p>
                        <p className="font-semibold">
                          {addressData.country || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Zip Code</p>
                        <p className="font-semibold">
                          {addressData.zipCode || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Mobile Number</p>
                      <p className="font-semibold">
                        {addressData.phone
                          ? `${addressData.countryCode}${addressData.phone}`
                          : "Not set"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    No address saved yet. Click Edit to add one.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!user?.isAdmin && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  You haven't placed any orders yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow p-4 sm:p-6"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 items-center">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Order ID
                        </p>
                        <p className="font-bold text-sm sm:text-base">
                          {order._id.substring(0, 8)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Items
                        </p>
                        <p className="font-bold text-sm">
                          {order.products.length} product
                          {order.products.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Date</p>
                        <p className="font-bold text-xs sm:text-base">
                          {new Date(order.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Status
                        </p>
                        <p className="font-bold capitalize text-sm sm:text-base">
                          {order.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Total
                        </p>
                        <p className="font-bold text-sm sm:text-base">
                          ₹{order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-end col-span-2 sm:col-span-1 mt-2 sm:mt-0">
                        <button
                          onClick={() =>
                            setExpandedOrder((prev) =>
                              prev === order._id ? null : order._id,
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 px-4 py-2 sm:px-2 sm:py-0 bg-blue-50 sm:bg-transparent rounded-lg sm:rounded-none w-full sm:w-auto"
                        >
                          {expandedOrder === order._id
                            ? "▲ Hide Details"
                            : "▼ View Details"}
                        </button>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-bold mb-4 text-lg">
                          Order Details
                        </h3>
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
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <p className="font-bold text-lg mb-2">
                                Order Status:
                              </p>
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
                            {order.status !== "delivered" &&
                              order.status !== "cancelled" && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={cancellingOrderId === order._id}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                >
                                  {cancellingOrderId === order._id
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all ${
              popupType === "error"
                ? "bg-red-50 border-2 border-red-500"
                : "bg-green-50 border-2 border-green-500"
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                {popupType === "error" ? (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <h3
                className={
                  popupType === "error"
                    ? "text-lg font-bold text-red-800"
                    : "text-lg font-bold text-green-800"
                }
              >
                {popupType === "error" ? "Cannot Proceed" : "Success"}
              </h3>
            </div>

            <p
              className={
                popupType === "error"
                  ? "mb-6 text-red-700"
                  : "mb-6 text-green-700"
              }
              style={{ whiteSpace: "pre-wrap" }}
            >
              {popupMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className={`w-full px-4 py-2 ${
                  popupType === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-semibold rounded-lg transition`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
