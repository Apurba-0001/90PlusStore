import React, { useState, useEffect } from "react";

export default function Shipping() {
  const [shippingRates, setShippingRates] = useState({
    indiaStandard: 10,
    indiaExpress: 50,
    internationalStandard: 200,
    internationalExpress: 500,
  });

  useEffect(() => {
    // Load shipping rates from localStorage (admin dashboard settings)
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shipping Information</h1>

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Shipping Rates</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Location</th>
              <th className="border p-3 text-left">Standard Shipping</th>
              <th className="border p-3 text-left">Express Shipping</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-3">India (All Cities)</td>
              <td className="border p-3">
                ₹{shippingRates.indiaStandard.toFixed(2)} (5-7 business days)
              </td>
              <td className="border p-3">
                ₹{shippingRates.indiaExpress.toFixed(2)} (2-3 business days)
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border p-3">International</td>
              <td className="border p-3">
                ₹{shippingRates.internationalStandard.toFixed(2)} (10-14
                business days)
              </td>
              <td className="border p-3">
                ₹{shippingRates.internationalExpress.toFixed(2)} (5-7 business
                days)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Shipping Process</h3>
          <ol className="text-gray-700 space-y-3 list-decimal list-inside">
            <li>Place your order on 90PlusStore</li>
            <li>Receive order confirmation email</li>
            <li>Your order is packed and prepared</li>
            <li>Package ships via courier service</li>
            <li>Track your package in real-time</li>
            <li>Receive your order safely</li>
          </ol>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Shipping Policy</h3>
          <ul className="text-gray-700 space-y-3">
            <li>✓ Free shipping on orders over ₹2000 (India only)</li>
            <li>✓ All packages are insured</li>
            <li>✓ Real-time tracking available</li>
            <li>✓ Secure packaging to prevent damage</li>
            <li>✓ Delivered by trusted courier partners</li>
            <li>✓ Safe delivery guaranteed</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">Important Notes</h3>
        <ul className="text-gray-700 space-y-2">
          <li>
            • Shipping times are estimates and may vary during peak seasons
          </li>
          <li>• Orders are shipped only on business days (Monday-Friday)</li>
          <li>• Please provide a complete and accurate delivery address</li>
          <li>• You will receive a tracking number once your order ships</li>
          <li>
            • For any shipping issues, contact us at 90plusstore0@gmail.com
          </li>
        </ul>
      </div>
    </div>
  );
}
