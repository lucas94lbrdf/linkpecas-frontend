import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Loader2, Sparkles,
  Search, Filter, LayoutGrid, Share2
} from 'lucide-react';
import { communityService } from '../services/communityService';
import ProductCard from '../components/shared/ProductCard';
import api from '../services/api';

const CommunityAdsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const communities = await communityService.getAll();
      return communities.find((c: any) => c.id === id);
    },
    enabled: !!id,
  });

  const { data: ads, isLoading: isLoadingAds } = useQuery({
    queryKey: ['community-ads', id],
    queryFn: () => communityService.getAds(id!),
    enabled: !!id,
  });

  const handleSearch = () => {
    const term = searchQuery.trim();
    if (!term) return;

    // Log da busca para Analytics (Demanda Reprimida)
    api.post('/api/public/logs/searches', {
      term: term,
      results_found: ads?.filter((a: any) => a.title.toLowerCase().includes(term.toLowerCase())).length || 0,
      origin: 'community',
      vehicle_context: community?.name
    }).catch(() => {});
  };

  if (isLoadingCommunity || isLoadingAds) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Banner Header Premium */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Foto de Fundo (Banner) */}
        <div className="absolute inset-0">
          <img
            src={community?.banner_url || community?.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000'}
            className="w-full h-full object-cover"
            alt="Banner"
          />
          <div className="absolute inset-0 bg-orange/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Conteúdo do Header */}
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-20">
          <button
            onClick={() => navigate('/comunidades')}
            className="absolute top-8 left-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="flex-1 text-center md:text-left text-white pb-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                {community?.name}
              </h1>
              <p className="text-lg opacity-80 font-medium max-w-2xl">
                {community?.description}
              </p>
            </div>

            <div className="pb-4 flex gap-3">
              <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Area */}
      <div className="max-w-5xl mx-auto px-6 -translate-y-1/2 z-20 relative">
        <div className="gls p-3 flex flex-col md:flex-row gap-3 shadow-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input
              type="text"
              placeholder="O que você está procurando nesta comunidade?"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:border-orange/50 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSearch}
              className="bg-orange text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Buscar
            </button>
            <button 
              onClick={() => { setSearchQuery(''); }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-40"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Anúncios */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black flex items-center gap-2">
            <LayoutGrid size={20} className="text-orange" /> Achados Recentes
          </h2>
          <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
            {ads?.length || 0} Itens encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads?.map((ad: any) => (
            <ProductCard
              key={ad.id}
              product={{
                ...ad,
                image: ad.image_url,
                oldPrice: ad.old_price
              }}
              trackingParams={{ src: 'community', ref: id || '' }}
            />
          ))}

          {ads?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--glass2)] mb-6 opacity-20">
                <Sparkles size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Ainda não há achados aqui</h3>
              <p className="opacity-40 max-w-xs mx-auto text-sm">
                Esta comunidade ainda está sendo populada com as melhores ofertas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default CommunityAdsPage;
