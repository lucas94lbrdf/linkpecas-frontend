import React, { useState, useEffect } from 'react';
import { 
  Heart, Star, Clock, 
  Trash2, TrendingDown, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const EnthusiastDashboard: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [favsRes, ratingsRes] = await Promise.all([
        api.get('/api/enthusiast/favorites'),
        api.get('/api/enthusiast/ratings')
      ]);
      setFavorites(favsRes.data || []);
      setRatings(ratingsRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar dados do entusiasta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavorite = async (id: string) => {
    try {
      await api.post(`/api/enthusiast/favorite/${id}`);
      setFavorites(favorites.filter(f => f.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Removido dos Favoritos',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#0d1117',
        color: '#fff'
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro ao remover' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-orange" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Meu Painel de Entusiasta</h1>
          <p className="opacity-40 text-sm">Gerencie seus links favoritos e suas contribuições para a comunidade.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="gls p-4 flex flex-col items-center min-w-[120px] border border-orange/20">
              <span className="text-2xl font-black text-orange">{favorites.length}</span>
              <span className="text-[10px] uppercase font-bold opacity-40">Favoritos</span>
           </div>
           <div className="gls p-4 flex flex-col items-center min-w-[120px] border border-fuchsia-500/20">
              <span className="text-2xl font-black text-fuchsia-500">{ratings.length}</span>
              <span className="text-[10px] uppercase font-bold opacity-40">Avaliações</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Favoritos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-rose-500 fill-rose-500" />
            <h2 className="text-xl font-black uppercase tracking-tight">Meus Favoritos</h2>
          </div>

          {favorites.length === 0 ? (
            <div className="gls p-12 text-center border-dashed border-2 opacity-40">
              <p className="text-sm italic">Você ainda não favoritou nenhum link. Comece a explorar!</p>
              <Link to="/offers" className="inline-block mt-4 text-orange font-bold hover:underline">Ver Ofertas</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map(fav => (
                <div key={fav.id} className="gls p-4 group relative hover:translate-y-[-4px] transition-all duration-300">
                  <div className="flex gap-4">
                    <img 
                      src={fav.image_url || 'https://via.placeholder.com/150'} 
                      alt={fav.title}
                      className="w-20 h-20 rounded-xl object-cover shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black truncate">{fav.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-orange font-black text-sm">R$ {fav.price?.toLocaleString('pt-BR')}</span>
                        {fav.old_price > fav.price && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            <TrendingDown size={10} /> Promoção
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Link to={`/offers/${fav.slug}`} className="text-[10px] font-black uppercase bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-orange transition-colors">Detalhes</Link>
                        <button 
                          onClick={() => handleUnfavorite(fav.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minhas Avaliações */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-black uppercase tracking-tight">Minhas Notas</h2>
          </div>

          <div className="space-y-4">
            {ratings.length === 0 ? (
              <div className="gls p-8 text-center opacity-40 text-xs italic">
                Nenhuma avaliação feita.
              </div>
            ) : ratings.map(rating => (
              <div key={rating.id} className="gls p-5 space-y-3 border-l-4 border-fuchsia-500 bg-fuchsia-500/5">
                <div className="flex justify-between items-start">
                  <h4 className="text-[10px] font-black uppercase opacity-60 truncate max-w-[150px]">{rating.ad_title}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < rating.score ? "text-yellow-500 fill-yellow-500" : "text-slate-700"} />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-medium leading-relaxed italic opacity-80">"{rating.comment || 'Sem comentário.'}"</p>
                <p className="text-[9px] font-bold opacity-30 flex items-center gap-1 uppercase tracking-widest">
                  <Clock size={8} /> {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnthusiastDashboard;
