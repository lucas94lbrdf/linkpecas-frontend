import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Link2, PlusCircle, BarChart3, Users, 
  Settings, ShoppingBag, Crown, MessageCircle, Home,
  Store, Tag, Ticket, FileText, Globe, CarFront
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  type: 'user' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const enthusiastLinks = [
    { icon: LayoutDashboard, label: 'Meu Painel', path: '/dashboard/enthusiast' },
    { icon: Tag, label: 'Ofertas', path: '/offers' },
    { icon: Ticket, label: 'Promoções', path: '/promotions' },
    { icon: MessageCircle, label: 'Comunidades', path: '/comunidades' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const userLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Store, label: 'Minha Loja', path: '/shops', premiumOnly: true },
    { icon: Link2, label: 'Meus Links', path: '/my-links' },
    { icon: Tag, label: 'Ofertas', path: '/offers' },
    { icon: Ticket, label: 'Promoções', path: '/promotions' },
    { icon: PlusCircle, label: 'Novo Link', path: '/new-link' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: MessageCircle, label: 'Comunidades', path: '/comunidades' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: ShoppingBag, label: 'Anúncios', path: '/admin/ads' },
    { icon: CarFront, label: 'Veículos', path: '/admin/vehicles' },
    { icon: Globe, label: 'Marketplaces', path: '/admin/marketplaces' },
    { icon: Tag, label: 'Categorias', path: '/admin/categories' },
    { icon: BarChart3, label: 'Analytics Global', path: '/admin/analytics' },
    { icon: MessageCircle, label: 'Comunidades', path: '/admin/communities' },
    { icon: Crown, label: 'Planos', path: '/admin/plans' },
    { icon: FileText, label: 'Logs', path: '/admin/logs' },
    { icon: Settings, label: 'Minha Conta', path: '/settings' },
    { icon: Globe, label: 'Sistema', path: '/admin/settings' },
  ];

  let activeLinks = type === 'admin' ? adminLinks : userLinks;
  if (user?.role === 'entusiasta') {
    activeLinks = enthusiastLinks;
  }

  const links = activeLinks.filter(link => {
      // @ts-ignore
      if (link.premiumOnly && user?.plan !== 'premium') return false;
      return true;
  });

  return (
    <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-64px)] border-r border-[var(--border)] pt-6 flex flex-col bg-[var(--glass)] backdrop-blur-xl hidden lg:flex">
      <div className="px-6 mb-4 text-[9px] font-black tracking-[2px] text-orange opacity-40 uppercase">
        Painel {type === 'admin' ? 'Administrador' : (user?.role === 'entusiasta' ? 'Entusiasta' : 'Vendedor')}
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === link.path
                ? 'bg-orange/10 text-orange'
                : 'opacity-40 hover:opacity-100 hover:bg-[var(--glass2)]'
            }`}
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold opacity-30 border border-[var(--border)] hover:opacity-100 transition-all">
          <Home size={15} /> Voltar ao Início
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
