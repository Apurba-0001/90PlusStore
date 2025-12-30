import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  productService,
  orderService,
  authService,
  settingsService,
} from "../../services/services";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(false);
  const [adminName, setAdminName] = useState(user?.name || "");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminEditError, setAdminEditError] = useState("");
  const [taxRate, setTaxRate] = useState(10);
  const [shippingCost, setShippingCost] = useState(10);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await productService.getProducts();
        const ordersRes = await orderService.getAllOrders();

        const products = productsRes.data.products;
        const orders = ordersRes.data.orders;
        const pendingOrders = orders.filter((o) => o.status === "pending");

        const totalRevenue = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, order) => sum + order.totalPrice, 0);

        setStats({
          totalProducts: productsRes.data.pagination.total,
          totalOrders: ordersRes.data.pagination.total,
          pendingOrders: pendingOrders.length,
          totalRevenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await settingsService.updateSettings({
        taxRate,
        shippingRates,
      });

      // Also update localStorage for immediate UI updates
      localStorage.setItem("taxRate", taxRate);
      localStorage.setItem("shippingRates", JSON.stringify(shippingRates));

      // Dispatch custom event to notify other components about the change
      window.dispatchEvent(
        new CustomEvent("shippingRatesUpdated", { detail: shippingRates })
      );
      window.dispatchEvent(
        new CustomEvent("taxRateUpdated", { detail: taxRate })
      );

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveAdminDetails = async () => {
    setAdminEditError("");
    setSavingAdmin(true);
    try {
      const response = await authService.updateProfile({
        name: adminName,
        email: adminEmail,
      });

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditingAdmin(false);
    } catch (err) {
      setAdminEditError(
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your store and view analytics
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Details */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mb-8 border border-blue-500/20 backdrop-blur-sm relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Admin Profile</h2>
            </div>
            <div className="flex items-center gap-3">
              {!editingAdmin && (
                <button
                  onClick={() => setEditingAdmin(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Edit Details
                </button>
              )}
            </div>
          </div>

          {editingAdmin ? (
            <div className="space-y-4">
              {adminEditError && (
                <div className="bg-red-500 bg-opacity-20 border border-red-300 text-red-100 px-4 py-2 rounded">
                  {adminEditError}
                </div>
              )}

              <div>
                <label className="block text-sm opacity-80 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm opacity-80 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter email"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveAdminDetails}
                  disabled={savingAdmin}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                >
                  {savingAdmin ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditingAdmin(false);
                    setAdminName(user.name);
                    setAdminEmail(user.email);
                    setAdminEditError("");
                  }}
                  disabled={savingAdmin}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-80">Admin Name</p>
                <p className="text-2xl font-bold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Email</p>
                <p className="text-lg font-semibold break-words">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">Role</p>
                <p className="text-lg font-semibold">
                  <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                    {user.isAdmin ? "Administrator" : "User"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">Account Status</p>
                <p className="text-lg font-semibold">
                  <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 p-6 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
              Total Products
            </h3>
            <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors p-3 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {stats.totalProducts}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active in catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 p-6 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
              Total Orders
            </h3>
            <div className="bg-green-100 group-hover:bg-green-200 transition-colors p-3 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.3.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 p-6 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
              Pending Orders
            </h3>
            <div className="bg-red-100 group-hover:bg-red-200 transition-colors p-3 rounded-lg">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-red-600">
            {stats.pendingOrders}
          </p>
          <p className="text-xs text-gray-500 mt-2">Need attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 p-6 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
              Total Revenue
            </h3>
            <div className="bg-purple-100 group-hover:bg-purple-200 transition-colors p-3 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            ₹{stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="group bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-blue-400/30 hover:border-blue-400/60 hover:scale-105 transform"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-2xl mb-2">Manage Products</h3>
          <p className="text-sm opacity-90">
            Add, update, or delete products from your catalog
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="group bg-gradient-to-br from-green-500 to-green-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-green-400/30 hover:border-green-400/60 hover:scale-105 transform"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-2xl mb-2">Manage Orders</h3>
          <p className="text-sm opacity-90">
            View and update order statuses and details
          </p>
        </Link>

        <Link
          to="/admin/products/new"
          className="group bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-400/30 hover:border-purple-400/60 hover:scale-105 transform"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-2xl mb-2">Add New Product</h3>
          <p className="text-sm opacity-90">
            Create a new product and add it to your store
          </p>
        </Link>
      </div>

      {/* Tax and Shipping */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.49.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.49.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.49-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Tax and Shipping
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            {showSettings ? "Hide" : "Show"}
          </button>
        </div>

        {showSettings && (
          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-200 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M11.29 10.29L19 2.59V6h2V0h-6v2h3.41l-7.71 7.71 1.42 1.42zM7.71 13.71L0 21.41V18H-2v6h6v-2H.59l7.71-7.71-1.42-1.42z"
                        transform="translate(2, 2)"
                      />
                    </svg>
                  </div>
                  <label className="block text-gray-800 font-bold">
                    Tax Rate (%)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                  <span className="text-gray-700 font-semibold">%</span>
                </div>
                <p className="text-xs text-blue-700 mt-3 italic">
                  Example: 10 for 10% tax on orders
                </p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-blue-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <h3 className="font-bold text-blue-900">Current Settings</h3>
              </div>
              <p className="text-sm text-blue-800 ml-7">
                Tax Rate: <span className="font-bold text-lg">{taxRate}%</span>
              </p>
            </div>

            {/* Shipping Rates Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Shipping Rates
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <label className="block text-gray-800 font-bold mb-3">
                    <span className="text-emerald-700">🚚</span> India -
                    Standard
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-semibold">₹</span>
                    <input
                      type="number"
                      value={shippingRates.indiaStandard}
                      onChange={(e) =>
                        setShippingRates({
                          ...shippingRates,
                          indiaStandard: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-emerald-700 mt-2 italic">
                    ⏱️ 5-7 business days
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <label className="block text-gray-800 font-bold mb-3">
                    <span className="text-emerald-700">🚀</span> India - Express
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-semibold">₹</span>
                    <input
                      type="number"
                      value={shippingRates.indiaExpress}
                      onChange={(e) =>
                        setShippingRates({
                          ...shippingRates,
                          indiaExpress: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-emerald-700 mt-2 italic">
                    ⏱️ 2-3 business days
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <label className="block text-gray-800 font-bold mb-3">
                    <span className="text-blue-700">🌍</span> International -
                    Standard
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-semibold">₹</span>
                    <input
                      type="number"
                      value={shippingRates.internationalStandard}
                      onChange={(e) =>
                        setShippingRates({
                          ...shippingRates,
                          internationalStandard:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2 italic">
                    ⏱️ 10-14 business days
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <label className="block text-gray-800 font-bold mb-3">
                    <span className="text-blue-700">✈️</span> International -
                    Express
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-semibold">₹</span>
                    <input
                      type="number"
                      value={shippingRates.internationalExpress}
                      onChange={(e) =>
                        setShippingRates({
                          ...shippingRates,
                          internationalExpress: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2 italic">
                    ⏱️ 5-7 business days
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-300 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-emerald-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <h3 className="font-bold text-emerald-900">
                    Current Shipping Rates
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 text-sm text-emerald-800 ml-7">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    <span>
                      India Standard:{" "}
                      <span className="font-bold">
                        ₹{shippingRates.indiaStandard.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    <span>
                      India Express:{" "}
                      <span className="font-bold">
                        ₹{shippingRates.indiaExpress.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>
                      Intl Standard:{" "}
                      <span className="font-bold">
                        ₹{shippingRates.internationalStandard.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>
                      Intl Express:{" "}
                      <span className="font-bold">
                        ₹{shippingRates.internationalExpress.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
              {settingsSaved && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Settings saved successfully!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-700"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.3.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 font-mono text-sm text-gray-700">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {order.userId?.name || "Unknown"}
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-bold">
                    ₹{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
