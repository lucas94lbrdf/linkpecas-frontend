import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Loader2, Edit3, X, Save,
  ExternalLink, Users, Image as ImageIcon
} from 'lucide-react';
import { communityService } from '../../services/communityService';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

interface CommunityForm {
  name: string;
  slug: string;
  description: string;
  avatar_url: string;
  banner_url: string;
}

const emptyForm: CommunityForm = {
  name: '', slug: '', description: '', avatar_url: '', banner_url: '',
};

const AdminCommunities: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommunityForm>(emptyForm);

  const { data: communities, isLoading } = useQuery({
    queryKey: ['admin-communities'],
    queryFn: communityService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CommunityForm) => {
      if (editingId) return communityService.update(editingId, data);
      return communityService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      closeModal();
      Swal.fire({ icon: 'success', title: editingId ? 'Atualizado!' : 'Criado!', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire('Erro', err.response?.data?.detail || 'Falha ao salvar', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: communityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      Swal.fire({ icon: 'success', title: 'Removida!', timer: 1500, showConfirmButton: false });
    },
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', avatar_url: c.avatar_url || '', banner_url: c.banner_url || '' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    saveMutation.mutate(form);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Tem certeza?', text: 'A comunidade será removida.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ff5c00', confirmButtonText: 'Sim, remover!',
    }).then((r) => { if (r.isConfirmed) deleteMutation.mutate(id); });
  };

  const updateSlug = (name: string) => {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, name, slug }));
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Gerenciar Comunidades</h1>
          <p className="text-sm opacity-50 font-medium">Configure e organize as vitrines de nicho.</p>
        </div>
        <button onClick={openCreate} className="bg-orange text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange/20 shrink-0">
          <Plus size={16} /> Nova Comunidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {communities?.map((c: any) => (
          <div key={c.id} className="gls overflow-hidden group hover:border-orange/30 transition-all">
            <div className="h-24 relative overflow-hidden">
              {c.banner_url || c.image_url ? (
                <><img src={c.banner_url || c.image_url} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-orange/60 mix-blend-multiply" /></>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange/80 to-orange2/80" />
              )}
              <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl border-2 border-[var(--bg)] shadow-lg overflow-hidden bg-[var(--bg)]">
                {c.avatar_url ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange/10 flex items-center justify-center text-orange font-black">{c.name?.charAt(0)}</div>}
              </div>
            </div>
            <div className="p-4 pt-7">
              <h3 className="font-bold text-sm truncate">{c.name}</h3>
              <p className="text-[10px] font-mono opacity-40">/{c.slug}</p>
              <p className="text-[10px] opacity-40 mt-1 line-clamp-1">{c.description || 'Sem descrição'}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <span className="text-[10px] font-bold opacity-40">{c.ads_count || 0} anúncios</span>
                <div className="flex gap-1">
                  <Link to={`/comunidades/${c.id}`} target="_blank" className="p-1.5 hover:bg-orange/10 hover:text-orange rounded-lg transition-all opacity-40 hover:opacity-100"><ExternalLink size={13} /></Link>
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {communities?.length === 0 && (
          <div className="col-span-full p-16 text-center opacity-30">
            <Users size={40} className="mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma comunidade.</p>
          </div>
        )}
      </div>

      {/* Modal via Portal */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--border2)] bg-[var(--bg)] shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Preview */}
            <div className="h-28 relative overflow-hidden rounded-t-2xl">
              {form.banner_url ? (
                <><img src={form.banner_url} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-orange/60 mix-blend-multiply" /></>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange/40 to-orange2/40 flex items-center justify-center"><ImageIcon size={28} className="opacity-30" /></div>
              )}
              <div className="absolute bottom-2 left-5 w-12 h-12 rounded-xl border-2 border-[var(--bg)] overflow-hidden bg-[var(--bg)] shadow-lg">
                {form.avatar_url ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange/10 flex items-center justify-center text-orange font-black">{form.name?.charAt(0) || '?'}</div>}
              </div>
              <button onClick={closeModal} className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-all"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-lg font-black">{editingId ? 'Editar Comunidade' : 'Nova Comunidade'}</h2>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nome</label>
                <input type="text" value={form.name} onChange={e => updateSlug(e.target.value)} placeholder="Ex: JDM Legends" required
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">URL Amigável (Slug)</label>
                <div className="flex items-center bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3">
                  <span className="text-xs opacity-30 mr-1">/comunidades/</span>
                  <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} required
                    className="bg-transparent outline-none text-sm font-mono flex-1 min-w-0" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Descrição</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição..."
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all min-h-[70px] resize-y" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-1">URL Avatar</label>
                  <input type="url" value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..."
                    className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-1">URL Banner</label>
                  <input type="url" value={form.banner_url} onChange={e => setForm({ ...form, banner_url: e.target.value })} placeholder="https://..."
                    className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
                </div>
              </div>

              <button type="submit" disabled={saveMutation.isPending}
                className="w-full bg-orange text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editingId ? 'Salvar Alterações' : 'Criar Comunidade'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCommunities;