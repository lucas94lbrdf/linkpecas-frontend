import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, ArrowRight, ChevronRight, Star, Truck, ShieldCheck,
  Headphones, Zap, Package, Wrench, Sparkles, Gauge, Lightbulb,
  CarFront, Loader2, Eye, Flame, Crown, Award, TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { vehicleService } from '../services/vehicleService';
import type { Manufacturer, VehicleModel } from '../services/vehicleService';
import SearchBar from '../components/shared/SearchBar';

/* ─── tipos ──────────────────────────────────────────────────────────────── */
interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  category: string;
  marketplace: string;
  clicks: number;
  views?: number;
  rating: number;
  hot?: boolean;
  plan?: string;
  is_universal?: boolean;
}

/* ─── constantes ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Peças',        icon: Wrench,     color: '#FF6200', bg: '#FFF3EC', path: '/ofertas?cat=pecas' },
  { label: 'Estética',     icon: Sparkles,   color: '#9333ea', bg: '#F5F0FF', path: '/ofertas?cat=estetica' },
  { label: 'Performance',  icon: Gauge,      color: '#e11d48', bg: '#FFF0F3', path: '/ofertas?cat=performance' },
  { label: 'Som e Mídia',  icon: Headphones, color: '#0ea5e9', bg: '#EFF8FF', path: '/ofertas?cat=som' },
  { label: 'Iluminação',   icon: Lightbulb,  color: '#f59e0b', bg: '#FFFBEB', path: '/ofertas?cat=iluminacao' },
  { label: 'Ferramentas',  icon: Zap,        color: '#10b981', bg: '#ECFDF5', path: '/ofertas?cat=ferramentas' },
  { label: 'Pneus',        icon: CarFront,   color: '#64748b', bg: '#F8FAFC', path: '/ofertas?cat=pneus' },
  { label: 'Universal',    icon: Package,    color: '#6366f1', bg: '#EEF2FF', path: '/ofertas' },
];

const TRUST = [
  { icon: Truck,        label: 'Frete Grátis',     sub: 'em milhares de produtos' },
  { icon: ShieldCheck,  label: 'Compra Garantida',  sub: 'proteção total' },
  { icon: Star,         label: 'Melhores Preços',   sub: 'comparados em tempo real' },
  { icon: Headphones,   label: 'Suporte 24h',       sub: 'estamos aqui por você' },
];

const YEARS = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

/* ─── componente ProductCardLight ────────────────────────────────────────── */
const ProductCardLight: React.FC<{ product: Product; delay?: number }> = ({ product, delay = 0 }) => {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const isHot = product.hot || product.clicks >= 100;
  const isPremium = product.plan === 'premium';
  const isPro = product.plan === 'pro';

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <CarFront size={56} className="text-gray-200" />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-[#FF6200] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
              -{discount}%
            </span>
          )}
          {isHot && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Flame size={9} fill="currentColor" /> ALTA
            </span>
          )}
          {isPremium && (
            <span className="bg-[#FF6200] text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Crown size={9} /> PREMIUM
            </span>
          )}
          {isPro && !isPremium && (
            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Award size={9} /> PRO
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/90 border border-gray-100 text-gray-500 uppercase tracking-wide">
          {product.marketplace}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 line-clamp-2 flex-1 leading-relaxed mb-2">{product.title}</p>

        <div className="mt-auto">
          {product.oldPrice && (
            <p className="text-[11px] line-through text-gray-300">
              R$ {product.oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-xl font-black text-[#FF6200]">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">em 12x sem juros</p>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-300 font-medium">
          <span className="flex items-center gap-1"><Eye size={11} /> {(product.views || 0) >= 1000 ? ((product.views || 0) / 1000).toFixed(1) + 'K' : (product.views || 0)}</span>
          <span className="flex items-center gap-1 text-amber-400"><Star size={11} fill="currentColor" /> {Number(product.rating).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

/* ─── Home ───────────────────────────────────────────────────────────────── */
const Home: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [manufacturerId, setManufacturerId] = useState('');
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    vehicleService.listManufacturers().then(setManufacturers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!manufacturerId) { setModels([]); setModelId(''); return; }
    vehicleService.listModelsByManufacturer(manufacturerId).then(setModels).catch(() => {});
  }, [manufacturerId]);

  useEffect(() => {
    api.get('/api/public/ads/trending')
      .then(res => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedMfg = useMemo(() => manufacturers.find(m => m.id === manufacturerId), [manufacturers, manufacturerId]);
  const selectedModel = useMemo(() => models.find(m => m.id === modelId), [models, modelId]);

  const handleSearch = () => {
    if (query.trim()) { navigate(`/ofertas?q=${encodeURIComponent(query.trim())}`); return; }
    navigate('/ofertas');
  };

  const handleVehicleSearch = () => {
    if (!selectedMfg || !selectedModel) return;
    const qs = year ? `?year=${year}` : '';
    navigate(`/montadora/${selectedMfg.slug}/${selectedModel.slug}/ofertas${qs}`);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="bg-[#FF6200]">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Tudo para o seu veículo em um só lugar
            </h1>
            <p className="text-white/70 text-sm">Peças, acessórios e produtos de estética com as melhores ofertas</p>
          </div>

          {/* SearchBar com search-as-you-type */}
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Buscar produto, marca ou categoria..." />

            {/* Tags rápidas */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Filtro de ar', 'Cera automotiva', 'Scanner OBD2', 'Pneus', 'Som automotivo'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/ofertas?q=${encodeURIComponent(tag)}`)}
                  className="text-white/80 hover:text-white text-xs px-3 py-1 rounded-full border border-white/30 hover:border-white/60 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST.map(t => (
              <div key={t.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFF3EC] flex items-center justify-center flex-shrink-0">
                  <t.icon size={16} className="text-[#FF6200]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* ── CATEGORIAS ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-800">Categorias</h2>
            <Link to="/ofertas" className="text-xs text-[#FF6200] font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                to={cat.path}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:scale-105 transition-all"
                style={{ backgroundColor: cat.bg }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cat.color + '20' }}
                >
                  <cat.icon size={20} style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] font-bold text-center text-gray-600 leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BUSCA POR VEÍCULO ────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-[#FF6200]/5 to-transparent">
            <div className="w-9 h-9 rounded-xl bg-[#FF6200]/10 flex items-center justify-center">
              <CarFront size={20} className="text-[#FF6200]" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-800">Buscar por veículo</h2>
              <p className="text-[11px] text-gray-400">Encontre peças compatíveis com seu carro</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={manufacturerId}
                onChange={e => setManufacturerId(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#FF6200] focus:ring-2 focus:ring-[#FF6200]/10 transition-all"
              >
                <option value="">Montadora</option>
                {manufacturers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <select
                value={modelId}
                onChange={e => setModelId(e.target.value)}
                disabled={!manufacturerId}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#FF6200] focus:ring-2 focus:ring-[#FF6200]/10 transition-all disabled:opacity-40"
              >
                <option value="">Modelo</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#FF6200] focus:ring-2 focus:ring-[#FF6200]/10 transition-all"
              >
                <option value="">Ano (opcional)</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <button
                onClick={handleVehicleSearch}
                disabled={!manufacturerId || !modelId}
                className="bg-[#FF6200] hover:bg-[#e55800] disabled:opacity-40 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Search size={16} /> Buscar
              </button>
            </div>
          </div>
        </section>

        {/* ── OFERTAS EM ALTA ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-[#FF6200]" />
              <h2 className="text-lg font-black text-gray-800">Ofertas em Alta</h2>
              <span className="text-[10px] bg-red-100 text-red-500 font-black px-2 py-0.5 rounded-full uppercase">Hot</span>
            </div>
            <Link
              to="/ofertas"
              className="text-xs text-[#FF6200] font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-[#FF6200]" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl py-16 text-center text-gray-300 border border-gray-100">
              <Package size={40} className="mx-auto mb-3" />
              <p className="text-sm font-semibold">Nenhuma oferta em alta hoje.</p>
              <p className="text-xs mt-1">Volte mais tarde!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p, i) => (
                <ProductCardLight key={p.id} product={p} delay={i * 60} />
              ))}
            </div>
          )}
        </section>

        {/* ── BANNER CTA ───────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#FF6200] to-[#ff8c00] rounded-2xl p-8 text-white flex flex-col justify-between min-h-[180px]">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Para Vendedores</p>
              <h3 className="text-2xl font-black leading-tight mb-2">Venda mais com destaque automático</h3>
              <p className="text-sm opacity-70">Alcance milhares de compradores no maior marketplace automotivo</p>
            </div>
            <Link
              to="/register"
              className="mt-4 self-start bg-white text-[#FF6200] text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              Cadastrar grátis <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white flex flex-col justify-between min-h-[180px]">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Plano Premium</p>
              <h3 className="text-2xl font-black leading-tight mb-2">Destaque sua loja entre as melhores</h3>
              <p className="text-sm opacity-50">Analytics avançado, links ilimitados e domínio próprio</p>
            </div>
            <Link
              to="/plans"
              className="mt-4 self-start bg-[#FF6200] text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              Ver planos <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── MONTADORAS ───────────────────────────────────────────────── */}
        {manufacturers.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">Por Montadora</h2>
              <Link to="/montadoras" className="text-xs text-[#FF6200] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Ver todas <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {manufacturers.slice(0, 16).map(mfg => (
                <Link
                  key={mfg.id}
                  to={`/montadora/${mfg.slug}`}
                  className="group flex-shrink-0 flex flex-col items-center gap-3 px-5 py-4 w-28 rounded-2xl border border-gray-100 hover:border-[#FF6200]/40 hover:bg-[#FFF3EC] hover:shadow-md transition-all"
                >
                  {mfg.logo_url ? (
                    <img
                      src={mfg.logo_url}
                      alt={mfg.name}
                      className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-base font-black text-gray-400 group-hover:bg-[#FF6200]/10 group-hover:text-[#FF6200] transition-all">
                      {mfg.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-gray-500 text-center leading-tight group-hover:text-[#FF6200] transition-colors">
                    {mfg.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── FOOTER INFO ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-xs text-gray-300 font-medium">
            © 2026 LinkPeças · Todos os direitos reservados ·
            <Link to="/termos" className="hover:text-[#FF6200] ml-1">Termos de Uso</Link> ·
            <Link to="/privacidade" className="hover:text-[#FF6200] ml-1">Privacidade</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Home;
