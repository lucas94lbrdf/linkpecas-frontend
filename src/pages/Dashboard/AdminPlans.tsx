import React, { useState, useEffect } from 'react';
import { Crown, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/plans')
      .then(res => setPlans(res.data || []))
      .catch(err => console.error('Erro ao buscar planos:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Gestão de Planos</h1>
          <p className="opacity-40 text-sm">Configure os pacotes de assinatura e limites do sistema.</p>
        </div>
        <button className="bg-orange text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
           <Plus size={16} /> Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? <div className="col-span-full p-10 flex justify-center"><Loader2 className="animate-spin opacity-50" /></div> : plans.map((plan) => (
          <div key={plan.id} className="gls p-6 relative">
             <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-[var(--glass2)] rounded-lg text-emerald-500">
               {plan.status}
             </div>
             <Crown size={32} className="text-orange mb-4 opacity-50" />
             <input className="text-2xl font-black bg-transparent border-b border-[var(--border)] outline-none mb-2 w-full" defaultValue={plan.name} />
             <div className="flex items-center gap-2 mb-6">
               <span className="text-lg opacity-40">R$</span>
               <input type="number" className="text-3xl font-black bg-transparent outline-none w-24 text-orange" defaultValue={plan.price} />
             </div>
             
             <div className="space-y-4">
               <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Limite de Links</label>
                  <input type="number" className="w-full bg-[var(--card)] px-4 py-2 mt-1 rounded-lg text-sm border border-[var(--border)]" defaultValue={plan.link_limit} />
               </div>
             </div>

             <div className="mt-8 flex gap-2">
               <button className="flex-1 bg-[var(--glass2)] hover:bg-orange hover:text-white transition-all py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                 <Save size={14} /> Salvar
               </button>
               <button className="px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center">
                 <Trash2 size={16} />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;
