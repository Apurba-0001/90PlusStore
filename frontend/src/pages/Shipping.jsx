import React, { useState, useEffect } from "react";
import { settingsService } from "../services/services";

export default function Shipping() {
  const [taxRate, setTaxRate] = useState(10);
  const [shippingRates, setShippingRates] = useState({
    indiaStandard: 10,
    indiaExpress: 50,
    internationalStandard: 200,
    internationalExpress: 500,
  });

  useEffect(() => {
    // Load settings from database
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-100 p-4 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Shipping Information
          </h1>
          <p className="text-gray-500">
            Everything you need to know about our shipping
          </p>
        </div>

        {/* Shipping Rates Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Shipping Rates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <th className="border border-gray-200 p-4 text-left font-semibold text-gray-800 rounded-tl-xl">
                    Location
                  </th>
                  <th className="border border-gray-200 p-4 text-left font-semibold text-gray-800">
                    Standard Shipping
                  </th>
                  <th className="border border-gray-200 p-4 text-left font-semibold text-gray-800 rounded-tr-xl">
                    Express Shipping
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium text-gray-800">
                    India (All Cities)
                  </td>
                  <td className="border border-gray-200 p-4 text-gray-600">
                    <span className="font-semibold text-blue-600">
                      ₹{shippingRates.indiaStandard.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      (5-7 business days)
                    </span>
                  </td>
                  <td className="border border-gray-200 p-4 text-gray-600">
                    <span className="font-semibold text-blue-600">
                      ₹{shippingRates.indiaExpress.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      (2-3 business days)
                    </span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-4 font-medium text-gray-800">
                    International
                  </td>
                  <td className="border border-gray-200 p-4 text-gray-600">
                    <span className="font-semibold text-blue-600">
                      ₹{shippingRates.internationalStandard.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      (10-14 business days)
                    </span>
                  </td>
                  <td className="border border-gray-200 p-4 text-gray-600">
                    <span className="font-semibold text-blue-600">
                      ₹{shippingRates.internationalExpress.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      (5-7 business days)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Process */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Shipping Process
              </h3>
            </div>
            <ol className="text-gray-600 space-y-3">
              {[
                "Place your order on 90PlusStore",
                "Receive order confirmation email",
                "Your order is packed and prepared",
                "Package ships via courier service",
                "Track your package in real-time",
                "Receive your order safely",
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Shipping Policy */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Shipping Policy
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Free shipping on orders over ₹2000 (India only)",
                "All packages are insured",
                "Real-time tracking available",
                "Secure packaging to prevent damage",
                "Delivered by trusted courier partners",
                "Safe delivery guaranteed",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-amber-600"
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
            </div>
            <h3 className="text-lg font-bold text-amber-900">
              Important Notes
            </h3>
          </div>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Shipping times are estimates and may vary during peak seasons
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Orders are shipped only on business days (Monday-Friday)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Please provide a complete and accurate delivery address
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span>
                You will receive a tracking number once your order ships
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span>
                For any shipping issues, contact us at 90plusstore0@gmail.com
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
