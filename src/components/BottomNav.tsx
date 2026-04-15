import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, FileText, ClipboardCheck, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/alunos', icon: Users, label: 'Alunos' },
  { to: '/frequencia', icon: ClipboardCheck, label: 'Chamada' },
  { to: '/mensalidades', icon: Wallet, label: 'Financeiro' },
  { to: '/documentos', icon: FileText, label: 'Detran' },
  { to: '/configuracoes', icon: Settings, label: 'Ajustes' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
