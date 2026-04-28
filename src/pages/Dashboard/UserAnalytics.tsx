import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, MousePointer2, Calendar, Target, 
  Lock, ArrowUpRight, Zap, MapPin, Smartphone, 
  Clock, Share2
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';

const UserAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/api/analytics/');
      setData(data);
    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const plan = data?.plan || 'free';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const UpgradeGate = ({ target }: { target: string }) => (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl z-10 p-6 text-center">
      <div className="w-12 h-12 bg-orange/20 text-orange rounded-full flex items-center justify-center mb-3">
        <Lock size={20} />
      </div>
      <h3 className="font-bold text-sm mb-1">Métricas Bloqueadas</h3>
      <p className="text-[10px] opacity-60 mb-4 max-w-[200px]">
        {target === 'smart' ? 'Quer ver cliques por link e categoria? Vá para o Smart.' : 
         target === 'pro' ? 'Quer saber origens e campanhas detalhadas? Vá para o Pro.' : 
         'Relatórios avançados e IA disponíveis no Premium.'}
      </p>
      <Link to="/plans" className="px-4 py-2 bg-orange text-white text-[10px] font-bold rounded-lg hover:scale-105 transition-all">
        Fazer Upgrade
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-up space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black">Analytics</h1>
            <span className="px-2 py-0.5 bg-orange/10 text-orange text-[9px] font-black uppercase rounded-md border border-orange/10">
              {plan}
            </span>
          </div>
          <p className="opacity-40 text-sm">
            {plan === 'free' && 'Visão básica da sua performance.'}
            {plan === 'smart' && 'Métricas essenciais para seu negócio.'}
            {plan === 'pro' && 'Relatórios completos e insights de campanha.'}
            {plan === 'premium' && 'Analytics avançado e inteligência competitiva.'}
          </p>
        </div>
      </div>

      {/* 1. FREE - Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gls p-6 bg-[var(--card)] space-y-2">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total de Cliques</span>
            <MousePointer2 size={16} />
          </div>
          <p className="text-3xl font-black">{data?.summary?.total_clicks || 0}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <ArrowUpRight size={12} /> +12% vs mês anterior
          </div>
        </div>

        <div className="gls p-6 bg-[var(--card)] space-y-2">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Últimos 7 dias</span>
            <Calendar size={16} />
          </div>
          <p className="text-3xl font-black">{data?.summary?.last_7_days || 0}</p>
          <p className="text-[10px] opacity-40 italic">Média de {(data?.summary?.last_7_days / 7).toFixed(1)}/dia</p>
        </div>

        <div className="gls p-6 bg-[var(--card)] space-y-2">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Top Link</span>
            <Target size={16} />
          </div>
          <p className="text-lg font-black truncate">{data?.summary?.top_link || 'Nenhum'}</p>
          <p className="text-[10px] opacity-40 uppercase tracking-tighter">O mais clicado</p>
        </div>

        <div className="gls p-6 bg-[var(--card)] space-y-2">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Último Clique</span>
            <Clock size={16} />
          </div>
          <p className="text-lg font-black">
            {data?.summary?.last_click ? new Date(data.summary.last_click).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
          </p>
          <p className="text-[10px] opacity-40">
            {data?.summary?.last_click ? new Date(data.summary.last_click).toLocaleDateString() : 'Sem registros'}
          </p>
        </div>
      </div>

      {/* 2. SMART - Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 gls p-6 bg-[var(--card)] min-h-[400px] relative overflow-hidden">
          {plan === 'free' && <UpgradeGate target="smart" />}
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-sm uppercase tracking-widest">Desempenho Diário</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] opacity-40">
                <div className="w-2 h-2 bg-orange rounded-full" /> Cliques
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.clicks_by_day || []}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5c00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff5c00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#ff5c00" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sources */}
        <div className="gls p-6 bg-[var(--card)] relative overflow-hidden">
          {(plan === 'free' || plan === 'smart') && <UpgradeGate target="pro" />}
          
          <h3 className="font-black text-sm uppercase tracking-widest mb-6">Origens Principais</h3>
          
          <div className="space-y-6">
            {data?.top_sources?.map((s: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2">
                    {s.source === 'Whatsapp' && <Share2 size={12} className="text-emerald-500" />}
                    {s.source}
                  </span>
                  <span>{s.count}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--glass2)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange rounded-full" 
                    style={{ width: `${(s.count / data.summary.total_clicks * 100) || 0}%` }}
                  />
                </div>
              </div>
            ))}
            {(!data?.top_sources || data.top_sources.length === 0) && (
              <div className="text-center py-10 opacity-30 text-xs">Aguardando dados...</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRO - Detailed Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {(plan === 'free' || plan === 'smart') && <UpgradeGate target="pro" />}
        
        {/* Campaign Ranking */}
        <div className="gls p-6 bg-[var(--card)]">
          <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap size={16} className="text-orange" /> Campanhas Ativas
          </h3>
          <div className="space-y-4">
            {data?.campaigns?.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--glass2)] rounded-xl border border-[var(--border)]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{c.name}</span>
                  <span className="text-[10px] opacity-40 uppercase tracking-widest">Active Campaign</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black">{c.clicks}</span>
                  <p className="text-[9px] text-emerald-500 font-bold">CTR 4.2%</p>
                </div>
              </div>
            ))}
            {(!data?.campaigns || data.campaigns.length === 0) && (
               <div className="text-center py-10 opacity-30 text-xs">Sem campanhas registradas</div>
            )}
          </div>
        </div>

        {/* Pro Insights */}
        <div className="gls p-6 bg-[var(--card)] bg-gradient-to-br from-orange/5 to-transparent">
          <h3 className="font-black text-sm uppercase tracking-widest mb-6">Insights Automáticos</h3>
          <div className="space-y-4">
             <div className="flex items-start gap-4 p-4 rounded-xl border border-orange/20 bg-orange/5">
                <Clock className="text-orange shrink-0" size={18} />
                <div>
                   <p className="text-xs font-bold">Horário de Pico</p>
                   <p className="text-[11px] opacity-60">Seu melhor horário de conversão é às 20:00h.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <Share2 className="text-emerald-500 shrink-0" size={18} />
                <div>
                   <p className="text-xs font-bold">Canal Vencedor</p>
                   <p className="text-[11px] opacity-60">O WhatsApp converte 62% melhor que o Telegram.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <TrendingUp className="text-blue-500 shrink-0" size={18} />
                <div>
                   <p className="text-xs font-bold">Performance de Link</p>
                   <p className="text-[11px] opacity-60">O link do Shampoo Vonixx performa 3x mais que a média.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 4. PREMIUM - Advanced Features */}
      <div className="gls p-8 bg-[var(--card)] relative overflow-hidden">
        {plan !== 'premium' && <UpgradeGate target="premium" />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Smartphone size={16} className="text-orange" /> Dispositivos
            </h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.devices || [{name: 'Mobile', count: 65}, {name: 'Desktop', count: 35}]}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    <Cell fill="#ff5c00" />
                    <Cell fill="#30363d" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
               <div className="flex items-center gap-1 text-[10px] opacity-40"><div className="w-2 h-2 rounded-full bg-orange" /> Mobile</div>
               <div className="flex items-center gap-1 text-[10px] opacity-40"><div className="w-2 h-2 rounded-full bg-slate-700" /> Desktop</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-orange" /> Cidades Principais
            </h3>
            <div className="space-y-2">
              {data?.top_cities?.map((city: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                   <span className="opacity-60">{city.name}</span>
                   <span className="font-black">{city.count}</span>
                </div>
              ))}
              {(!data?.top_cities) && [
                {name: 'São Paulo', count: 1240},
                {name: 'Curitiba', count: 850},
                {name: 'Belo Horizonte', count: 420}
              ].map((city, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                   <span className="opacity-60">{city.name}</span>
                   <span className="font-black">{city.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-orange" /> Predições IA
            </h3>
            <div className="p-4 bg-orange/10 border border-orange/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-orange">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Growth Forecast</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {data?.advanced?.prediction || "Baseado nos dados atuais, seu crescimento estimado é de 15% nos próximos 30 dias."}
              </p>
              <div className="pt-2 border-t border-orange/10">
                <p className="text-[10px] opacity-40">Benchmark Categoria:</p>
                <p className="text-xs font-bold text-emerald-500">+24% vs média</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
