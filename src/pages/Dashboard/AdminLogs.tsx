import React, { useState, useEffect } from 'react';
import { 
  Activity, MousePointer2, Search, Filter, 
  Download, Loader2, Clock, User as UserIcon,
  Database, Info
} from 'lucide-react';
import api from '../../services/api';

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logType, setLogType] = useState<'activity' | 'traffic'>('activity');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/logs?type=${logType}`);
      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="animate-fade-up space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Logs do Sistema</h1>
          <p className="opacity-40 text-sm">Auditoria completa de atividades e tráfego em tempo real.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--glass2)] border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--border)] transition-all">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[var(--glass2)] rounded-2xl w-fit border border-[var(--border)]">
        <button 
          onClick={() => setLogType('activity')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            logType === 'activity' ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'opacity-40 hover:opacity-100'
          }`}
        >
          <Activity size={14} /> Atividades
        </button>
        <button 
          onClick={() => setLogType('traffic')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            logType === 'traffic' ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'opacity-40 hover:opacity-100'
          }`}
        >
          <MousePointer2 size={14} /> Tráfego
        </button>
      </div>

      <div className="gls p-2 bg-[var(--card)]">
        <div className="p-4 flex flex-col md:flex-row items-center gap-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--glass2)] border border-[var(--border)] rounded-xl focus-within:border-orange/30 transition-all w-full md:w-96">
            <Search size={16} className="opacity-20" />
            <input 
              type="text" 
              placeholder="Filtrar por ação, entidade ou detalhes..." 
              className="bg-transparent border-none outline-none text-xs w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
             <button onClick={fetchLogs} className="p-2 hover:bg-[var(--glass2)] rounded-lg transition-all text-orange">
                <Clock size={18} />
             </button>
             <button className="p-2 hover:bg-[var(--glass2)] rounded-lg transition-all">
                <Filter size={18} />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Data / Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Ação</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">
                    {logType === 'activity' ? 'Usuário' : 'Origem'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Entidade</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-10 opacity-40 text-sm">Nenhum log encontrado.</td></tr>
                ) : filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--glass2)] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${getStatusColor(log.status)}`}>
                          {log.action}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                             {logType === 'activity' ? <UserIcon size={12} /> : <Database size={12} />}
                          </div>
                          <span className="text-xs font-medium">{logType === 'activity' ? log.user : log.source}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold opacity-80">{log.entity}</td>
                    <td className="px-6 py-4 max-w-xs">
                       <p className="text-[10px] opacity-50 line-clamp-2 italic">{log.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 opacity-30">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px]">
            <Info size={14} /> Retenção: 90 dias
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px]">
            <Database size={14} /> Espaço: 12.4 MB
         </div>
      </div>
    </div>
  );
};

export default AdminLogs;
