import React, { useState } from "react";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!token || !user) {
    window.location.href = "/login";
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    window.location.href = "/";
    return null;
  }

  return children;
}
