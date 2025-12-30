import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [taxRate] = useState(
    () => parseFloat(localStorage.getItem("taxRate")) || 10
  );
  const [shippingCost] = useState(
    () => parseFloat(localStorage.getItem("shippingCost")) || 10
  );

  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.3.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Cart is Empty</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Add some amazing products to get started!
        </p>
        <Link
          to="/products"
          className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="hidden sm:block">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-6 border-b border-gray-100 last:border-b-0 gap-6 hover:bg-gray-50 transition"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-blue-600 font-semibold text-lg">
                        ₹{item.price}
                      </p>
                      {item.size && (
                        <p className="text-gray-600 text-sm mt-2">
                          Size:{" "}
                          <span className="font-semibold">{item.size}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm font-bold transition"
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
                        className="w-14 text-center bg-transparent text-sm font-bold border-0 focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm font-bold transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right w-28 flex-shrink-0">
                      <p className="font-bold text-lg text-gray-900 mb-3">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm hover:bg-red-50 px-3 py-2 rounded-lg transition"
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
                  <div
                    key={item.id}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-200"
                      />
                    )}
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-blue-600 font-semibold mb-2">
                      ₹{item.price}
                    </p>
                    {item.size && (
                      <p className="text-gray-600 text-sm mb-3">
                        Size: <span className="font-semibold">{item.size}</span>
                      </p>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm font-bold"
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
                          className="w-12 text-center bg-transparent text-sm font-bold border-0 focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-lg">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Order Summary
            </h2>
            <div className="flex justify-between font-bold text-xl mb-6">
              <span>Subtotal:</span>
              <span className="text-blue-600">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-6 italic bg-gray-50 p-3 rounded-lg">
              * Final price with taxes and shipping will be calculated at
              checkout
            </p>

            <Link
              to="/checkout"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all block text-center mb-3 transform hover:scale-105 active:scale-95"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition mb-3"
            >
              Continue Shopping
            </button>
            <button
              onClick={clearCart}
              className="w-full text-red-600 py-2 hover:text-red-800 font-bold hover:bg-red-50 rounded-xl transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
