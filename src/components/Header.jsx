import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header-brand">
        📄 AI Resume Builder
      </Link>
    </header>
  );
}