import React, { useState, useEffect } from 'react';
import { Store, Search, ArrowRight, Loader2, ShoppingBag, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ShopsDirectory: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/api/public/shops')
      .then(res => setShops(res.data || []))
      .catch(err => console.error('Erro ao carregar diretório de lojas', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredShops = shops.filter(shop => 
    shop.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] animate-fade-up">
      {/* Header do Diretório */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] " />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Nossos <span className="text-orange">Parceiros</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Conheça as melhores lojas de peças, acessórios e serviços automotivos do Brasil reunidas em um só lugar.
          </p>
          
          <div className="max-w-xl mx-auto mt-10">
            <div className="gls flex items-center gap-4 px-6 py-4 bg-white/5 border-white/10">
               <Search size={20} className="text-orange" />
               <input 
                 type="text" 
                 placeholder="Buscar por nome da loja..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-transparent border-none outline-none text-white w-full text-sm"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Lojas */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-orange opacity-30" size={48} />
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Store size={64} className="mx-auto mb-4" />
            <p className="text-xl font-bold">Nenhuma loja encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <Link 
                key={shop.id} 
                to={`/loja/${shop.slug}`}
                className="gls p-6 group hover:border-orange/30 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Background Decorativo */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange/5 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-orange/20 transition-all" />

                <div className="w-24 h-24 rounded-[32px] bg-white border border-[var(--border)] shadow-xl flex items-center justify-center text-3xl font-black text-orange overflow-hidden mb-6 group-hover:shadow-orange/10 transition-all">
                  {shop.logo ? (
                    <img src={shop.logo} className="w-full h-full object-cover" />
                  ) : (
                    shop.name[0]
                  )}
                </div>

                <h3 className="font-bold text-lg mb-2 group-hover:text-orange transition-all">{shop.name}</h3>
                
                <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest opacity-40 mb-6">
                   <span className="flex items-center gap-1"><ShoppingBag size={12} /> {shop.ad_count || 0} Itens</span>
                   <span className="flex items-center gap-1"><MapPin size={12} /> {shop.location?.split(',')[0] || 'Brasil'}</span>
                </div>

                <div className="w-full mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                   Visitar Loja <ArrowRight size={14} className="text-orange" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ShopsDirectory;
