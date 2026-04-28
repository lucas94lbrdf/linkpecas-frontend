import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Link2, DollarSign, Tag, ShoppingCart, Globe, MapPin, Calendar, Car, Image as ImageIcon, X, Plus, GitMerge, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../services/categoryService';
import { vehicleService } from '../../services/vehicleService';
import type { Manufacturer, VehicleModel } from '../../services/vehicleService';
import { communityService } from '../../services/communityService';
import { marketplaceService } from '../../services/marketplaceService';
import Swal from 'sweetalert2';

const LinkForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [allCommunities, setAllCommunities] = useState<any[]>([]);
  const [allMarketplaces, setAllMarketplaces] = useState<any[]>([]);

  // UI States
  const [isPermanent, setIsPermanent] = useState(true);
  const [isNational, setIsNational] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Opções extras de marketplace
  const [extraOptions, setExtraOptions] = useState<{ marketplace: string; price: string; url: string; free_shipping: boolean }[]>([]);

  // Cada linha de compatibilidade carrega seus próprios modelos
  interface CompatRow {
    manufacturer_id: string;
    model_id: string;
    year_start: string;
    year_end: string;
    engine: string;
    note: string;
    _models: VehicleModel[];
  }

  const emptyCompat = (): CompatRow => ({
    manufacturer_id: '', model_id: '', year_start: '', year_end: '', engine: '', note: '', _models: [],
  });

  const [compatRows, setCompatRows] = useState<CompatRow[]>([]);
  const [isUniversal, setIsUniversal] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    image_url: '',
    image_urls: [] as string[],
    price: '',
    old_price: '',
    category: '',
    marketplace: 'Shopee',
    description: '',
    city: '',
    state: '',
    expires_at: '',
    free_shipping: false,
    condition: 'new',
    warranty: '',
    community_ids: [] as string[],
  });

  const MARKETPLACES = ['Shopee', 'Mercado Livre', 'Amazon', 'AliExpress', 'Magalu', 'Americanas', 'Site Próprio'];

  const addExtraOption = () => {
    const defaultMkt = allMarketplaces.length > 0 ? allMarketplaces[0].name : 'Shopee';
    setExtraOptions(prev => [...prev, { marketplace: defaultMkt, price: '', url: '', free_shipping: false }]);
  };

  const removeExtraOption = (i: number) =>
    setExtraOptions(prev => prev.filter((_, idx) => idx !== i));

  const updateExtraOption = (i: number, field: string, value: any) =>
    setExtraOptions(prev => prev.map((opt, idx) => idx === i ? { ...opt, [field]: value } : opt));

  useEffect(() => {
    const ctrl = new AbortController();
    const sig  = ctrl.signal;
    const skip = (err: any) => { if (err?.code !== 'ERR_CANCELED') console.error(err); };

    categoryService.list().then(setCategories).catch(skip);
    vehicleService.listManufacturers().then(setManufacturers).catch(skip);
    communityService.getAll().then(setAllCommunities).catch(skip);
    marketplaceService.getAll().then(setAllMarketplaces).catch(skip);

    if (!id) {
      api.get('/api/dashboard/', { signal: sig }).then(({ data }) => {
        if (data.total_links >= data.plan_limit) {
          Swal.fire({
            icon: 'warning',
            title: 'Limite Atingido!',
            text: `Seu plano ${data.plan} atingiu o limite de ${data.plan_limit} links.`,
            background: '#0d1117',
            color: '#fff',
            confirmButtonText: 'Fazer Upgrade',
            confirmButtonColor: '#ff5c00',
            showCancelButton: true,
            cancelButtonText: 'Voltar'
          }).then((result) => {
            if (result.isConfirmed) navigate('/plans');
            else navigate('/dashboard');
          });
        }
      }).catch(skip);
    }

    if (id) {
      setFetching(true);
      api.get(`/api/ads/${id}`, { signal: sig })
        .then(async ({ data }) => {
          setFormData({
            title: data.title || '',
            url: data.url || data.external_url || '',
            image_url: data.image_url || '',
            image_urls: data.image_urls || [],
            price: data.price ? String(data.price) : '',
            old_price: data.old_price ? String(data.old_price) : '',
            category: data.category || '',
            marketplace: data.marketplace || 'Shopee',
            description: data.description || '',
            city: data.city || '',
            state: data.state || '',
            expires_at: data.expires_at ? data.expires_at.split('T')[0] : '',
            free_shipping: data.free_shipping || false,
            condition: data.condition || 'new',
            warranty: data.warranty || '',
            community_ids: data.communities?.map((c: any) => c.id) || [],
          });
          if (data.expires_at) setIsPermanent(false);
          if (data.city || data.state) setIsNational(false);
          if (data.marketplace_options?.length) {
            setExtraOptions(data.marketplace_options.map((o: any) => ({
              marketplace: o.marketplace,
              price: String(o.price),
              url: o.url,
              free_shipping: o.free_shipping || false,
            })));
          }

          // Carrega compatibilidades
          if (data.compatibilities?.length) {
            setIsUniversal(false);
            const rows: CompatRow[] = await Promise.all(
              data.compatibilities.map(async (c: any) => {
                let rowModels: VehicleModel[] = [];
                if (c.manufacturer_id) {
                  try { rowModels = await vehicleService.listModelsByManufacturer(c.manufacturer_id); } catch {}
                }
                return {
                  manufacturer_id: c.manufacturer_id || '',
                  model_id: c.model_id || '',
                  year_start: c.year_start ? String(c.year_start) : '',
                  year_end: c.year_end ? String(c.year_end) : '',
                  engine: c.engine || '',
                  note: c.note || '',
                  _models: rowModels,
                };
              })
            );
            setCompatRows(rows);
          } else if (!data.is_universal && data.manufacturer_id) {
            // Dado legado sem lista
            setIsUniversal(false);
            let rowModels: VehicleModel[] = [];
            try { rowModels = await vehicleService.listModelsByManufacturer(data.manufacturer_id); } catch {}
            setCompatRows([{
              manufacturer_id: data.manufacturer_id || '',
              model_id: data.model_id || '',
              year_start: data.year_start ? String(data.year_start) : '',
              year_end: data.year_end ? String(data.year_end) : '',
              engine: data.engine || '',
              note: '',
              _models: rowModels,
            }]);
          } else {
            setIsUniversal(data.is_universal ?? true);
          }
        })
        .catch(skip)
        .finally(() => setFetching(false));
    }

    return () => ctrl.abort();
  }, [id, navigate]);

  const handleCompatChange = async (idx: number, field: keyof CompatRow, value: string) => {
    setCompatRows(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'manufacturer_id') {
        updated[idx].model_id = '';
        updated[idx]._models  = [];
      }
      return updated;
    });
    if (field === 'manufacturer_id' && value) {
      try {
        const rowModels = await vehicleService.listModelsByManufacturer(value);
        setCompatRows(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], _models: rowModels };
          return updated;
        });
      } catch {}
    }
  };

  const addCompatRow = () => setCompatRows(prev => [...prev, emptyCompat()]);
  const removeCompatRow = (idx: number) => setCompatRows(prev => prev.filter((_, i) => i !== idx));

  const handleAddImage = () => {
    if (!newImageUrl) return;
    
    if (!formData.image_url) {
      setFormData(prev => ({ ...prev, image_url: newImageUrl }));
    } else {
      setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, newImageUrl] }));
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleUrlChange = (val: string) => {
    let mkt = formData.marketplace;
    const lowerUrl = val.toLowerCase();
    
    if (lowerUrl.includes('mercadolivre.com') || lowerUrl.includes('mercadolibre.com')) mkt = 'Mercado Livre';
    else if (lowerUrl.includes('shopee.com') || lowerUrl.includes('shp.ee')) mkt = 'Shopee';
    else if (lowerUrl.includes('amazon.')) mkt = 'Amazon';
    else if (lowerUrl.includes('aliexpress.')) mkt = 'AliExpress';
    else if (lowerUrl.includes('magazineluiza.com') || lowerUrl.includes('magalu.com')) mkt = 'Magalu';
    else if (lowerUrl.includes('americanas.com')) mkt = 'Americanas';

    setFormData(prev => ({ ...prev, url: val, marketplace: mkt }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const parsedPrice = parseFloat(String(formData.price).replace(',', '.')) || 0;
    const parsedOldPrice = formData.old_price ? parseFloat(String(formData.old_price).replace(',', '.')) : null;

    const payload: any = {
      ...formData,
      price: parsedPrice,
      old_price: parsedOldPrice,
      url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
      community_ids: formData.community_ids,
    };
    if (isPermanent) payload.expires_at = '';
    if (isNational) { payload.city = ''; payload.state = ''; }

    payload.is_universal = isUniversal;
    payload.compatibilities = isUniversal
      ? []
      : compatRows
          .filter(r => r.manufacturer_id && r.model_id)
          .map(r => ({
            manufacturer_id: r.manufacturer_id,
            model_id:        r.model_id,
            year_start:      r.year_start ? parseInt(r.year_start) : null,
            year_end:        r.year_end   ? parseInt(r.year_end)   : null,
            engine:          r.engine || null,
            note:            r.note   || null,
          }));

    payload.marketplace_options = extraOptions
      .filter(o => o.url && o.price)
      .map(o => ({ 
        marketplace: o.marketplace, 
        price: parseFloat(String(o.price).replace(',', '.')) || 0, 
        url: o.url.startsWith('http') ? o.url : `https://${o.url}`, 
        free_shipping: o.free_shipping 
      }));

    try {
      if (id) {
        await api.put(`/api/ads/${id}`, payload);
      } else {
        await api.post('/api/ads', payload);
      }
      navigate('/my-links');
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Anúncio salvo com sucesso.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Erro ao salvar o link. Tente novamente.';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: msg,
        background: '#0d1117',
        color: '#fff',
        confirmButtonColor: '#ff6b35'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center opacity-40">Carregando dados...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-up pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold opacity-40 hover:opacity-100 hover:text-orange transition-all mb-8"
      >
        <ArrowLeft size={14} /> Voltar
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">{id ? 'Editar Anúncio' : 'Novo Anúncio'}</h1>
          <p className="text-sm opacity-40 mt-1">Preencha os dados para publicar seu produto no marketplace.</p>
        </div>
        <div className="text-[10px] uppercase font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/10 tracking-widest hidden sm:block">
           Formulário Otimizado
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção 1: Informações Básicas */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[var(--border)]">
            <Tag size={18} className="text-orange" />
            <h2 className="font-bold">Informações Principais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Título do Anúncio</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <input 
                   required value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   placeholder="Ex: Kit Suspensão Esportiva Honda Civic" 
                   className="bg-transparent border-none outline-none text-sm w-full font-semibold"
                 />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Descrição Detalhada</label>
              <div className="flex px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <textarea 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Descreva as condições, marca, compatibilidade e detalhes do produto..." 
                   className="bg-transparent border-none outline-none text-sm w-full min-h-[100px] resize-y"
                 />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Link Original do Marketplace</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <Link2 size={18} className="opacity-20" />
                 <input 
                   required type="url" value={formData.url}
                   onChange={e => handleUrlChange(e.target.value)}
                   placeholder="https://shopee.com.br/..." 
                   className="bg-transparent border-none outline-none text-sm w-full text-blue-400"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Precificação e Categoria */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[var(--border)]">
            <DollarSign size={18} className="text-emerald-500" />
            <h2 className="font-bold">Valores e Categoria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Preço (R$)</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-emerald-500/50 transition-all">
                 <span className="opacity-30 font-bold">R$</span>
                 <input 
                   type="number" step="0.01" required
                   value={formData.price}
                   onChange={e => setFormData({...formData, price: e.target.value})}
                   placeholder="299.90" 
                   className="bg-transparent border-none outline-none text-sm w-full font-bold text-emerald-500"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Preço De (R$) - Opcional</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <span className="opacity-30 font-bold">R$</span>
                 <input 
                   type="number" step="0.01"
                   value={formData.old_price}
                   onChange={e => setFormData({...formData, old_price: e.target.value})}
                   placeholder="399.90" 
                   className="bg-transparent border-none outline-none text-sm w-full line-through opacity-60"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Categoria Principal</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <ShoppingCart size={18} className="opacity-20" />
                  <select 
                    required
                    className="bg-transparent border-none outline-none text-sm w-full appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" disabled className="text-black">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug} className="text-black">{cat.name}</option>
                    ))}
                  </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Plataforma Origem</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <Globe size={18} className="opacity-20" />
                 <select 
                    required
                    className="bg-transparent border-none outline-none text-sm w-full appearance-none"
                    value={formData.marketplace}
                    onChange={e => setFormData({...formData, marketplace: e.target.value})}
                  >
                    {allMarketplaces.length > 0 ? (
                      allMarketplaces.map(mp => (
                        <option key={mp.id} value={mp.name} className="text-black">{mp.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Shopee" className="text-black">Shopee</option>
                        <option value="Mercado Livre" className="text-black">Mercado Livre</option>
                        <option value="Amazon" className="text-black">Amazon</option>
                      </>
                    )}
                  </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Condição do Produto</label>
              <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
                 <button 
                   type="button" 
                   onClick={() => setFormData({...formData, condition: 'new'})}
                   className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.condition === 'new' ? 'bg-orange text-white' : 'opacity-40 hover:opacity-100'}`}
                 >
                   Novo
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setFormData({...formData, condition: 'used'})}
                   className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.condition === 'used' ? 'bg-orange text-white' : 'opacity-40 hover:opacity-100'}`}
                 >
                   Usado
                 </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Garantia (Ex: 3 meses)</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus-within:border-orange/50 transition-all">
                 <input 
                   value={formData.warranty}
                   onChange={e => setFormData({...formData, warranty: e.target.value})}
                   placeholder="Sem garantia" 
                   className="bg-transparent border-none outline-none text-sm w-full"
                 />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Vincular a Comunidades</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allCommunities.map(comm => (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => {
                      const ids = formData.community_ids.includes(comm.id)
                        ? formData.community_ids.filter(id => id !== comm.id)
                        : [...formData.community_ids, comm.id];
                      setFormData({...formData, community_ids: ids});
                    }}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase transition-all text-left flex items-center justify-between ${formData.community_ids.includes(comm.id) ? 'border-orange bg-orange/10 text-orange' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}
                  >
                    {comm.name}
                    {formData.community_ids.includes(comm.id) && <CheckCircle2 size={12} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3: Compatibilidade Veicular */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border)]">
            <Car size={18} className="text-orange" />
            <h2 className="font-bold">Compatibilidade com Veículos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setIsUniversal(false); if (compatRows.length === 0) addCompatRow(); }}
              className={`text-left p-4 rounded-xl border transition-all ${!isUniversal ? 'border-orange bg-orange/10' : 'border-[var(--border)] hover:border-orange/30'}`}
            >
              <p className="text-xs font-black uppercase tracking-widest">Compatível com veículo</p>
              <p className="text-xs opacity-50 mt-1">Especifique uma ou mais aplicações.</p>
            </button>
            <button
              type="button"
              onClick={() => setIsUniversal(true)}
              className={`text-left p-4 rounded-xl border transition-all ${isUniversal ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] hover:border-blue-500/30'}`}
            >
              <p className="text-xs font-black uppercase tracking-widest">Universal</p>
              <p className="text-xs opacity-50 mt-1">Serve para qualquer veículo.</p>
            </button>
          </div>

          {!isUniversal && (
            <div className="space-y-4">
              {compatRows.map((row, idx) => (
                <div key={idx} className="border border-[var(--border)] rounded-2xl p-5 space-y-4 relative bg-[var(--card)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">
                      Aplicação {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCompatRow(idx)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Montadora</label>
                      <select
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full"
                        value={row.manufacturer_id}
                        onChange={e => handleCompatChange(idx, 'manufacturer_id', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {manufacturers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Modelo</label>
                      <select
                        disabled={!row.manufacturer_id}
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full disabled:opacity-40"
                        value={row.model_id}
                        onChange={e => handleCompatChange(idx, 'model_id', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {row._models.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Ano Inicial</label>
                      <input
                        type="number" min={1900} max={new Date().getFullYear() + 1}
                        placeholder="Ex: 2015"
                        value={row.year_start}
                        onChange={e => handleCompatChange(idx, 'year_start', e.target.value)}
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Ano Final</label>
                      <input
                        type="number" min={1900} max={new Date().getFullYear() + 1}
                        placeholder="Ex: 2024"
                        value={row.year_end}
                        onChange={e => handleCompatChange(idx, 'year_end', e.target.value)}
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Motor (Opcional)</label>
                      <input
                        placeholder="Ex: 1.6 MSI"
                        value={row.engine}
                        onChange={e => handleCompatChange(idx, 'engine', e.target.value)}
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Observação (Opcional)</label>
                      <input
                        placeholder="Ex: apenas versão turbo"
                        value={row.note}
                        onChange={e => handleCompatChange(idx, 'note', e.target.value)}
                        className="bg-[var(--glass2)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCompatRow}
                className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border)] text-xs font-bold opacity-40 hover:opacity-100 hover:border-orange/40 hover:text-orange transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Adicionar outra aplicação
              </button>
            </div>
          )}
        </div>

        {/* Seção 4: Segmentação (Local e Prazo) */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[var(--border)]">
            <MapPin size={18} className="text-blue-500" />
            <h2 className="font-bold">Disponibilidade e Localização</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2"><Globe size={16}/> Alcance</label>
                <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)]">
                  <button type="button" onClick={() => setIsNational(true)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${isNational ? 'bg-blue-500 text-white' : 'opacity-40 hover:opacity-100'}`}>Nacional</button>
                  <button type="button" onClick={() => setIsNational(false)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${!isNational ? 'bg-blue-500 text-white' : 'opacity-40 hover:opacity-100'}`}>Regional</button>
                </div>
              </div>
              
              {!isNational && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Cidade</label>
                    <input 
                      required={!isNational}
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: São Paulo" 
                      className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none text-sm w-full focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Estado (UF)</label>
                    <input 
                      required={!isNational} maxLength={2}
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      placeholder="SP" 
                      className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none text-sm w-full focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2"><Calendar size={16}/> Validade</label>
                <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)]">
                  <button type="button" onClick={() => setIsPermanent(true)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${isPermanent ? 'bg-orange text-white' : 'opacity-40 hover:opacity-100'}`}>Permanente</button>
                  <button type="button" onClick={() => setIsPermanent(false)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${!isPermanent ? 'bg-orange text-white' : 'opacity-40 hover:opacity-100'}`}>Com Prazo</button>
                </div>
              </div>
              
              {!isPermanent && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Data de Término</label>
                  <input 
                    type="date" required={!isPermanent}
                    value={formData.expires_at}
                    onChange={e => setFormData({...formData, expires_at: e.target.value})}
                    className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none text-sm w-full focus:border-orange/50 transition-all color-scheme-dark"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <label className="text-sm font-bold flex items-center gap-2">🚚 Frete Grátis</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.free_shipping} onChange={e => setFormData({...formData, free_shipping: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4: Galeria de Fotos */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[var(--border)]">
            <ImageIcon size={18} className="text-purple-500" />
            <h2 className="font-bold">Galeria de Fotos</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input 
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Cole o link da imagem (JPG/PNG)" 
                className="bg-[var(--card)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none text-sm flex-1 focus:border-purple-500/50 transition-all"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <button 
                type="button" onClick={handleAddImage}
                className="px-6 py-3 bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold text-sm rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
            <p className="text-[10px] opacity-30 italic ml-2">A primeira imagem será usada como capa do anúncio.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
              {formData.image_url && (
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/20 group">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500 text-white text-[9px] font-black uppercase rounded shadow">Capa</div>
                  <img src={formData.image_url} alt="Capa" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (formData.image_urls.length > 0) {
                        setFormData(prev => ({ ...prev, image_url: prev.image_urls[0], image_urls: prev.image_urls.slice(1) }));
                      } else {
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {formData.image_urls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] group bg-[var(--card)]">
                  <img src={url} alt={`Foto ${index + 2}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção 5: Outras opções de marketplace */}
        <div className="gls p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <GitMerge size={18} className="text-indigo-400" />
              <div>
                <h2 className="font-bold">Comparação de Preços</h2>
                <p className="text-[10px] opacity-40 mt-0.5">Adicione o mesmo produto em outros marketplaces. O visitante escolhe o melhor preço.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addExtraOption}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[11px] font-black hover:bg-indigo-500 hover:text-white transition-all"
            >
              <Plus size={14} /> Adicionar marketplace
            </button>
          </div>

          {extraOptions.length === 0 ? (
            <div className="text-center py-8 opacity-20">
              <GitMerge size={32} className="mx-auto mb-2" />
              <p className="text-sm">Nenhuma opção adicionada ainda.</p>
              <p className="text-[11px]">Clique em "Adicionar marketplace" para criar uma comparação de preços.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {extraOptions.map((opt, i) => (
                <div key={i} className="grid grid-cols-[1fr_130px_1fr_auto_auto] gap-3 items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <select
                    value={opt.marketplace}
                    onChange={e => updateExtraOption(i, 'marketplace', e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-bold"
                  >
                    {allMarketplaces.length > 0 ? (
                      allMarketplaces.map(mp => (
                        <option key={mp.id} value={mp.name} className="text-black">{mp.name}</option>
                      ))
                    ) : (
                      MARKETPLACES.map(m => <option key={m} value={m} className="text-black">{m}</option>)
                    )}
                  </select>

                  <div className="flex items-center gap-1 px-3 py-2 bg-[var(--glass2)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] opacity-40 font-bold">R$</span>
                    <input
                      type="number" step="0.01" placeholder="0,00"
                      value={opt.price}
                      onChange={e => updateExtraOption(i, 'price', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-emerald-400 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--glass2)] border border-[var(--border)] rounded-lg">
                    <Link2 size={12} className="opacity-30 shrink-0" />
                    <input
                      type="url" placeholder="https://..."
                      value={opt.url}
                      onChange={e => updateExtraOption(i, 'url', e.target.value)}
                      className="bg-transparent border-none outline-none text-[11px] text-blue-400 w-full"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={opt.free_shipping}
                      onChange={e => updateExtraOption(i, 'free_shipping', e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span className="text-[10px] font-bold opacity-60">Frete Grátis</span>
                  </label>

                  <button type="button" onClick={() => removeExtraOption(i)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-to-br from-orange to-orange2 text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg uppercase tracking-wider"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          {id ? 'Atualizar Anúncio' : 'Publicar Anúncio'}
        </button>
      </form>
    </div>
  );
};

export default LinkForm;
