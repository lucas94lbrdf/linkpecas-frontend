import React, { useState, useEffect } from 'react';
import { Gift, Ticket, Calendar, CheckCircle, Loader2, Plus, Users } from 'lucide-react';
import api from '../../services/api';

const Promotions: React.FC = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/promotions')
      .then(res => setPromos(res.data || []))
      .catch(err => console.error('Erro ao buscar promoções', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Campanhas e Promoções</h1>
          <p className="opacity-40 text-sm">Gerencie cupons de desconto e campanhas sazonais para seus clientes.</p>
        </div>
        <button className="bg-blue text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue/20">
          <Ticket size={16} /> Novo Cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Banner/Resumo */}
        <div className="md:col-span-2 lg:col-span-2 gls p-8 bg-gradient-to-br from-blue/5 to-transparent border-blue/10 flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center text-blue mb-4">
                 <Gift size={24} />
              </div>
              <h3 className="text-xl font-black mb-2">Aumente sua visibilidade</h3>
              <p className="text-xs opacity-50 max-w-sm leading-relaxed mb-6">
                Cupons de desconto são a forma mais rápida de atrair novos compradores. 
                Crie um código agora e compartilhe em suas redes sociais.
              </p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg)] bg-slate-200" />
                 ))}
              </div>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Mais de 1.4k usuários usaram cupons hoje</p>
           </div>
        </div>

        {/* Card Estatístico */}
        <div className="gls p-6 flex flex-col justify-center items-center text-center">
           <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
              <Users size={28} />
           </div>
           <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Novos Clientes via Promo</p>
           <h4 className="text-4xl font-black text-emerald-500">12%</h4>
           <p className="text-[9px] opacity-30 mt-2 italic">*Aumento médio na última semana</p>
        </div>
      </div>

      <div className="gls p-8">
        <h3 className="font-bold text-sm uppercase tracking-widest opacity-40 mb-6">Cupons Ativos</h3>
        
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin opacity-20" size={32} /></div>
        ) : (
          <div className="space-y-4">
            {promos.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[var(--border)] rounded-2xl opacity-20">
                 <Ticket size={32} className="mx-auto mb-2" />
                 <p className="text-xs font-bold uppercase tracking-widest">Nenhum cupom criado</p>
              </div>
            ) : promos.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-blue/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center px-4 py-2 bg-blue/10 rounded-xl border border-blue/20">
                     <span className="text-lg font-black text-blue">{promo.code}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{promo.label}</h4>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="flex items-center gap-1 text-[9px] opacity-40 uppercase font-black"><Calendar size={10} /> {promo.expiry}</span>
                       <span className="flex items-center gap-1 text-[9px] text-emerald-500 uppercase font-black"><CheckCircle size={10} /> {promo.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-xs font-black">{promo.usage_count} usos</p>
                      <p className="text-[9px] opacity-30 uppercase font-bold tracking-widest">Limite: {promo.limit}</p>
                   </div>
                   <button className="w-10 h-10 rounded-xl bg-[var(--glass2)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
