import { Link, NavLink, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();
  const dashboardActive = pathname === "/" || pathname.startsWith("/resumes/");

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-header-brand">
          <span className="brand-mark" aria-hidden>
            ✦
          </span>
          <span className="brand-copy">
            <span className="brand-name">Resume Studio</span>
            <span className="brand-tag">AI resume builder</span>
          </span>
        </Link>

        <nav className="app-nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={() =>
              dashboardActive ? "app-nav-link is-active" : "app-nav-link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/analyzer"
            className={({ isActive }) =>
              isActive ? "app-nav-link is-active" : "app-nav-link"
            }
          >
            Analyzer
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
