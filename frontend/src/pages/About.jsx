import React from "react";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About 90PlusStore</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            90PlusStore is your premier destination for best quality football
            merchandise and collectibles. We are passionate about bringing the
            latest and greatest football gear to fans around the world.
          </p>
          <p className="text-gray-700 mb-4">
            Founded with a mission to provide authentic, high-quality football
            merchandise, we've grown into a trusted platform for fans seeking
            official jerseys, footwear, apparel, and collectibles from their
            favorite teams and players.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            Our mission is to deliver exceptional quality products and customer
            service to football enthusiasts worldwide. We believe in:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>✓ Authentic, original merchandise from trusted brands</li>
            <li>✓ Fast and reliable shipping to your doorstep</li>
            <li>✓ Competitive pricing without compromising quality</li>
            <li>✓ Exceptional customer support 24/7</li>
            <li>✓ A wide selection of products for all budgets</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
          Why Choose 90PlusStore?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-2">Wide Selection</h3>
            <p className="text-gray-700">
              Browse thousands of authentic football products from all major
              brands and teams.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-2">Best Prices</h3>
            <p className="text-gray-700">
              Competitive pricing and regular discounts on your favorite items.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-2">Fast Shipping</h3>
            <p className="text-gray-700">
              Quick and secure delivery to your location with tracking updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
