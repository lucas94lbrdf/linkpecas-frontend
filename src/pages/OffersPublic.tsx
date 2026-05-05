import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package, Zap, TrendingDown, Link as LinkIcon, Search
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/shared/SearchBar';
import SearchFiltersComponent, { type SearchFilters } from '../components/shared/SearchFilters';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
interface Product {
  id: string;
  title: string;
  slug?: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  category: string;
  marketplace: string;
  clicks: number;
  views?: number;
  rating?: number;
  plan?: string;
  is_universal?: boolean;
}

/* ── Highlight helper ───────────────────────────────────────────────────── */
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-orange-100 text-orange-700 font-bold rounded px-0.5 not-italic">{part}</mark>
      : part
  );
}

/* ── Card de produto ────────────────────────────────────────────────────── */
const ProductCard: React.FC<{ product: Product; query?: string; delay?: number }> = ({ product, query = '', delay = 0 }) => {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Package size={48} className="text-gray-200" />
        )}
        {discount && (
          <span className="absolute top-2 left-2 bg-[#FF6200] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
        <span className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/90 border border-gray-100 text-gray-500 uppercase tracking-wide">
          {product.marketplace}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-600 line-clamp-2 flex-1 leading-relaxed mb-3">
          {highlight(product.title, query)}
        </p>

        <div className="mt-auto">
          {product.oldPrice && (
            <p className="text-[11px] line-through text-gray-300">
              R$ {product.oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-xl font-black text-[#FF6200]">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Link>
  );
};

/* ── Skeleton loader ────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-5 bg-orange-100 rounded w-1/2 mt-3" />
    </div>
  </div>
);

/* ── Página principal ───────────────────────────────────────────────────── */
const OffersPublic: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* Converte searchParams → SearchFilters */
  const filtersFromURL = useMemo<SearchFilters>(() => ({
    q:         searchParams.get('q')         || undefined,
    category:  searchParams.get('category')  || undefined,
    brand:     searchParams.get('brand')     || undefined,
    model:     searchParams.get('model')     || undefined,
    year_min:  searchParams.get('year_min')  || undefined,
    year_max:  searchParams.get('year_max')  || undefined,
    price_min: searchParams.get('price_min') || undefined,
    price_max: searchParams.get('price_max') || undefined,
    state:     searchParams.get('state')     || undefined,
    city:      searchParams.get('city')      || undefined,
  }), [searchParams]);

  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMeta, setSearchMeta] = useState<{ total: number; ms: number } | null>(null);

  /* Fetch ao mudar filtros */
  useEffect(() => {
    setLoading(true);
    const t0 = performance.now();

    const params = new URLSearchParams();
    Object.entries(filtersFromURL).forEach(([k, v]) => {
      if (v && v !== 'all') params.append(k, v);
    });
    params.set('limit', '48');

    api.get(`/api/public/ads?${params.toString()}`)
      .then(res => {
        const data: Product[] = res.data || [];
        setOffers(data);
        setSearchMeta({ total: data.length, ms: Math.round(performance.now() - t0) });

        // Log de busca para analytics
        if (filtersFromURL.q) {
          api.post('/api/public/logs/searches', {
            term: filtersFromURL.q,
            results_found: data.length,
            origin: 'site',
          }).catch(() => {});
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filtersFromURL]);

  /* Atualiza URL ao mudar filtros */
  const handleFilterChange = useCallback((next: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v);
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const handleSearch = useCallback((q: string) => {
    handleFilterChange({ ...filtersFromURL, q });
  }, [filtersFromURL, handleFilterChange]);

  const activeQ = filtersFromURL.q || '';

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#FF6200] to-[#cc4d00] py-14 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
            <Zap size={12} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Busca Inteligente</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {activeQ ? `Resultados para "${activeQ}"` : 'Todas as Ofertas'}
          </h1>
          <p className="text-white/70 text-sm max-w-lg">
            Peças, acessórios e produtos automotivos dos melhores marketplaces
          </p>

          {/* SearchBar com sugestões */}
          <div className="w-full max-w-2xl">
            <SearchBar
              initialValue={activeQ}
              onSearch={handleSearch}
              fullWidth
              placeholder="Buscar produto, peça, marca..."
            />
          </div>

          {/* Meta de busca */}
          {searchMeta && !loading && (
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <Zap size={11} className="text-white/80" />
              <span className="text-[11px] text-white/90 font-semibold">
                {searchMeta.total} resultado{searchMeta.total !== 1 ? 's' : ''} encontrado{searchMeta.total !== 1 ? 's' : ''} em {searchMeta.ms}ms
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTEÚDO PRINCIPAL: Sidebar + Grid ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile: filtros no topo */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <SearchFiltersComponent
            filters={filtersFromURL}
            onChange={handleFilterChange}
            resultCount={offers.length}
          />
          {searchMeta && !loading && (
            <p className="text-xs text-gray-400">
              {searchMeta.total} resultado{searchMeta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar desktop */}
          <SearchFiltersComponent
            filters={filtersFromURL}
            onChange={handleFilterChange}
            resultCount={offers.length}
          />

          {/* Resultados */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : offers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <TrendingDown size={56} className="mx-auto mb-4 text-gray-200" />
                <h2 className="text-lg font-black text-gray-700 mb-2">Nenhum resultado encontrado</h2>
                <p className="text-sm text-gray-400 mb-6">
                  {activeQ
                    ? `Tente outros termos ou remova alguns filtros.`
                    : 'Seja o primeiro a anunciar aqui!'}
                </p>
                <Link
                  to="/ofertas"
                  className="inline-flex items-center gap-2 bg-[#FF6200] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e55800] transition-colors"
                >
                  <Search size={14} /> Ver todas as ofertas
                </Link>
              </div>
            ) : (
              <>
                {/* Grid responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {offers.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      query={activeQ}
                      delay={i * 40}
                    />
                  ))}
                </div>

                {/* CTA bottom */}
                <div className="mt-12 bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF6200]/20 flex items-center justify-center">
                      <LinkIcon size={24} className="text-[#FF6200]" />
                    </div>
                    <div>
                      <h3 className="text-white font-black">Quer anunciar aqui?</h3>
                      <p className="text-white/50 text-xs">Crie sua loja e alcance milhares de compradores</p>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="bg-[#FF6200] text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#e55800] transition-colors whitespace-nowrap"
                  >
                    Criar minha loja grátis
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPublic;
