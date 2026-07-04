import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <div className="section">Loading...</div>;

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="section product-detail">
      <img src={product.image_url} alt={product.name} className="product-detail-img" />
      <div className="product-detail-info">
        <Link to="/shop" className="back-link">← Back to shop</Link>
        <h1>{product.name}</h1>
        <p className="product-category">{product.category_name}</p>
        <p className="product-detail-price">₹{product.price}</p>
        <p>{product.description}</p>
        <p>{product.in_stock ? `${product.stock} in stock` : "Out of stock"}</p>

        {product.in_stock && (
          <div className="qty-row">
            <input type="number" min="1" max={product.stock} value={qty}
              onChange={(e) => setQty(Number(e.target.value))} />
            <button className="btn-primary" onClick={handleAdd}>
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
