import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 animate-fade-up">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange/10 text-orange mb-4">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Termos de Uso</h1>
          <p className="text-[var(--fg2)] opacity-60 uppercase text-[10px] font-bold tracking-[3px]">Última atualização: 24 de Abril de 2026</p>
        </header>

        <div className="gls p-8 md:p-12 space-y-8 bg-white/50 backdrop-blur-xl border border-[var(--border)] shadow-2xl">
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CheckCircle size={20} className="text-orange" /> 1. Aceitação dos Termos
            </h2>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Ao acessar e utilizar a plataforma LinkPeças, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CheckCircle size={20} className="text-orange" /> 2. Descrição do Serviço
            </h2>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              O LinkPeças é um hub de ofertas automotivas que facilita a conexão entre compradores e vendedores. Não somos responsáveis pela venda direta dos produtos, mas sim pela curadoria e redirecionamento para marketplaces parceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CheckCircle size={20} className="text-orange" /> 3. Responsabilidades do Usuário
            </h2>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              O usuário é responsável por manter a confidencialidade de sua conta e por todas as atividades que ocorrem sob sua senha. É proibido o uso da plataforma para fins ilegais ou não autorizados.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CheckCircle size={20} className="text-orange" /> 4. Propriedade Intelectual
            </h2>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Todo o conteúdo presente na plataforma, incluindo logos, textos e design, é de propriedade exclusiva do LinkPeças ou de seus licenciadores, sendo protegido por leis de direitos autorais.
            </p>
          </section>

          <section className="space-y-4 border-t border-[var(--border)] pt-8">
            <p className="text-xs opacity-40 text-center italic">
              Estes termos servem como um contrato legal entre você e a plataforma LinkPeças.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
