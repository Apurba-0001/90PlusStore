import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center space-x-2 flex-shrink-0"
            onClick={closeMenu}
          >
            <img
              src="/logo.png"
              alt="90PlusStore Logo"
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg sm:text-xl hidden sm:inline">
              90PlusStore
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition text-sm"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/"
              className="flex flex-col items-center hover:text-blue-400 transition"
              title="Home"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-xs lg:text-sm">Home</span>
            </Link>

            <Link
              to="/products"
              className="flex flex-col items-center hover:text-blue-400 transition"
              title="Products"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
              <span className="text-xs lg:text-sm">Products</span>
            </Link>

            <Link
              to="/wishlist"
              className="flex flex-col items-center hover:text-blue-400 transition"
              title="Wishlist"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-xs lg:text-sm">Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className="flex flex-col items-center relative hover:text-blue-400 transition"
              title="Cart"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l0.03-.12 0.9-1.63h7.45c0.75 0 1.41-.41 1.75-1.03l3.58-6.49c0.08-.14.12-.3.12-.48 0-.55-.45-1-1-1H5.21l-0.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s0.89 2 1.99 2 2-0.9 2-2-0.9-2-2-2z" />
              </svg>
              <span className="text-xs lg:text-sm">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                {user.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex flex-col items-center hover:text-blue-400 transition"
                    title="Admin"
                  >
                    <svg
                      className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <span className="text-xs lg:text-sm">Admin</span>
                  </Link>
                )}
                {!user.isAdmin && (
                  <Link
                    to="/profile"
                    className="flex flex-col items-center hover:text-blue-400 transition"
                    title={user.name}
                  >
                    <svg
                      className="w-6 h-6 lg:w-5 lg:h-5 mb-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-xs lg:text-sm">Profile</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-600 px-3 lg:px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="bg-blue-600 px-3 lg:px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 px-3 lg:px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button and Cart Icon */}
          <div className="md:hidden flex items-center justify-end gap-2">
            <Link
              to="/wishlist"
              className="flex items-center justify-center px-2 py-2 hover:text-blue-300 transition rounded-md hover:bg-blue-800"
              onClick={closeMenu}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center justify-center px-2 py-2 hover:text-blue-300 transition rounded-md hover:bg-blue-800"
              onClick={closeMenu}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l0.03-.12 0.9-1.63h7.45c0.75 0 1.41-.41 1.75-1.03l3.58-6.49c0.08-.14.12-.3.12-.48 0-.55-.45-1-1-1H5.21l-0.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s0.89 2 1.99 2 2-0.9 2-2-0.9-2-2-2z" />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            {user && (
              <Link
                to="/profile"
                className="flex items-center justify-center px-2 py-2 hover:text-blue-300 transition rounded-md hover:bg-blue-800"
                onClick={closeMenu}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-blue-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeMenu}
            ></div>

            {/* Floating Menu */}
            <div className="fixed top-20 right-4 left-4 bg-blue-900 rounded-lg shadow-2xl z-50 md:hidden max-w-sm mx-auto">
              <div className="p-4 space-y-2">
                <Link
                  to="/"
                  className="block px-4 py-3 hover:bg-blue-800 transition rounded-lg"
                  onClick={closeMenu}
                >
                  Home
                </Link>

                <Link
                  to="/products"
                  className="block px-4 py-3 hover:bg-blue-800 transition rounded-lg"
                  onClick={closeMenu}
                >
                  Products
                </Link>

                {user ? (
                  <>
                    {user.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-3 hover:bg-blue-800 transition rounded-lg"
                        onClick={closeMenu}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="w-full text-left bg-red-600 px-4 py-3 rounded-lg hover:bg-red-700 transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/login"
                      className="block text-center bg-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                      onClick={closeMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center bg-green-600 px-4 py-3 rounded-lg hover:bg-green-700 transition"
                      onClick={closeMenu}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
