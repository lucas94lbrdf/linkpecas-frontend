import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Heart, ShoppingCart, ShieldCheck, Truck, Star, ArrowLeft, Loader2, Share2, Sparkles, MapPin, Tag, Globe, AtSign, Camera, MessageCircle, Hash, X, TrendingDown, ExternalLink, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const viewRegistered = useRef(false);

  useEffect(() => {
    api.get(`/api/public/ads/${id}`)
      .then(res => {
        setAd(res.data);
        setActiveImage(res.data.image);
        
        if (!viewRegistered.current) {
          api.post(`/api/public/ads/${id}/view`).catch(err => console.error(err));
          viewRegistered.current = true;
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Checa se é favorito
    if (isAuthenticated) {
      api.get('/api/enthusiast/favorites').then(res => {
        const isFav = res.data.some((f: any) => f.id === id);
        setIsFavorited(isFav);
      }).catch(() => {});
    }
  }, [id, isAuthenticated]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', title: 'Faça login', text: 'Você precisa estar logado para favoritar.' });
      return;
    }
    try {
      await api.post(`/api/enthusiast/favorite/${id}`);
      setIsFavorited(!isFavorited);
      Swal.fire({
        icon: 'success',
        title: isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#0d1117',
        color: '#fff'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (score: number) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Acesse sua conta',
        text: 'Você precisa estar logado para avaliar este produto.',
        confirmButtonText: 'Fazer Login',
        confirmButtonColor: '#ff6200',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }

    const { value: comment } = await Swal.fire({
      title: 'O que achou deste link?',
      input: 'textarea',
      inputLabel: `Sua nota: ${score} estrelas`,
      inputPlaceholder: 'Escreva seu comentário aqui...',
      showCancelButton: true,
      confirmButtonText: 'Enviar Avaliação',
      background: '#0d1117',
      color: '#fff',
      confirmButtonColor: '#ff6b35'
    });

    if (comment !== undefined) {
      setRatingLoading(true);
      try {
        await api.post(`/api/enthusiast/rate/${id}`, { score, comment });
        
        // Atualiza os dados do anúncio para refletir a nova média (opcionalmente recarrega)
        const res = await api.get(`/api/public/ads/${id}`);
        setAd(res.data);

        Swal.fire({
          icon: 'success',
          title: 'Obrigado!',
          text: 'Sua avaliação foi registrada com sucesso.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível registrar sua avaliação.'
        });
      } finally {
        setRatingLoading(false);
      }
    }
  };

  const [searchParams] = useSearchParams();
  const src = searchParams.get('src');
  const ref = searchParams.get('ref');

  const handleBuy = (url?: string, adId?: string, optionStore?: string) => {
    const targetUrl  = url || ad?.url || ad?.external_url;
    const targetId   = adId || id;
    const store      = optionStore || ad?.marketplace || 'Marketplace';
    const adTitle    = ad?.title || '';

    api.post(`/api/public/ads/${targetId}/click`, {
      marketplace: store,
      url: targetUrl,
      source_type: src,
      source_ref: ref
    }).catch(() => {});

    if (targetUrl) {
      const params = new URLSearchParams({
        url:   targetUrl,
        title: adTitle,
        store,
      });
      navigate(`/redirect?${params.toString()}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange" size={48} /></div>;

  if (!ad) return <div className="p-20 text-center">Produto não encontrado.</div>;

  const allImages = [ad.image, ...(ad.image_urls || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[var(--bg2)] pb-20 animate-fade-up">
      {/* Top Nav */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-[var(--glass)] border border-[var(--border)] hover:text-orange transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Voltar
         </button>
         
         <div className="flex gap-2">
            <button 
              onClick={handleFavorite} 
              className={`p-3 rounded-2xl bg-[var(--glass)] border border-[var(--border)] transition-all ${isFavorited ? 'text-rose-500 border-rose-500/30' : 'hover:text-rose-500'}`}
              title="Favoritar"
            >
               <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setIsShareOpen(true)} className="p-3 rounded-2xl bg-[var(--glass)] border border-[var(--border)] hover:text-orange transition-all">
               <Share2 size={18} />
            </button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
         {/* Galeria */}
         <div className="space-y-4">
            <div className="aspect-[4/5] rounded-[40px] bg-[var(--card)] border border-[var(--border)] overflow-hidden flex items-center justify-center p-8 group relative shadow-2xl">
               {activeImage ? (
                  <img src={activeImage} className="w-full h-full object-contain group-hover:scale-105 transition-all duration-700" alt={ad.title} />
               ) : (
                  <Sparkles size={80} className="opacity-5 text-orange" />
               )}
               {ad.free_shipping && (
                 <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                   <Truck size={14} /> Frete Grátis
                 </div>
               )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all ${activeImage === img ? 'border-orange shadow-lg shadow-orange/20' : 'border-[var(--border)] opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
         </div>

         {/* Info Compras */}
         <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-4">
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                 ad.marketplace === 'Mercado Livre' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                 ad.marketplace === 'Amazon' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                 ad.marketplace === 'Shopee' ? 'bg-orange/10 text-orange border-orange/10' :
                 'bg-slate-500/10 text-slate-500 border-slate-500/10'
               }`}>
                  <ShoppingCart size={12}/> {ad.marketplace}
               </span>
               {ad.category && (
                 <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/10 flex items-center gap-1.5">
                    <Tag size={12}/> {ad.category}
                 </span>
               )}
                               {ad.condition && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                    ad.condition === 'new' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                  }`}>
                    {ad.condition === 'new' ? 'Novo' : 'Usado'}
                  </span>
                )}
                 <div className="flex items-center gap-1 text-amber-500 ml-auto bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10 relative group">
                  <div className="flex gap-0.5 mr-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRate(star); }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`transition-all duration-200 ${ratingLoading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:scale-125'}`}
                        disabled={ratingLoading}
                      >
                        <Star 
                          size={14} 
                          fill={(hoverRating || ad.rating) >= star ? 'currentColor' : 'none'} 
                          className={(hoverRating || ad.rating) >= star ? 'text-amber-500' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold">{Number(ad.rating).toFixed(1)} ({ad.reviews} avaliações)</span>
                  
                  {!isAuthenticated && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                      Faça login para avaliar este produto
                    </div>
                  )}
               </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1] mb-6">{ad.title}</h1>
            
            <div className="p-8 gls bg-gradient-to-br from-[var(--glass)] to-[var(--glass2)] border-[var(--border)] mb-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 blur-3xl rounded-full -mr-16 -mt-16" />
               
               {ad.old_price && ad.old_price > ad.price && (
                 <p className="text-xs font-black uppercase tracking-widest opacity-40 line-through mb-1 text-red-400">R$ {ad.old_price.toFixed(2)}</p>
               )}
               
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-orange tracking-tighter">R$ {ad.price.toFixed(2)}</span>
                  <span className="text-xs font-bold opacity-40">em até 12x</span>
               </div>

               <div className="mt-8 space-y-4">
                  {ad.free_shipping && (
                    <div className="flex items-center gap-3 text-sm opacity-80 font-semibold">
                       <Truck size={18} className="text-emerald-500" />
                       <span className="text-emerald-400">Frete Grátis disponível</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm opacity-60">
                     <MapPin size={18} className="text-blue-500" />
                     <span>Localização: <strong>{ad.city && ad.state ? `${ad.city}, ${ad.state}` : 'Nacional (Todo Brasil)'}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm opacity-60">
                     <ShieldCheck size={18} className="text-emerald-500" />
                                           <span>{ad.warranty ? `Garantia: ${ad.warranty}` : 'Garantia de 30 dias pela plataforma'}</span>

                  </div>
               </div>

               {/* Botão único (quando não há opções múltiplas) */}
               {(!ad.all_options || ad.all_options.length <= 1) && (
                 <button
                   onClick={() => handleBuy()}
                   className={`w-full mt-10 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-[2px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
                     ad.marketplace === 'Mercado Livre' ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-blue-500/20' :
                     ad.marketplace === 'Amazon' ? 'bg-gradient-to-br from-amber-500 to-amber-300 shadow-amber-500/20' :
                     'bg-gradient-to-br from-orange to-orange2 shadow-orange/30'
                   }`}
                 >
                   <ShoppingCart size={20} /> Comprar no {ad.marketplace}
                 </button>
               )}
            </div>

            {/* ── Comparação de Preços ── */}
            {ad.all_options && ad.all_options.length > 1 && (
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-emerald-500" />
                  <h3 className="font-black text-sm uppercase tracking-widest">Comparar Preços</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full border border-emerald-500/20">
                    {ad.all_options.length} opções
                  </span>
                </div>

                <div className="space-y-2">
                  {ad.all_options.map((opt: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleBuy(opt.url, opt.ad_id, opt.marketplace)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] text-left group ${
                        opt.is_best
                          ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-orange/30'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        opt.is_best ? 'bg-emerald-500 text-white' : 'bg-[var(--glass2)] opacity-50'
                      }`}>
                        {opt.is_best ? <CheckCircle2 size={14} /> : i + 1}
                      </div>

                      {/* Marketplace */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm">{opt.marketplace}</span>
                          {opt.is_best && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded border border-emerald-500/20">
                              Melhor preço
                            </span>
                          )}
                          {opt.free_shipping && (
                            <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-black">
                              <Truck size={9} /> Grátis
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preço */}
                      <div className="text-right shrink-0">
                        <p className={`font-black text-lg ${opt.is_best ? 'text-emerald-400' : ''}`}>
                          {opt.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>

                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comunidades */}
            {ad.communities && ad.communities.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Visto em:</span>
                {ad.communities.map((c: any) => (
                  <Link 
                    key={c.id} 
                    to={`/comunidades/${c.slug}`}
                    className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-bold hover:border-orange/30 hover:text-orange transition-all"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="space-y-4 mb-8">
               <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Vendido por:</h3>
               <Link to={`/loja/${ad.shop_slug}`} className="flex items-center gap-3 group bg-[var(--card)] p-4 rounded-3xl border border-[var(--border)] hover:border-orange transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--glass2)] border border-[var(--border)] flex items-center justify-center text-xl shadow-lg">
                     🏎️
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold group-hover:text-orange transition-all">{ad.shop_name || 'Loja Parceira'}</p>
                     <p className="text-[10px] opacity-40 uppercase font-black">Vendedor Verificado</p>
                  </div>
                  <ArrowLeft size={16} className="opacity-0 group-hover:opacity-100 transition-all rotate-180 text-orange" />
               </Link>
            </div>

            {(ad.is_universal === false || ad.model || ad.manufacturer) && (
              <div className="space-y-4 mb-8">
                <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Compatibilidade</h3>
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] text-sm">
                  <p>
                    {ad.manufacturer?.name} {ad.model?.name}
                    {ad.year_start ? ` • ${ad.year_start}` : ''}
                    {ad.year_end ? ` até ${ad.year_end}` : ''}
                    {ad.engine ? ` • Motor ${ad.engine}` : ''}
                  </p>
                </div>
              </div>
            )}

            {ad.is_universal === true && (
              <div className="space-y-4 mb-8">
                <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Aplicação</h3>
                <div className="bg-blue-500/10 text-blue-400 p-4 rounded-2xl border border-blue-500/20 text-sm font-semibold">
                  Produto universal
                </div>
              </div>
            )}

            {/* Descrição */}
            {ad.description && (
              <div className="space-y-4 pt-8 border-t border-[var(--border)]">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                   <ShieldCheck size={20} className="text-orange" /> Descrição do Produto
                 </h3>
                 <div className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)]">
                   {ad.description}
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Modal de Compartilhamento */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsShareOpen(false)} />
          <div className="gls relative w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">Compartilhar Anúncio</h3>
                <button onClick={() => setIsShareOpen(false)} className="opacity-40 hover:opacity-100 transition-all p-2 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                  <X size={16} />
                </button>
             </div>
             
             <div className="grid grid-cols-5 gap-3">
               <button onClick={() => window.open(`https://api.whatsapp.com/send?text=Olha o que eu achei: ${ad.title} - ${window.location.href}`, '_blank')} className="flex flex-col items-center gap-2 group">
                 <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all">
                   <MessageCircle size={20} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">WhatsApp</span>
               </button>
               
               <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} className="flex flex-col items-center gap-2 group">
                 <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                   <Globe size={20} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Facebook</span>
               </button>
               
               <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${ad.title}&url=${window.location.href}`, '_blank')} className="flex flex-col items-center gap-2 group">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                   <AtSign size={20} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">X / Twitter</span>
               </button>

               <button onClick={() => {
                   navigator.clipboard.writeText(window.location.href);
                   alert('Link copiado! Você pode colar no Instagram.');
               }} className="flex flex-col items-center gap-2 group">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-80 text-white flex items-center justify-center group-hover:opacity-100 transition-all">
                   <Camera size={20} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Instagram</span>
               </button>

               <button onClick={() => {
                   navigator.clipboard.writeText(window.location.href);
                   alert('Link copiado! Você pode colar no Threads.');
               }} className="flex flex-col items-center gap-2 group">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center border border-[var(--border)] group-hover:bg-white group-hover:text-black transition-all">
                   <Hash size={20} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Threads</span>
               </button>
             </div>

             <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                <input type="text" readOnly value={window.location.href} className="bg-transparent border-none outline-none text-xs flex-1 opacity-60" />
                <button onClick={() => {
                   navigator.clipboard.writeText(window.location.href);
                   alert('Link copiado!');
                }} className="px-3 py-1.5 bg-[var(--glass2)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-orange transition-all">
                  Copiar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
