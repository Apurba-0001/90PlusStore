import React from "react";

export default function Returns() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Returns & Refunds</h1>

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
        <p className="text-gray-700 mb-4">
          We want you to be completely satisfied with your purchase. If for any
          reason you're not happy with your order, we offer hassle-free returns
          within 30 days of purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Return Eligibility</h3>
          <ul className="text-gray-700 space-y-2 list-disc list-inside">
            <li>
              Item must be returned within 10 days for India and 15 days for
              international orders
            </li>
            <li>Product must be unused and in original condition</li>
            <li>Original packaging and tags must be intact</li>
            <li>Original invoice/receipt required</li>
            <li>No signs of wear or damage</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Non-Returnable Items</h3>
          <ul className="text-gray-700 space-y-2 list-disc list-inside">
            <li>Custom/personalized items</li>
            <li>Final sale items</li>
            <li>Clearance items (unless defective)</li>
            <li>Items without original tags/packaging</li>
            <li>Items showing signs of wear</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
        <ol className="text-gray-700 space-y-4">
          <li>
            <strong>1. Contact us:</strong> Email 90plusstore0@gmail.com with
            your order number and reason for return
          </li>
          <li>
            <strong>2. Get Return Authorization:</strong> We'll provide you with
            a return shipping label and instructions
          </li>
          <li>
            <strong>3. Pack & Ship:</strong> Securely pack your item and ship it
            back using the provided label
          </li>
          <li>
            <strong>4. Inspection:</strong> Once received, we'll inspect the
            item within 5-7 business days
          </li>
          <li>
            <strong>5. Refund:</strong> After approval, your refund will be
            processed within 7-10 business days
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Refund Information</h3>
          <ul className="text-gray-700 space-y-2">
            <li>✓ Full refund issued for approved returns</li>
            <li>✓ Refund processed to original payment method</li>
            <li>✓ Return shipping covered for defective items</li>
            <li>✓ Processing time: 7-10 business days</li>
            <li>✓ Bank transfers may take 2-3 days</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Exchanges</h3>
          <ul className="text-gray-700 space-y-2">
            <li>✓ Exchange for different size/color available</li>
            <li>✓ Same quality products only</li>
            <li>✓ Free exchange within 30 days</li>
            <li>✓ Return & new item shipped simultaneously</li>
            <li>✓ No additional charges</li>
          </ul>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">Damaged/Defective Items</h3>
        <p className="text-gray-700 mb-4">
          If you receive a damaged or defective item:
        </p>
        <ul className="text-gray-700 space-y-2">
          <li>• Report it within 48 hours of delivery with photos as proof</li>
          <li>• We'll provide a return shipping label at no cost</li>
          <li>• Full refund or replacement will be provided immediately</li>
          <li>• Contact us at 90plusstore0@gmail.com with your order number</li>
        </ul>
      </div>
    </div>
  );
}
