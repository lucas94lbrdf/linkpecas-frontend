import React, { useState, useEffect } from 'react';
import { Ticket, Gift, Clock, CheckCircle2, Copy, Loader2, Award, Zap } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

const PromotionsPublic: React.FC = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/public/promotions')
      .then(res => setPromos(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      icon: 'success',
      title: 'Copiado!',
      text: `Cupom ${code} pronto para uso.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] animate-fade-up pb-20">
      {/* Header Central de Cupons */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-24 px-6 text-white text-center">
         <div className="max-w-4xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
               <Ticket size={32} />
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter">Central de Cupons</h1>
            <p className="text-blue-100/70 text-lg max-w-xl mx-auto leading-relaxed">
               Aproveite descontos exclusivos das melhores lojas do marketplace. Copie o código e use no checkout.
            </p>
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
         {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
         ) : promos.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <Gift size={64} className="mx-auto mb-4" />
               <p className="text-lg font-bold">Nenhuma promoção ativa no momento.</p>
               <p className="text-sm">Fique de olho, novas ofertas chegam a todo momento.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {promos.map((promo) => (
                  <div key={promo.id} className="gls overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-xl shadow-black/5 bg-white">
                     <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                                 {promo.shop_logo ? <img src={promo.shop_logo} className="w-full h-full object-cover" /> : <Award size={20} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black">{promo.shop_name || 'Loja Parceira'}</h4>
                                 <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Verificado</p>
                              </div>
                           </div>
                           <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full flex items-center gap-1">
                              <Zap size={10} fill="currentColor" /> ATIVO
                           </span>
                        </div>

                        <div className="py-6 border-y border-dashed border-slate-200 text-center space-y-2">
                           <h3 className="text-2xl font-black tracking-tight">{promo.label}</h3>
                           <p className="text-xs opacity-40 px-4">{promo.description || 'Desconto aplicado em todos os produtos selecionados da loja.'}</p>
                        </div>

                        <div className="flex flex-col items-center">
                           <p className="text-[10px] font-black uppercase tracking-[3px] opacity-30 mb-3">Clique para copiar</p>
                           <button 
                             onClick={() => copyToClipboard(promo.code)}
                             className="w-full py-4 border-2 border-dashed border-blue-600/30 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all flex items-center justify-center gap-3"
                           >
                              <span className="text-xl font-black text-blue-600 group-hover:text-white font-mono tracking-widest">{promo.code}</span>
                              <Copy size={16} className="text-blue-600 group-hover:text-white" />
                           </button>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase opacity-30 tracking-widest pt-4">
                           <span className="flex items-center gap-1"><Clock size={12} /> Expira em: {promo.expiry}</span>
                           <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12} /> {promo.status}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-slate-100">
         <h2 className="text-2xl font-black mb-10">Como usar os cupons</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="space-y-4">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-lg font-black">1</div>
               <h4 className="font-bold">Escolha um cupom</h4>
               <p className="text-xs opacity-50">Navegue pela lista e encontre a oferta ideal para o seu projeto.</p>
            </div>
            <div className="space-y-4">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-lg font-black">2</div>
               <h4 className="font-bold">Copie o código</h4>
               <p className="text-xs opacity-50">Basta clicar no código para copiá-lo automaticamente.</p>
            </div>
            <div className="space-y-4">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-lg font-black">3</div>
               <h4 className="font-bold">Aplique no Carrinho</h4>
               <p className="text-xs opacity-50">Insira o cupom no checkout do marketplace ou na finalização da compra.</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PromotionsPublic;
