import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navigation.css";

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          ⚽ 90PlusStore
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>

          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="nav-link">
                Orders
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout ({user?.name})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}

          <Link to="/cart" className="nav-link cart-link">
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
