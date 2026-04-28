import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Loader2, Edit3, X, Save, Tag,
  Wrench, Cog, Car, Fuel, Gauge, ShieldCheck, Zap, Wind,
  Disc, CircleDot, Lightbulb, Battery, Thermometer, Settings,
  Hammer, PaintBucket, Truck, LifeBuoy, Lock, Radio,
  Eye, Navigation, Sparkles, Filter, Pipette, Box,
  Layers, PackageOpen, SlidersHorizontal, PlugZap, CircuitBoard, Bike,
} from 'lucide-react';
import { categoryService, type Category, type CategoryCreate } from '../../services/categoryService';
import Swal from 'sweetalert2';

/* ── Icon Picker Config ── */
const ICON_OPTIONS = [
  { name: 'Wrench', icon: Wrench },
  { name: 'Cog', icon: Cog },
  { name: 'Settings', icon: Settings },
  { name: 'SlidersHorizontal', icon: SlidersHorizontal },
  { name: 'Car', icon: Car },
  { name: 'Truck', icon: Truck },
  { name: 'Bike', icon: Bike },
  { name: 'Fuel', icon: Fuel },
  { name: 'Gauge', icon: Gauge },
  { name: 'Zap', icon: Zap },
  { name: 'PlugZap', icon: PlugZap },
  { name: 'Battery', icon: Battery },
  { name: 'CircuitBoard', icon: CircuitBoard },
  { name: 'Disc', icon: Disc },
  { name: 'CircleDot', icon: CircleDot },
  { name: 'LifeBuoy', icon: LifeBuoy },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Lock', icon: Lock },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Wind', icon: Wind },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Filter', icon: Filter },
  { name: 'Pipette', icon: Pipette },
  { name: 'PaintBucket', icon: PaintBucket },
  { name: 'Hammer', icon: Hammer },
  { name: 'Radio', icon: Radio },
  { name: 'Eye', icon: Eye },
  { name: 'Navigation', icon: Navigation },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Box', icon: Box },
  { name: 'Layers', icon: Layers },
  { name: 'PackageOpen', icon: PackageOpen },
  { name: 'Tag', icon: Tag },
];

const getIconComponent = (name: string) => {
  const found = ICON_OPTIONS.find(i => i.name === name);
  return found ? found.icon : Tag;
};

/* ── Form Types ── */
interface CatForm { name: string; slug: string; description: string; icon: string; }
const emptyForm: CatForm = { name: '', slug: '', description: '', icon: '' };

const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryService.list,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CatForm) => {
      const payload: CategoryCreate = { name: data.name, slug: data.slug, description: data.description || undefined, icon: data.icon || undefined };
      if (editingId) return categoryService.update(editingId, payload);
      return categoryService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
      Swal.fire({ icon: 'success', title: editingId ? 'Atualizada!' : 'Criada!', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire('Erro', err.response?.data?.detail || 'Falha ao salvar', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      Swal.fire({ icon: 'success', title: 'Removida!', timer: 1500, showConfirmButton: false });
    },
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', icon: cat.icon || '' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyForm); setIconPickerOpen(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    saveMutation.mutate(form);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Tem certeza?', text: 'A categoria será removida.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ff5c00', confirmButtonText: 'Sim, remover!',
    }).then((r) => { if (r.isConfirmed) deleteMutation.mutate(id); });
  };

  const updateSlug = (name: string) => {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, name, slug }));
  };

  const SelectedIcon = form.icon ? getIconComponent(form.icon) : null;

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Gerenciar Categorias</h1>
          <p className="text-sm opacity-50 font-medium">Organize os tipos de produtos do marketplace.</p>
        </div>
        <button onClick={openCreate} className="bg-orange text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange/20 shrink-0">
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories?.map((cat: Category) => {
          const CatIcon = cat.icon ? getIconComponent(cat.icon) : Tag;
          return (
            <div key={cat.id} className="gls p-4 flex items-center justify-between group hover:border-orange/30 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
                  <CatIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">{cat.name}</h4>
                  <p className="text-[10px] font-mono opacity-40 truncate">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all opacity-40 hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {categories?.length === 0 && (
          <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <Tag size={40} className="mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma categoria.</p>
          </div>
        )}
      </div>

      {/* Modal via Portal */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border2)] bg-[var(--bg)] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-black">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-[var(--bg2)] rounded-lg transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nome</label>
                <input type="text" value={form.name} onChange={e => updateSlug(e.target.value)} placeholder="Ex: Performance" required
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} required
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm font-mono focus:border-orange outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Descrição</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição curta..."
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all min-h-[70px] resize-y" />
              </div>

              {/* Icon Picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Ícone</label>
                <button
                  type="button"
                  onClick={() => setIconPickerOpen(!iconPickerOpen)}
                  className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm focus:border-orange outline-none transition-all flex items-center gap-3 hover:border-orange/50"
                >
                  {SelectedIcon ? (
                    <>
                      <SelectedIcon size={18} className="text-orange" />
                      <span className="opacity-70">{form.icon}</span>
                    </>
                  ) : (
                    <span className="opacity-40">Selecione um ícone...</span>
                  )}
                </button>
                {iconPickerOpen && (
                  <div className="grid grid-cols-8 gap-1.5 p-3 bg-[var(--bg2)] border border-[var(--border2)] rounded-xl mt-1 max-h-[180px] overflow-y-auto">
                    {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, icon: name })); setIconPickerOpen(false); }}
                        title={name}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center hover:bg-orange/10 hover:text-orange ${form.icon === name ? 'bg-orange/15 text-orange ring-1 ring-orange/30' : 'opacity-50 hover:opacity-100'}`}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={saveMutation.isPending}
                className="w-full bg-orange text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCategories;