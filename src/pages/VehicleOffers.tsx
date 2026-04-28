import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/shared/ProductCard';
import api from '../services/api';
import { vehicleService } from '../services/vehicleService';
import type { Manufacturer, VehicleModel } from '../services/vehicleService';

const VehicleOffers: React.FC = () => {
  const { manufacturerSlug, modelSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [compatibleAds, setCompatibleAds] = useState<any[]>([]);
  const [universalAds, setUniversalAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const year = searchParams.get('year') || '';
  const isAccessoryPage = location.pathname.endsWith('/acessorios');

  const manufacturer = useMemo(
    () => manufacturers.find(item => item.slug === manufacturerSlug),
    [manufacturers, manufacturerSlug]
  );
  const model = useMemo(
    () => models.find(item => item.slug === modelSlug),
    [models, modelSlug]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const mfgs = await vehicleService.listManufacturers();
        setManufacturers(mfgs);
        const selectedManufacturer = mfgs.find(item => item.slug === manufacturerSlug);
        if (!selectedManufacturer) return;

        const modelRows = await vehicleService.listModelsByManufacturer(selectedManufacturer.id);
        setModels(modelRows);

        const params = new URLSearchParams({
          brand: manufacturerSlug || '',
          model: modelSlug || '',
        });
        if (year) params.set('year', year);

        const [compatible, universal] = await Promise.all([
          api.get(`/api/ads/by-vehicle?${params.toString()}`),
          isAccessoryPage
            ? api.get('/api/ads/category/acessorios')
            : api.get('/api/ads/universal?limit=16'),
        ]);

        setCompatibleAds(compatible.data || []);
        setUniversalAds(universal.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [manufacturerSlug, modelSlug, year, isAccessoryPage]);

  useEffect(() => {
    if (!manufacturer || !model) return;
    document.title = `${manufacturer.name} ${model.name} | Ofertas`;
    const description = `Ofertas compatíveis para ${manufacturer.name} ${model.name}${year ? ` ano ${year}` : ''} e produtos universais recomendados.`;
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [manufacturer, model, year]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin" size={36} /></div>;
  if (!manufacturer || !model) return <div className="max-w-6xl mx-auto px-6 py-20 text-center opacity-50">Veículo não encontrado.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs opacity-50 mb-2">
          <Link to="/montadoras" className="hover:opacity-100">Montadoras</Link>
          <span>/</span>
          <Link to={`/montadora/${manufacturer.slug}`} className="hover:opacity-100">{manufacturer.name}</Link>
          <span>/</span>
          <span className="opacity-100">{model.name}</span>
        </div>
        <h1 className="text-3xl font-black">{manufacturer.name} {model.name}</h1>
        <p className="opacity-50 mt-2">Produtos compatíveis com seu veículo + recomendações universais.</p>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <input
          type="number"
          min={1900}
          max={new Date().getFullYear() + 1}
          value={year}
          onChange={e => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value) next.set('year', e.target.value);
            else next.delete('year');
            setSearchParams(next);
          }}
          className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-xl text-sm outline-none w-40"
          placeholder="Filtrar ano"
        />
        <Link to={`/${manufacturer.slug}/${model.slug}/acessorios`} className="text-xs font-black uppercase tracking-widest text-orange hover:underline">
          Ver acessórios SEO
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-black mb-5">Compatíveis com {manufacturer.name} {model.name}</h2>
        {compatibleAds.length === 0 ? (
          <p className="opacity-40">Nenhum anúncio compatível encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compatibleAds.map((item: any, index: number) => (
              <ProductCard key={item.id} product={{ ...item, oldPrice: item.old_price }} delay={index * 60} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-black mb-5">Universais Recomendados</h2>
        {universalAds.length === 0 ? (
          <p className="opacity-40">Nenhuma recomendação universal disponível.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {universalAds.map((item: any, index: number) => (
              <ProductCard
                key={item.id}
                product={{ ...item, oldPrice: item.old_price, is_universal: true }}
                delay={index * 60}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VehicleOffers;
