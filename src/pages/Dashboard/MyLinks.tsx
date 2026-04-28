import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ExternalLink, Search, Loader2, GitMerge, Link2, X, CheckSquare, Square, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const MyLinks: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [groupMode, setGroupMode] = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [grouping, setGrouping]   = useState(false);

  const fetchLinks = () => {
    setLoading(true);
    api.get('/api/ads')
      .then(res => setLinks(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLinks(); }, []);

  const filtered = links.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.marketplace?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGroup = async () => {
    if (selected.size < 2) return;
    setGrouping(true);
    try {
      const res = await api.post('/api/dashboard/ads/group', { ad_ids: Array.from(selected) });
      Swal.fire({
        icon: 'success',
        title: `${res.data.linked} links vinculados!`,
        text: 'Agora eles aparecerão juntos na comparação de preços.',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#0d1117', color: '#fff',
      });
      setSelected(new Set());
      setGroupMode(false);
      fetchLinks();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: err.response?.data?.detail || 'Erro ao vincular.', background: '#0d1117', color: '#fff' });
    } finally {
      setGrouping(false);
    }
  };

  const handleUngroup = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Desvincular do grupo?', text: 'Este link não aparecerá mais na comparação de preços do grupo.',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff6b35',
      confirmButtonText: 'Desvincular', cancelButtonText: 'Cancelar',
      background: '#0d1117', color: '#fff',
    });
    if (!confirm.isConfirmed) return;
    await api.delete(`/api/dashboard/ads/${id}/ungroup`);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Excluir Link?', text: 'Você não poderá reverter esta ação!',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ff6b35', cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar',
      background: '#0d1117', color: '#fff',
    });
    if (!confirm.isConfirmed) return;
    await api.delete(`/api/ads/${id}`);
    Swal.fire({ title: 'Excluído!', icon: 'success', background: '#0d1117', color: '#fff', timer: 2000, showConfirmButton: false });
    fetchLinks();
  };

  const mktColor = (m: string) => {
    if (m === 'Shopee') return 'text-orange bg-orange/10 border-orange/20';
    if (m === 'Mercado Livre') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (m === 'Amazon') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  // Agrupar por group_id para mostrar badge de grupo
  const groupCounts: Record<string, number> = {};
  links.forEach(l => { if (l.group_id) groupCounts[l.group_id] = (groupCounts[l.group_id] || 0) + 1; });

  return (
    <div className="space-y-8 animate-fade-up pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Meus Links</h1>
          <p className="opacity-40 text-sm">Gerencie seus anúncios e acompanhe o engajamento.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setGroupMode(v => !v); setSelected(new Set()); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black border transition-all ${
              groupMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[var(--glass2)] border-[var(--border)] hover:border-indigo-500/30 opacity-70 hover:opacity-100'
            }`}
          >
            <GitMerge size={14} />
            {groupMode ? 'Cancelar agrupamento' : 'Vincular links'}
          </button>
          <button
            onClick={() => navigate('/new-link')}
            className="bg-gradient-to-br from-orange to-orange2 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange/20 text-[11px] whitespace-nowrap"
          >
            <PlusCircle size={16} /> Novo Link
          </button>
        </div>
      </div>

      {/* Instruções do modo agrupamento */}
      {groupMode && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-300 flex items-start gap-3">
          <GitMerge size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-black">Modo de agrupamento ativo</p>
            <p className="opacity-70 mt-0.5">Selecione 2 ou mais links do mesmo produto para vinculá-los. Na página do produto, o visitante poderá comparar os preços e escolher o marketplace preferido.</p>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="gls p-2">
        <div className="p-3 flex items-center gap-3 bg-[var(--glass2)] rounded-xl mb-2">
          <Search size={16} className="opacity-20" />
          <input
            type="text"
            placeholder="Filtrar por nome ou marketplace..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="opacity-30" /></button>}
        </div>

        {loading ? (
          <div className="flex justify-center p-16 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {groupMode && <th className="px-4 py-4 w-10" />}
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Produto</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Marketplace</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-center">Opções</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-center">Cliques</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Status</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={groupMode ? 7 : 6} className="text-center p-10 opacity-40">Nenhum link encontrado.</td></tr>
                ) : filtered.map((link) => {
                  const isSelected = selected.has(link.id);
                  const optionCount = (link.marketplace_options?.length || 0) + (link.group_id ? (groupCounts[link.group_id] || 1) - 1 : 0);
                  const inGroup = !!link.group_id;

                  return (
                    <tr
                      key={link.id}
                      className={`hover:bg-[var(--glass2)] transition-colors group ${isSelected ? 'bg-indigo-500/5 border-l-2 border-indigo-500' : ''}`}
                      onClick={() => groupMode && toggleSelect(link.id)}
                      style={{ cursor: groupMode ? 'pointer' : 'default' }}
                    >
                      {groupMode && (
                        <td className="px-4 py-4">
                          {isSelected
                            ? <CheckSquare size={18} className="text-indigo-400" />
                            : <Square size={18} className="opacity-20" />}
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {link.image_url && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                              <img src={link.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold truncate max-w-[200px]">{link.title}</p>
                              {inGroup && (
                                <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded border border-indigo-500/20 flex items-center gap-1 whitespace-nowrap">
                                  <GitMerge size={8} /> Grupo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[9px] opacity-40 font-mono bg-black/5 px-1.5 py-0.5 rounded">
                                /{link.short_code || link.slug}
                              </p>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  const url = `${window.location.origin}/product/${link.slug || link.short_code}`;
                                  navigator.clipboard.writeText(url);
                                  Swal.fire({ icon: 'success', title: 'Link copiado!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                                }}
                                className="text-[9px] font-black text-orange uppercase tracking-tighter hover:underline"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${mktColor(link.marketplace)}`}>
                          {link.marketplace || 'ND'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {optionCount > 0 ? (
                          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-black border border-indigo-500/20">
                            +{optionCount} opção{optionCount > 1 ? 'ões' : ''}
                          </span>
                        ) : (
                          <span className="opacity-20 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black">{(link.clicks_count || 0).toLocaleString('pt-BR')}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          link.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' :
                          link.status === 'pending' ? 'text-amber-500 bg-amber-500/10' :
                          'text-red-500 bg-red-500/10'
                        }`}>
                          {link.status || 'Ativo'}
                        </span>
                      </td>

                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {inGroup && (
                            <button
                              onClick={() => handleUngroup(link.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-slate-400"
                              title="Desvincular do grupo"
                            >
                              <Link2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/link/${link.id}`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-slate-400"
                            title="Ver Métricas"
                          >
                            <BarChart3 size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-link/${link.id}`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange/10 hover:text-orange transition-all text-slate-400"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400"
                          >
                            <Trash2 size={14} />
                          </button>
                          <a
                            href={`/product/${link.short_code || link.slug}`}
                            target="_blank" rel="noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-400 transition-all text-slate-400"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Barra flutuante de agrupamento */}
      {groupMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-[var(--card)] border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-400">
            <GitMerge size={18} />
            <span className="font-black text-sm">{selected.size} links selecionados</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <button
            onClick={handleGroup}
            disabled={grouping || selected.size < 2}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white rounded-xl text-[11px] font-black hover:bg-indigo-600 transition-all disabled:opacity-50"
          >
            {grouping ? <Loader2 size={14} className="animate-spin" /> : <GitMerge size={14} />}
            Vincular selecionados
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="p-2 rounded-lg hover:bg-[var(--glass2)] transition-all opacity-40 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLinks;
