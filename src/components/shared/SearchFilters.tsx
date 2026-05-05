import React, { useCallback, useEffect, useState } from 'react';
import {
  SlidersHorizontal, X, ChevronDown, Tag, Car, Gauge, MapPin, DollarSign
} from 'lucide-react';
import { vehicleService, type Manufacturer, type VehicleModel } from '../../services/vehicleService';

const CATEGORIES = [
  { value: 'all',         label: 'Tudo' },
  { value: 'pecas',       label: 'Peças' },
  { value: 'estetica',    label: 'Estética' },
  { value: 'performance', label: 'Performance' },
  { value: 'acessorios',  label: 'Acessórios' },
  { value: 'pneus',       label: 'Pneus' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'iluminacao',  label: 'Iluminação' },
];

const YEARS = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

const STATES_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

export interface SearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  model?: string;
  year_min?: string;
  year_max?: string;
  price_min?: string;
  price_max?: string;
  state?: string;
  city?: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  resultCount?: number;
}

/* ── Subcomponente: collapsible section ─────────────────────────────────── */
const FilterSection: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({
  label, icon, children, defaultOpen = true
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-2 text-sm font-bold text-gray-700 hover:text-[#FF6200] transition-colors"
      >
        <span className="flex items-center gap-2">{icon}{label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
};

/* ── Componente principal ───────────────────────────────────────────────── */
const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({ filters, onChange, resultCount }) => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    vehicleService.listManufacturers().then(setManufacturers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.brand) { setModels([]); return; }
    const mfg = manufacturers.find(m => m.slug === filters.brand);
    if (mfg) {
      vehicleService.listModelsByManufacturer(mfg.id).then(setModels).catch(() => {});
    }
  }, [filters.brand, manufacturers]);

  const set = useCallback((key: keyof SearchFilters, value: string) => {
    const next = { ...filters, [key]: value || undefined };
    // reset dependentes
    if (key === 'brand') { next.model = undefined; }
    onChange(next);
  }, [filters, onChange]);

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'q' && v && v !== 'all').length;

  const filteredBrands = manufacturers.filter(m =>
    m.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const clearAll = () => onChange({ q: filters.q });

  const panel = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#FF6200]" />
          <span className="text-sm font-black text-gray-800">Filtros</span>
          {activeCount > 0 && (
            <span className="bg-[#FF6200] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <X size={11} /> Limpar tudo
          </button>
        )}
      </div>
      {resultCount !== undefined && (
        <p className="text-[11px] text-gray-400">{resultCount} resultado{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}</p>
      )}

      {/* Categoria */}
      <FilterSection label="Categoria" icon={<Tag size={13} />}>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => set('category', cat.value === 'all' ? '' : cat.value)}
              className={`text-left text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                (filters.category || 'all') === cat.value
                  ? 'bg-[#FF6200] text-white font-bold'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-[#FF6200]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Veículo: Marca */}
      <FilterSection label="Marca do Veículo" icon={<Car size={13} />}>
        <input
          type="text"
          placeholder="Buscar marca..."
          value={brandSearch}
          onChange={e => setBrandSearch(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#FF6200] mb-2"
        />
        <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
          <button
            onClick={() => set('brand', '')}
            className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${!filters.brand ? 'bg-[#FF6200] text-white font-bold' : 'text-gray-600 hover:bg-orange-50'}`}
          >
            Todas
          </button>
          {filteredBrands.map(m => (
            <button
              key={m.id}
              onClick={() => set('brand', m.slug)}
              className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${filters.brand === m.slug ? 'bg-[#FF6200] text-white font-bold' : 'text-gray-600 hover:bg-orange-50'}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Modelo (dependente da marca) */}
      {filters.brand && models.length > 0 && (
        <FilterSection label="Modelo" icon={<Car size={13} />}>
          <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
            <button onClick={() => set('model', '')} className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${!filters.model ? 'bg-[#FF6200] text-white font-bold' : 'text-gray-600 hover:bg-orange-50'}`}>
              Todos
            </button>
            {models.map(m => (
              <button key={m.id} onClick={() => set('model', m.slug)} className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${filters.model === m.slug ? 'bg-[#FF6200] text-white font-bold' : 'text-gray-600 hover:bg-orange-50'}`}>
                {m.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Ano */}
      <FilterSection label="Ano" icon={<Gauge size={13} />} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 font-semibold">De</label>
            <select
              value={filters.year_min || ''}
              onChange={e => set('year_min', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#FF6200] mt-0.5"
            >
              <option value="">Qualquer</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-semibold">Até</label>
            <select
              value={filters.year_max || ''}
              onChange={e => set('year_max', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#FF6200] mt-0.5"
            >
              <option value="">Qualquer</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </FilterSection>

      {/* Preço */}
      <FilterSection label="Faixa de Preço" icon={<DollarSign size={13} />} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 font-semibold">De (R$)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.price_min || ''}
              onChange={e => set('price_min', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#FF6200] mt-0.5"
              min={0}
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-semibold">Até (R$)</label>
            <input
              type="number"
              placeholder="9999"
              value={filters.price_max || ''}
              onChange={e => set('price_max', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#FF6200] mt-0.5"
              min={0}
            />
          </div>
        </div>
        {/* Chips de preço rápido */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[['0','50'],['50','200'],['200','500'],['500','']].map(([min, max]) => (
            <button
              key={`${min}-${max}`}
              onClick={() => onChange({ ...filters, price_min: min || undefined, price_max: max || undefined })}
              className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 hover:border-[#FF6200] hover:text-[#FF6200] transition-all text-gray-500"
            >
              {max ? `R$${min}–${max}` : `R$${min}+`}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Estado */}
      <FilterSection label="Estado" icon={<MapPin size={13} />} defaultOpen={false}>
        <select
          value={filters.state || ''}
          onChange={e => set('state', e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#FF6200]"
        >
          <option value="">Todo o Brasil</option>
          {STATES_BR.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-4">
          {panel}
        </div>
      </aside>

      {/* Mobile: botão + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 shadow-sm"
        >
          <SlidersHorizontal size={15} className="text-[#FF6200]" />
          Filtros
          {activeCount > 0 && (
            <span className="bg-[#FF6200] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="w-72 bg-white h-full overflow-y-auto p-5 shadow-2xl animate-slide-in-right">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-800">Filtros</span>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              {panel}
              <button
                onClick={() => setMobileOpen(false)}
                className="mt-6 w-full bg-[#FF6200] text-white py-3 rounded-xl font-bold text-sm"
              >
                Ver {resultCount ?? ''} resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchFiltersComponent;
