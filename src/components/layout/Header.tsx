import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Zap, Sun, Moon, LayoutDashboard, Settings, LogOut, ChevronDown, X, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[var(--glass)] backdrop-blur-2xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange to-orange2 text-white shadow-lg shadow-orange/25 group-hover:scale-105 transition-transform">
              <Zap size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-wider">
              Link<span className="text-orange">Peças<aside></aside></span>
            </span>
          </Link>
        </div>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {['Ofertas', 'Montadoras', 'Comunidades'].map((item) => {
            const path = `/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
            return (
              <Link
                key={item}
                to={path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(path)
                  ? 'bg-[var(--glass2)] text-orange opacity-100'
                  : 'opacity-50 hover:opacity-100 hover:bg-[var(--glass2)]'
                  }`}
              >
                {item}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="gls flex items-center gap-2 px-3 py-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
              <Search size={15} className="opacity-30" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm w-40 md:w-64"
                onBlur={() => setIsSearchOpen(false)}
              />
              <button onClick={() => setIsSearchOpen(false)} className="opacity-30 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-[var(--glass2)] transition-all"
            >
              <Search size={18} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-[var(--glass2)] transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-xl border border-[var(--border)] hover:border-[var(--border2)] hover:bg-[var(--glass2)] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange to-orange2 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-semibold">{user.name}</span>
                <ChevronDown size={12} className="opacity-40" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 gls p-1.5 shadow-2xl z-20 overflow-hidden">
                    <button
                      onClick={() => { navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs hover:bg-[var(--glass2)] transition-all"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs hover:bg-[var(--glass2)] transition-all"
                    >
                      <Settings size={15} /> Configurações
                    </button>
                    <div className="h-px bg-[var(--border)] my-1 mx-2" />
                    <button
                      onClick={() => { logout(); setIsUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={15} /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-xl bg-gradient-to-br from-orange to-orange2 text-white text-sm font-bold shadow-lg shadow-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
