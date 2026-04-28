import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Edit3, X, Save, Globe } from 'lucide-react';
import { marketplaceService } from '../../services/marketplaceService';
import Swal from 'sweetalert2';

interface MpForm { name: string; slug: string; icon_url: string; }
const emptyForm: MpForm = { name: '', slug: '', icon_url: '' };

const AdminMarketplaces: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MpForm>(emptyForm);

  const { data: marketplaces, isLoading } = useQuery({
    queryKey: ['admin-marketplaces'],
    queryFn: marketplaceService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: MpForm) => {
      if (editingId) return marketplaceService.update(editingId, data);
      return marketplaceService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketplaces'] });
      closeModal();
      Swal.fire({ icon: 'success', title: editingId ? 'Atualizado!' : 'Criado!', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire('Erro', err.response?.data?.detail || 'Falha ao salvar', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: marketplaceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketplaces'] });
      Swal.fire({ icon: 'success', title: 'Removido!', timer: 1500, showConfirmButton: false });
    },
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (mp: any) => {
    setEditingId(mp.id);
    setForm({ name: mp.name || '', slug: mp.slug || '', icon_url: mp.icon_url || '' });
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
      title: 'Tem certeza?', text: 'O marketplace será removido.', icon: 'warning',
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
          <h1 className="text-2xl font-black tracking-tight">Gerenciar Marketplaces</h1>
          <p className="text-sm opacity-50 font-medium">Adicione, edite ou remova e-commerces parceiros.</p>
        </div>
        <button onClick={openCreate} className="bg-orange text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange/20 shrink-0">
          <Plus size={16} /> Novo Marketplace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {marketplaces?.map((mp: any) => (
          <div key={mp.id} className="gls p-4 flex items-center justify-between group hover:border-orange/30 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange/10 flex items-center justify-center text-orange shrink-0">
                {mp.icon_url ? <img src={mp.icon_url} alt={mp.name} className="w-full h-full object-cover" /> : <Globe size={20} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate">{mp.name}</h4>
                <p className="text-[10px] font-mono opacity-40 truncate">/{mp.slug}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(mp)} className="p-1.5 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Edit3 size={14} /></button>
              <button onClick={() => handleDelete(mp.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {marketplaces?.length === 0 && (
          <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <Globe size={40} className="mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhum marketplace.</p>
          </div>
        )}
      </div>

      {/* Modal via Portal */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border2)] bg-[var(--bg)] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-black">{editingId ? 'Editar Marketplace' : 'Novo Marketplace'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-[var(--bg2)] rounded-lg transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nome</label>
                <input type="text" value={form.name} onChange={e => updateSlug(e.target.value)} placeholder="Ex: Mercado Livre" required
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} required
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm font-mono focus:border-orange outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Ícone URL (Opcional)</label>
                <input type="url" value={form.icon_url} onChange={e => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..."
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
              </div>
              <button type="submit" disabled={saveMutation.isPending}
                className="w-full bg-orange text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editingId ? 'Salvar Alterações' : 'Criar Marketplace'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminMarketplaces;