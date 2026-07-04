import { useEffect, useState } from "react";
import { api } from "../../api";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.analyticsSummary().then(setData);
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h2>Analytics dashboard</h2>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total revenue</span>
          <span className="stat-value">₹{data.total_revenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total orders</span>
          <span className="stat-value">{data.total_orders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Customers</span>
          <span className="stat-value">{data.total_customers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Conversion rate</span>
          <span className="stat-value">{data.conversion_rate}%</span>
        </div>
      </div>

      <h3>Top-selling products</h3>
      <table className="admin-table">
        <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
        <tbody>
          {data.top_products.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.units_sold}</td>
              <td>₹{p.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Orders per day</h3>
      <div className="mini-chart">
        {data.orders_by_day.map((d) => (
          <div key={d.day} className="mini-bar-wrap" title={`${d.day}: ${d.count}`}>
            <div className="mini-bar" style={{ height: `${d.count * 20}px` }} />
            <span>{d.day.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
