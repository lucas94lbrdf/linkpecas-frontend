import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, ExternalLink, Loader2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const AdminAds: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data } = await api.get('/api/admin/ads');
      setAds(data || []);
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/ads/${id}`, { status });
      Swal.fire({
        icon: 'success',
        title: 'Status Atualizado',
        text: `O anúncio foi marcado como ${status}.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchAds();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao atualizar status do anúncio',
        background: '#0d1117',
        color: '#fff'
      });
    }
  };

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Gestão de Anúncios</h1>
          <p className="opacity-40 text-sm">Modere e gerencie todos os links do marketplace.</p>
        </div>
      </div>

      <div className="gls p-2 bg-[var(--card)]">
        <div className="p-4 flex items-center gap-4 bg-[var(--glass2)] rounded-xl mb-4">
          <Search size={18} className="opacity-20" />
          <input 
            type="text" 
            placeholder="Buscar por ID, título ou vendedor..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Anúncio</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Vendedor</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Preço / Mktplace</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Status</th>
                  <th className="px-4 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ads.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-10 opacity-40 text-sm">Nenhum anúncio encontrado.</td></tr>
                ) : ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-[var(--glass2)] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold">{ad.title}</p>
                      <p className="text-[10px] opacity-30">ID: {ad.id}</p>
                    </td>
                    <td className="px-6 py-4 text-xs opacity-80">{ad.seller_name || 'Desconhecido'}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-orange">R$ {ad.price}</p>
                      <span className="text-[9px] opacity-50 uppercase tracking-widest">{ad.marketplace}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {ad.is_universal ? (
                        <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold uppercase text-[9px]">Universal</span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-orange/10 text-orange font-bold uppercase text-[9px]">Compatível</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                        ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                        ad.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(ad.id, 'active')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-slate-400" title="Aprovar/Ativar"><CheckCircle size={16} /></button>
                        <button onClick={() => updateStatus(ad.id, 'rejected')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400" title="Rejeitar"><XCircle size={16} /></button>
                        <button onClick={() => navigate(`/link/${ad.id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-all text-slate-400" title="Ver Métricas"><BarChart3 size={16} /></button>
                        <a href={`/product/${ad.slug || ad.short_code}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-500/20 transition-all text-slate-400" title="Ver Link"><ExternalLink size={16} /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;
