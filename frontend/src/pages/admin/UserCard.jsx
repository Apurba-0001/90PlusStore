import React from "react";

export default function UserCard({ user, onClick }) {
  return (
    <div
      className="group bg-gradient-to-br from-green-400 to-green-600 text-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-green-400/30 hover:border-green-400/60 hover:scale-105 transform cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
      <h3 className="font-bold text-2xl mb-2 truncate">{user.name}</h3>
      <p className="text-sm opacity-90 truncate">{user.email}</p>
      <p className="text-xs mt-2 opacity-80">
        Registered: {new Date(user.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
