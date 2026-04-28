import React from 'react';
import { Shield, Eye, Lock } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 animate-fade-up">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue/10 text-blue mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Política de Privacidade</h1>
          <p className="text-[var(--fg2)] opacity-60 uppercase text-[10px] font-bold tracking-[3px]">Última atualização: 24 de Abril de 2026</p>
        </header>

        <div className="gls p-8 md:p-12 space-y-10 bg-white/50 backdrop-blur-xl border border-[var(--border)] shadow-2xl">
          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Eye className="text-blue" size={24} />
               <h2 className="text-xl font-bold">Coleta de Informações</h2>
            </div>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, publica um anúncio ou entra em contato conosco. Isso pode incluir seu nome, e-mail e dados comerciais.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Lock className="text-blue" size={24} />
               <h2 className="text-xl font-bold">Uso dos Dados</h2>
            </div>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Seus dados são utilizados para personalizar sua experiência, processar transações, enviar comunicações importantes e melhorar constantemente nossos serviços. Nunca vendemos seus dados para terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               <Shield className="text-blue" size={24} />
               <h2 className="text-xl font-bold">Segurança</h2>
            </div>
            <p className="text-sm text-[var(--fg2)] leading-relaxed">
              Implementamos uma variedade de medidas de segurança para manter a segurança de suas informações pessoais. Utilizamos criptografia de ponta a ponta e servidores seguros.
            </p>
          </section>

          <div className="p-6 rounded-2xl bg-blue/5 border border-blue/10 space-y-2">
             <h4 className="text-xs font-black uppercase tracking-widest text-blue">Seus Direitos</h4>
             <p className="text-[10px] text-blue/60 leading-relaxed">
                Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações da sua conta ou entrando em contato com nosso DPO.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
