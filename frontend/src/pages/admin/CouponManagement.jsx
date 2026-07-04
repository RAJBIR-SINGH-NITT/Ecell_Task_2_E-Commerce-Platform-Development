import { useEffect, useState } from "react";
import { api } from "../../api";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", value: "", expires_at: "" });

  function refresh() {
    api.listCoupons().then(setCoupons);
  }
  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.createCoupon({
      ...form,
      value: Number(form.value),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setForm({ code: "", discount_type: "percentage", value: "", expires_at: "" });
    refresh();
  }

  return (
    <div>
      <h2>Coupon management</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input placeholder="Code e.g. SAVE20" required value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percentage">Percentage off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
        <input placeholder="Value" type="number" required value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input type="date" value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
        <button className="btn-primary" type="submit">Create coupon</button>
      </form>

      <table className="admin-table">
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Expires</th><th>Active</th></tr></thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td>{c.code}</td>
              <td>{c.discount_type}</td>
              <td>{c.discount_type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
              <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
              <td>{c.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
