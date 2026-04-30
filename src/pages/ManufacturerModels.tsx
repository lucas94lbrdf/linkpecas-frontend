import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CarFront, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import type { Manufacturer, VehicleModel } from '../services/vehicleService';

const TYPE_LABEL: Record<string, string> = {
  carro: 'Carro', car: 'Carro',
  moto: 'Moto',  bike: 'Moto',
  caminhao: 'Caminhão', truck: 'Caminhão',
};

const ManufacturerModels: React.FC = () => {
  const { slug } = useParams();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels]               = useState<VehicleModel[]>([]);
  const [loading, setLoading]             = useState(true);
  const [query, setQuery]                 = useState('');

  const manufacturer = useMemo(
    () => manufacturers.find(m => m.slug === slug),
    [manufacturers, slug]
  );

  useEffect(() => {
    (async () => {
      try {
        const all = await vehicleService.listManufacturers();
        setManufacturers(all);
        const mfg = all.find(m => m.slug === slug);
        if (!mfg) return;
        const rows = await vehicleService.listModelsByManufacturer(mfg.id);
        setModels(rows);
        document.title = `${mfg.name} | Modelos | LinkPeças`;
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [slug]);

  const filtered = useMemo(() =>
    query.trim()
      ? models.filter(m =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          (m.generation || '').toLowerCase().includes(query.toLowerCase())
        )
      : models,
  [models, query]);

  // Agrupa por vehicle_type
  const grouped = useMemo(() => {
    const map: Record<string, VehicleModel[]> = {};
    filtered.forEach(m => {
      const key = m.vehicle_type || 'car';
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return Object.entries(map);
  }, [filtered]);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#FF6200]" size={40} />
    </div>
  );

  if (!manufacturer) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-gray-400">
      Montadora não encontrada.
    </div>
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* Hero */}
      <div className="bg-[#FF6200]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/60 text-xs mb-6">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={12} />
            <Link to="/montadoras" className="hover:text-white transition-colors">Montadoras</Link>
            <ChevronRight size={12} />
            <span className="text-white">{manufacturer.name}</span>
          </div>

          {/* Logo + título */}
          <div className="flex items-center gap-6 mb-8">
            {manufacturer.logo_url ? (
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 shadow-lg flex-shrink-0">
                <img src={manufacturer.logo_url} alt={manufacturer.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-2xl">{manufacturer.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{manufacturer.name}</h1>
              <p className="text-white/70 text-sm mt-1">
                {models.length} modelo{models.length !== 1 ? 's' : ''} disponíve{models.length !== 1 ? 'is' : 'l'}
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="max-w-md flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search size={18} className="text-gray-300 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar modelo ou geração..."
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <CarFront size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">Nenhum modelo encontrado</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([type, list]) => (
              <div key={type}>
                {grouped.length > 1 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6200] text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                      {(TYPE_LABEL[type] || type).slice(0, 3).toUpperCase()}
                    </div>
                    <h2 className="text-base font-black text-gray-700">{TYPE_LABEL[type] || type}</h2>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">{list.length} modelo{list.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {list.map(model => (
                    <ModelCard key={model.id} model={model} manufacturerSlug={manufacturer.slug} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Card de modelo ───────────────────────────────────────────────────────── */
const ModelCard: React.FC<{ model: VehicleModel; manufacturerSlug: string }> = ({ model, manufacturerSlug }) => (
  <Link
    to={`/montadora/${manufacturerSlug}/${model.slug}`}
    className="group bg-white rounded-2xl border border-gray-100 hover:border-[#FF6200]/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
  >
    {/* Imagem do modelo */}
    <div className="aspect-[16/9] bg-gray-50 overflow-hidden flex items-center justify-center relative">
      {model.image_url ? (
        <img
          src={model.image_url}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <CarFront size={40} className="text-gray-200 group-hover:text-[#FF6200]/30 transition-colors" />
      )}
      {model.generation && (
        <div className="absolute top-2 right-2 bg-[#FF6200] text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider">
          {model.generation}
        </div>
      )}
    </div>

    {/* Info */}
    <div className="p-4">
      <p className="text-sm font-bold text-gray-700 group-hover:text-[#FF6200] transition-colors leading-tight">
        {model.name}
      </p>
      {model.generation && (
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{model.generation}</p>
      )}
      <p className="text-[10px] text-gray-300 mt-2 flex items-center gap-1">
        Ver ofertas <ChevronRight size={10} />
      </p>
    </div>
  </Link>
);

export default ManufacturerModels;
