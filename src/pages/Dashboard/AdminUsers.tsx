import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, UserPlus, Edit, Trash2, Mail, Shield, Loader2, X, 
  CheckCircle, Lock, Unlock, KeyRound, AlertTriangle 
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'seller' });
  const [creating, setCreating] = useState(false);
  
  // Abas: 'active' ou 'blocked'
  const [activeTab, setActiveTab] = useState<'active' | 'blocked'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/auth/register', newUser);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'seller' });
      fetchUsers();
      
      Swal.fire({
        icon: 'success',
        title: 'Usuário Criado',
        background: '#0d1117', color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Falha no Cadastro',
        text: 'Erro ao criar usuário. Verifique se o e-mail já existe.',
        background: '#0d1117', color: '#fff',
        confirmButtonColor: '#ff6b35'
      });
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Permissão Negada',
        text: 'Erro ao atualizar permissão, verifique se você tem esse acesso.',
        background: '#0d1117', color: '#fff'
      });
    }
  };

  const handleBlockUser = async (user: any) => {
    const { value: reason } = await Swal.fire({
      title: 'Bloquear Usuário',
      input: 'text',
      inputLabel: 'Motivo do bloqueio (enviado por e-mail)',
      inputPlaceholder: 'Ex: Violação dos Termos',
      showCancelButton: true,
      confirmButtonText: 'Bloquear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      background: '#0d1117', color: '#fff',
    });

    if (reason) {
      try {
        await api.post(`/api/admin/users/${user.id}/block`, { reason });
        fetchUsers();
        Swal.fire({ icon: 'success', title: 'Bloqueado', background: '#0d1117', color: '#fff', timer: 1500 });
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', background: '#0d1117', color: '#fff' });
      }
    }
  };

  const handleUnblockUser = async (id: string) => {
    try {
      await api.post(`/api/admin/users/${id}/unblock`);
      fetchUsers();
      Swal.fire({ icon: 'success', title: 'Reativado!', background: '#0d1117', color: '#fff', timer: 1500 });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro', background: '#0d1117', color: '#fff' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita. Todos os dados serão perdidos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Sim, excluir permanentemente',
      background: '#0d1117', color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        fetchUsers();
        Swal.fire({ icon: 'success', title: 'Excluído', background: '#0d1117', color: '#fff', timer: 1500 });
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', background: '#0d1117', color: '#fff' });
      }
    }
  };

  const handleResetPassword = async (email: string) => {
    const result = await Swal.fire({
      title: 'Resetar Senha',
      text: `Deseja enviar um e-mail de recuperação de senha para ${email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Sim, enviar e-mail',
      background: '#0d1117', color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/api/auth/forgot-password', { email });
        Swal.fire({ icon: 'success', title: 'E-mail Enviado!', background: '#0d1117', color: '#fff', timer: 2000 });
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', background: '#0d1117', color: '#fff' });
      }
    }
  };

  // Filtros Locais
  const filteredUsers = users.filter(u => {
    const isBlocked = u.role === 'blocked';
    if (activeTab === 'blocked' && !isBlocked) return false;
    if (activeTab === 'active' && isBlocked) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="animate-fade-up space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Gestão de Usuários</h1>
            <p className="opacity-40 text-sm">Administre contas, permissões e restrições de acesso.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--fg)] text-[var(--bg)] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <UserPlus size={14} /> Novo Usuário
          </button>
        </div>

        <div className="gls p-2 bg-[var(--card)] shadow-xs">
          
          {/* Tabs e Busca */}
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--border)]">
            <div className="flex gap-2">
               <button 
                 onClick={() => setActiveTab('active')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                   activeTab === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                 }`}
               >
                 Ativos ({users.filter(u => u.role !== 'blocked').length})
               </button>
               <button 
                 onClick={() => setActiveTab('blocked')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                   activeTab === 'blocked' ? 'bg-red-500/10 text-red-500' : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                 }`}
               >
                 Bloqueados ({users.filter(u => u.role === 'blocked').length})
               </button>
            </div>

            <div className="flex items-center gap-4 bg-[var(--glass2)] rounded-xl px-4 py-2 w-full md:w-auto">
              <Search size={16} className="opacity-30" />
              <input 
                type="text" 
                placeholder="Buscar usuário..." 
                className="bg-transparent border-none outline-none text-sm w-full min-w-[200px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-16 opacity-50"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[3px] opacity-30">Usuário</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[3px] opacity-30">Cargo</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[3px] opacity-30 text-center">Plano</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[3px] opacity-30 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-10 opacity-40 italic">Nenhum usuário encontrado nesta aba.</td></tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors group ${activeTab === 'blocked' ? 'bg-red-500/5' : 'hover:bg-[var(--glass2)]'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-black/10 ${activeTab === 'blocked' ? 'bg-red-900/50' : 'bg-slate-900'}`}>
                              {user.name ? user.name[0] : '?'}
                           </div>
                           <div>
                              <p className="text-xs font-black flex items-center gap-2">
                                {user.name}
                                {activeTab === 'blocked' && <AlertTriangle size={12} className="text-red-500" />}
                              </p>
                              <p className="text-[10px] opacity-40 flex items-center gap-1"><Mail size={10} /> {user.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {user.role === 'blocked' ? (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border-2 text-red-500 bg-red-500/5 border-red-500/10">Bloqueado</span>
                        ) : user.role === 'entusiasta' ? (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border-2 text-fuchsia-500 bg-fuchsia-500/5 border-fuchsia-500/10">Entusiasta</span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border-2 ${
                            user.role === 'admin' ? 'text-blue-500 bg-blue-500/5 border-blue-500/10' : 'text-slate-500 bg-slate-100 border-slate-200'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/5 border border-emerald-500/10">
                          {user.plan || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 justify-end opacity-40 group-hover:opacity-100 transition-all duration-300">
                          
                          {/* Botão de Redefinir Senha (Chave) */}
                          <button onClick={() => handleResetPassword(user.email)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all text-slate-500" title="Redefinir Senha">
                            <KeyRound size={14} />
                          </button>

                          {activeTab === 'active' ? (
                            <>
                              <button onClick={() => updateRole(user.id, user.role === 'admin' ? 'seller' : 'admin')} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all text-slate-500" title="Mudar Cargo">
                                <Shield size={14} />
                              </button>
                              <button onClick={() => handleBlockUser(user)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:bg-orange hover:border-orange hover:text-white transition-all text-slate-500" title="Bloquear Conta">
                                <Lock size={14} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleUnblockUser(user.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all text-emerald-500" title="Reativar Conta">
                              <Unlock size={14} />
                            </button>
                          )}
                          
                          <button onClick={() => handleDeleteUser(user.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:bg-red-500 hover:border-red-500 hover:text-white transition-all text-slate-500" title="Excluir Permanentemente">
                            <Trash2 size={14} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Cadastro */}
        {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto outline-none focus:outline-none">
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
             
             <div className="flex min-h-full items-start justify-center p-4 text-center sm:items-center sm:p-0 pt-20">
                <div className="relative transform overflow-hidden rounded-[32px] bg-white text-left shadow-[0_50px_100px_rgba(0,0,0,0.3)] transition-all sm:my-8 sm:w-full sm:max-w-md animate-fade-up border border-slate-100">
                   
                   <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center text-white">
                            <UserPlus size={20} />
                         </div>
                         <h3 className="text-lg font-black tracking-tight text-slate-900">Novo Usuário</h3>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                         <X size={20} />
                      </button>
                   </div>

                   <form onSubmit={handleCreateUser} className="px-8 py-8 space-y-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</label>
                         <input 
                           required
                           type="text" 
                           value={newUser.name}
                           onChange={e => setNewUser({...newUser, name: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all text-sm text-slate-900"
                           placeholder="Ex: João Silva"
                         />
                      </div>

                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail de Acesso</label>
                         <input 
                           required
                           type="email" 
                           value={newUser.email}
                           onChange={e => setNewUser({...newUser, email: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all text-sm text-slate-900"
                           placeholder="joao@dominio.com"
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha</label>
                            <input 
                              required
                              type="password" 
                              value={newUser.password}
                              onChange={e => setNewUser({...newUser, password: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all text-sm text-slate-900"
                              placeholder="••••••••"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargo</label>
                            <select 
                              value={newUser.role}
                              onChange={e => setNewUser({...newUser, role: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-orange transition-all text-sm font-bold appearance-none cursor-pointer text-slate-900"
                            >
                               <option value="entusiasta">Entusiasta (Comprador)</option>
                               <option value="seller">Vendedor (Lojista)</option>
                               <option value="admin">Administrador</option>
                            </select>
                         </div>
                      </div>

                      <div className="pt-4">
                         <button 
                           type="submit" 
                           disabled={creating}
                           className="w-full bg-slate-900 hover:bg-orange text-white py-4 rounded-xl font-black text-xs uppercase tracking-[3px] shadow-xl hover:shadow-orange/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {creating ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Finalizar Cadastro</>}
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          </div>,
          document.body
        )}
      </div>
  );
};

export default AdminUsers;
