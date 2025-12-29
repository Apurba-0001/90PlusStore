import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const [taxRate] = useState(
    () => parseFloat(localStorage.getItem("taxRate")) || 10
  );
  const [shippingCost] = useState(
    () => parseFloat(localStorage.getItem("shippingCost")) || 10
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          Your cart is empty
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-block text-sm sm:text-base"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="hidden sm:block">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 sm:p-6 border-b last:border-b-0 gap-4"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      ₹{item.price}
                    </p>
                    {item.size && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        Size: <span className="font-semibold">{item.size}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.id,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-12 text-center border rounded text-sm"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right w-24 flex-shrink-0">
                    <p className="font-bold mb-2 text-sm sm:text-base">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile view */}
            <div className="sm:hidden">
              {cart.map((item) => (
                <div key={item.id} className="p-4 border-b last:border-b-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">₹{item.price}</p>
                  {item.size && (
                    <p className="text-gray-500 text-xs mb-2">
                      Size: <span className="font-semibold">{item.size}</span>
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-12 text-center border rounded text-sm"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between font-bold text-base sm:text-lg mb-6">
            <span>Subtotal:</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 italic">
            * Final price with taxes and shipping will be calculated at checkout
          </p>

          <Link
            to="/checkout"
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-700 transition block text-center mb-2 text-sm sm:text-base"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-700 transition mb-2 text-sm sm:text-base"
          >
            Continue Shopping
          </button>
          <button
            onClick={clearCart}
            className="w-full text-red-600 py-2 hover:text-red-800 font-bold text-sm sm:text-base"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
