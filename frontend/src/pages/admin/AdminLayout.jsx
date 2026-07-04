import { NavLink, Outlet } from "react-router-dom";

// This is a "layout route" -- App.jsx nests all /admin/* pages inside
// this, and <Outlet /> is where React Router injects whichever admin
// sub-page is currently active. Saves us repeating this sidebar 5 times.
export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3>Admin</h3>
        <NavLink to="/admin" end>Analytics</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/coupons">Coupons</NavLink>
        <NavLink to="/admin/banners">Banners</NavLink>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
