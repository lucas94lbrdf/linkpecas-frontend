import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, Zap } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface SearchHit {
  id: string;
  title: string;
  price?: number;
  category_name?: string;
  image?: string;
  slug?: string;
}

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  fullWidth?: boolean;
  placeholder?: string;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-orange-100 text-orange-700 font-bold rounded px-0.5">{part}</mark>
      : part
  );
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearch,
  fullWidth = false,
  placeholder = 'Buscar produto, marca ou categoria...',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ total: number; ms: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce: busca após 300ms de inatividade
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setMeta(null);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const t0 = performance.now();
      try {
        const res = await api.get(`/api/public/ads?q=${encodeURIComponent(query)}&limit=6`);
        const hits: SearchHit[] = res.data || [];
        const ms = Math.round(performance.now() - t0);
        setSuggestions(hits);
        setMeta({ total: hits.length, ms });
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    setShowDropdown(false);
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/ofertas?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onSearch, navigate]);

  const handleSelectSuggestion = (hit: SearchHit) => {
    setShowDropdown(false);
    navigate(`/product/${hit.slug || hit.id}`);
  };

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : 'max-w-2xl w-full'}`}>
      <div className="flex bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-gray-100">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="flex-1 px-5 py-4 text-gray-700 text-sm outline-none bg-transparent"
          id="search-input"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}
            className="px-3 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#FF6200] hover:bg-[#e55800] disabled:opacity-60 text-white px-6 flex items-center gap-2 font-bold text-sm transition-colors"
          aria-label="Buscar"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Search size={18} />
          }
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {/* Dropdown de sugestões */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-up">
          {/* Meta: total e tempo */}
          {meta && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100">
              <Zap size={12} className="text-orange-500" />
              <span className="text-[11px] text-orange-600 font-semibold">
                {meta.total} resultado{meta.total !== 1 ? 's' : ''} em {meta.ms}ms
              </span>
            </div>
          )}

          {suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Nenhum resultado encontrado
            </div>
          ) : (
            <ul>
              {suggestions.map((hit) => (
                <li key={hit.id}>
                  <button
                    onClick={() => handleSelectSuggestion(hit)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {hit.image
                        ? <img src={hit.image} alt={hit.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {highlight(hit.title, query)}
                      </p>
                      {hit.category_name && (
                        <p className="text-[11px] text-gray-400 truncate">{hit.category_name}</p>
                      )}
                    </div>
                    {/* Preço */}
                    {hit.price != null && (
                      <span className="text-sm font-black text-[#FF6200] flex-shrink-0">
                        R$ {(hit.price ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {/* Ver todos */}
              <li>
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-50 text-xs text-[#FF6200] font-bold hover:bg-orange-50 transition-colors"
                >
                  <Search size={12} />
                  Ver todos os resultados para "{query}"
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
