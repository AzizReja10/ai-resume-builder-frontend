import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "../hooks/useTheme";

export default function Header() {
  const { pathname } = useLocation();
  const dashboardActive = pathname === "/" || pathname.startsWith("/resumes/");
  const { isNight, toggleTheme } = useTheme();

  return (
    <header className={`app-header ${isNight ? "is-night" : "is-day"}`}>
      <div className="header-sky" aria-hidden>
        <span className="header-sun" />
        <span className="header-moon" />
        <span className="header-star s1" />
        <span className="header-star s2" />
        <span className="header-star s3" />
        <span className="header-star s4" />
        <span className="header-cloud c1" />
        <span className="header-cloud c2" />
      </div>

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

        <div className="app-header-actions">
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

          <button
            type="button"
            className={`theme-toggle ${isNight ? "is-night" : "is-day"}`}
            onClick={toggleTheme}
            aria-label={isNight ? "Switch to day mode" : "Switch to night mode"}
            aria-pressed={isNight}
            title={isNight ? "Day mode" : "Night mode"}
          >
            <span className="theme-toggle-stars" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <motion.span
              className="theme-orb"
              animate={{ x: isNight ? 30 : 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 26 }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
