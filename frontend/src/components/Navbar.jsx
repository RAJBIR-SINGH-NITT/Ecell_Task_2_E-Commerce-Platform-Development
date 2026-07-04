import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Shopwave</Link>

      <div className="nav-links">
        <Link to="/shop">Shop</Link>
        <Link to="/cart">Cart ({itemCount})</Link>

        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn-link" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
