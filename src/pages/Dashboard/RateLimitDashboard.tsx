import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ShieldAlert, Loader2, AlertTriangle, Hash, Clock } from 'lucide-react';
import api from '../../services/api';

interface RateLimitStats {
  total_blocked_today: number;
  blocked_by_route: Record<string, number>;
  top_ips: { ip: string; count: number }[];
  hourly_stats: { hour: string; count: number }[];
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'];
const TICK_COLOR = '#64748b';
const GRID_COLOR = 'rgba(100,116,139,0.12)';

const RateLimitDashboard: React.FC = () => {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/rate-limits/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="gls p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black">Firewall & Rate Limiting</h2>
          <p className="text-[11px] opacity-50 uppercase tracking-widest font-bold">Últimas 24 horas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card: Total Bloqueado */}
        <div className="gls p-6 flex flex-col justify-between border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5">
            <ShieldAlert size={120} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-2">
              <AlertTriangle size={14} /> Requisições Bloqueadas (24h)
            </p>
            <h3 className="text-5xl font-black text-red-500">{stats.total_blocked_today.toLocaleString('pt-BR')}</h3>
          </div>

          {Object.keys(stats.blocked_by_route).length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-[10px] font-black uppercase opacity-40">Principais Rotas Alvo</p>
              {Object.entries(stats.blocked_by_route).map(([route, count]) => (
                <div key={route} className="flex items-center justify-between text-xs">
                  <span className="font-mono opacity-80">{route}</span>
                  <span className="font-black text-red-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gráfico: Bloqueios por Hora */}
        <div className="gls p-6 lg:col-span-2 flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
            <Clock size={14} /> Bloqueios por Hora
          </p>
          <div className="flex-1 h-[250px]">
            {stats.hourly_stats.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-20 text-sm font-bold">Sem bloqueios recentes.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourly_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR }} width={30} />
                  <Tooltip
                    cursor={{ fill: 'rgba(239,68,68,0.05)' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)', background: 'var(--card)' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {stats.hourly_stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length] || '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabela: Top 10 IPs */}
        <div className="gls p-6 lg:col-span-3">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
            <Hash size={14} /> Top 10 IPs Bloqueados
          </p>
          {stats.top_ips.length === 0 ? (
            <p className="opacity-20 italic text-sm text-center py-6 font-bold">Nenhum IP bloqueado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-3 px-4 text-[10px] uppercase font-black opacity-50">Endereço IP</th>
                    <th className="py-3 px-4 text-[10px] uppercase font-black opacity-50 text-right">Tentativas Bloqueadas</th>
                    <th className="py-3 px-4 text-[10px] uppercase font-black opacity-50 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {stats.top_ips.map((item) => (
                    <tr key={item.ip} className="hover:bg-[var(--glass2)] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-red-400">{item.ip}</td>
                      <td className="py-3 px-4 text-right font-black">{item.count}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest">
                          Limitado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RateLimitDashboard;
