import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Layers, Loader2, AlertCircle, Settings } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const PLANS = [
  {
    key: null,
    name: "Free",
    price: "R$ 0",
    features: ["Até 3 links ativos", "Exposição básica", "Analytics simples"],
    color: "#64748b",
    icon: Layers,
  },
  {
    key: "smart",
    name: "Smart",
    price: "R$ 9,90",
    features: ["Até 5 links ativos", "Analytics básico", "Suporte e-mail"],
    color: "#10b981",
    icon: Zap,
    popular: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$ 29,90",
    features: ["Até 50 links ativos", "Analytics completo", "Badge Pro", "Suporte Prioritário"],
    color: "#3b82f6",
    icon: Crown,
  },
  {
    key: "premium",
    name: "Premium",
    price: "R$ 79",
    features: ["Links Ilimitados", "Analytics avançado", "Domínio & API Access", "Loja Própria", "Destaque Automático"],
    color: "#ff6b35",
    icon: Crown,
  },
];

const Plans: React.FC = () => {
  const { user } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPlan = (user?.plan || 'free').toLowerCase();
  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');
  const sessionIdParam = searchParams.get('session_id');

  const { setUser } = useAuthStore();

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionIdParam) return;
      try {
        // Confirma pagamento no backend e atualiza o plano no DB
        await api.post('/api/payments/verify-checkout', { session_id: sessionIdParam });
        // Busca o user atualizado e persiste no store + localStorage
        const { data: meData } = await api.get('/api/auth/me');
        setUser(meData);
      } catch (err) {
        console.error('Erro ao verificar sessão Stripe:', err);
      }
    };

    if (successParam || canceledParam || sessionIdParam) {
      verifyCheckout();
      const t = setTimeout(() => setSearchParams({}, { replace: true }), 4000);
      return () => clearTimeout(t);
    }
  }, [successParam, canceledParam, sessionIdParam, setSearchParams, setUser]);

  const handleCheckout = async (planKey: string) => {
    setError(null);
    setLoadingPlan(planKey);
    try {
      const { data } = await api.post('/api/payments/create-checkout', { plan: planKey });
      window.location.href = data.checkout_url;
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao iniciar checkout. Tente novamente.');
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.get('/api/payments/portal');
      window.location.href = data.portal_url;
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao abrir portal. Tente novamente.');
    } finally {
      setPortalLoading(false);
    }
  };

  const getButtonState = (plan: typeof PLANS[0]) => {
    if (!plan.key) return { label: 'Plano Atual', disabled: true, isCurrent: true };
    if (plan.key === currentPlan) return { label: 'Plano Atual', disabled: true, isCurrent: true };
    return { label: 'Contratar Agora', disabled: false, isCurrent: false };
  };

  return (
    <div className="animate-fade-up space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Planos e Assinatura</h1>
          <p className="opacity-40 text-sm">Escolha o plano ideal para escalar suas vendas automotivas.</p>
        </div>
        {currentPlan !== 'free' && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--glass2)] transition-all disabled:opacity-50"
          >
            {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
            Gerenciar Assinatura
          </button>
        )}
      </div>

      {successParam && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
          <Check size={18} /> Assinatura ativada com sucesso! Aproveite seu novo plano.
        </div>
      )}
      {canceledParam && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm font-semibold">
          <AlertCircle size={18} /> Checkout cancelado. Sem problemas, você pode tentar novamente.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const btn = getButtonState(plan);
          const isLoading = loadingPlan === plan.key;
          return (
            <div
              key={plan.name}
              className={`gls p-8 flex flex-col relative overflow-hidden transition-all duration-300 border-2 ${
                plan.popular ? 'border-orange/40 scale-105 shadow-2xl shadow-orange/10 z-10' : 'border-transparent'
              } ${btn.isCurrent ? 'ring-2 ring-offset-0' : ''}`}
              style={btn.isCurrent ? ({ "--tw-ring-color": plan.color } as React.CSSProperties) : {}}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl tracking-widest leading-none">
                  POPULAR
                </div>
              )}
              {btn.isCurrent && (
                <div
                  className="absolute top-0 left-0 text-white text-[9px] font-black px-4 py-1.5 rounded-br-xl tracking-widest leading-none"
                  style={{ backgroundColor: plan.color }}
                >
                  SEU PLANO
                </div>
              )}

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${plan.color}15`, color: plan.color }}
              >
                <plan.icon size={24} />
              </div>

              <h3 className="text-xl font-black">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                <span className="text-[10px] uppercase font-bold opacity-30">/ mês</span>
              </div>

              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map((ft) => (
                  <li key={ft} className="flex items-center gap-3 text-xs opacity-60">
                    <Check size={14} className="text-emerald-500" /> {ft}
                  </li>
                ))}
              </ul>

              <button
                disabled={btn.disabled || isLoading}
                onClick={() => plan.key && handleCheckout(plan.key)}
                className={`w-full mt-10 py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  btn.isCurrent
                    ? 'bg-slate-500/10 text-slate-400 cursor-default'
                    : 'bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100'
                }`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {btn.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="gls p-8 bg-blue/5 border-blue/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-full bg-blue/10 flex items-center justify-center text-blue">
            <Crown size={32} />
          </div>
          <div>
            <h4 className="font-bold text-lg">Precisa de um plano Enterprise?</h4>
            <p className="text-sm opacity-40">Para concessionárias e grandes grupos automotivos.</p>
          </div>
        </div>
        <button className="bg-blue text-white px-8 py-4 rounded-xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all">
          Falar com Consultor
        </button>
      </div>
    </div>
  );
};

export default Plans;
