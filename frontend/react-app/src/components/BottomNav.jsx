import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const links = [
    ['/', '⌂', 'Início'],
    ['/contatos', '☎', 'Contatos'],
    ['/perfil', '●', 'Perfil'],
    ['/configuracoes', '⚙', 'Config.']
  ];
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {links.map(([to, icon, label]) => (
        <NavLink key={to} to={to} className={({isActive}) => isActive ? 'active' : ''}>
          <span>{icon}</span><small>{label}</small>
        </NavLink>
      ))}
    </nav>
  );
}
