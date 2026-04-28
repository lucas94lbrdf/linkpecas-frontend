import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import type { Manufacturer } from '../services/vehicleService';

const Manufacturers: React.FC = () => {
  const [items, setItems]     = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');

  useEffect(() => {
    document.title = 'Montadoras | Auto Marketplace';
    vehicleService.listManufacturers()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    query.trim()
      ? items.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
      : items,
  [items, query]);

  const grouped = useMemo(() => {
    const map: Record<string, Manufacturer[]> = {};
    filtered.forEach(m => {
      const letter = m.name[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* Hero */}
      <div className="bg-[#FF6200]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-white">Montadoras</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Todas as Montadoras</h1>
          <p className="text-white/70 text-sm mb-8">
            Selecione a fabricante do seu veículo para ver ofertas e peças compatíveis
          </p>
          <div className="max-w-md flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search size={18} className="text-gray-300 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar montadora..."
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
        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-[#FF6200]" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <CarFront size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">Nenhuma montadora encontrada</p>
            <p className="text-sm mt-1">Tente outro termo de busca</p>
          </div>
        ) : query.trim() ? (
          <div>
            <p className="text-sm text-gray-400 mb-6">
              <span className="font-bold text-gray-700">{filtered.length}</span> resultado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map(m => <MfgCard key={m.id} m={m} />)}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([letter, list]) => (
              <div key={letter}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6200] text-white flex items-center justify-center font-black text-base flex-shrink-0">
                    {letter}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-semibold">
                    {list.length} marca{list.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {list.map(m => <MfgCard key={m.id} m={m} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MfgCard: React.FC<{ m: Manufacturer }> = ({ m }) => (
  <Link
    to={`/montadora/${m.slug}`}
    className="group bg-white rounded-2xl border border-gray-100 hover:border-[#FF6200]/40 hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-3 p-6"
  >
    {m.logo_url ? (
      <div className="w-20 h-20 flex items-center justify-center">
        <img
          src={m.logo_url}
          alt={m.name}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
        />
      </div>
    ) : (
      <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#FFF3EC] group-hover:border-[#FF6200]/20 transition-all">
        <span className="text-2xl font-black text-gray-300 group-hover:text-[#FF6200] transition-colors">
          {m.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )}
    <div className="text-center">
      <p className="text-sm font-bold text-gray-700 group-hover:text-[#FF6200] transition-colors leading-tight">
        {m.name}
      </p>
      <p className="text-[10px] text-gray-300 mt-1 flex items-center justify-center gap-1">
        Ver ofertas <ChevronRight size={10} />
      </p>
    </div>
  </Link>
);

export default Manufacturers;
