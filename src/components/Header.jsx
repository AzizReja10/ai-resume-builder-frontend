import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <Link to={token ? "/dashboard" : "/login"} className="app-header-brand">
        📄 AI Resume Builder
      </Link>

      {token && (
        <button className="btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  );
}