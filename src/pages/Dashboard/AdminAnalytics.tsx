import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  TrendingUp, Globe, Smartphone, Monitor, Clock,
  Loader2, MousePointer2, Users, Search, ChevronUp,
  ChevronDown, ChevronLeft, ChevronRight, Download,
  SlidersHorizontal, X, RefreshCw, ExternalLink,
} from 'lucide-react';
import StatsCard from '../../components/shared/StatsCard';
import api from '../../services/api';
import RateLimitDashboard from './RateLimitDashboard';

const COLORS = ['#ff6b35', '#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899'];

// ─── tipos ────────────────────────────────────────────────────────────────────

interface ChartData {
  total_sessions: string;
  ctr: number;
  conversion: number;
  revenue: { day: string; value: number }[];
  devices: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  hourly: { hour: string; visits: number }[];
  top_stores: { name: string; clicks: number; growth: number }[];
}

interface AdRow {
  ad_id: string;
  ad_title: string;
  ad_slug: string | null;
  short_code: string | null;
  shop_name: string;
  category: string | null;
  marketplace: string | null;
  price: number | null;
  old_price: number | null;
  free_shipping: boolean;
  ad_status: string | null;
  created_at: string | null;
  expires_at: string | null;
  views_count: number;
  clicks_count: number;
  ctr: number;
  last_click_at: string | null;
  last_device: string | null;
  last_city: string | null;
  last_state: string | null;
  last_source: string | null;
  last_referrer: string | null;
  last_ip: string | null;
}

interface TableResponse {
  data: AdRow[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface FilterOptions {
  marketplaces: string[];
  categories: string[];
  statuses: string[];
  sellers: string[];
}

interface Filters {
  search: string;
  seller: string;
  marketplace: string;
  category: string;
  ad_status: string;
  date_from: string;
  date_to: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

const statusBadge = (s: string | null) => {
  const map: Record<string, string> = {
    active:   'bg-emerald-500/10 text-emerald-500',
    pending:  'bg-amber-500/10 text-amber-500',
    rejected: 'bg-red-500/10 text-red-500',
    expired:  'bg-slate-500/10 text-slate-400',
  };
  return map[s || ''] || 'bg-slate-500/10 text-slate-400';
};

const deviceIcon = (d: string | null) => {
  if (d === 'mobile') return '📱';
  if (d === 'tablet') return '📟';
  if (d === 'desktop') return '🖥️';
  return '❓';
};

const TICK_COLOR = '#64748b';
const GRID_COLOR = 'rgba(100,116,139,0.12)';

// ─── componente principal ─────────────────────────────────────────────────────

const AdminAnalytics: React.FC = () => {
  const [chartData, setChartData]       = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [tableData, setTableData]       = useState<TableResponse | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  // --- NOVOS ESTADOS ---
  const [marketplaces, setMarketplaces] = useState<{name: string, value: number}[]>([]);
  const [topManufacturers, setTopManufacturers] = useState<{name: string, clicks: number}[]>([]);
  const [communitiesData, setCommunitiesData] = useState<{community: string, product: string, slug: string, clicks: number}[]>([]);
  const [topDemands, setTopDemands] = useState<{term: string, origin: string, searches: number}[]>([]);

  const [page, setPage]   = useState(1);
  const [sortBy, setSortBy]   = useState('clicks_count');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '', seller: '', marketplace: '', category: '', ad_status: '', date_from: '', date_to: '',
  });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── gráficos + filtros ───────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/api/admin/analytics/v2')
      .then(r => setChartData(r.data))
      .catch(console.error)
      .finally(() => setChartLoading(false));

    api.get('/api/admin/analytics/filter-options')
      .then(r => setFilterOptions(r.data))
      .catch(console.error);

    // --- NOVAS ROTAS ---
    api.get('/api/analytics/marketplaces').then(r => setMarketplaces(r.data)).catch(console.error);
    api.get('/api/analytics/top-manufacturers').then(r => setTopManufacturers(r.data)).catch(console.error);
    api.get('/api/analytics/communities-performance').then(r => setCommunitiesData(r.data)).catch(console.error);
    api.get('/api/analytics/top-demands').then(r => setTopDemands(r.data)).catch(console.error);
  }, []);

  // ── tabela ───────────────────────────────────────────────────────────────────
  const fetchTable = useCallback(() => {
    setTableLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: '50', sort_by: sortBy, sort_dir: sortDir });
    if (filters.search)      p.set('search',      filters.search);
    if (filters.seller)      p.set('seller',      filters.seller);
    if (filters.marketplace) p.set('marketplace', filters.marketplace);
    if (filters.category)    p.set('category',    filters.category);
    if (filters.ad_status)   p.set('ad_status',   filters.ad_status);
    if (filters.date_from)   p.set('date_from',   filters.date_from);
    if (filters.date_to)     p.set('date_to',     filters.date_to);

    api.get(`/api/admin/analytics/clicks?${p}`)
      .then(r => setTableData(r.data))
      .catch(console.error)
      .finally(() => setTableLoading(false));
  }, [page, sortBy, sortDir, filters]);

  useEffect(() => { fetchTable(); }, [fetchTable]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setFilters(f => ({ ...f, search: value }));
    }, 350);
  };

  const handleFilter = (key: keyof Filters, value: string) => {
    setPage(1);
    setFilters(f => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({ search: '', seller: '', marketplace: '', category: '', ad_status: '', date_from: '', date_to: '' });
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ── exportar CSV ──────────────────────────────────────────────────────────────
  const exportCsv = () => {
    if (!tableData?.data?.length) return;
    const headers = ['Produto','Loja','Categoria','Marketplace','Preço','Frete Grátis','Status','Criado em','Expira em','Views','Cliques','CTR','Último Clique','Dispositivo','Cidade','UF','Origem','IP'];
    const csvRows = tableData.data.map(r => [
      r.ad_title, r.shop_name, r.category || '', r.marketplace || '',
      r.price != null ? `R$ ${r.price.toFixed(2)}` : '',
      r.free_shipping ? 'Sim' : 'Não', r.ad_status || '',
      fmtDate(r.created_at), fmtDate(r.expires_at),
      r.views_count, r.clicks_count, `${r.ctr}%`,
      fmtDate(r.last_click_at), r.last_device || '',
      r.last_city || '', r.last_state || '', r.last_source || '', r.last_ip || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));

    const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `analytics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── sort header ───────────────────────────────────────────────────────────────
  const SortTh: React.FC<{ col: string; label: string; cls?: string }> = ({ col, label, cls = '' }) => (
    <th
      className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 cursor-pointer select-none whitespace-nowrap hover:opacity-100 transition-opacity ${cls}`}
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortBy === col
          ? sortDir === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>
          : <ChevronDown size={10} className="opacity-20"/>}
      </span>
    </th>
  );

  const sources = chartData?.sources || [];
  const devices = chartData?.devices || [];

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Global Analytics</h1>
          <p className="opacity-40 text-sm">Monitoramento de tráfego, cliques e performance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/10 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Stats */}
      {chartLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="gls h-28 animate-pulse rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Users}         label="Total de Sessões" value={chartData?.total_sessions || '0'} delta={12}/>
          <StatsCard icon={MousePointer2} label="CTR Médio"        value={`${chartData?.ctr || 0}%`}       delta={-2}  color="var(--blue)"/>
          <StatsCard icon={Globe}         label="Top Origem"        value={sources[0]?.name || 'ND'}        delta={0}   color="var(--orange)"/>
          <StatsCard icon={TrendingUp}    label="Conversão"         value={`${chartData?.conversion || 0}%`} delta={15} color="#10b981"/>
        </div>
      )}

      {/* Gráficos */}
      {!chartLoading && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Volume de Cliques */}
          <div className="lg:col-span-2 gls p-6 flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
              <TrendingUp size={14}/> Volume de Cliques (últimos 7 dias)
            </p>
            <div className="h-[300px] w-full">
              {!(chartData.revenue || []).length ? (
                <div className="h-full flex items-center justify-center opacity-20 italic text-sm">Sem dados históricos ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.revenue}>
                    <defs>
                      <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR }} width={30}/>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }} labelStyle={{ fontWeight: 700, fontSize: 11 }}/>
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#gArea)" strokeWidth={3} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Dispositivos */}
          <div className="gls p-6 flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
              <Smartphone size={14}/> Dispositivos
            </p>
            {!devices.length ? (
              <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">Sem dados.</div>
            ) : (
              <>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={devices} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {devices.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }} formatter={(v: any) => [`${v}%`, '']}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                  {devices.map((dev: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                        <span className="text-[11px] font-bold opacity-60">{dev.name}</span>
                      </div>
                      <span className="text-[11px] font-black">{dev.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Horários de Pico */}
          <div className="lg:col-span-2 gls p-6">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
              <Clock size={14}/> Atividade por Horário
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.hourly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: TICK_COLOR }} interval={2}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: TICK_COLOR }} width={24}/>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }} cursor={{ fill: 'rgba(100,116,139,0.06)' }}/>
                  <Bar dataKey="visits" fill="#ff6b35" radius={[3, 3, 0, 0]} maxBarSize={18}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Origem do Tráfego */}
          <div className="gls p-6">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
              <Globe size={14}/> Origem do Tráfego
            </p>
            <div className="space-y-4">
              {!sources.length ? (
                <p className="opacity-20 italic text-sm">Sem dados.</p>
              ) : sources.map((src: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{src.name}</span>
                    <span className="opacity-40">{src.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--glass2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${src.value}%`, backgroundColor: COLORS[i % COLORS.length] }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── NOVOS BLOCOS DE INTELIGÊNCIA ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Marketplaces (Donut Chart) */}
        <div className="gls p-6 flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
            <Globe size={14}/> Distribuição por Marketplaces
          </p>
          {!marketplaces.length ? (
            <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">Sem dados.</div>
          ) : (
            <div className="flex-1 flex flex-col items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={marketplaces} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" strokeWidth={0}>
                      {marketplaces.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }} formatter={(v: any) => [`${v} cliques`, '']}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 w-full grid grid-cols-2 gap-2">
                {marketplaces.map((mp, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                      <span className="font-bold opacity-60">{mp.name}</span>
                    </div>
                    <span className="font-black">{mp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Top Montadoras (Bar Chart Horizontal) */}
        <div className="gls p-6 flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
            <TrendingUp size={14}/> Top Montadoras
          </p>
          {!topManufacturers.length ? (
            <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">Sem dados.</div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topManufacturers} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false}/>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR }}/>
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: TICK_COLOR, fontWeight: 'bold' }} width={80}/>
                  <Tooltip cursor={{fill: 'rgba(100,116,139,0.05)'}} contentStyle={{ borderRadius: 12, border: '1px solid rgba(100,116,139,0.2)', background: 'var(--card)', color: 'var(--fg)' }}/>
                  <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    {topManufacturers.map((_, i) => <Cell key={i} fill={COLORS[(i+1) % COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Card 3: Performance das Comunidades */}
        <div className="gls p-6 flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
            <Users size={14}/> Performance de Comunidades
          </p>
          {!communitiesData.length ? (
            <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">Sem conversões via grupos.</div>
          ) : (
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-2 text-[10px] uppercase opacity-50 font-black">Comunidade</th>
                    <th className="py-2 text-[10px] uppercase opacity-50 font-black px-4">Produto</th>
                    <th className="py-2 text-[10px] uppercase opacity-50 font-black text-right">Cliques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {communitiesData.map((c, i) => (
                    <tr key={i} className="hover:bg-[var(--glass2)] transition-colors">
                      <td className="py-3 font-bold opacity-80 whitespace-nowrap">{c.community}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[11px] line-clamp-1">{c.product}</span>
                          <a 
                            href={`/product/${c.slug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[9px] text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> ver anúncio
                          </a>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono font-black text-emerald-500">{c.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card 4: Demanda Reprimida */}
        <div className="gls p-6 flex flex-col bg-red-500/5 border-red-500/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Search size={14}/> Demanda Reprimida
            </p>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/10 text-red-500 rounded uppercase">Atenção</span>
          </div>
          {!topDemands.length ? (
            <div className="flex-1 flex items-center justify-center opacity-40 italic text-sm text-red-500">Nenhuma busca sem resultado. Ótimo!</div>
          ) : (
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <p className="text-xs opacity-60 mb-3 text-red-500 font-medium">Os seguintes termos foram buscados mas não retornaram peças.</p>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-red-500/20">
                    <th className="py-2 text-[10px] uppercase opacity-60 font-black text-red-500">Termo Buscado</th>
                    <th className="py-2 text-[10px] uppercase opacity-60 font-black text-red-500 text-center">Origem</th>
                    <th className="py-2 text-[10px] uppercase opacity-60 font-black text-red-500 text-right">Qtd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-500/10">
                  {topDemands.map((d, i) => (
                    <tr key={i} className="hover:bg-red-500/5 transition-colors">
                      <td className="py-3 font-bold text-red-500/80">{d.term}</td>
                      <td className="py-3 text-center">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-500">{d.origin}</span>
                      </td>
                      <td className="py-3 text-right font-mono font-black text-red-500">{d.searches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── TABELA PRINCIPAL ───────────────────────────────────────────────────── */}
      <div className="gls overflow-hidden">

        {/* Cabeçalho */}
        <div className="p-6 border-b border-[var(--border)] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">Desempenho por Anúncio</h2>
              <p className="text-[11px] opacity-40">
                {tableData
                  ? `${tableData.total.toLocaleString('pt-BR')} anúncios encontrados`
                  : 'Carregando...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-orange/10 text-orange border-orange/30'
                    : 'bg-[var(--glass2)] border-[var(--border)] hover:border-orange/30'
                }`}
              >
                <SlidersHorizontal size={14}/>
                Filtros
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-orange text-white text-[9px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={fetchTable}
                className="p-2 rounded-xl bg-[var(--glass2)] border border-[var(--border)] hover:border-orange/30 transition-all text-orange"
                title="Atualizar"
              >
                <RefreshCw size={14} className={tableLoading ? 'animate-spin' : ''}/>
              </button>
              <button
                onClick={exportCsv}
                disabled={!tableData?.data?.length}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-[var(--glass2)] border border-[var(--border)] hover:border-orange/30 transition-all disabled:opacity-30"
              >
                <Download size={14}/> CSV
              </button>
            </div>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--glass2)] border border-[var(--border)] rounded-xl focus-within:border-orange/40 transition-all">
            <Search size={15} className="opacity-30 shrink-0"/>
            <input
              type="text"
              placeholder="Buscar por produto ou loja..."
              className="bg-transparent border-none outline-none text-sm w-full"
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Filtros */}
          {showFilters && filterOptions && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 bg-[var(--glass2)] rounded-2xl border border-[var(--border)]">
              {([
                { key: 'seller',      label: 'Loja',        options: filterOptions.sellers },
                { key: 'marketplace', label: 'Marketplace', options: filterOptions.marketplaces },
                { key: 'category',    label: 'Categoria',   options: filterOptions.categories },
                { key: 'ad_status',   label: 'Status',      options: filterOptions.statuses },
              ] as { key: keyof Filters; label: string; options: string[] }[]).map(({ key, label, options }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</label>
                  <select
                    value={filters[key]}
                    onChange={e => handleFilter(key, e.target.value)}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-orange/40 transition-all"
                  >
                    <option value="">Todos</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Criado de</label>
                <input type="date" value={filters.date_from}
                  onChange={e => handleFilter('date_from', e.target.value)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-orange/40 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Criado até</label>
                <input type="date" value={filters.date_to}
                  onChange={e => handleFilter('date_to', e.target.value)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-orange/40 transition-all"
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-[11px] font-black hover:bg-red-500/10 transition-all"
                  >
                    <X size={11}/> Limpar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          {tableLoading ? (
            <div className="flex items-center justify-center p-20 opacity-40">
              <Loader2 className="animate-spin" size={32}/>
            </div>
          ) : !tableData?.data?.length ? (
            <div className="flex flex-col items-center justify-center p-20 opacity-30 gap-3">
              <Monitor size={36}/>
              <p className="text-sm italic">Nenhum anúncio encontrado com esses filtros.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="border-b border-[var(--border)] sticky top-0 bg-[var(--card)] z-10">
                <tr>
                  <th className="px-4 py-3 pl-6 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Produto</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Loja</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Categoria</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Marketplace</th>
                  <SortTh col="price"        label="Preço"/>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Frete</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Status</th>
                  <SortTh col="views_count"  label="Views"/>
                  <SortTh col="clicks_count" label="Cliques"/>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">CTR</th>
                  <SortTh col="created_at"   label="Criado em"/>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Ult. Clique</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Dispositivo</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Cidade/UF</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Origem</th>
                  <th className="px-4 py-3 pr-6 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tableData.data.map((row, i) => (
                  <tr key={row.ad_id || i} className="hover:bg-[var(--glass2)] transition-colors">
                    <td className="px-4 py-3 pl-6 max-w-[200px]">
                      <p className="font-bold truncate" title={row.ad_title}>{row.ad_title}</p>
                      {row.short_code && <p className="text-[9px] font-mono opacity-30 mt-0.5">{row.short_code}</p>}
                    </td>
                    <td className="px-4 py-3 opacity-60 whitespace-nowrap text-[11px]">{row.shop_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.category
                        ? <span className="px-2 py-0.5 rounded bg-[var(--glass2)] border border-[var(--border)] text-[10px] font-bold">{row.category}</span>
                        : <span className="opacity-20">—</span>}
                    </td>
                    <td className="px-4 py-3 opacity-60 whitespace-nowrap text-[11px]">{row.marketplace || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.price != null ? (
                        <div>
                          <span className="text-emerald-500 font-black">
                            {row.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          {row.old_price != null && (
                            <span className="block text-[9px] line-through opacity-30">
                              {row.old_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          )}
                        </div>
                      ) : <span className="opacity-20">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-[11px]">
                      {row.free_shipping
                        ? <span className="text-emerald-500 font-black">✓</span>
                        : <span className="opacity-20">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${statusBadge(row.ad_status)}`}>
                        {row.ad_status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-center opacity-60">{row.views_count.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-mono text-center font-black">{row.clicks_count.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-orange/10 text-orange text-[10px] font-black">{row.ctr}%</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] opacity-50 whitespace-nowrap">{fmtDate(row.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-[10px] opacity-50 whitespace-nowrap">{fmtDate(row.last_click_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.last_device
                        ? <span className="flex items-center gap-1">{deviceIcon(row.last_device)}<span className="capitalize opacity-70 text-[11px]">{row.last_device}</span></span>
                        : <span className="opacity-20">—</span>}
                    </td>
                    <td className="px-4 py-3 opacity-60 whitespace-nowrap text-[11px]">
                      {row.last_city ? `${row.last_city}${row.last_state ? `, ${row.last_state}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.last_source
                        ? <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black">{row.last_source}</span>
                        : <span className="opacity-20">—</span>}
                    </td>
                    <td className="px-4 py-3 pr-6 font-mono text-[10px] opacity-40 whitespace-nowrap">{row.last_ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {tableData && tableData.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border)]">
            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">
              Página {tableData.page} de {tableData.pages} · {tableData.total.toLocaleString('pt-BR')} registros
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-[var(--glass2)] border border-[var(--border)] disabled:opacity-20 hover:border-orange/30 transition-all">«</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black bg-[var(--glass2)] border border-[var(--border)] disabled:opacity-20 hover:border-orange/30 transition-all">
                <ChevronLeft size={12}/> Anterior
              </button>
              {Array.from({ length: Math.min(5, tableData.pages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, tableData.pages - 4));
                const p = start + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-black border transition-all ${
                      p === page ? 'bg-orange text-white border-orange shadow-lg shadow-orange/20' : 'bg-[var(--glass2)] border-[var(--border)] hover:border-orange/30'
                    }`}>
                    {p}
                  </button>
                );
              })}
              <button disabled={page === tableData.pages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black bg-[var(--glass2)] border border-[var(--border)] disabled:opacity-20 hover:border-orange/30 transition-all">
                Próximo <ChevronRight size={12}/>
              </button>
              <button disabled={page === tableData.pages} onClick={() => setPage(tableData.pages)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-[var(--glass2)] border border-[var(--border)] disabled:opacity-20 hover:border-orange/30 transition-all">»</button>
            </div>
          </div>
        )}
      </div>
      
      {/* ── RATE LIMITING DASHBOARD ────────────────────────────────────────────── */}
      <div className="mt-8">
        <RateLimitDashboard />
      </div>

    </div>
  );
};

export default AdminAnalytics;
