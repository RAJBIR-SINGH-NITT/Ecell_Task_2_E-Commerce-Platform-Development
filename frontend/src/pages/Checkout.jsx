import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ address_line: "", city: "", pincode: "", phone: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function applyCoupon() {
    setCouponMsg("");
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      setDiscount(res.discount);
      setCouponMsg(`Coupon applied: -₹${res.discount}`);
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.message);
    }
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      // "Simulated Payment integration": we don't hit a real payment
      // gateway (Razorpay/Stripe) here -- we just pretend it succeeded
      // and go straight to creating the order, which is exactly what the
      // brief asks for ("Simulated Payment integration").
      const order = await api.placeOrder({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        ...address,
        coupon_code: couponCode || undefined,
      });
      clearCart();
      navigate(`/orders`, { state: { justPlaced: order.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="section checkout-page">
      <h1>Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        <div className="checkout-form">
          <h3>Delivery address</h3>
          <input required placeholder="Address line" value={address.address_line}
            onChange={(e) => setAddress({ ...address, address_line: e.target.value })} />
          <input required placeholder="City" value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input required placeholder="Pincode" value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
          <input required placeholder="Phone" value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })} />

          <h3>Coupon</h3>
          <div className="coupon-row">
            <input placeholder="Coupon code" value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" className="btn-primary-sm" onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && <p className="coupon-msg">{couponMsg}</p>}

          <h3>Payment</h3>
          <p className="payment-note">💳 Simulated payment — no real card is charged.</p>
        </div>

        <div className="order-summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div key={i.product.id} className="summary-line">
              <span>{i.product.name} × {i.quantity}</span>
              <span>₹{(i.product.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="summary-line"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
          <div className="summary-line total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>

          {error && <div className="error-banner">{error}</div>}
          <button className="btn-primary" disabled={placing} type="submit">
            {placing ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
