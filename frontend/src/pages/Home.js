import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAllProducts({ limit: 6 });
      setFeaturedProducts(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to 90PlusStore</h1>
          <p>Your Ultimate Destination for Premium Football Merchandise</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories container">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          <Link to="/products?category=jerseys" className="category-card">
            <div className="category-icon">👕</div>
            <h3>Jerseys</h3>
          </Link>
          <Link to="/products?category=boots" className="category-card">
            <div className="category-icon">👟</div>
            <h3>Boots</h3>
          </Link>
          <Link to="/products?category=balls" className="category-card">
            <div className="category-icon">⚽</div>
            <h3>Balls</h3>
          </Link>
          <Link to="/products?category=accessories" className="category-card">
            <div className="category-icon">🧢</div>
            <h3>Accessories</h3>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured container">
        <h2>Featured Products</h2>
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="view-all">
              <Link to="/products" className="btn btn-secondary">
                View All Products
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose 90PlusStore?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping across the country</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing on all products</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✅</div>
              <h3>Authentic Products</h3>
              <p>100% genuine football merchandise</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Secure Checkout</h3>
              <p>Safe and secure payment processing</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
