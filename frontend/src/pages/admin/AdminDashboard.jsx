import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  productService,
  orderService,
  authService,
  settingsService,
} from "../../services/services";

import UserCard from "./UserCard";
import UserDetails from "./UserDetails";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(false);
  const [adminName, setAdminName] = useState(user?.name || "");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [adminEditError, setAdminEditError] = useState("");
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [taxRateIndia, setTaxRateIndia] = useState(0);
  const [taxRateInternational, setTaxRateInternational] = useState(0);
  const [shippingRates, setShippingRates] = useState({
    indiaStandard: 0,
    indiaExpress: 0,
    internationalStandard: 0,
    internationalExpress: 0,
  });
  const [indiaFreeShippingThreshold, setIndiaFreeShippingThreshold] =
    useState(0);
  const [
    internationalFreeShippingThreshold,
    setInternationalFreeShippingThreshold,
  ] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  // Fetch settings (tax, shipping) on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      setSettingsError("");
      try {
        const res = await settingsService.getSettings();
        const s = res.data.data || {};
        setTaxRateIndia(s.taxRateIndia ?? 0);
        setTaxRateInternational(s.taxRateInternational ?? 0);
        setShippingRates({
          indiaStandard: s.shippingRates?.indiaStandard ?? 0,
          indiaExpress: s.shippingRates?.indiaExpress ?? 0,
          internationalStandard: s.shippingRates?.internationalStandard ?? 0,
          internationalExpress: s.shippingRates?.internationalExpress ?? 0,
        });
        setIndiaFreeShippingThreshold(s.indiaFreeShippingThreshold ?? 0);
        setInternationalFreeShippingThreshold(
          s.internationalFreeShippingThreshold ?? 0
        );
      } catch (err) {
        setSettingsError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load settings"
        );
        console.error("Failed to load settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settingsSaved, setSettingsSaved] = useState(false);
  // Tax and Shipping settings toggle
  const [showSettings, setShowSettings] = useState(false);

  // Registered Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [selectedUser, setSelectedUser] = useState(false);

  // Fetch users for Registered Users card/modal
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const res = await authService.getAllUsers();
        setUsers(res.data.users || []);
      } catch (err) {
        setUsers([]);
        setUsersError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch users"
        );
        console.error("Failed to fetch users:", err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        taxRateIndia,
        taxRateInternational,
        shippingRates,
        indiaFreeShippingThreshold,
        internationalFreeShippingThreshold,
      });

      // Also update localStorage for immediate UI updates
      localStorage.setItem("taxRateIndia", taxRateIndia);
      localStorage.setItem("taxRateInternational", taxRateInternational);
      localStorage.setItem("shippingRates", JSON.stringify(shippingRates));

      // Dispatch custom event to notify other components about the change
      window.dispatchEvent(
        new CustomEvent("shippingRatesUpdated", { detail: shippingRates })
      );
      window.dispatchEvent(
        new CustomEvent("taxRateIndiaUpdated", { detail: taxRateIndia })
      );
      window.dispatchEvent(
        new CustomEvent("taxRateInternationalUpdated", {
          detail: taxRateInternational,
        })
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
                  id="adminName"
                  name="adminName"
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
                  id="adminEmail"
                  name="adminEmail"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="group bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-blue-400/30 hover:border-blue-500/60 hover:scale-105 transform min-h-[180px] md:min-h-[260px] flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-300 hover:ring-4 hover:ring-blue-300"
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
          className="group bg-gradient-to-br from-pink-500 to-pink-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-pink-300/30 hover:border-pink-400/60 hover:scale-105 transform min-h-[180px] md:min-h-[260px] flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-pink-300 hover:ring-4 hover:ring-pink-300"
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
          className="group bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-400/30 hover:border-purple-500/60 hover:scale-105 transform min-h-[180px] md:min-h-[260px] flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-purple-300 hover:ring-4 hover:ring-purple-300"
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

        {/* Registered Users Card */}
        <Link
          to="/admin/users"
          className="group bg-gradient-to-br from-orange-400 to-orange-600 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-orange-300/30 hover:border-orange-400/60 hover:scale-105 transform min-h-[180px] md:min-h-[260px] flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-orange-300 hover:ring-4 hover:ring-orange-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-2xl mb-2">Registered Users</h3>
          <p className="text-sm opacity-90 mt-2">
            Click to manage and view all registered users.
          </p>
          {/* No error display here, handled on users page */}
        </Link>
        {/* No modal, navigation only */}
      </div>

      {/* Tax and Shipping */}
      <div
        className={`bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-8 transition-shadow duration-300${
          !showSettings
            ? " shadow-[0_0_24px_4px_rgba(239,68,68,0.18)] hover:shadow-[0_0_40px_8px_rgba(239,68,68,0.32)]"
            : ""
        }`}
      >
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
            {settingsLoading ? (
              <div className="text-blue-600 font-semibold p-4">
                Loading settings...
              </div>
            ) : settingsError ? (
              <div className="bg-red-100 text-red-700 rounded p-2 mb-2 border border-red-300">
                Error loading settings: {settingsError}
              </div>
            ) : (
              <form
                className="space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Tax Rate Cards */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center">
                      <div className="bg-blue-200 p-3 rounded-full mb-3">
                        <svg
                          className="w-7 h-7 text-blue-700"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 8v4l3 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                      <label className="block text-md font-bold mb-2 text-blue-900">
                        Tax Rate (India) %
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center font-semibold text-blue-900 bg-white"
                        value={taxRateIndia}
                        onChange={(e) =>
                          setTaxRateIndia(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center">
                      <div className="bg-blue-200 p-3 rounded-full mb-3">
                        <svg
                          className="w-7 h-7 text-blue-700"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 8v4l3 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                      <label className="block text-md font-bold mb-2 text-blue-900">
                        Tax Rate (International) %
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center font-semibold text-blue-900 bg-white"
                        value={taxRateInternational}
                        onChange={(e) =>
                          setTaxRateInternational(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  {/* India Shipping Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 flex flex-col items-center">
                    <div className="bg-green-200 p-3 rounded-full mb-3">
                      <svg
                        className="w-7 h-7 text-green-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 12h18M3 12l6-6m-6 6l6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <label className="block text-md font-bold mb-2 text-green-900">
                      India Shipping (₹)
                    </label>
                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap gap-2 w-full">
                        <table className="w-full mb-2">
                          <thead>
                            <tr>
                              <th className="text-xs font-semibold text-green-700 text-center">
                                Standard
                              </th>
                              <th className="text-xs font-semibold text-green-700 text-center">
                                Express
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-0 align-top">
                                <input
                                  type="number"
                                  min="0"
                                  className="min-w-[100px] w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-center font-semibold text-green-900 bg-white"
                                  value={shippingRates.indiaStandard}
                                  onChange={(e) =>
                                    setShippingRates((r) => ({
                                      ...r,
                                      indiaStandard: Number(e.target.value),
                                    }))
                                  }
                                  placeholder="Standard (India)"
                                />
                              </td>
                              <td className="p-0 align-top">
                                <input
                                  type="number"
                                  min="0"
                                  className="min-w-[100px] w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-center font-semibold text-green-900 bg-white"
                                  value={shippingRates.indiaExpress}
                                  onChange={(e) =>
                                    setShippingRates((r) => ({
                                      ...r,
                                      indiaExpress: Number(e.target.value),
                                    }))
                                  }
                                  placeholder="Express (India)"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <label className="block text-xs mt-3 mb-1 text-green-700">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-center font-semibold text-green-900 bg-white"
                      value={indiaFreeShippingThreshold}
                      onChange={(e) =>
                        setIndiaFreeShippingThreshold(Number(e.target.value))
                      }
                    />
                  </div>
                  {/* International Shipping Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center">
                    <div className="bg-purple-200 p-3 rounded-full mb-3">
                      <svg
                        className="w-7 h-7 text-purple-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20m0-20C6.48 2 2 6.48 2 12s4.48 10 10 10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <label className="block text-md font-bold mb-2 text-purple-900">
                      International Shipping (₹)
                    </label>
                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap gap-2 w-full">
                        <table className="w-full mb-2">
                          <thead>
                            <tr>
                              <th className="text-xs font-semibold text-purple-700 text-center">
                                Standard
                              </th>
                              <th className="text-xs font-semibold text-purple-700 text-center">
                                Express
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-0 align-top">
                                <input
                                  type="number"
                                  min="0"
                                  className="min-w-[100px] w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center font-semibold text-purple-900 bg-white"
                                  value={shippingRates.internationalStandard}
                                  onChange={(e) =>
                                    setShippingRates((r) => ({
                                      ...r,
                                      internationalStandard: Number(
                                        e.target.value
                                      ),
                                    }))
                                  }
                                  placeholder="Standard (Intl)"
                                />
                              </td>
                              <td className="p-0 align-top">
                                <input
                                  type="number"
                                  min="0"
                                  className="min-w-[100px] w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center font-semibold text-purple-900 bg-white"
                                  value={shippingRates.internationalExpress}
                                  onChange={(e) =>
                                    setShippingRates((r) => ({
                                      ...r,
                                      internationalExpress: Number(
                                        e.target.value
                                      ),
                                    }))
                                  }
                                  placeholder="Express (Intl)"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <label className="block text-xs mt-3 mb-1 text-purple-700">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center font-semibold text-purple-900 bg-white"
                      value={internationalFreeShippingThreshold}
                      onChange={(e) =>
                        setInternationalFreeShippingThreshold(
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 mt-6"
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
                {settingsSaved && (
                  <div className="text-green-600 font-semibold text-center mt-2">
                    Settings saved!
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 transition-shadow duration-300 shadow-[0_0_24px_4px_rgba(59,130,246,0.18)] hover:shadow-[0_0_40px_8px_rgba(59,130,246,0.32)] mb-2">
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
                    {order.userId?.name || order.user?.name || "Unknown"}
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
