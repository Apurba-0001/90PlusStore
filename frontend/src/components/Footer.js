import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h4>About 90PlusStore</h4>
          <p>
            Your one-stop shop for premium football merchandise. Jerseys, boots,
            balls, and more!
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/products">Products</a>
            </li>
            <li>
              <a href="/cart">Cart</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Categories</h4>
          <ul>
            <li>
              <a href="/products?category=jerseys">Jerseys</a>
            </li>
            <li>
              <a href="/products?category=boots">Boots</a>
            </li>
            <li>
              <a href="/products?category=balls">Balls</a>
            </li>
            <li>
              <a href="/products?category=accessories">Accessories</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@90plusstore.com</p>
          <p>Phone: +1-800-FOOTBALL</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} 90PlusStore. All rights reserved. | University
          Portfolio Project
        </p>
      </div>
    </footer>
  );
};

export default Footer;
