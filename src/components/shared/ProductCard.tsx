import React from 'react';
import { Eye, Star, Heart, Share2, Zap, Flame, Crown, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number | string;
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
  promoted?: boolean;
  hot?: boolean;
  plan?: string;
  is_universal?: boolean;
  engine?: string | null;
}

interface ProductCardProps {
  product: Product;
  delay?: number;
  trackingParams?: Record<string, string>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, delay = 0, trackingParams }) => {
  const discount = product.oldPrice 
    ? Math.round((1 - product.price / product.oldPrice) * 100) 
    : null;

  const marketplaceClasses: Record<string, string> = {
    'Shopee': 'bg-orange/10 text-orange border-orange/20',
    'Mercado Livre': 'bg-blue/10 text-blue border-blue/20',
    'Amazon': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  const mpClass = marketplaceClasses[product.marketplace] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const isPremium = product.plan === 'premium';
  const isPro = product.plan === 'pro';
  const isHot = product.hot || product.clicks >= 100;

  const buildTo = () => {
    const base = `/product/${product.slug || product.id}`;
    if (!trackingParams) return base;
    const qs = new URLSearchParams(trackingParams).toString();
    return `${base}?${qs}`;
  };

  return (
    <Link 
      to={buildTo()}
      className={`group block bg-[var(--card)] border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 animate-fade-up ${isPremium ? 'border-orange shadow-lg shadow-orange/10' : isPro ? 'border-blue-500/50 shadow-md shadow-blue-500/10' : 'border-[var(--border)] hover:border-orange/20'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Target Image Container */}
      <div className="relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-900 to-black overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
             {/* Fallback icon or emoji */}
             {product.category === 'pecas' ? '⚙️' : 
              product.category === 'estetica' ? '✨' : 
              product.category === 'performance' ? '🏎️' : '📦'}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
              -{discount}%
            </span>
          )}
          {isPremium && (
            <span className="bg-gradient-to-r from-orange to-orange2 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-orange/30">
              <Crown size={10} fill="currentColor" /> PREMIUM
            </span>
          )}
          {isPro && !isPremium && (
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-blue-500/30">
              <Award size={10} /> PRO
            </span>
          )}
          {product.promoted && (
            <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> DESTAQUE
            </span>
          )}
          {isHot && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-red-600/30">
              <Flame size={10} fill="currentColor" /> EM ALTA
            </span>
          )}
          {product.is_universal && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
              UNIVERSAL
            </span>
          )}
        </div>

        {/* Floating Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <button className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange transition-colors">
            <Heart size={14} />
          </button>
          <button className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange transition-colors">
            <Share2 size={14} />
          </button>
        </div>

        {/* Marketplace Label */}
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold border backdrop-blur-md tracking-wider uppercase ${mpClass}`}>
          {product.marketplace}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-xs leading-tight line-clamp-2 h-8 group-hover:text-orange transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-orange">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] line-through opacity-20">
              R$ {product.oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between opacity-30 text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <Eye size={12} /> {(product.views || 0) >= 1000 ? ((product.views || 0)/1000).toFixed(1) + 'K' : (product.views || 0)}
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-500 fill-amber-500" /> {Number(product.rating || 0).toFixed(1)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
