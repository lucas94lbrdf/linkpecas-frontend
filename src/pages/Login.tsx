import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Cookies from 'js-cookie';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      Cookies.set('access_token', data.access_token);
      Cookies.set('refresh_token', data.refresh_token);
      setUser(data.user);

      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 animate-fade-up">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs opacity-40 hover:opacity-100 transition-all">
            <ArrowLeft size={14} /> Voltar ao Início
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange to-orange2 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange/20">
            <Zap size={24} />
          </div>
          <h1 className="text-2xl font-black">Bem-vindo de volta</h1>
          <p className="text-sm opacity-40">Acesse sua dashboard de parceiro</p>
        </div>

        <div className="gls p-8 space-y-6">
          <button className="w-full py-3 rounded-xl border border-[var(--border2)] flex items-center justify-center gap-3 text-xs font-bold hover:bg-[var(--glass2)] transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            Entrar com Google
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[10px] font-bold opacity-20 uppercase">ou</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Senha</label>
              <input 
                type="password" 
                required
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-orange to-orange2 text-white font-black py-4 rounded-xl shadow-xl shadow-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Acessar Conta'}
            </button>
          </form>

          <p className="text-center text-xs opacity-50">
            Não tem uma conta? <Link to="/register" className="text-orange font-bold hover:underline">Crie agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
