import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 animate-fade-up">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange/10 text-orange mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Entre em Contato</h1>
          <p className="text-[var(--fg2)] opacity-60 max-w-xl mx-auto">
             Dúvidas, sugestões ou suporte técnico? Nossa equipe está pronta para te ajudar a acelerar seus negócios.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Info Cards */}
           <div className="space-y-4">
              <div className="gls p-6 flex items-center gap-6 border border-[var(--border)]">
                 <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center shrink-0">
                    <Mail size={20} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">E-mail</h4>
                    <p className="text-sm font-bold">contato@linkpecas.com.br</p>
                 </div>
              </div>
              <div className="gls p-6 flex items-center gap-6 border border-[var(--border)]">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">WhatsApp</h4>
                    <p className="text-sm font-bold">(11) 99999-9999</p>
                 </div>
              </div>
              <div className="gls p-6 flex items-center gap-6 border border-[var(--border)]">
                 <div className="w-12 h-12 rounded-2xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Endereço</h4>
                    <p className="text-sm font-bold">São Paulo, SP - Brasil</p>
                 </div>
              </div>
           </div>

           {/* Form */}
           <div className="lg:col-span-2 gls p-8 md:p-10 border border-[var(--border)] bg-white/40 shadow-2xl">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Nome Completo</label>
                    <input type="text" placeholder="Seu nome" className="w-full bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl text-sm outline-none focus:border-orange transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">E-mail</label>
                    <input type="email" placeholder="seu@email.com" className="w-full bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl text-sm outline-none focus:border-orange transition-all" />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Assunto</label>
                    <input type="text" placeholder="Como podemos ajudar?" className="w-full bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl text-sm outline-none focus:border-orange transition-all" />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Mensagem</label>
                    <textarea placeholder="Escreva sua mensagem aqui..." rows={5} className="w-full bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl text-sm outline-none focus:border-orange transition-all resize-none"></textarea>
                 </div>
                 <div className="md:col-span-2 pt-4">
                    <button className="w-full bg-gradient-to-br from-orange to-orange2 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[2px] shadow-xl shadow-orange/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3">
                       <Send size={16} /> Enviar Mensagem
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
