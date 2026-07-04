import { useEffect, useState } from "react";
import { api } from "../../api";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.allOrders().then(setOrders);
  }, []);

  async function handleStatusChange(orderId, status) {
    const updated = await api.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  }

  return (
    <div>
      <h2>Order management</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.customer_name}</td>
              <td>₹{o.total}</td>
              <td>
                <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
