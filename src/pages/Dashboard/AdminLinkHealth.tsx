import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, ShieldAlert, Link2, CheckCircle, XCircle,
  Users, BarChart, Loader2, RefreshCw, AlertTriangle, Search
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, ReferenceLine
} from 'recharts';
import api from '../../services/api';
import Swal from 'sweetalert2';
import CheckHistoryModal from '../../components/dashboard/CheckHistoryModal';
import './AdminLinkHealth.css';

const COLORS = ['#ff5c00', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

const AdminLinkHealth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [deactivations, setDeactivations] = useState<any[]>([]);
  const [worstShops, setWorstShops] = useState<any[]>([]);
  const [forcing, setForcing] = useState(false);
  const [modalAdId, setModalAdId] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [mktFilter, setMktFilter] = useState('');
  const [shopFilter, setShopFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, mktRes, trendRes, deactRes, shopsRes] = await Promise.all([
        api.get('/api/admin/link-health/summary'),
        api.get('/api/admin/link-health/by-marketplace'),
        api.get(`/api/admin/link-health/trend?period=${period}`),
        api.get('/api/admin/link-health/recent-deactivations?limit=20'),
        api.get('/api/admin/link-health/worst-shops?limit=10'),
      ]);
      setSummary(sumRes.data);
      setMarketplaces(mktRes.data);
      setTrend(trendRes.data);
      setDeactivations(deactRes.data);
      setWorstShops(shopsRes.data);
    } catch (err) {
      console.error('Failed to fetch link health data', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleForceCheck = async () => {
    const conf = await Swal.fire({
      title: 'Forçar Verificação Completa?',
      html: `Isso vai verificar <strong>${summary?.total_monitored || 0}</strong> links.<br/>Estimativa: ~${Math.max(1, Math.round((summary?.total_monitored || 0) * 2 / 60))} minutos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Verificar Agora',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5c00',
      background: '#0d1117',
      color: '#fff',
    });
    if (!conf.isConfirmed) return;

    setForcing(true);
    try {
      const res = await api.post('/api/admin/link-health/force-check');
      Swal.fire({
        icon: 'success',
        title: 'Verificação Agendada!',
        html: `<strong>${res.data.queued_checks}</strong> checks enfileirados.<br/>Tempo estimado: <strong>${res.data.estimated_time_minutes} min</strong>.`,
        background: '#0d1117', color: '#fff', confirmButtonColor: '#ff5c00',
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao agendar verificação.', background: '#0d1117', color: '#fff' });
    } finally {
      setForcing(false);
    }
  };

  const healthColor = (rate: number) => rate >= 90 ? 'lh-health-green' : rate >= 80 ? 'lh-health-yellow' : 'lh-health-red';

  // Apply filters
  const filteredDeact = deactivations
    .filter(d => !mktFilter || d.marketplace === mktFilter)
    .filter(d => !shopFilter || d.shop_name?.toLowerCase().includes(shopFilter.toLowerCase()));

  const filteredShops = worstShops
    .filter(s => !shopFilter || s.shop_name?.toLowerCase().includes(shopFilter.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-up">
        <Loader2 className="animate-spin text-orange" size={36} />
        <p className="text-sm opacity-40">Carregando dados de saúde dos links...</p>
      </div>
    );
  }

  const pieData = marketplaces.map(m => ({ name: m.marketplace, value: m.total }));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-orange" /> Link Health Dashboard
          </h1>
          <p className="opacity-40 text-sm mt-1">
            Monitoramento global de disponibilidade — atualiza a cada 5 min
            {summary?.last_full_check_at && (
              <span className="ml-2 text-[10px]">
                Último check: {new Date(summary.last_full_check_at).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <button onClick={handleForceCheck} disabled={forcing} className="lh-btn-force">
          {forcing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {forcing ? 'Verificando...' : 'Forçar Verificação'}
        </button>
      </div>

      {/* Filters */}
      <div className="lh-filters">
        <select className="lh-select" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
        <select className="lh-select" value={mktFilter} onChange={e => setMktFilter(e.target.value)}>
          <option value="">Todos Marketplaces</option>
          {marketplaces.map(m => <option key={m.marketplace} value={m.marketplace}>{m.marketplace}</option>)}
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <Search size={12} className="opacity-30" />
          <input type="text" placeholder="Filtrar lojista..." value={shopFilter} onChange={e => setShopFilter(e.target.value)}
            className="bg-transparent outline-none text-xs w-32" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="lh-grid lh-grid-4">
        <div className="gls p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500"><Link2 size={18} /></div>
          <div><p className="text-2xl font-black">{summary?.total_monitored || 0}</p><p className="text-[10px] uppercase font-bold tracking-wider opacity-30 mt-1">Monitorados</p></div>
        </div>
        <div className="gls p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500"><CheckCircle size={18} /></div>
          <div>
            <p className="text-2xl font-black text-green-500">{summary?.total_available || 0}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-30 mt-1">Disponíveis</p>
          </div>
        </div>
        <div className="gls p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500"><XCircle size={18} /></div>
          <div>
            <p className="text-2xl font-black text-red-500">{summary?.total_unavailable || 0}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-30 mt-1">Indisponíveis</p>
          </div>
        </div>
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange/10 text-orange"><Activity size={18} /></div>
          <div>
            <p className={`lh-health-badge ${healthColor(summary?.health_rate || 0)}`}>{summary?.health_rate || 0}%</p>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-30 mt-1">Taxa de Saúde</p>
          </div>
          {summary?.avg_check_duration_ms > 0 && (
            <span className="ml-auto text-[9px] opacity-30 font-bold">~{Math.round(summary.avg_check_duration_ms)}ms/check</span>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="lh-grid lh-grid-2" style={{ gap: '1.5rem' }}>
        {/* Pie Chart */}
        <div className="gls p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><BarChart size={16} /> Distribuição por Marketplace</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center opacity-30 text-sm">Sem dados</div>
          ) : (
            <>
              <div className="h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: 'none', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-lg font-black">{summary?.total_monitored}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {marketplaces.map((m, i) => (
                  <div key={m.marketplace} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="opacity-60 truncate">{m.marketplace}</span>
                    <span className="ml-auto font-bold">{m.total}</span>
                    <span className={`text-[9px] font-bold ${m.health_rate >= 90 ? 'text-green-500' : m.health_rate >= 80 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {m.health_rate}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Trend Chart */}
        <div className="gls p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Activity size={16} /> Tendência de Saúde ({period})</h3>
          {trend.length === 0 ? (
            <div className="h-64 flex items-center justify-center opacity-30 text-sm">Sem dados de tendência</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(8,12,21,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Saúde']} />
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: '80%', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                  <Area type="monotone" dataKey="health_rate" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="lh-grid lh-grid-2" style={{ gap: '1.5rem' }}>
        {/* Recent Deactivations */}
        <div className="gls p-6 overflow-x-auto">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Últimas Desativações</h3>
          {filteredDeact.length === 0 ? (
            <div className="py-8 text-center opacity-30 text-sm">Nenhuma desativação recente.</div>
          ) : (
            <table className="lh-table">
              <thead><tr><th>Anúncio</th><th>Lojista</th><th>Motivo</th><th>Data</th></tr></thead>
              <tbody>
                {filteredDeact.map(d => (
                  <tr key={d.ad_id} className="cursor-pointer" onClick={() => setModalAdId(d.ad_id)}>
                    <td className="font-bold hover:text-orange transition-colors max-w-[160px] truncate">{d.ad_title}</td>
                    <td className="opacity-60">{d.shop_name}</td>
                    <td><span className="lh-signal-chip bg-red-500/10 text-red-400">{d.reason}</span></td>
                    <td className="opacity-40 text-[11px]">{d.deactivated_at ? new Date(d.deactivated_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Worst Shops */}
        <div className="gls p-6 overflow-x-auto">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Users size={16} /> Lojistas com Mais Problemas</h3>
          {filteredShops.length === 0 ? (
            <div className="py-8 text-center opacity-30 text-sm">Nenhum lojista com problemas.</div>
          ) : (
            <table className="lh-table">
              <thead><tr><th>Lojista</th><th>Total</th><th>Quebrados</th><th>Taxa</th></tr></thead>
              <tbody>
                {filteredShops.map(s => (
                  <tr key={s.shop_id}>
                    <td className="font-bold">{s.shop_name}</td>
                    <td className="opacity-60">{s.total_ads}</td>
                    <td className="text-red-500 font-black">{s.broken_links}</td>
                    <td>
                      <span className={`text-xs font-bold ${s.broken_rate > 50 ? 'text-red-500' : s.broken_rate > 20 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {s.broken_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Check History Modal */}
      {modalAdId && <CheckHistoryModal adId={modalAdId} onClose={() => setModalAdId(null)} />}
    </div>
  );
};

export default AdminLinkHealth;
