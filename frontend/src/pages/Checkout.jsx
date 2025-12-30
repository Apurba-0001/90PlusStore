import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  orderService,
  authService,
  settingsService,
} from "../services/services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load saved address from user profile
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const response = await authService.getProfile();
        const profileData = response.data;

        setFormData((prev) => ({
          ...prev,
          // Pre-fill from address
          houseNo: profileData.address?.houseNo || "",
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          country: profileData.address?.country || "",
          zipCode: profileData.address?.zipCode || "",
          countryCode: profileData.address?.countryCode || "+91",
          mobile: profileData.address?.phone || profileData.phone || "",
        }));
      } catch (err) {
        console.error("Error loading saved address:", err);
      }
    };

    if (user) {
      loadSavedAddress();
    }
  }, [user]);

  // Listen for address updates from other tabs or pages
  useEffect(() => {
    const handleAddressUpdate = (event) => {
      if (event.detail?.address) {
        const addr = event.detail.address;
        setFormData((prev) => ({
          ...prev,
          houseNo: addr.houseNo || "",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "",
          zipCode: addr.zipCode || "",
          countryCode: addr.countryCode || "+91",
          mobile: addr.phone || "",
        }));
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "addressUpdated") {
        try {
          const data = JSON.parse(event.newValue);
          const addr = data.address;
          setFormData((prev) => ({
            ...prev,
            houseNo: addr.houseNo || "",
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "",
            zipCode: addr.zipCode || "",
            countryCode: addr.countryCode || "+91",
            mobile: addr.phone || "",
          }));
        } catch (err) {
          console.error("Error parsing address update:", err);
        }
      }
    };

    // Listen for custom event (same tab updates)
    window.addEventListener("addressUpdated", handleAddressUpdate);

    // Listen for storage changes (other tabs)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("addressUpdated", handleAddressUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const [taxRate, setTaxRate] = useState(10);
  const [shippingRates, setShippingRates] = useState({
    indiaStandard: 10,
    indiaExpress: 50,
    internationalStandard: 200,
    internationalExpress: 500,
  });

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        const settings = response.data.data;
        setTaxRate(settings.taxRate);
        setShippingRates(settings.shippingRates);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };

    loadSettings();

    // Listen for settings updates from admin panel
    const handleTaxRateUpdate = (event) => {
      setTaxRate(event.detail);
    };
    const handleShippingRatesUpdate = (event) => {
      setShippingRates(event.detail);
    };

    window.addEventListener("taxRateUpdated", handleTaxRateUpdate);
    window.addEventListener("shippingRatesUpdated", handleShippingRatesUpdate);

    return () => {
      window.removeEventListener("taxRateUpdated", handleTaxRateUpdate);
      window.removeEventListener(
        "shippingRatesUpdated",
        handleShippingRatesUpdate
      );
    };
  }, []);

  const [formData, setFormData] = useState({
    houseNo: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    countryCode: "+91",
    mobile: "",
    paymentMethod: "credit-card",
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZipCode: "",
    shippingType: "standard",
  });

  const getShippingCost = () => {
    const isIndia =
      formData.country && formData.country.toLowerCase() === "india";

    // Check if India purchase qualifies for free shipping (over ₹2000)
    if (isIndia && getTotalPrice() > 2000) {
      return 0; // Free shipping
    }

    if (isIndia) {
      return formData.shippingType === "express"
        ? shippingRates.indiaExpress
        : shippingRates.indiaStandard;
    } else if (formData.country) {
      return formData.shippingType === "express"
        ? shippingRates.internationalExpress
        : shippingRates.internationalStandard;
    }
    return 0;
  };

  const shippingCost = getShippingCost();

  // Check if India purchase qualifies for free shipping
  const isIndiaFreeShipping = () => {
    const isIndia =
      formData.country && formData.country.toLowerCase() === "india";
    return isIndia && getTotalPrice() > 2000;
  };

  // Check if country is selected
  const isCountrySelected = () => {
    return formData.country && formData.country.trim() !== "";
  };

  const handleCloseSuccessModal = (path = "/profile") => {
    setShowSuccessModal(false);
    navigate(path);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate UPI ID for UPI payments
      if (formData.paymentMethod === "upi") {
        if (!formData.upiId) {
          setError("Please enter your UPI ID");
          setLoading(false);
          return;
        }
        // Basic UPI validation (should contain @)
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(formData.upiId)) {
          setError("Please enter a valid UPI ID (e.g., yourname@bankname)");
          setLoading(false);
          return;
        }
      }

      // Validate card details for card payments (credit card and debit card)
      if (
        formData.paymentMethod !== "cash-on-delivery" &&
        formData.paymentMethod !== "upi"
      ) {
        if (
          !formData.cardHolderName ||
          !formData.cardNumber ||
          !formData.expiryDate ||
          !formData.cvv
        ) {
          setError("Please fill in all card details");
          setLoading(false);
          return;
        }
        // Basic card number validation (should be 13-19 digits)
        if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
          setError("Please enter a valid card number");
          setLoading(false);
          return;
        }
        // Basic CVV validation (3-4 digits)
        if (!/^\d{3,4}$/.test(formData.cvv)) {
          setError("Please enter a valid CVV");
          setLoading(false);
          return;
        }
      }

      // Persist mobile in user profile/address for future checkouts
      await authService.updateProfile({
        phone: formData.mobile,
        address: {
          houseNo: formData.houseNo,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
          countryCode: formData.countryCode,
          phone: formData.mobile,
        },
      });

      const orderData = {
        products: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || null,
        })),
        shippingAddress: {
          houseNo: formData.houseNo,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          shippingType: formData.shippingType,
        },
        billingAddress: {
          houseNo: formData.billingHouseNo || formData.houseNo,
          street: formData.billingStreet || formData.street,
          city: formData.billingCity || formData.city,
          state: formData.billingState || formData.state,
          country: formData.billingCountry || formData.country,
          zipCode: formData.billingZipCode || formData.zipCode,
        },
        paymentDetails: {
          cardHolderName: formData.cardHolderName,
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          upiId: formData.upiId,
        },
        paymentMethod: formData.paymentMethod,
      };

      await orderService.createOrder(orderData);
      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Your cart is empty. Redirecting...</p>
          {setTimeout(() => navigate("/products"), 2000)}
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Order successful
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your order has been placed. You can review and track it from your
              profile.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => handleCloseSuccessModal("/profile")}
                className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Profile
              </button>
              <button
                type="button"
                onClick={() => handleCloseSuccessModal("/products")}
                className="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Checkout
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Shipping Address
                  </h2>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    House No / Building Name{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                    placeholder="e.g., 123, Apartment 4B"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      required
                      pattern="^\+[0-9]{1,4}$"
                      placeholder="+91"
                      list="countryCodes"
                      className="w-28 px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                    <datalist id="countryCodes">
                      <option value="+91">India</option>
                      <option value="+1">USA/Canada</option>
                      <option value="+44">UK</option>
                      <option value="+61">Australia</option>
                      <option value="+971">UAE</option>
                      <option value="+65">Singapore</option>
                      <option value="+81">Japan</option>
                      <option value="+86">China</option>
                      <option value="+33">France</option>
                      <option value="+49">Germany</option>
                      <option value="+39">Italy</option>
                      <option value="+34">Spain</option>
                      <option value="+7">Russia</option>
                      <option value="+55">Brazil</option>
                      <option value="+27">South Africa</option>
                    </datalist>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{6,15}"
                      placeholder="Mobile number"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter country code (e.g., +91) and mobile number for order
                    updates
                  </p>
                </div>

                <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Payment Method
                    </h2>
                  </div>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all"
                  >
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="upi">UPI Payment</option>
                    <option value="cash-on-delivery">
                      Cash on Delivery (COD)
                    </option>
                  </select>
                  {formData.paymentMethod === "cash-on-delivery" && (
                    <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-green-700 font-medium">
                        Pay when your order arrives at your doorstep
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Details Form - Show for credit card and debit card */}
                {(formData.paymentMethod === "credit-card" ||
                  formData.paymentMethod === "debit-card") && (
                  <div className="mt-6 sm:mt-8 bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
                    <h2 className="text-base sm:text-xl font-bold mb-2 text-blue-900">
                      Card Details
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6">
                      Please enter your card information securely
                    </p>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                        Cardholder Name *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Your full name as it appears on the card
                      </p>
                      <input
                        type="text"
                        name="cardHolderName"
                        value={formData.cardHolderName}
                        onChange={handleChange}
                        placeholder="Apurba Maji"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-bold mb-2">
                        Card Number *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        The 16-digit number on the front of your card
                      </p>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="5104 2200 5104 2200"
                        maxLength="19"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2">
                          Expiry Date (MM/YY) *
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Month and year (e.g., 12/25)
                        </p>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="12/25"
                          maxLength="5"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-2">
                          CVV/CVC *
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          3 or 4-digit security code on the back
                        </p>
                        <input
                          type="password"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="456"
                          maxLength="4"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Billing Address Section */}
                    <div className="mt-8 pt-6 border-t-2 border-blue-300">
                      <h3 className="text-lg font-bold mb-4 text-blue-900">
                        Billing Address
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your address linked to the card
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="billingStreet"
                            value={formData.billingStreet}
                            onChange={handleChange}
                            placeholder="AJC Bose Road, Kolkata"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="billingCity"
                            value={formData.billingCity}
                            onChange={handleChange}
                            placeholder="Kolkata"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            name="billingState"
                            value={formData.billingState}
                            onChange={handleChange}
                            placeholder="West Bengal"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="billingCountry"
                            value={formData.billingCountry}
                            onChange={handleChange}
                            placeholder="India"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-gray-700 font-bold mb-2">
                          Zip Code *
                        </label>
                        <input
                          type="text"
                          name="billingZipCode"
                          value={formData.billingZipCode}
                          onChange={handleChange}
                          placeholder="700001"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                      <p className="text-xs text-yellow-800">
                        🔒 Your card details are secure and encrypted. We do not
                        store sensitive card information.
                      </p>
                    </div>
                  </div>
                )}

                {/* UPI Payment Form - Show only for UPI */}
                {formData.paymentMethod === "upi" && (
                  <div className="mt-6 sm:mt-8 bg-orange-50 p-4 sm:p-6 rounded-lg border-2 border-orange-200">
                    <h2 className="text-base sm:text-xl font-bold mb-6 text-orange-900">
                      UPI Payment Details
                    </h2>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="apurbamaji@okaxis"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-600 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., yourname@okaxis, yourname@paytm,
                        yourname@googleplay
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                      <p className="text-xs text-yellow-800">
                        🔒 Your UPI ID will be used to process your payment
                        securely.
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
                      <p className="text-xs text-blue-800">
                        💡 You will receive a payment request on your UPI app
                        after placing the order.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 sm:mt-8 text-sm sm:text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Place Order
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-2 text-xs sm:text-sm bg-gray-50 p-3 rounded-xl"
                  >
                    <div className="flex-1 break-words">
                      <span className="font-medium text-gray-800">
                        {item.name} x {item.quantity}
                        {item.size && (
                          <span className="text-gray-500"> ({item.size})</span>
                        )}
                      </span>
                    </div>
                    <span className="flex-shrink-0 font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Option Selection */}
              {formData.country && (
                <div className="border-2 border-blue-200 rounded-xl p-3 sm:p-4 mb-4 bg-blue-50/50">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base text-gray-800">
                    Select Shipping Option:
                  </h3>
                  {isIndiaFreeShipping() && (
                    <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-green-800 font-semibold text-xs sm:text-sm">
                        Free shipping on orders over ₹2000!
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {formData.country.toLowerCase() === "india" ? (
                      <>
                        <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm transition-all">
                          <input
                            type="radio"
                            name="shippingType"
                            value="standard"
                            checked={formData.shippingType === "standard"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3">
                            Standard (5-7 days) - ₹
                            {isIndiaFreeShipping() ? (
                              <span className="line-through text-gray-400">
                                {shippingRates.indiaStandard.toFixed(2)}
                              </span>
                            ) : (
                              shippingRates.indiaStandard.toFixed(2)
                            )}
                            {isIndiaFreeShipping() && (
                              <span className="ml-1 text-green-600 font-bold">
                                FREE
                              </span>
                            )}
                          </span>
                        </label>
                        <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm transition-all">
                          <input
                            type="radio"
                            name="shippingType"
                            value="express"
                            checked={formData.shippingType === "express"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3">
                            Express (2-3 days) - ₹
                            {shippingRates.indiaExpress.toFixed(2)}
                          </span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm transition-all">
                          <input
                            type="radio"
                            name="shippingType"
                            value="standard"
                            checked={formData.shippingType === "standard"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3">
                            Standard (10-14 days) - ₹
                            {shippingRates.internationalStandard.toFixed(2)}
                          </span>
                        </label>
                        <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm transition-all">
                          <input
                            type="radio"
                            name="shippingType"
                            value="express"
                            checked={formData.shippingType === "express"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3">
                            Express (5-7 days) - ₹
                            {shippingRates.internationalExpress.toFixed(2)}
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-100 pt-4 space-y-3 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>

                {!isCountrySelected() ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-amber-800 text-xs sm:text-sm">
                      Please select your country to see shipping and tax
                      details.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className="font-medium text-gray-800">
                        ₹{shippingCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-medium text-gray-800">
                        ₹
                        {(
                          (getTotalPrice() + shippingCost) *
                          (taxRate / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between font-bold text-base sm:text-lg pt-3 border-t-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mb-4 sm:-mb-6 rounded-b-2xl">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">
                    ₹
                    {isCountrySelected()
                      ? (
                          getTotalPrice() +
                          shippingCost +
                          (getTotalPrice() + shippingCost) * (taxRate / 100)
                        ).toFixed(2)
                      : getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
