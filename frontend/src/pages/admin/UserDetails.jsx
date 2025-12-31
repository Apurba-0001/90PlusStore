import React from "react";

export default function UserDetails({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-green-700"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-700 text-lg">{user.email}</p>
          <p className="text-gray-500 text-sm">
            Registered: {new Date(user.createdAt).toLocaleString()}
          </p>
        </div>
        {/* Add more user details here if needed */}
      </div>
    </div>
  );
}
