import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Trash2, Edit, Loader2, Zap } from 'lucide-react';
import api from '../../services/api';

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/offers')
      .then(res => setOffers(res.data || []))
      .catch(err => console.error('Erro ao buscar ofertas', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Minhas Ofertas</h1>
          <p className="opacity-40 text-sm">Crie promoções relâmpago e descontos especiais nos seus produtos.</p>
        </div>
        <button className="bg-orange text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange/20">
          <Plus size={16} /> Nova Oferta
        </button>
      </div>

      <div className="gls p-2 bg-[var(--card)]">
        <div className="p-4 flex items-center gap-4 bg-[var(--glass2)] rounded-xl mb-4">
          <Search size={18} className="opacity-20" />
          <input 
            type="text" 
            placeholder="Buscar ofertas..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-16 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Produto</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Desconto</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Validade</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-14">
                      <div className="flex flex-col items-center opacity-30">
                        <Tag size={48} className="mb-4" />
                        <p className="text-sm">Nenhuma oferta ativa no momento.</p>
                      </div>
                    </td>
                  </tr>
                ) : offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[var(--glass2)] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold">{offer.title}</p>
                      <p className="text-[10px] opacity-30 uppercase tracking-widest">Preço original: R$ {offer.original_price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg text-[10px] font-bold">-{offer.discount}%</span>
                         <span className="text-xs font-black">R$ {offer.deal_price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs opacity-50 font-mono">
                      {offer.expires_at || 'Ilimitada'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange">
                         <Zap size={10} /> Ativa
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange/10 hover:text-orange transition-all"><Edit size={14} /></button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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

export default Offers;
