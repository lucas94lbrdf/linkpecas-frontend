import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, Globe, ShoppingBag, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const ShopPublic: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados públicos da loja pelo slug
    api.get(`/api/public/shops/${slug}`)
      .then(res => {
        setShop(res.data.shop);
        setAds(res.data.ads || []);
      })
      .catch(err => console.error('Loja não encontrada', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]"><Loader2 className="animate-spin text-orange" size={48} /></div>;

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <Store size={64} className="opacity-10 mb-4" />
      <h2 className="text-2xl font-black">Loja não encontrada</h2>
      <Link to="/" className="text-orange font-bold mt-4">Voltar para a Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] animate-fade-up">
      {/* Banner de Capa */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-orange to-orange2 relative">
         <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Info da Loja */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        <div className="gls p-8 flex flex-col md:flex-row items-center md:items-end gap-8">
           <div className="w-32 h-32 rounded-[40px] bg-white border-8 border-[var(--bg)] shadow-2xl flex items-center justify-center text-5xl font-black text-orange overflow-hidden">
              {shop.logo ? <img src={shop.logo} className="w-full h-full object-cover" /> : shop.name[0]}
           </div>
           
           <div className="flex-1 text-center md:text-left pb-2">
              <h1 className="text-4xl font-black tracking-tight">{shop.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 opacity-50 text-xs font-bold uppercase tracking-widest">
                 <span className="flex items-center gap-1"><MapPin size={14} /> {shop.location || 'Brasil'}</span>
                 <span className="flex items-center gap-1"><ShoppingBag size={14} /> {ads.length} Anúncios</span>
              </div>
           </div>

           <div className="flex gap-2">
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:text-orange transition-all"><Phone size={20} /></a>
              )}
              {shop.website && (
                <a href={shop.website} target="_blank" className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:text-orange transition-all"><Globe size={20} /></a>
              )}
           </div>
        </div>

        {/* Listagem de Produtos */}
        <div className="mt-12 space-y-8 pb-20">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Produtos em Destaque</h2>
              <div className="h-px flex-1 mx-8 bg-[var(--border)] hidden md:block" />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="gls group hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                   <div className="aspect-video bg-slate-200 relative overflow-hidden">
                      {ad.image ? <img src={ad.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center opacity-10"><ShoppingBag size={48} /></div>}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-orange">
                         {ad.marketplace}
                      </div>
                   </div>
                   
                   <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 truncate">{ad.title}</h3>
                      <div className="flex items-center justify-between mb-6">
                         <div>
                            <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter">Preço Especial</p>
                            <p className="text-2xl font-black text-orange">R$ {ad.price}</p>
                         </div>
                         <div className="text-right opacity-30">
                            <p className="text-[10px] uppercase font-black">Anterior</p>
                            <p className="text-sm line-through">R$ {ad.old_price || ad.price * 1.2}</p>
                         </div>
                      </div>

                      <Link 
                        to={`/product/${ad.slug || ad.id}`}
                        className="w-full bg-[var(--fg)] text-[var(--bg)] font-black py-4 rounded-xl flex items-center justify-center gap-2 group-hover:bg-orange group-hover:text-white transition-all shadow-xl shadow-black/5"
                      >
                         Eu quero <ArrowRight size={16} />
                      </Link>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPublic;
