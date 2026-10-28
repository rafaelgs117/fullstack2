import { Link } from 'react-router-dom';

export default function Header({ user }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="Ir para início">
        <span className="brand-icon">SOS</span>
        <span>
          <strong>SOS Emergência</strong>
          <small>Proteção rápida e simples</small>
        </span>
      </Link>
      <Link className="profile-link" to="/perfil" aria-label="Abrir perfil">👤</Link>
    </header>
  );
}
