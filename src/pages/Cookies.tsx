import React from 'react';
import { Cookie, Info, Settings } from 'lucide-react';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 animate-fade-up">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mb-4">
            <Cookie size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Política de Cookies</h1>
          <p className="text-[var(--fg2)] opacity-60 uppercase text-[10px] font-bold tracking-[3px]">Última atualização: 24 de Abril de 2026</p>
        </header>

        <div className="gls p-8 md:p-12 space-y-10 bg-white/50 backdrop-blur-xl border border-[var(--border)] shadow-2xl">
          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Info className="text-amber-500" size={24} />
               <h2 className="text-xl font-bold">O que são Cookies?</h2>
            </div>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Cookies são pequenos arquivos de texto que são armazenados no seu computador ou dispositivo móvel quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem ou funcionarem de forma mais eficiente.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                <h3 className="font-bold text-sm">Cookies Essenciais</h3>
                <p className="text-xs opacity-60 leading-relaxed">Necessários para o funcionamento básico do site, como login e segurança.</p>
             </div>
             <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                <h3 className="font-bold text-sm">Cookies de Performance</h3>
                <p className="text-xs opacity-60 leading-relaxed">Ajudam-nos a entender como os visitantes interagem com o site, coletando informações anonimamente.</p>
             </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Settings className="text-amber-500" size={24} />
               <h2 className="text-xl font-bold">Como gerenciar?</h2>
            </div>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Você pode controlar e/ou excluir cookies conforme desejar através das configurações do seu navegador. No entanto, se você desativar os cookies, algumas partes de nosso site podem não funcionar corretamente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
