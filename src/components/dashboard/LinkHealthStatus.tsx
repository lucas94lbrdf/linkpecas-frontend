import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ExternalLink, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface LinkIssue {
  id: string;
  title: string;
  external_url: string;
  link_status: 'active' | 'unavailable' | 'error' | 'pending_review';
  last_link_check_at: string;
}

const LinkHealthStatus: React.FC = () => {
  const [issues, setIssues] = useState<LinkIssue[]>([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0 });
  const [loading, setLoading] = useState(true);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Usaremos os próprios endpoints de listagem de ads para processar isso no frontend (ou ideal seria um endpoint específico)
      const res = await api.get('/api/ads/');
      const allAds = res.data;
      
      const externalAds = allAds.filter((ad: any) => ad.url);
      const problemAds = externalAds.filter((ad: any) => 
        ad.link_status === 'unavailable' || ad.link_status === 'error' || ad.link_status === 'pending_review'
      );
      
      setStats({
        total: externalAds.length,
        healthy: externalAds.length - problemAds.length
      });
      setIssues(problemAds.slice(0, 5)); // Mostra os top 5 problemas
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecheck = async (id: string) => {
    setRecheckingId(id);
    try {
      await api.post(`/api/ads/${id}/recheck-link`);
      Swal.fire({
        icon: 'success',
        title: 'Verificação agendada!',
        text: 'O link está sendo verificado em background.',
        background: '#0d1117',
        color: '#fff',
        confirmButtonColor: '#ff5c00'
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível agendar a verificação.',
        background: '#0d1117',
        color: '#fff',
      });
    } finally {
      setRecheckingId(null);
    }
  };

  if (loading) return <div className="gls p-6 animate-pulse h-48 rounded-2xl" />;

  const isPerfect = stats.total > 0 && stats.healthy === stats.total;

  return (
    <div className="gls p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isPerfect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            <Activity size={20} />
          </div>
          <h3 className="font-bold text-sm">Saúde dos Links</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{stats.healthy}<span className="text-sm opacity-40">/{stats.total}</span></p>
          <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">Links Saudáveis</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {issues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-6">
            <CheckCircle size={32} className="mb-2 text-green-500" />
            <p className="text-sm">Todos os seus links estão online e ativos!</p>
          </div>
        ) : (
          issues.map((ad) => (
            <div key={ad.id} className="p-4 rounded-xl bg-[var(--glass2)] border border-red-500/10 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{ad.title}</p>
                  <a href={ad.external_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1 truncate">
                    {ad.external_url} <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex-shrink-0">
                  {ad.link_status === 'unavailable' && <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-red-500/10 text-red-500 flex items-center gap-1"><XCircle size={10}/> Indisponível</span>}
                  {ad.link_status === 'pending_review' && <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-yellow-500/10 text-yellow-500 flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Em Revisão</span>}
                  {ad.link_status === 'error' && <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-gray-500/10 text-gray-400 flex items-center gap-1"><AlertTriangle size={10}/> Erro</span>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[9px] opacity-40">Verificado em: {ad.last_link_check_at ? new Date(ad.last_link_check_at).toLocaleDateString() : 'N/A'}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/edit-link/${ad.id}`}
                    className="text-[10px] font-bold px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Editar URL
                  </button>
                  <button 
                    onClick={() => handleRecheck(ad.id)}
                    disabled={recheckingId === ad.id || ad.link_status === 'pending_review'}
                    className="text-[10px] font-bold px-3 py-1.5 rounded bg-orange/10 text-orange hover:bg-orange/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {recheckingId === ad.id ? <RefreshCw size={12} className="animate-spin" /> : 'Verificar Novamente'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LinkHealthStatus;
