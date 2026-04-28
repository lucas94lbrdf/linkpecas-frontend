import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-fade-up">
      <div className="max-w-4xl mx-auto gls p-6 border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/80 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange" />
        
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center shrink-0">
              <Cookie size={24} />
           </div>
           <div className="space-y-1">
              <h4 className="font-bold text-sm">Privacidade & Cookies</h4>
              <p className="text-[11px] opacity-60 leading-relaxed max-w-xl">
                 Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar anúncios. Ao continuar navegando, você concorda com nossa <Link to="/privacidade" className="text-orange underline font-bold">Política de Privacidade</Link> e <Link to="/cookies" className="text-orange underline font-bold">Uso de Cookies</Link>.
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
           <button 
             onClick={() => setIsVisible(false)}
             className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
           >
              Recusar
           </button>
           <button 
             onClick={acceptCookies}
             className="px-8 py-3 rounded-xl bg-orange text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 hover:scale-105 transition-all flex items-center gap-2"
           >
              <Check size={14} /> Aceitar Tudo
           </button>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 opacity-20 hover:opacity-100 transition-all"
        >
           <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
