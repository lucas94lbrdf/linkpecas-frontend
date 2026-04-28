import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Loader2, ArrowLeft, CarFront, Store, CheckCircle2, MessageCircle, Hash } from 'lucide-react';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Controle de Telas: 'choose_role' -> 'form'
  const [step, setStep] = useState<'choose_role' | 'form'>('choose_role');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'entusiasta' | 'seller'>('entusiasta');
  
  // Novos campos para Lojista
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Máscaras e Validações
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDocument = (value: string) => {
    const doc = value.replace(/\D/g, '');
    if (doc.length <= 11) {
      return doc
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return doc
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/000$2') // Simplificado para exemplo, ideal é tratar posição
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const isValidCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let cpfs = cpf.split('').map(el => +el);
    const rest = (count: number) => (cpfs.slice(0, count - 12).reduce((soma, el, i) => soma + el * (count - i), 0) * 10) % 11 % 10;
    return rest(10) === cpfs[9] && rest(11) === cpfs[10];
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações para Lojista
    if (role === 'seller') {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('WhatsApp inválido. Digite o DDD + número.');
        setLoading(false);
        return;
      }
      
      const docDigits = document.replace(/\D/g, '');
      if (docDigits.length === 11 && !isValidCPF(docDigits)) {
        setError('CPF inválido. Verifique os números informados.');
        setLoading(false);
        return;
      }

      if (docDigits.length !== 11 && docDigits.length !== 14) {
        setError('Documento inválido. Digite o CPF (11 dígitos) ou CNPJ (14 dígitos).');
        setLoading(false);
        return;
      }
    }

    try {
      const { data } = await api.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role,
        phone: role === 'seller' ? phone : null,
        document: role === 'seller' ? document : null
      });

      // Login Automático
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (role === 'seller') {
        navigate('/admin/subscriptions');
      } else {
        navigate('/offers');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (selectedRole: 'entusiasta' | 'seller') => {
    setRole(selectedRole);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row animate-fade-in">
      
      {/* Lado Esquerdo - Imagem Institucional */}
      <div className="hidden md:flex md:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
            alt="LinkPeça Institucional" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg px-12 text-white">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange to-orange2 text-white flex items-center justify-center shadow-2xl shadow-orange/30 mb-8">
            <Zap size={32} />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight">
            O motor do seu negócio automotivo.
          </h1>
          <p className="text-lg opacity-80 font-medium max-w-md">
            Junte-se a milhares de entusiastas e lojistas. Descubra ofertas incríveis ou potencialize as vendas da sua loja de peças em um só lugar.
          </p>
          
          <div className="mt-12 space-y-4">
             <div className="flex items-center gap-3 opacity-70">
                <CheckCircle2 size={20} className="text-orange" />
                <span className="font-medium">Comunidades Exclusivas</span>
             </div>
             <div className="flex items-center gap-3 opacity-70">
                <CheckCircle2 size={20} className="text-orange" />
                <span className="font-medium">Rastreamento de Cliques</span>
             </div>
             <div className="flex items-center gap-3 opacity-70">
                <CheckCircle2 size={20} className="text-orange" />
                <span className="font-medium">Métricas em Tempo Real</span>
             </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Conteúdo Interativo */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 relative">
        
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => step === 'form' ? setStep('choose_role') : navigate('/')}
            className="flex items-center gap-2 text-xs font-bold opacity-40 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Voltar
          </button>
        </div>

        <div className="w-full max-w-md">
          
          {/* PASSO 1: Escolha de Perfil */}
          {step === 'choose_role' && (
            <div className="animate-fade-up">
              <div className="mb-10">
                <h2 className="text-3xl font-black mb-2">Como você quer usar o LinkPeça?</h2>
                <p className="opacity-50 text-sm font-medium">Escolha o perfil que melhor descreve seu objetivo na plataforma.</p>
              </div>

              <div className="space-y-4">
                {/* Opção Entusiasta */}
                <button 
                  onClick={() => handleRoleSelection('entusiasta')}
                  className="w-full text-left p-6 rounded-2xl border-2 border-[var(--border)] hover:border-orange bg-[var(--card)] hover:shadow-[0_0_30px_rgba(255,107,53,0.1)] transition-all group flex gap-5 items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-orange/10 text-orange flex items-center justify-center shrink-0">
                    <CarFront size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black mb-1 group-hover:text-orange transition-colors">Sou Entusiasta</h3>
                    <p className="text-xs opacity-50 font-medium leading-relaxed">
                      Quero procurar peças, avaliar anúncios, salvar links favoritos e participar das comunidades.
                    </p>
                  </div>
                </button>

                {/* Opção Lojista */}
                <button 
                  onClick={() => handleRoleSelection('seller')}
                  className="w-full text-left p-6 rounded-2xl border-2 border-[var(--border)] hover:border-orange bg-[var(--card)] hover:shadow-[0_0_30px_rgba(255,107,53,0.1)] transition-all group flex gap-5 items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-orange/10 text-orange flex items-center justify-center shrink-0">
                    <Store size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black mb-1 group-hover:text-orange transition-colors">Sou Lojista</h3>
                    <p className="text-xs opacity-50 font-medium leading-relaxed">
                      Quero cadastrar meus links, criar minha vitrine, rastrear cliques e aumentar minhas vendas.
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-center text-xs opacity-50 mt-10 font-medium">
                Já tem uma conta? <Link to="/login" className="text-orange font-black hover:underline ml-1">Fazer login</Link>
              </p>
            </div>
          )}

          {/* PASSO 2: Formulário de Cadastro */}
          {step === 'form' && (
            <div className="animate-fade-left">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 text-orange text-[10px] font-black uppercase tracking-widest mb-4">
                  {role === 'seller' ? 'Perfil: Lojista' : 'Perfil: Entusiasta'}
                </div>
                <h2 className="text-3xl font-black mb-2">Crie sua conta</h2>
                <p className="opacity-50 text-sm font-medium">Preencha seus dados para começar.</p>
              </div>

              <div className="gls p-8 border border-[var(--border)] shadow-2xl rounded-3xl">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Nome Completo</label>
                    <input 
                      type="text" required
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all font-medium"
                      placeholder="Ex: João da Silva"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">E-mail</label>
                    <input 
                      type="email" required
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all font-medium"
                      placeholder="joao@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Campos Condicionais para Lojista */}
                  {role === 'seller' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-down">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 flex items-center gap-1">
                          <MessageCircle size={10} /> WhatsApp
                        </label>
                        <input 
                          type="text" required
                          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all font-medium"
                          placeholder="(00) 00000-0000"
                          value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 flex items-center gap-1">
                          <Hash size={10} /> CPF ou CNPJ
                        </label>
                        <input 
                          type="text" required
                          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all font-medium"
                          placeholder="000.000.000-00"
                          value={document} onChange={(e) => setDocument(maskDocument(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Senha (mín. 8 caracteres)</label>
                    <input 
                      type="password" required minLength={8}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all font-medium"
                      placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-slate-900 hover:bg-orange text-white mt-4 font-black text-xs uppercase tracking-[2px] py-4 rounded-xl shadow-xl hover:shadow-orange/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Finalizar Cadastro'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
