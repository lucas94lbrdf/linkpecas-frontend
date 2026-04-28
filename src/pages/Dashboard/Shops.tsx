import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Globe, Camera, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const Shops: React.FC = () => {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/shops/me')
      .then(res => setShop(res.data))
      .catch(err => console.error('Loja não encontrada ou erro na API', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/shops/me', shop);
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Loja atualizada com sucesso!',
        background: '#0d1117',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Erro ao salvar loja',
        background: '#0d1117',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Minha Loja</h1>
          <p className="opacity-40 text-sm">Configure a identidade visual e contatos da sua loja no marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="gls p-8 space-y-6">
            <h3 className="font-bold flex items-center gap-2"><Store size={20} className="text-orange" /> Informações Básicas</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={shop?.name || ''} 
                    onChange={e => setShop({...shop, name: e.target.value})}
                    className="w-full bg-[var(--card)] px-4 py-3 rounded-xl border border-[var(--border)] outline-none focus:border-orange/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Slug (URL customizada)</label>
                  <div className="flex items-center bg-[var(--card)] px-4 py-3 rounded-xl border border-[var(--border)]">
                    <span className="text-xs opacity-30">/loja/</span>
                    <input 
                      type="text" 
                      value={shop?.slug || ''} 
                      onChange={e => setShop({...shop, slug: e.target.value})}
                      className="bg-transparent border-none outline-none text-sm w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Descrição / Slogan</label>
                <textarea 
                  rows={3}
                  value={shop?.description || ''}
                  onChange={e => setShop({...shop, description: e.target.value})}
                  className="w-full bg-[var(--card)] px-4 py-3 rounded-xl border border-[var(--border)] outline-none focus:border-orange/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Telefone</label>
                  <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)]">
                    <Phone size={14} className="opacity-20" />
                    <input type="text" value={shop?.phone || ''} onChange={e => setShop({...shop, phone: e.target.value})} className="bg-transparent border-none outline-none text-xs w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Website</label>
                  <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)]">
                    <Globe size={14} className="opacity-20" />
                    <input type="text" value={shop?.website || ''} onChange={e => setShop({...shop, website: e.target.value})} className="bg-transparent border-none outline-none text-xs w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Localização</label>
                  <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)]">
                    <MapPin size={14} className="opacity-20" />
                    <input type="text" value={shop?.location || ''} onChange={e => setShop({...shop, location: e.target.value})} className="bg-transparent border-none outline-none text-xs w-full" />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="bg-orange text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange/20"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="gls p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-orange to-orange2 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-orange/20 overflow-hidden">
                {shop?.logo ? <img src={shop.logo} className="w-full h-full object-cover" /> : shop?.name ? shop.name[0] : <Store />}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-slate-900 border border-[var(--border2)] flex items-center justify-center text-white hover:bg-orange transition-all shadow-xl">
                <Camera size={14} />
              </button>
            </div>
            <h4 className="font-bold">{shop?.name || 'Sua Loja'}</h4>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Status: Ativo</p>
          </div>

          <div className="gls p-6">
             <h4 className="text-xs font-black uppercase opacity-40 mb-4 tracking-widest">Dica Premium</h4>
             <p className="text-xs opacity-60 leading-relaxed">
               Uma loja com foto de perfil e banner bem configurados convertem até 45% mais vendas. 
               Capriche nas imagens!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shops;
