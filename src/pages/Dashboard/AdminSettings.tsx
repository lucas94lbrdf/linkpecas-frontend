import React, { useState } from 'react';
import { Save, CreditCard, Shield, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const saveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Sistema Atualizado',
        text: 'Configurações do sistema salvas com sucesso!',
        background: '#0d1117',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1000);
  };

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="text-3xl font-black">Configurações do Sistema</h1>
        <p className="opacity-40 text-sm">Ajuste os parâmetros globais da plataforma AutoMarket.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gateway de Pagamento */}
        <div className="gls p-8 space-y-6">
           <div className="flex items-center gap-4 mb-4">
              <CreditCard size={24} className="text-orange" />
              <h3 className="font-bold text-lg">Gateway de Pagamento</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Provedor Ativo</label>
                 <select className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2">
                    <option>Stripe</option>
                    <option>Mercado Pago</option>
                    <option>Pagar.me</option>
                 </select>
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Chave Pública (Public Key)</label>
                 <input type="text" className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs opacity-60" defaultValue="pk_test_51Nx..." />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Chave Secreta (Secret Key)</label>
                 <input type="password" className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs opacity-60" defaultValue="sk_test_..." />
              </div>
           </div>
        </div>

        {/* Políticas de Plataforma */}
        <div className="space-y-8">
            <div className="gls p-8 space-y-6">
               <div className="flex items-center gap-4 mb-4">
                  <Shield size={24} className="text-blue" />
                  <h3 className="font-bold text-lg">Políticas & Moderação</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                     <div>
                        <p className="font-bold text-sm">Aprovação Automática</p>
                        <p className="text-[10px] opacity-40">Anúncios vão pro ar sem revisão manual.</p>
                     </div>
                     <input type="checkbox" className="w-5 h-5 accent-orange" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                     <div>
                        <p className="font-bold text-sm">Exigir Verificação de E-mail</p>
                        <p className="text-[10px] opacity-40">Bloqueia criação de links sem ativar conta.</p>
                     </div>
                     <input type="checkbox" className="w-5 h-5 accent-orange" defaultChecked />
                  </div>
               </div>
            </div>

            <button onClick={saveSettings} disabled={loading} className="w-full bg-gradient-to-r from-orange to-orange2 text-white font-black py-4 rounded-xl shadow-2xl shadow-orange/20 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Salvar Configurações
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
