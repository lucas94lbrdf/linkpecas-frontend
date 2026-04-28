import React, { useEffect, useRef, useState } from 'react';
import {
  Bike,
  CarFront,
  Check,
  ChevronRight,
  Edit2,
  Image,
  Loader2,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';

interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}

interface VehicleModel {
  id: string;
  manufacturer_id: string;
  name: string;
  slug: string;
  vehicle_type?: string;
  generation?: string | null;
  image_url?: string | null;
  is_active: boolean;
}

const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carro', icon: CarFront },
  { value: 'moto', label: 'Moto', icon: Bike },
  { value: 'caminhao', label: 'Caminhão', icon: Truck },
];

const typeIcon = (type?: string) => {
  const found = VEHICLE_TYPES.find(t => t.value === type);
  if (!found) return null;
  const Icon = found.icon;
  return <Icon size={11} />;
};

const typeLabel = (type?: string) => VEHICLE_TYPES.find(t => t.value === type)?.label ?? type ?? '—';

const typeColor = (type?: string) => {
  if (type === 'carro') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (type === 'moto') return 'text-orange bg-orange/10 border-orange/20';
  if (type === 'caminhao') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
};

const errorToast = (msg?: string) =>
  Swal.fire({
    icon: 'error',
    title: 'Erro',
    text: msg || 'Ocorreu um erro inesperado.',
    background: '#0d1117',
    color: '#fff',
    confirmButtonColor: '#ff6b35',
  });

const AdminVehicles: React.FC = () => {
  const [loadingInit, setLoadingInit] = useState(true);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [mfgSearch, setMfgSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const [mfgName, setMfgName] = useState('');
  const [mfgLogo, setMfgLogo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savingMfg, setSavingMfg] = useState(false);

  const [modelName, setModelName]         = useState('');
  const [vehicleType, setVehicleType]     = useState('carro');
  const [modelGeneration, setModelGeneration] = useState('');
  const [modelImageUrl, setModelImageUrl] = useState('');
  const [showModelAdvanced, setShowModelAdvanced] = useState(false);
  const [savingModel, setSavingModel]     = useState(false);

  const [editingMfgId, setEditingMfgId]       = useState<string | null>(null);
  const [editingMfgName, setEditingMfgName]   = useState('');
  const [editingMfgLogo, setEditingMfgLogo]   = useState('');
  const [savingMfgEdit, setSavingMfgEdit]     = useState(false);

  const [editingModelId, setEditingModelId]         = useState<string | null>(null);
  const [editingModelName, setEditingModelName]     = useState('');
  const [editingModelGen, setEditingModelGen]       = useState('');
  const [editingModelImg, setEditingModelImg]       = useState('');
  const [savingModelEdit, setSavingModelEdit]       = useState(false);

  const [togglingMfgId, setTogglingMfgId] = useState<string | null>(null);
  const [deletingMfgId, setDeletingMfgId] = useState<string | null>(null);
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null);

  const mfgNameRef = useRef<HTMLInputElement>(null);
  const modelNameRef = useRef<HTMLInputElement>(null);
  const editMfgRef = useRef<HTMLInputElement>(null);
  const editModelRef = useRef<HTMLInputElement>(null);

  const loadManufacturers = async () => {
    const res = await api.get('/api/admin/manufacturers');
    setManufacturers(res.data || []);
  };

  const loadModels = async (manufacturerId?: string) => {
    const params = manufacturerId ? `?manufacturer_id=${manufacturerId}` : '';
    const res = await api.get(`/api/admin/models${params}`);
    setModels(res.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadManufacturers();
      } catch {
        errorToast('Erro ao carregar montadoras.');
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadModels(selectedId).catch(() => errorToast('Erro ao carregar modelos.'));
    } else {
      setModels([]);
    }
  }, [selectedId]);

  useEffect(() => {
    if (editingMfgId && editMfgRef.current) editMfgRef.current.focus();
  }, [editingMfgId]);

  useEffect(() => {
    if (editingModelId && editModelRef.current) editModelRef.current.focus();
  }, [editingModelId]);

  const handleSelectManufacturer = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
    setModelName('');
    setModelSearch('');
    setEditingModelId(null);
  };

  const handleAddManufacturer = async () => {
    if (!mfgName.trim()) return;
    setSavingMfg(true);
    try {
      const body: Record<string, string> = { name: mfgName.trim() };
      if (mfgLogo.trim()) body.logo_url = mfgLogo.trim();
      await api.post('/api/admin/manufacturers', body);
      setMfgName('');
      setMfgLogo('');
      setShowAdvanced(false);
      await loadManufacturers();
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setSavingMfg(false);
    }
  };

  const handleAddModel = async () => {
    if (!modelName.trim() || !selectedId) return;
    setSavingModel(true);
    try {
      await api.post('/api/admin/models', {
        name: modelName.trim(),
        manufacturer_id: selectedId,
        vehicle_type: vehicleType,
        generation: modelGeneration.trim() || null,
        image_url: modelImageUrl.trim() || null,
      });
      setModelName('');
      setModelGeneration('');
      setModelImageUrl('');
      setShowModelAdvanced(false);
      await loadModels(selectedId);
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setSavingModel(false);
    }
  };

  const handleSaveMfgEdit = async (id: string) => {
    if (!editingMfgName.trim()) return;
    setSavingMfgEdit(true);
    try {
      await api.put(`/api/admin/manufacturers/${id}`, {
        name: editingMfgName.trim(),
        logo_url: editingMfgLogo.trim() || null,
      });
      setEditingMfgId(null);
      await loadManufacturers();
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setSavingMfgEdit(false);
    }
  };

  const handleSaveModelEdit = async (id: string) => {
    if (!editingModelName.trim()) return;
    setSavingModelEdit(true);
    try {
      await api.put(`/api/admin/models/${id}`, {
        name: editingModelName.trim(),
        generation: editingModelGen.trim() || null,
        image_url: editingModelImg.trim() || null,
      });
      setEditingModelId(null);
      if (selectedId) await loadModels(selectedId);
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setSavingModelEdit(false);
    }
  };

  const handleToggleMfg = async (mfg: Manufacturer) => {
    setTogglingMfgId(mfg.id);
    try {
      await api.put(`/api/admin/manufacturers/${mfg.id}`, { is_active: !mfg.is_active });
      await loadManufacturers();
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setTogglingMfgId(null);
    }
  };

  const handleDeleteMfg = async (id: string) => {
    const result = await Swal.fire({
      title: 'Remover montadora?',
      text: 'Todos os modelos vinculados também serão removidos. Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b35',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      background: '#0d1117',
      color: '#fff',
    });
    if (!result.isConfirmed) return;
    setDeletingMfgId(id);
    try {
      await api.delete(`/api/admin/manufacturers/${id}`);
      if (selectedId === id) setSelectedId(null);
      await loadManufacturers();
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setDeletingMfgId(null);
    }
  };

  const handleDeleteModel = async (id: string) => {
    setDeletingModelId(id);
    try {
      await api.delete(`/api/admin/models/${id}`);
      if (selectedId) await loadModels(selectedId);
    } catch (err: any) {
      errorToast(err?.response?.data?.detail);
    } finally {
      setDeletingModelId(null);
    }
  };

  const selectedMfg = manufacturers.find(m => m.id === selectedId);

  const filteredMfgs = manufacturers.filter(m =>
    m.name.toLowerCase().includes(mfgSearch.toLowerCase())
  );

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const activeMfgCount = manufacturers.filter(m => m.is_active).length;

  return (
    <div className="animate-fade-up space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Catálogo Automotivo</h1>
          <p className="opacity-40 text-sm">Gerencie montadoras e modelos do marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
            <CarFront size={18} className="text-orange" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{manufacturers.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1.5">Montadoras</p>
          </div>
        </div>
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Truck size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{selectedId ? filteredModels.length : '—'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1.5">
              {selectedId ? 'Modelos' : 'Selecione'}
            </p>
          </div>
        </div>
        <div className="gls p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Check size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{activeMfgCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1.5">Ativas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="gls p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base uppercase tracking-widest opacity-60">Montadoras</h2>
            <span className="px-2.5 py-1 rounded-lg bg-[var(--glass2)] text-[10px] font-black opacity-60">
              {filteredMfgs.length}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[var(--glass2)] rounded-xl px-4 py-3 border border-[var(--border)]">
            <Search size={14} className="opacity-30 shrink-0" />
            <input
              type="text"
              placeholder="Buscar montadora..."
              value={mfgSearch}
              onChange={e => setMfgSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
            {mfgSearch && (
              <button onClick={() => setMfgSearch('')} className="opacity-40 hover:opacity-100 transition-all">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {loadingInit ? (
              <div className="flex justify-center p-10 opacity-40">
                <Loader2 className="animate-spin" size={28} />
              </div>
            ) : filteredMfgs.length === 0 ? (
              <div className="text-center py-10 opacity-30 text-sm italic">Nenhuma montadora encontrada.</div>
            ) : (
              filteredMfgs.map(mfg => (
                <div
                  key={mfg.id}
                  onClick={() => handleSelectManufacturer(mfg.id)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    selectedId === mfg.id
                      ? 'bg-orange/10 border-orange/30'
                      : 'bg-[var(--glass2)] border-[var(--border)] hover:border-orange/20 hover:bg-orange/5'
                  }`}
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-[var(--card)] border border-[var(--border)] text-[13px] font-black uppercase">
                    {mfg.logo_url ? (
                      <img src={mfg.logo_url} alt={mfg.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-orange">{mfg.name.slice(0, 2)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingMfgId === mfg.id ? (
                      <div
                        className="flex flex-col gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            ref={editMfgRef}
                            value={editingMfgName}
                            onChange={e => setEditingMfgName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveMfgEdit(mfg.id);
                              if (e.key === 'Escape') setEditingMfgId(null);
                            }}
                            placeholder="Nome da montadora"
                            className="bg-[var(--card)] border border-orange/40 rounded-lg px-2 py-1 text-sm outline-none flex-1 min-w-0"
                          />
                          <button
                            onClick={() => handleSaveMfgEdit(mfg.id)}
                            disabled={savingMfgEdit}
                            className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center hover:bg-orange hover:text-white transition-all shrink-0 disabled:opacity-50"
                          >
                            {savingMfgEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button
                            onClick={() => setEditingMfgId(null)}
                            className="w-7 h-7 rounded-lg bg-[var(--glass2)] flex items-center justify-center opacity-50 hover:opacity-100 transition-all shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <input
                          value={editingMfgLogo}
                          onChange={e => setEditingMfgLogo(e.target.value)}
                          placeholder="URL do logotipo"
                          className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs outline-none w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-bold truncate">{mfg.name}</p>
                        {!mfg.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                            Inativa
                          </span>
                        )}
                      </div>
                    )}
                    {editingMfgId !== mfg.id && (
                      <p className="text-[10px] opacity-30 mt-0.5">
                        {models.filter(m => m.manufacturer_id === mfg.id).length} modelos
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingMfgId(mfg.id);
                        setEditingMfgName(mfg.name);
                        setEditingMfgLogo(mfg.logo_url || '');
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-orange/10 hover:text-orange transition-all opacity-50 hover:opacity-100"
                      title="Editar nome"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      onClick={() => handleToggleMfg(mfg)}
                      disabled={togglingMfgId === mfg.id}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
                        mfg.is_active
                          ? 'hover:bg-amber-500/10 hover:text-amber-400 opacity-50 hover:opacity-100'
                          : 'bg-emerald-500/10 text-emerald-400 opacity-80 hover:opacity-100'
                      }`}
                      title={mfg.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {togglingMfgId === mfg.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : mfg.is_active ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteMfg(mfg.id)}
                      disabled={deletingMfgId === mfg.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all opacity-50 hover:opacity-100 disabled:opacity-30"
                      title="Remover montadora"
                    >
                      {deletingMfgId === mfg.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>

                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-all ${selectedId === mfg.id ? 'text-orange rotate-90' : 'opacity-20'}`}
                  />
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Adicionar montadora</p>

            <div className="flex gap-2">
              <input
                ref={mfgNameRef}
                type="text"
                placeholder="Ex: Volkswagen"
                value={mfgName}
                onChange={e => setMfgName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddManufacturer()}
                className="flex-1 bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-all"
              />
              <button
                onClick={handleAddManufacturer}
                disabled={savingMfg || !mfgName.trim()}
                className="px-4 bg-orange text-white rounded-xl flex items-center gap-2 font-bold text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 shadow-lg shadow-orange/20"
              >
                {savingMfg ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              </button>
            </div>

            <button
              onClick={() => setShowAdvanced(p => !p)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition-all"
            >
              <Image size={11} />
              {showAdvanced ? 'Ocultar opções' : 'Opções avançadas'}
            </button>

            {showAdvanced && (
              <input
                type="text"
                placeholder="URL do logo (opcional)"
                value={mfgLogo}
                onChange={e => setMfgLogo(e.target.value)}
                className="w-full bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-all"
              />
            )}
          </div>
        </div>

        <div className="gls p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-base uppercase tracking-widest opacity-60">Modelos</h2>
              {selectedMfg && (
                <p className="text-xs font-bold text-orange mt-0.5">{selectedMfg.name}</p>
              )}
            </div>
            {selectedId && (
              <span className="px-2.5 py-1 rounded-lg bg-[var(--glass2)] text-[10px] font-black opacity-60">
                {filteredModels.length}
              </span>
            )}
          </div>

          {!selectedId ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-25">
              <CarFront size={40} />
              <p className="text-sm font-bold">Selecione uma montadora</p>
              <p className="text-xs text-center">Clique em uma montadora à esquerda para ver e gerenciar seus modelos.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-[var(--glass2)] rounded-xl px-4 py-3 border border-[var(--border)]">
                <Search size={14} className="opacity-30 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                />
                {modelSearch && (
                  <button onClick={() => setModelSearch('')} className="opacity-40 hover:opacity-100 transition-all">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredModels.length === 0 ? (
                  <div className="text-center py-8 opacity-30 text-sm italic">
                    {modelSearch ? 'Nenhum modelo encontrado.' : 'Nenhum modelo cadastrado para esta montadora.'}
                  </div>
                ) : (
                  filteredModels.map(model => (
                    <div
                      key={model.id}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--glass2)] border border-[var(--border)] hover:border-orange/20 transition-all"
                    >
                      {editingModelId === model.id ? (
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <input
                              ref={editModelRef}
                              value={editingModelName}
                              onChange={e => setEditingModelName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveModelEdit(model.id);
                                if (e.key === 'Escape') setEditingModelId(null);
                              }}
                              placeholder="Nome do modelo"
                              className="bg-[var(--card)] border border-orange/40 rounded-lg px-2 py-1 text-sm outline-none flex-1 min-w-0"
                            />
                            <button
                              onClick={() => handleSaveModelEdit(model.id)}
                              disabled={savingModelEdit}
                              className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center hover:bg-orange hover:text-white transition-all shrink-0 disabled:opacity-50"
                            >
                              {savingModelEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            </button>
                            <button
                              onClick={() => setEditingModelId(null)}
                              className="w-7 h-7 rounded-lg bg-[var(--glass2)] flex items-center justify-center opacity-50 hover:opacity-100 transition-all shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <input
                            value={editingModelGen}
                            onChange={e => setEditingModelGen(e.target.value)}
                            placeholder="Geração — ex: MK4, 9N3, 2ª Geração"
                            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs outline-none w-full"
                          />
                          <input
                            value={editingModelImg}
                            onChange={e => setEditingModelImg(e.target.value)}
                            placeholder="URL da foto do modelo"
                            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs outline-none w-full"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {model.image_url && (
                                <img src={model.image_url} alt={model.name} className="w-8 h-6 object-cover rounded shrink-0" />
                              )}
                              <p className="text-sm font-bold truncate">{model.name}</p>
                              {model.vehicle_type && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase border shrink-0 ${typeColor(model.vehicle_type)}`}>
                                  {typeIcon(model.vehicle_type)}
                                  {typeLabel(model.vehicle_type)}
                                </span>
                              )}
                            </div>
                            {model.generation && (
                              <p className="text-[10px] opacity-40 mt-0.5 ml-0.5">{model.generation}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button
                              onClick={() => {
                                setEditingModelId(model.id);
                                setEditingModelName(model.name);
                                setEditingModelGen(model.generation || '');
                                setEditingModelImg(model.image_url || '');
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-orange/10 hover:text-orange transition-all opacity-60 hover:opacity-100"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              disabled={deletingModelId === model.id}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all opacity-60 hover:opacity-100 disabled:opacity-30"
                            >
                              {deletingModelId === model.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Adicionar modelo</p>

                <div className="flex gap-2">
                  <input
                    ref={modelNameRef}
                    type="text"
                    placeholder="Ex: Gol G5"
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddModel()}
                    className="flex-1 bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-all"
                  />
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    className="bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm outline-none focus:border-orange transition-all font-bold cursor-pointer appearance-none"
                  >
                    {VEHICLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddModel}
                    disabled={savingModel || !modelName.trim()}
                    className="px-4 bg-orange text-white rounded-xl flex items-center gap-2 font-bold text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 shadow-lg shadow-orange/20"
                  >
                    {savingModel ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  </button>
                </div>

                {/* Opções avançadas do modelo */}
                <button
                  type="button"
                  onClick={() => setShowModelAdvanced(v => !v)}
                  className="text-[10px] font-bold opacity-30 hover:opacity-60 transition-all flex items-center gap-1"
                >
                  <Image size={10} /> {showModelAdvanced ? 'Ocultar' : 'Geração e foto'}
                </button>

                {showModelAdvanced && (
                  <div className="space-y-2 animate-fade-up">
                    <input
                      type="text"
                      placeholder="Geração — ex: MK4, 9N3, 2ª Geração"
                      value={modelGeneration}
                      onChange={e => setModelGeneration(e.target.value)}
                      className="w-full bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-all"
                    />
                    <input
                      type="text"
                      placeholder="URL da foto do modelo"
                      value={modelImageUrl}
                      onChange={e => setModelImageUrl(e.target.value)}
                      className="w-full bg-[var(--glass2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-all"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVehicles;
