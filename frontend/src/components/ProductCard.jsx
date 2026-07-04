import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.image_url} alt={product.name} className="product-img" />
      </Link>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <p className="product-category">{product.category_name}</p>
        <div className="product-bottom">
          <span className="product-price">₹{product.price}</span>
          {product.in_stock ? (
            <button className="btn-primary-sm" onClick={() => addToCart(product, 1)}>
              Add to cart
            </button>
          ) : (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
}
