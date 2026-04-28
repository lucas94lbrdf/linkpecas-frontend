import React, { useState, useEffect } from 'react';
import { 
  Link2, Eye, BarChart3, TrendingUp, PlusCircle, 
  Settings as SettingsIcon, Crown, ArrowUpRight, ShoppingBag, 
  Zap, AlertCircle, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/shared/StatsCard';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const UserOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.chart || [];
  const recentLinks = data?.recent_links || [];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header / Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fala, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="opacity-40 text-sm">Seu marketplace está performando bem hoje.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => navigate('/settings')}
             className="w-12 h-12 rounded-2xl gls flex items-center justify-center hover:bg-[var(--glass2)] transition-all"
           >
             <SettingsIcon size={20} className="opacity-40" />
           </button>
           <button 
             onClick={() => {
               if (data && data.total_links >= data.plan_limit) {
                 Swal.fire({
                   icon: 'warning',
                   title: 'Limite Atingido!',
                   text: `Seu plano ${data.plan} permite apenas ${data.plan_limit} links. Faça upgrade para continuar postando!`,
                   background: '#0d1117',
                   color: '#fff',
                   confirmButtonText: 'Ver Planos',
                   confirmButtonColor: '#ff5c00',
                   showCancelButton: true,
                   cancelButtonText: 'Fechar'
                 }).then((result) => {
                   if (result.isConfirmed) navigate('/plans');
                 });
               } else {
                 navigate('/new-link');
               }
             }}
             className="bg-gradient-to-br from-orange to-orange2 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange/30"
           >
             <PlusCircle size={18} /> Novo Anúncio
           </button>
        </div>
      </div>

      {/* Account Status Banner - Dinâmico */}
      <div className="gls p-6 border-orange/10 bg-gradient-to-r from-orange/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shadow-lg shadow-orange/10">
            <Crown size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Plano {data?.plan || 'FREE'}</h3>
              <span className="px-2 py-0.5 rounded-md bg-orange text-white text-[8px] font-black uppercase tracking-wider">Ativo</span>
            </div>
            
            {/* Barra de Progresso de Uso */}
            <div className="mt-3 w-full md:w-64">
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase opacity-40">Uso de Links</span>
                  <span className="text-[9px] font-black text-orange">{data?.total_links} / {data?.plan_limit}</span>
               </div>
               <div className="h-1.5 w-full bg-orange/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange transition-all duration-1000" 
                    style={{ width: `${Math.min(data?.used_percentage || 0, 100)}%` }}
                  />
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8 px-8 border-l border-orange/10 hidden md:flex">
           <div className="text-center">
              <p className="text-lg font-black">{data?.total_links || 0}</p>
              <p className="text-[9px] font-black uppercase opacity-20 tracking-wider">Links Ativos</p>
           </div>
           <div className="text-center">
              <p className="text-lg font-black">{data?.impressions || '0'}</p>
              <p className="text-[9px] font-black uppercase opacity-20 tracking-wider">Cliques Mês</p>
           </div>
        </div>
        <button 
          onClick={() => navigate('/plans')}
          className="text-xs font-black text-orange border border-orange/20 px-6 py-3 rounded-xl hover:bg-orange/5 transition-all"
        >
          {data?.plan === 'FREE' ? 'Fazer Upgrade' : 'Mudar Plano'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Link2} label="Meus Links" value={data?.total_links || '0'} delta={data?.links_delta || 0} />
            <StatsCard icon={Eye} label="Impressões" value={data?.impressions || '0'} delta={data?.impressions_delta || 0} color="var(--blue)" />
            <StatsCard icon={TrendingUp} label="Conversão" value={`${data?.conversion || '0'}%`} delta={data?.conversion_delta || 0} color="#10b981" />
            <StatsCard icon={Zap} label="Leads Hoje" value={data?.leads || '0'} delta={data?.leads_delta || 0} color="var(--orange)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <div className="lg:col-span-2 gls p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest opacity-40">Performance de Cliques</h3>
                <div className="flex gap-2">
                   <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                   <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">Real-time Data</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-30 text-sm">Nenhum dado financeiro.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--orange)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(8,12,21,0.95)', 
                          border: '1px solid rgba(255,107,53,0.1)',
                          borderRadius: '16px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="var(--orange)" 
                        fillOpacity={1} 
                        fill="url(#colorClicks)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Actions & Recent */}
            <div className="space-y-6">
              <div className="gls p-6">
                <h3 className="font-bold text-sm mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => navigate('/my-links')}
                     className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--glass2)] hover:bg-orange/10 transition-all border border-transparent hover:border-orange/20 group"
                   >
                      <ShoppingBag size={24} className="opacity-30 group-hover:text-orange group-hover:opacity-100 transition-all" />
                      <span className="text-[10px] font-black uppercase opacity-40">Minha Loja</span>
                   </button>
                   <button 
                     onClick={() => navigate('/analytics')}
                     className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--glass2)] hover:bg-blue/10 transition-all border border-transparent hover:border-blue/20 group"
                   >
                      <BarChart3 size={24} className="opacity-30 group-hover:text-blue group-hover:opacity-100 transition-all" />
                      <span className="text-[10px] font-black uppercase opacity-40">Relatórios</span>
                   </button>
                </div>
              </div>

              <div className="gls p-6 flex-1">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-sm">Anúncios Recentes</h3>
                    <Link2 size={16} className="opacity-20" />
                 </div>
                 <div className="space-y-4">
                    {recentLinks.length === 0 ? (
                      <div className="opacity-30 text-center py-6 text-sm">Nenhum anúncio.</div>
                    ) : recentLinks.map((link: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/edit-link/${link.id}`)}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-lg">
                           🏎️
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold truncate group-hover:text-orange transition-colors">{link.title}</p>
                           <p className="text-[9px] opacity-20 uppercase font-black tracking-widest mt-0.5">R$ {link.price}</p>
                        </div>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-orange" />
                      </div>
                    ))}
                 </div>
                 <button 
                   onClick={() => navigate('/my-links')}
                   className="w-full mt-6 py-3 rounded-xl bg-[var(--glass2)] text-[10px] font-black uppercase tracking-widest hover:text-orange transition-all"
                 >
                    Ver todos os links
                 </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pro Tip / Alert */}
      <div className="gls p-4 border-blue/10 bg-blue/5 flex items-center gap-4">
         <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center text-blue flex-shrink-0">
            <AlertCircle size={20} />
         </div>
         <p className="text-xs opacity-60">
           <strong>Dica Pro:</strong> Anúncios com fotos reais e descrição detalhada convertem <strong>35% mais</strong>. Revise seus anúncios recentes!
         </p>
      </div>
    </div>
  );
};

export default UserOverview;
