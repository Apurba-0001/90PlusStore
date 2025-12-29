import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  productService,
  orderService,
  authService,
} from "../../services/services";

export default function AdminDashboard() {
  const { user, setUser } = useAuth();
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
  const [taxRate, setTaxRate] = useState(() => {
    return parseFloat(localStorage.getItem("taxRate")) || 10;
  });
  const [shippingCost, setShippingCost] = useState(() => {
    return parseFloat(localStorage.getItem("shippingCost")) || 10;
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [shippingRates, setShippingRates] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("shippingRates")) || {
        indiaStandard: 10,
        indiaExpress: 50,
        internationalStandard: 200,
        internationalExpress: 500,
      }
    );
  });

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

  const handleSaveSettings = () => {
    localStorage.setItem("taxRate", taxRate);
    localStorage.setItem("shippingCost", shippingCost);
    localStorage.setItem("shippingRates", JSON.stringify(shippingRates));

    // Dispatch custom event to notify other components about the change
    window.dispatchEvent(
      new CustomEvent("shippingRatesUpdated", { detail: shippingRates })
    );

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Admin Details */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Admin Profile</h2>
            {!editingAdmin && (
              <button
                onClick={() => setEditingAdmin(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Edit Details
              </button>
            )}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm">Total Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm">Pending Orders</h3>
          <p className="text-3xl font-bold text-red-600">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="bg-blue-600 text-white p-8 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <h3 className="font-bold text-2xl">Manage Products</h3>
          <p className="text-base mt-3">Add, update, or delete products</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-green-600 text-white p-8 rounded-lg shadow hover:bg-green-700 transition"
        >
          <h3 className="font-bold text-2xl">Manage Orders</h3>
          <p className="text-base mt-3">View and update order status</p>
        </Link>
        <Link
          to="/admin/products/new"
          className="bg-purple-600 text-white p-8 rounded-lg shadow hover:bg-purple-700 transition"
        >
          <h3 className="font-bold text-2xl">Add New Product</h3>
          <p className="text-base mt-3">Create a new product</p>
        </Link>
      </div>

      {/* Store Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Store Settings</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
        </div>

        {showSettings && (
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Tax Rate (%) *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <span className="ml-2 text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Example: 10 for 10% tax on orders
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold text-blue-900 mb-2">
                Current Settings:
              </h3>
              <p className="text-sm text-blue-800">
                Tax Rate: <span className="font-bold">{taxRate}%</span>
              </p>
            </div>

            {/* Shipping Rates Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Shipping Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    India - Standard Shipping (₹)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">₹</span>
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    5-7 business days
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    India - Express Shipping (₹)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">₹</span>
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    2-3 business days
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    International - Standard Shipping (₹)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">₹</span>
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    10-14 business days
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    International - Express Shipping (₹)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">₹</span>
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    5-7 business days
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-bold text-green-900 mb-2">
                  Current Shipping Rates:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm text-green-800">
                  <div>
                    <span className="font-bold">India Standard:</span> ₹
                    {shippingRates.indiaStandard.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-bold">India Express:</span> ₹
                    {shippingRates.indiaExpress.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-bold">Intl Standard:</span> ₹
                    {shippingRates.internationalStandard.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-bold">Intl Express:</span> ₹
                    {shippingRates.internationalExpress.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveSettings}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Save Settings
              </button>
              {settingsSaved && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Settings saved successfully!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Order ID</th>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Total</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{order._id.substring(0, 8)}...</td>
                <td>{order.userId?.name || "Unknown"}</td>
                <td>₹{order.totalPrice.toFixed(2)}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold ${
                      order.status === "delivered"
                        ? "bg-green-200 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
