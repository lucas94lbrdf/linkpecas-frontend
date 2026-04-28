import React, { useState } from 'react';
import { 
  User, Mail, Camera, Shield, 
  CreditCard, Save, Loader2, Webhook,
  Smartphone, Globe, Lock, Zap, Target
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Perfil');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [shopName, setShopName] = useState(user?.shop_name || '');
  const [description, setDescription] = useState(user?.shop_description || '');

  const menuItems = [
    { icon: User, label: 'Perfil' },
    { icon: Mail, label: 'Notificações' },
    { icon: Shield, label: 'Segurança' },
    { icon: CreditCard, label: 'Assinatura' },
    { icon: Webhook, label: 'Integrações' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/api/auth/me', {
        name,
        shop_name: shopName,
        shop_description: description
      });
      
      // Update local state
      setUser({
        ...user,
        name,
        shop_name: shopName,
        shop_description: description
      });

      Swal.fire({
        icon: 'success',
        title: 'Atualizado!',
        text: 'Suas preferências foram salvas.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    const { value: url } = await Swal.fire({
      title: 'Atualizar Foto',
      input: 'url',
      inputLabel: 'URL da Imagem',
      inputPlaceholder: 'https://exemplo.com/foto.jpg',
      showCancelButton: true,
      background: '#0d1117',
      color: '#fff',
      confirmButtonColor: '#ff5c00'
    });

    if (url) {
      try {
        await api.patch('/api/auth/me', { shop_logo: url });
        setUser({ ...user, shop_logo: url });
        Swal.fire('Sucesso', 'Foto atualizada!', 'success');
      } catch (err) {
        Swal.fire('Erro', 'Falha ao atualizar foto.', 'error');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação é irreversível e todos os seus dados serão apagados!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#30363d',
      confirmButtonText: 'Sim, deletar conta',
      cancelButtonText: 'Cancelar',
      background: '#0d1117',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/api/auth/me');
        logout();
        navigate('/login');
        Swal.fire('Deletada!', 'Sua conta foi removida.', 'success');
      } catch (err) {
        Swal.fire('Erro', 'Não foi possível deletar a conta.', 'error');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-up pb-20">
      <div>
        <h1 className="text-3xl font-black">Configurações</h1>
        <p className="opacity-40 text-sm">Gerencie sua conta, preferências e segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
           {menuItems.map((item) => (
             <button 
               key={item.label}
               onClick={() => setActiveTab(item.label)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                 activeTab === item.label 
                   ? 'bg-orange text-white shadow-lg shadow-orange/20' 
                   : 'opacity-40 hover:opacity-100 hover:bg-[var(--glass2)]'
               }`}
             >
               <item.icon size={16} /> {item.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
           
           {activeTab === 'Perfil' && (
              <div className="gls p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-gradient-to-br from-orange to-orange2 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-orange/20">
                         {user?.shop_logo ? (
                           <img src={user.shop_logo} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           user?.name[0].toUpperCase()
                         )}
                      </div>
                      <button 
                        onClick={handleUpdateAvatar}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-slate-900 border border-[var(--border2)] flex items-center justify-center text-white hover:bg-orange transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                      >
                         <Camera size={16} />
                      </button>
                   </div>
                   <div>
                      <h3 className="font-bold text-xl">{user?.name}</h3>
                      <p className="text-xs opacity-40">{user?.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                         {user?.role === 'admin' ? 'Administrador do Sistema' : 'Vendedor Verificado'}
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[var(--border)] pt-8">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Nome Completo</label>
                      <input 
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all font-semibold"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Nome da Loja</label>
                      <input 
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all font-semibold"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                      />
                   </div>
                   <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Biografia / Descrição Pública</label>
                      <textarea 
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all font-semibold min-h-[100px]"
                        placeholder="Conte um pouco sobre sua loja ou serviços..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                   </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="bg-orange text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest shadow-lg shadow-orange/20"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Perfil
                </button>
              </div>
           )}

           {activeTab === 'Notificações' && (
              <div className="gls p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="font-bold text-lg">Preferências de Notificação</h3>
                 <div className="space-y-4">
                    {[
                      { title: 'Novos Cliques', desc: 'Receba alertas quando seus links receberem novos cliques.' },
                      { title: 'Relatórios Semanais', desc: 'Resumo da performance dos seus anúncios por e-mail.' },
                      { title: 'Atualizações do Sistema', desc: 'Novas funcionalidades e notícias da plataforma.' },
                      { title: 'Alertas de Segurança', desc: 'Notificações sobre logins em novos dispositivos.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[var(--glass2)] rounded-2xl border border-[var(--border)]">
                        <div>
                           <p className="text-sm font-bold">{item.title}</p>
                           <p className="text-[10px] opacity-40">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                        </label>
                      </div>
                    ))}
                 </div>
              </div>
           )}

           {activeTab === 'Segurança' && (
              <div className="gls p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="font-bold text-lg">Segurança da Conta</h3>
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Senha Atual</label>
                          <div className="relative">
                             <input type="password" placeholder="••••••••" className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all" />
                             <Lock size={16} className="absolute right-4 top-3.5 opacity-20" />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Nova Senha</label>
                             <input type="password" placeholder="Mínimo 8 caracteres" className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Confirmar Senha</label>
                             <input type="password" placeholder="Repita a nova senha" className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange/50 transition-all" />
                          </div>
                       </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Smartphone size={24} className="text-blue-500" />
                          <div>
                             <p className="text-sm font-bold">Autenticação em Duas Etapas (2FA)</p>
                             <p className="text-[10px] opacity-40">Adicione uma camada extra de segurança.</p>
                          </div>
                       </div>
                       <button className="px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-600 transition-all">Configurar</button>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'Assinatura' && (
              <div className="gls p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="font-bold text-lg">Plano Atual</h3>
                 <div className="p-6 bg-gradient-to-br from-orange to-orange2 rounded-3xl text-white shadow-2xl shadow-orange/30">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[2px] opacity-60">Plano Ativo</p>
                          <h4 className="text-3xl font-black mt-1 uppercase italic tracking-tighter">
                            {user?.plan || 'FREE'}
                          </h4>
                       </div>
                       <Zap size={32} />
                    </div>
                    <div className="space-y-2 mb-8 opacity-90">
                       <p className="text-xs flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full" /> Links ilimitados</p>
                       <p className="text-xs flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full" /> Analytics Premium</p>
                       <p className="text-xs flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full" /> Suporte prioritário</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/20">
                       <span className="text-[10px] font-bold">Próxima cobrança: 12/05/2026</span>
                       <button className="px-4 py-2 bg-white text-orange text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all">Gerenciar Pagamento</button>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'Integrações' && (
              <div className="gls p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="font-bold text-lg">Integrações Externas</h3>
                 <p className="text-xs opacity-40">Conecte o AutoMarket com suas ferramentas favoritas.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Google Analytics', icon: Globe, status: 'Conectado', color: 'text-orange' },
                      { name: 'WhatsApp Business', icon: Smartphone, status: 'Não Conectado', color: 'text-emerald-500' },
                      { name: 'Facebook Pixel', icon: Target, status: 'Configurar', color: 'text-blue-500' },
                      { name: 'Webhooks API', icon: Webhook, status: 'Ativo', color: 'text-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-[var(--glass2)] border border-[var(--border)] rounded-2xl flex flex-col gap-4">
                         <div className="flex items-center justify-between">
                            <item.icon size={24} className={item.color} />
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded bg-[var(--card)] ${item.status === 'Não Conectado' ? 'opacity-40' : ''}`}>
                               {item.status}
                            </span>
                         </div>
                         <p className="text-sm font-bold">{item.name}</p>
                         <button className="text-[10px] font-black uppercase tracking-widest hover:text-orange transition-all text-left">
                            {item.status === 'Conectado' ? 'Desconectar' : 'Configurar'} →
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Dangerous Area */}
           <div className="gls p-8 border-red-500/10 bg-red-500/5 mt-10">
              <h3 className="font-bold text-red-500 text-sm mb-4">Zona de Perigo</h3>
              <p className="text-xs opacity-40 mb-6">Uma vez deletada, sua conta e todos os dados associados não poderão ser recuperados.</p>
              <button 
                onClick={handleDeleteAccount}
                className="text-red-500 text-xs font-black uppercase tracking-widest border border-red-500/20 px-6 py-3 rounded-xl hover:bg-red-500/10 transition-all"
              >
                 Deletar Minha Conta
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
