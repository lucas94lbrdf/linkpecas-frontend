import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Eye, MousePointerClick, TrendingUp, ExternalLink,
  Copy, Calendar, MapPin, Tag, Globe, Shield, Clock, Package,
  Loader2, Edit3, BarChart3, Users, Truck, Smartphone, Monitor, Tablet
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad-detail', id],
    queryFn: async () => { const res = await api.get(`/api/ads/${id}`); return res.data; },
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const { data: clicks } = useQuery({
    queryKey: ['ad-clicks', id],
    queryFn: async () => {
      try { const res = await api.get(`/api/admin/clicks?ad_id=${id}&limit=50`); return res.data; }
      catch { return { clicks: [], total: 0 }; }
    },
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ icon: 'success', title: 'Copiado!', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-orange" size={48} /></div>;
  if (!ad) return <div className="p-20 text-center opacity-40">Anúncio não encontrado.</div>;

  const trackingUrl = `${window.location.origin}/product/${ad.short_code || ad.slug || id}`;
  const ctr = ad.views_count > 0 ? ((ad.clicks_count / ad.views_count) * 100).toFixed(1) : '0.0';

  const statusColors: Record<string, string> = {
    active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
  };
  const statusLabels: Record<string, string> = { active: 'Ativo', pending: 'Pendente', rejected: 'Rejeitado' };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold opacity-40 hover:opacity-100 hover:text-orange transition-all">
          <ArrowLeft size={14} /> Voltar
        </button>
        <Link to={`/edit-link/${id}`} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">
          <Edit3 size={14} /> Editar
        </Link>
      </div>

      {/* Hero */}
      <div className="gls p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-48 h-40 lg:h-auto rounded-xl overflow-hidden bg-[var(--bg2)] shrink-0">
            {ad.image_url ? <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Package size={48} /></div>}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-black tracking-tight leading-tight">{ad.title}</h1>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shrink-0 ${statusColors[ad.status] || statusColors.pending}`}>
                {statusLabels[ad.status] || ad.status}
              </span>
            </div>
            <p className="text-sm opacity-50 line-clamp-2">{ad.description || 'Sem descrição'}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {ad.condition && (
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${ad.condition === 'new' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                  {ad.condition === 'new' ? 'Novo' : 'Usado'}
                </span>
              )}
              {ad.warranty && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md border text-blue-500 bg-blue-500/10 border-blue-500/20 flex items-center gap-1"><Shield size={8} /> {ad.warranty}</span>}
              {ad.free_shipping && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md border text-emerald-500 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1"><Truck size={8} /> Frete Grátis</span>}
              {ad.category && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md border border-[var(--border2)] opacity-50 flex items-center gap-1"><Tag size={8} /> {ad.category}</span>}
              {ad.marketplace && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md border border-[var(--border2)] opacity-50 flex items-center gap-1"><Globe size={8} /> {ad.marketplace}</span>}
            </div>

            {/* Preço */}
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-emerald-500">R$ {Number(ad.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              {ad.old_price && <span className="text-base line-through opacity-30">R$ {Number(ad.old_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
            </div>

            {/* Tracking URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-3 py-2.5 min-w-0">
                <span className="text-[9px] font-black uppercase opacity-30 shrink-0">Tracking:</span>
                <span className="text-[11px] text-blue-500 truncate flex-1 font-mono">{trackingUrl}</span>
                <button onClick={() => copyToClipboard(trackingUrl)} className="p-1 hover:text-orange transition-all shrink-0"><Copy size={13} /></button>
              </div>
              <a href={ad.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-orange/10 text-orange border border-orange/20 rounded-xl text-xs font-bold hover:bg-orange hover:text-white transition-all shrink-0">
                <ExternalLink size={13} /> Ver Original
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Eye, color: 'text-blue-500', value: ad.views_count || 0, label: 'Visualizações' },
          { icon: MousePointerClick, color: 'text-emerald-500', value: ad.clicks_count || 0, label: 'Cliques' },
          { icon: Users, color: 'text-purple-500', value: ad.unique_clicks || 0, label: 'Cliques Únicos' },
          { icon: TrendingUp, color: 'text-orange', value: `${ctr}%`, label: 'CTR' },
        ].map((m, i) => (
          <div key={i} className="gls p-5 text-center space-y-1">
            <m.icon size={20} className={`mx-auto ${m.color} opacity-60`} />
            <p className="text-2xl font-black">{m.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhes */}
        <div className="gls p-5 space-y-3">
          <h3 className="font-black text-sm flex items-center gap-2"><BarChart3 size={15} className="text-orange" /> Detalhes</h3>
          <div className="space-y-0">
            <DetailRow icon={<Calendar size={13} />} label="Criado em" value={ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : '—'} />
            <DetailRow icon={<Clock size={13} />} label="Expira em" value={ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('pt-BR') : 'Permanente'} />
            <DetailRow icon={<MapPin size={13} />} label="Localização" value={ad.city && ad.state ? `${ad.city}, ${ad.state}` : 'Nacional'} />
            <DetailRow icon={<Globe size={13} />} label="Marketplace" value={ad.marketplace || '—'} />
            <DetailRow icon={<Tag size={13} />} label="Categoria" value={ad.category || '—'} />
            <DetailRow icon={<Shield size={13} />} label="Garantia" value={ad.warranty || 'Sem garantia'} />
            <DetailRow icon={<Package size={13} />} label="Condição" value={ad.condition === 'new' ? 'Novo' : ad.condition === 'used' ? 'Usado' : '—'} />
            <DetailRow icon={<Truck size={13} />} label="Frete Grátis" value={ad.free_shipping ? 'Sim' : 'Não'} />
          </div>
        </div>

        {/* Comunidades + Compatibilidades */}
        <div className="gls p-5 space-y-3">
          <h3 className="font-black text-sm flex items-center gap-2"><Users size={15} className="text-purple-500" /> Comunidades Vinculadas</h3>
          {ad.communities?.length > 0 ? (
            <div className="space-y-2">
              {ad.communities.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl">
                  <span className="text-sm font-bold">{c.name}</span>
                  <Link to={`/comunidades/${c.id}`} className="text-[10px] text-orange font-bold hover:underline">Ver vitrine →</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center opacity-30"><Users size={28} className="mx-auto mb-2" /><p className="text-xs">Nenhuma comunidade.</p></div>
          )}

          {ad.compatibilities?.length > 0 && (
            <>
              <h3 className="font-black text-sm flex items-center gap-2 pt-3 border-t border-[var(--border)]">🚗 Compatibilidades</h3>
              <div className="space-y-2">
                {ad.compatibilities.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-xs space-y-1">
                    <p className="font-bold">{c.manufacturer_name} {c.model_name}</p>
                    <p className="opacity-40">{c.year_start && c.year_end ? `${c.year_start} - ${c.year_end}` : c.year_start || ''}{c.engine ? ` • ${c.engine}` : ''}{c.note ? ` • ${c.note}` : ''}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cliques */}
      <div className="gls p-5 mt-6 space-y-3">
        <h3 className="font-black text-sm flex items-center gap-2">
          <MousePointerClick size={15} className="text-emerald-500" /> Últimos Cliques
          {clicks && (
            <span className="text-[10px] font-bold opacity-30 ml-auto">{clicks.total} total</span>
          )}
        </h3>
        {!clicks?.clicks?.length ? (
          <div className="py-8 text-center opacity-30">
            <MousePointerClick size={28} className="mx-auto mb-2" />
            <p className="text-xs italic">Nenhum clique registrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">Data</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">Dispositivo</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">Origem</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">Cidade/UF</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">Campanha</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest opacity-40">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {clicks.clicks.map((click: any, i: number) => (
                  <tr key={i} className="hover:bg-[var(--bg2)] transition-colors">
                    <td className="px-3 py-2 text-[11px] whitespace-nowrap">{click.clicked_at ? new Date(click.clicked_at).toLocaleString('pt-BR') : '—'}</td>
                    <td className="px-3 py-2">
                      {click.device ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          {click.device === 'mobile' ? <Smartphone size={11} className="text-blue-400" /> : click.device === 'tablet' ? <Tablet size={11} className="text-purple-400" /> : <Monitor size={11} className="text-slate-400" />}
                          <span className="capitalize opacity-70">{click.device}</span>
                        </span>
                      ) : <span className="opacity-20 text-[11px]">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {click.source ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black">{click.source}</span>
                      ) : <span className="opacity-20 text-[11px]">Direto</span>}
                    </td>
                    <td className="px-3 py-2 text-[11px] opacity-60 whitespace-nowrap">
                      {click.city ? `${click.city}${click.state ? `, ${click.state}` : ''}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono opacity-60">{click.campaign || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono opacity-30">{click.ip_hash || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Galeria */}
      {ad.image_urls?.length > 0 && (
        <div className="gls p-5 mt-6 space-y-3">
          <h3 className="font-black text-sm">📷 Galeria ({(ad.image_urls?.length || 0) + (ad.image_url ? 1 : 0)} fotos)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ad.image_url && (
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-orange/30">
                <img src={ad.image_url} alt="Capa" className="w-full h-full object-cover" />
              </div>
            )}
            {ad.image_urls.map((url: string, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                <img src={url} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
    <span className="flex items-center gap-2 text-xs opacity-50">{icon} {label}</span>
    <span className="text-xs font-bold">{value}</span>
  </div>
);

export default AdDetailPage;
