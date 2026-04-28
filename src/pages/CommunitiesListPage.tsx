import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { communityService } from '../services/communityService';

const CommunitiesListPage: React.FC = () => {
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: communityService.getAll,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Users className="text-orange" size={32} /> Comunidades
          </h1>
          <p className="opacity-50 font-medium">Vitrines curadas por nichos e paixões automotivas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {communities?.map((community: any) => (
          <div
            key={community.id}
            className="gls group relative overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all duration-500"
          >
            {/* Imagem de Fundo/Capa */}
            <div className="aspect-video bg-[var(--card)] relative overflow-hidden border-b border-[var(--border)]">
              {community.banner_url || community.image_url ? (
                <img
                  src={community.banner_url || community.image_url}
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-5">
                  <Sparkles size={80} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent opacity-60" />
            </div>

            {/* Conteúdo */}
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black mb-3 group-hover:text-orange transition-colors">
                {community.name}
              </h3>
              <p className="text-sm opacity-60 leading-relaxed mb-8 flex-1">
                {community.description || 'Uma comunidade dedicada a entusiastas e caçadores de ofertas.'}
              </p>

              <Link
                to={`/comunidades/${community.id}`}
                className="w-full bg-[var(--glass2)] hover:bg-orange hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
              >
                Ver Achados <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}

        {communities?.length === 0 && (
          <div className="col-span-full py-20 text-center gls opacity-50">
            <p className="font-bold uppercase tracking-widest text-sm">Nenhuma comunidade encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesListPage;
