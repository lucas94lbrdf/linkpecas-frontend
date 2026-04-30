import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, Eye, MousePointer2,
  Activity, Clock, TrendingUp, Loader2, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import StatsCard from '../../components/shared/StatsCard';
import api from '../../services/api';

const TICK  = '#64748b';
const GRID  = 'rgba(100,116,139,0.1)';

const AdminOverview: React.FC = () => {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api.get('/api/admin/overview')
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center opacity-40">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <AlertCircle size={40} />
        <p className="text-sm">Erro ao carregar dados do painel.</p>
      </div>
    );
  }

  const chart          = data.chart || [];
  const activity       = data.activity || [];
  const topAds         = data.top_ads || [];
  const hasChartData   = chart.some((d: any) => d.revenue > 0);

  return (
    <div className="space-y-8 animate-fade-up pb-20">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Painel Administrativo</h1>
          <p className="opacity-40 text-sm">Visão geral do ecossistema LinkPeças.</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Usuários"
          value={String(data.total_users)}
          delta={data.users_delta}
        />
        <StatsCard
          icon={ShoppingBag}
          label="Links Ativos"
          value={String(data.active_ads)}
          delta={data.ads_delta}
          color="var(--blue)"
        />
        <StatsCard
          icon={Eye}
          label="Visualizações"
          value={data.total_views >= 1000
            ? `${(data.total_views / 1000).toFixed(1)}K`
            : String(data.total_views)}
          delta={0}
          color="#10b981"
        />
        <StatsCard
          icon={MousePointer2}
          label="Cliques"
          value={String(data.total_clicks)}
          delta={0}
          color="var(--orange)"
        />
      </div>

      {/* Stats secundárias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Pendentes */}
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Pendentes</p>
            <p className="text-2xl font-black">{data.pending_ads}</p>
          </div>
          {data.pending_ads > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black">
              Revisar
            </span>
          )}
        </div>

        {/* CTR */}
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-orange" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CTR Global</p>
            <p className="text-2xl font-black">{data.conversion}%</p>
          </div>
        </div>

        {/* Valor do catálogo */}
        <div className="gls p-5 flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Valor do Catálogo</p>
            <p className="text-xl font-black">R$ {data.catalog_value}</p>
          </div>
        </div>
      </div>

      {/* Gráfico + Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de cliques */}
        <div className="lg:col-span-2 gls p-6">
          <h3 className="font-bold text-sm mb-1 uppercase tracking-wider opacity-60">
            Cliques por Dia (últimos 30d)
          </h3>
          <p className="text-[10px] opacity-30 mb-6">
            Baseado em eventos de clique registrados
          </p>
          <div className="h-[280px]">
            {!hasChartData ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                <MousePointer2 size={32} />
                <p className="text-sm italic">Nenhum clique registrado nos últimos 30 dias.</p>
                <p className="text-[11px]">Os dados aparecerão conforme os usuários clicarem nos links.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK }} interval={4} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK }} width={24} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }}
                    labelStyle={{ fontWeight: 700, fontSize: 11 }}
                    formatter={(v: any) => [v, 'Cliques']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ff6b35" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="gls p-6 flex flex-col">
          <h3 className="font-bold text-sm mb-6 uppercase tracking-wider opacity-60">
            Atividade Recente
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-20 py-10">
                <Activity size={28} />
                <p className="text-sm italic">Nenhuma atividade registrada.</p>
              </div>
            ) : activity.map((act: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--glass2)] border border-[var(--border)] flex items-center justify-center text-[11px] font-black text-orange shrink-0">
                  {act.user ? act.user[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{act.user}</p>
                  <p className="text-[10px] opacity-50 truncate">{act.action}</p>
                  {act.detail && (
                    <p className="text-[9px] opacity-30 truncate">{act.detail}</p>
                  )}
                </div>
                <span className="text-[9px] opacity-30 whitespace-nowrap shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top anúncios */}
      {topAds.length > 0 && (
        <div className="gls p-6">
          <h3 className="font-bold text-sm mb-6 uppercase tracking-wider opacity-60">
            Top Anúncios por Visualizações
          </h3>
          <div className="space-y-4">
            {topAds.map((ad: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center text-[11px] font-black shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{ad.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] opacity-40 flex items-center gap-1">
                      <Eye size={10} /> {ad.views.toLocaleString('pt-BR')} views
                    </span>
                    <span className="text-[10px] opacity-40 flex items-center gap-1">
                      <MousePointer2 size={10} /> {ad.clicks.toLocaleString('pt-BR')} cliques
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-black text-orange">{ad.ctr}%</p>
                  <p className="text-[9px] opacity-30">CTR</p>
                </div>
                <div className="w-24 h-1.5 bg-[var(--glass2)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange rounded-full"
                    style={{ width: `${Math.min(100, (ad.views / (topAds[0]?.views || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOverview;
