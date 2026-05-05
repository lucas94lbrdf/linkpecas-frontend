import React, { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import api from '../../services/api';

interface Check {
  id: string;
  http_status: number | null;
  is_available: boolean;
  signals: Record<string, boolean>;
  price_found: number | null;
  error_message: string | null;
  check_duration_ms: number | null;
  checked_at: string | null;
}

interface Props {
  adId: string;
  onClose: () => void;
}

const SIGNAL_LABELS: Record<string, string> = {
  http_404: 'HTTP 404', out_of_stock_text: 'Esgotado', redirect_home: 'Redirect Home',
  price_missing: 'Sem Preço', buy_button_missing: 'Sem Botão Compra', timeout: 'Timeout',
};

const CheckHistoryModal: React.FC<Props> = ({ adId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/admin/link-health/check-history/${adId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adId]);

  const last = data?.checks?.[0];

  return (
    <div className="lh-modal-overlay" onClick={onClose}>
      <div className="lh-modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black">{data?.ad_title || 'Carregando...'}</h2>
            {data?.external_url && (
              <a href={data.external_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1">
                {data.external_url.substring(0, 60)}... <ExternalLink size={10} />
              </a>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin opacity-40" size={28} /></div>
        ) : (
          <>
            {/* Status badge */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: data?.current_status === 'active' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <span className={`w-3 h-3 rounded-full ${data?.current_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold uppercase tracking-widest">{data?.current_status}</span>
            </div>

            {/* Timeline dots */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Timeline de Verificações</p>
              <div className="lh-timeline">
                {data?.checks?.map((c: Check) => (
                  <div key={c.id} className={`lh-dot ${c.is_available ? 'lh-dot-ok' : 'lh-dot-fail'}`}
                    title={`${c.checked_at ? new Date(c.checked_at).toLocaleString() : 'N/A'} — ${c.is_available ? 'OK' : 'Falha'}`} />
                ))}
              </div>
            </div>

            {/* Last check details */}
            {last && (
              <div className="gls p-5 mb-6 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Última Verificação</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div><p className="text-lg font-black">{last.http_status || '—'}</p><p className="text-[9px] opacity-40 uppercase">HTTP</p></div>
                  <div><p className="text-lg font-black">{last.check_duration_ms ? `${last.check_duration_ms}ms` : '—'}</p><p className="text-[9px] opacity-40 uppercase">Duração</p></div>
                  <div><p className="text-lg font-black">{last.price_found ? `R$${last.price_found.toFixed(2)}` : '—'}</p><p className="text-[9px] opacity-40 uppercase">Preço</p></div>
                  <div><p className="text-lg font-black">{last.checked_at ? new Date(last.checked_at).toLocaleDateString() : '—'}</p><p className="text-[9px] opacity-40 uppercase">Data</p></div>
                </div>
                {last.error_message && <p className="text-xs text-red-400 mt-2">Erro: {last.error_message}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(last.signals || {}).filter(([, v]) => v).map(([k]) => (
                    <span key={k} className="lh-signal-chip bg-red-500/10 text-red-400">{SIGNAL_LABELS[k] || k}</span>
                  ))}
                  {Object.keys(last.signals || {}).filter(k => last.signals[k]).length === 0 && (
                    <span className="lh-signal-chip bg-green-500/10 text-green-400">Nenhum sinal negativo</span>
                  )}
                </div>
              </div>
            )}

            {/* Full history table */}
            <div className="overflow-x-auto">
              <table className="lh-table">
                <thead><tr><th>Data</th><th>HTTP</th><th>Status</th><th>Duração</th><th>Preço</th></tr></thead>
                <tbody>
                  {data?.checks?.slice(0, 20).map((c: Check) => (
                    <tr key={c.id}>
                      <td className="opacity-60">{c.checked_at ? new Date(c.checked_at).toLocaleString() : '—'}</td>
                      <td className="font-bold">{c.http_status || '—'}</td>
                      <td>{c.is_available ? <span className="text-green-500 font-bold">OK</span> : <span className="text-red-500 font-bold">Falha</span>}</td>
                      <td className="opacity-60">{c.check_duration_ms ? `${c.check_duration_ms}ms` : '—'}</td>
                      <td className="opacity-60">{c.price_found ? `R$${c.price_found.toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckHistoryModal;
