import React, { useEffect, useState } from "react";
import { authService } from "../../services/services";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();
  const [removingId, setRemovingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        // Use the shared authService for fetching users
        const response = await authService.getAllUsers();
        setUsers(response.data.users || []);
      } catch (err) {
        setError(err.message || "Error loading users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    setRemovingId(id);
    try {
      await authService.removeUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to remove user");
    } finally {
      setRemovingId(null);
    }
  };

  // Sort users based on sortKey and sortOrder
  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortKey];
    let bValue = b[sortKey];
    if (sortKey === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    if (sortKey === "isAdmin") {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const usersPerPage = 10;
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sortKey" className="font-semibold text-gray-700">
            Sort by:
          </label>
          <div className="relative flex items-center">
            <select
              id="sortKey"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-gray-800 font-medium"
              style={{ cursor: "pointer" }}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="isAdmin">Role</option>
              <option value="createdAt">Joined</option>
            </select>
            <span
              className={`absolute right-2 flex items-center text-gray-400 cursor-pointer ${
                sortOrder === "asc" ? "" : "rotate-180"
              }`}
              style={{ transition: "transform 0.2s" }}
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
              tabIndex={0}
              role="button"
              aria-label="Toggle sort order"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 rounded p-3 mb-4 border border-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow border border-gray-100 bg-white">
            <table className="w-full text-sm min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-2 sm:px-4 text-left font-bold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    Name
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-bold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    Email
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-bold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    Role
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-bold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    Joined
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-bold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm break-words max-w-[120px] sm:max-w-none">
                        {user.name}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm break-words max-w-[140px] sm:max-w-none">
                        {user.email}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700 capitalize text-xs sm:text-sm">
                        {user.isAdmin ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            admin
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            user
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}{" "}
                        {new Date(user.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        {!user.isAdmin && currentUser?.isAdmin && (
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition disabled:opacity-50"
                            disabled={removingId === user._id}
                            onClick={() => handleRemove(user._id)}
                          >
                            {removingId === user._id ? "Removing..." : "Remove"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded font-semibold border transition ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
