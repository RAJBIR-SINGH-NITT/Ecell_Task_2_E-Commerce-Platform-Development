import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";

// Order tracking is modeled as a simple linear progress bar through
// these stages. "cancelled" is shown separately since it breaks the line.
const STAGES = ["placed", "processing", "shipped", "delivered"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    api.myOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section">Loading orders...</div>;
  if (orders.length === 0) return <div className="section">You haven't placed any orders yet.</div>;

  return (
    <div className="section">
      <h1>My orders</h1>
      {orders.map((order) => (
        <div key={order.id} className={`order-card ${order.id === justPlaced ? "just-placed" : ""}`}>
          <div className="order-header">
            <span>Order #{order.id}</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
            <span className="order-total">₹{order.total.toFixed(2)}</span>
          </div>

          {order.status === "cancelled" ? (
            <p className="status-cancelled">Cancelled</p>
          ) : (
            <div className="tracking-bar">
              {STAGES.map((stage, i) => (
                <div key={stage}
                  className={`tracking-step ${STAGES.indexOf(order.status) >= i ? "done" : ""}`}>
                  <div className="tracking-dot" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          )}

          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>{item.product_name} × {item.quantity} — ₹{item.line_total}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
