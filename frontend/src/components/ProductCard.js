import React from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  const inStock = totalStock > 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          {!inStock && <div className="out-of-stock">Out of Stock</div>}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="category">{product.category}</p>
          <div className="price">₹{product.price}</div>
          <div className="rating">⭐ {product.rating || "N/A"} / 5</div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
