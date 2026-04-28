import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, ExternalLink, ShieldCheck } from 'lucide-react';

const TOTAL = 3;

const Redirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [count, setCount] = useState(TOTAL);
  const [gone, setGone] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  
  const url      = searchParams.get('url') || '/';
  const title    = searchParams.get('title') || 'produto';
  const store    = searchParams.get('store') || 'marketplace';
  const hasGone  = useRef(false);

  const ALLOWED_DOMAINS = [
    'mercadolivre.com.br', 'shopee.com.br', 'amazon.com.br',
    'magazineluiza.com.br', 'olx.com.br', 'aliexpress.com',
    'casasbahia.com.br', 'extra.com.br'
  ];

  useEffect(() => {
    try {
      const hostname = new URL(url).hostname;
      const isDomainAllowed = ALLOWED_DOMAINS.some(domain => hostname.endsWith(domain));
      setIsSecure(isDomainAllowed);
    } catch (e) {
      setIsSecure(false);
    }
  }, [url]);

  useEffect(() => {
    if (!isSecure) return;
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSecure]);

  useEffect(() => {
    if (count === 0 && !hasGone.current && isSecure) {
      hasGone.current = true;
      setGone(true);
      setTimeout(() => {
        window.location.href = url;
      }, 300);
    }
  }, [count, url, isSecure]);

  const progress = ((TOTAL - count) / TOTAL) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <div className={`max-w-md w-full text-center transition-opacity duration-300 ${gone ? 'opacity-0' : 'opacity-100'}`}>

        {/* Ícone animado */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-orange/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-orange/20 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center">
            <ShoppingBag size={36} className="text-orange" />
          </div>
        </div>

        {/* Mensagem principal */}
        <h1 className="text-2xl font-black mb-2">Estamos carregando sua oferta</h1>
        <p className="opacity-40 text-sm mb-1 truncate px-4">
          <span className="font-semibold opacity-70">{title}</span>
        </p>
        <p className="opacity-30 text-xs mb-8">
          via <span className="font-bold uppercase tracking-widest">{store}</span>
        </p>

        {/* Countdown + barra (Só aparece se for seguro) */}
        {isSecure ? (
          <div className="gls p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold opacity-50 uppercase tracking-widest">
              <span>Redirecionando em</span>
              <span className="text-orange text-2xl font-black">{count}s</span>
            </div>

            <div className="h-1.5 w-full bg-[var(--glass2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-orange rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] opacity-30">
              Em {count} segundo{count !== 1 ? 's' : ''} você verá seu produto no {store}
            </p>
          </div>
        ) : (
          <div className="gls p-6 border-red-500/20 bg-red-500/5 space-y-4">
             <div className="flex items-center gap-3 text-red-500 mb-2">
                <ShieldCheck size={24} />
                <h3 className="font-black text-sm uppercase tracking-widest">Aviso de Segurança</h3>
             </div>
             <p className="text-xs opacity-60 text-left leading-relaxed">
                Este link leva a um site externo não verificado (<strong>{new URL(url).hostname}</strong>). 
                Certifique-se de que o destino é confiável antes de prosseguir.
             </p>
          </div>
        )}

        {/* Ir agora */}
        <button
          onClick={() => { window.location.href = url; }}
          className="mt-6 flex items-center gap-2 mx-auto text-xs font-bold text-orange border border-orange/20 px-5 py-2.5 rounded-xl hover:bg-orange/5 transition-all"
        >
          <ExternalLink size={14} /> Ir agora
        </button>

        {/* Badge de segurança */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] opacity-20">
          <ShieldCheck size={12} />
          <span>Link verificado pelo Auto Marketplace</span>
        </div>
      </div>
    </div>
  );
};

export default Redirect;
