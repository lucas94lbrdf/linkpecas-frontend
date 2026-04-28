import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border)] mt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange to-orange2 text-white shadow-lg shadow-orange/20">
                <Zap size={14} />
              </div>
              <span className="font-extrabold text-sm tracking-wider">
                Link<span className="text-orange">Peças</span>
              </span>
            </div>
            <p className="text-xs text-[var(--fg2)] leading-relaxed max-w-[200px] opacity-60">
              A maior revista de ofertas automotivas curadas do Brasil.
            </p>
          </div>

          {[
            { title: 'Explorar', links: [{ n: 'Peças', p: '/ofertas?category=pecas' }, { n: 'Performance', p: '/ofertas?category=performance' }, { n: 'Estética', p: '/ofertas?category=estetica' }] },
            { title: 'Plataforma', links: [{ n: 'Sobre', p: '/' }, { n: 'Anuncie', p: '/register' }, { n: 'Planos', p: '/plans' }] },
            { title: 'Legal', links: [{ n: 'Termos', p: '/termos' }, { n: 'Privacidade', p: '/privacidade' }, { n: 'Cookies', p: '/cookies' }, { n: 'Contato', p: '/contato' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-orange opacity-40 mb-6">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.n}>
                    <Link to={link.p} className="text-xs text-[var(--fg)] opacity-40 hover:opacity-100 hover:text-orange transition-all">
                      {link.n}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-20">
            © 2026 LinkPeças Platform
          </span>
          <div className="flex gap-6">
             <span className="text-[10px] opacity-20">v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
