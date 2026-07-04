import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="section empty-state">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h1>Your cart</h1>
      <div className="cart-list">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="cart-row">
            <img src={product.image_url} alt={product.name} />
            <div className="cart-row-info">
              <span className="product-name">{product.name}</span>
              <span>₹{product.price} each</span>
            </div>
            <input type="number" min="1" max={product.stock} value={quantity}
              onChange={(e) => updateQuantity(product.id, Number(e.target.value))} />
            <span className="line-total">₹{(product.price * quantity).toFixed(2)}</span>
            <button className="btn-link" onClick={() => removeFromCart(product.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>Subtotal</span>
        <span className="cart-subtotal">₹{subtotal.toFixed(2)}</span>
      </div>
      <button className="btn-primary" onClick={() => navigate("/checkout")}>
        Proceed to checkout
      </button>
    </div>
  );
}
