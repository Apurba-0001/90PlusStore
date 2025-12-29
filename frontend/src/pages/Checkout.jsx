import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  const [taxRate] = useState(
    () => parseFloat(localStorage.getItem("taxRate")) || 10
  );
  const [shippingRates, setShippingRates] = useState({
    indiaStandard: 10,
    indiaExpress: 50,
    internationalStandard: 200,
    internationalExpress: 500,
  });

  // Load and listen for shipping rates updates
  useEffect(() => {
    // Load shipping rates from localStorage
    const storedRates = localStorage.getItem("shippingRates");
    if (storedRates) {
      try {
        setShippingRates(JSON.parse(storedRates));
      } catch (err) {
        console.error("Error loading shipping rates:", err);
      }
    }

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (event) => {
      if (event.key === "shippingRates" && event.newValue) {
        try {
          setShippingRates(JSON.parse(event.newValue));
        } catch (err) {
          console.error("Error updating shipping rates:", err);
        }
      }
    };

    // Listen for custom event (same-tab updates from admin dashboard)
    const handleShippingRatesUpdated = (event) => {
      setShippingRates(event.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("shippingRatesUpdated", handleShippingRatesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "shippingRatesUpdated",
        handleShippingRatesUpdated
      );
    };
  }, []);
  const [formData, setFormData] = useState({
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

      const orderData = {
        products: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || null,
        })),
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
      };

      const response = await orderService.createOrder(orderData);
      alert("Order placed successfully!");
      clearCart();
      navigate("/profile");
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Your cart is empty. Redirecting...</p>
        {setTimeout(() => navigate("/products"), 2000)}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Shipping Address
            </h2>

            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">
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
                  className="w-28 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
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
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter country code (e.g., +91) and mobile number for order
                updates
              </p>
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Payment Method
              </h2>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 text-sm sm:text-base"
              >
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="upi">UPI Payment</option>
                <option value="cash-on-delivery">Cash on Delivery (COD)</option>
              </select>
              {formData.paymentMethod === "cash-on-delivery" && (
                <p className="text-xs sm:text-sm text-green-600 mt-2">
                  ✓ Pay when your order arrives at your doorstep
                </p>
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
                    placeholder="John Doe"
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
                    placeholder="1234 5678 9012 3456"
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
                      placeholder="123"
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
                        placeholder="123 Main St"
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
                        placeholder="New York"
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
                        placeholder="NY"
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
                        placeholder="United States"
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
                      placeholder="10001"
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
                    placeholder="yourname@upi"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-600 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    e.g., yourname@okaxis, yourname@paytm, yourname@googleplay
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
                    💡 You will receive a payment request on your UPI app after
                    placing the order.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 mt-6 sm:mt-8 text-sm sm:text-base"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-xs sm:text-sm"
              >
                <div>
                  <span>
                    {item.name} x {item.quantity}
                    {item.size && <span> ({item.size})</span>}
                  </span>
                </div>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Shipping Option Selection */}
          {formData.country && (
            <div className="border rounded-lg p-3 sm:p-4 mb-4 bg-blue-50">
              <h3 className="font-bold mb-3 text-sm sm:text-base">
                Select Shipping Option:
              </h3>
              {isIndiaFreeShipping() && (
                <div className="mb-3 p-3 bg-green-100 border border-green-400 rounded">
                  <p className="text-green-800 font-bold text-xs sm:text-sm">
                    ✓ Free shipping on orders over ₹2000!
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {formData.country.toLowerCase() === "india" ? (
                  <>
                    <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-blue-100 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="shippingType"
                        value="standard"
                        checked={formData.shippingType === "standard"}
                        onChange={handleChange}
                      />
                      <span className="ml-2">
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
                    <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-blue-100 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="shippingType"
                        value="express"
                        checked={formData.shippingType === "express"}
                        onChange={handleChange}
                      />
                      <span className="ml-2">
                        Express (2-3 days) - ₹
                        {shippingRates.indiaExpress.toFixed(2)}
                      </span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-blue-100 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="shippingType"
                        value="standard"
                        checked={formData.shippingType === "standard"}
                        onChange={handleChange}
                      />
                      <span className="ml-2">
                        Standard (10-14 days) - ₹
                        {shippingRates.internationalStandard.toFixed(2)}
                      </span>
                    </label>
                    <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-blue-100 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="shippingType"
                        value="express"
                        checked={formData.shippingType === "express"}
                        onChange={handleChange}
                      />
                      <span className="ml-2">
                        Express (5-7 days) - ₹
                        {shippingRates.internationalExpress.toFixed(2)}
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>

            {!isCountrySelected() ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 my-4">
                <p className="text-yellow-800 text-xs sm:text-sm">
                  ℹ️ Please select your country to see shipping and tax details.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>
                    ₹
                    {(
                      (getTotalPrice() + shippingCost) *
                      (taxRate / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
              <span>Total:</span>
              <span>
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
  );
}
