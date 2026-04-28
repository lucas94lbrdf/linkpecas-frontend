import React, { useState, useEffect } from 'react';
import { Search, Loader2, TrendingDown, Percent, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shared/ProductCard';
import api from '../services/api';

const OffersPublic: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const q = searchParams.get('q') || '';
  const filter = searchParams.get('category') || 'all';

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    setLoading(true);
    
    // Constrói os parâmetros da query para o backend
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (filter !== 'all') params.append('category', filter);

    api.get(`/api/public/ads?${params.toString()}`)
      .then(res => {
        const data = res.data || [];
        setOffers(data);
        
        // Log da busca para Analytics (Demanda Reprimida)
        if (q) {
          api.post('/api/public/logs/searches', {
            term: q,
            results_found: data.length,
            origin: 'site'
          }).catch(() => {});
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [q, filter]);

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    if (inputValue) {
      newParams.set('q', inputValue);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] animate-fade-up pb-20">
      {/* Banner de Ofertas */}
      <section className="bg-gradient-to-br from-orange to-orange2 py-20 px-6 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20" />
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
            {/* <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
               💰 Economia Real
            </div> */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">Ofertas do Dia</h1>
            <p className="text-white/70 max-w-lg font-medium">
               Os menores preços garimpados em todos os marketplaces parceiros.
            </p>
         </div>
      </section>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
         <div className="gls p-4 flex flex-col md:flex-row items-center gap-4 bg-white shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full">
               <Search size={18} className="opacity-20" />
               <input 
                 type="text" 
                 placeholder="O que você está procurando?" 
                 className="bg-transparent border-none outline-none text-sm w-full" 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               {inputValue && (
                 <button onClick={() => { setInputValue(''); searchParams.delete('q'); setSearchParams(searchParams); }} className="opacity-40 hover:opacity-100 transition-all">
                   <X size={14} />
                 </button>
               )}
            </div>
            <button onClick={handleSearch} className="md:hidden w-full bg-orange text-white py-2 rounded-xl font-bold text-sm">Buscar</button>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
               {['all', 'pecas', 'estetica', 'performance', 'acessorios'].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => {
                       const newParams = new URLSearchParams(searchParams);
                       newParams.set('category', cat);
                       setSearchParams(newParams);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-orange text-white shadow-lg' : 'bg-slate-100 opacity-40 hover:opacity-100'}`}
                  >
                     {cat === 'all' ? 'Ver Tudo' : cat}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Listagem */}
      <div className="max-w-7xl mx-auto px-6 py-16">
         {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange" size={48} /></div>
         ) : offers.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <TrendingDown size={64} className="mx-auto mb-4" />
               <p className="text-lg font-bold">Nenhuma oferta relâmpago agora.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {offers.map((product, i) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    delay={i * 100} 
                    trackingParams={{ src: 'site', ref: 'offers' }}
                  />
               ))}
            </div>
         )}
      </div>

      {/* Banner Final */}
      <div className="max-w-7xl mx-auto px-6">
         <div className="gls p-10 bg-gradient-to-r from-slate-900 to-black border-none text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-orange/20 flex items-center justify-center text-orange">
                  <Percent size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-black">Quer divulgar suas ofertas aqui?</h3>
                  <p className="text-sm opacity-50 text-gray-800">Crie sua loja agora e comece a vender no maior hub automotivo.</p>
               </div>
            </div>
            <button className="bg-orange px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange/30">
               Criar minha loja grátis
            </button>
         </div>
      </div>
    </div>
  );
};

export default OffersPublic;
