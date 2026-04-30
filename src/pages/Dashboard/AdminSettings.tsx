import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Shield, Loader2, BarChart3, Bot, KeySquare } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';

interface Setting {
  key: string;
  value: string;
  description: string;
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setFetching(true);
      // Simula um delay para o skeleton ou apenas termina o loading
      setTimeout(() => setFetching(false), 500);
    }
  };

  const getSettingValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || '';
  };

  const updateSettingLocal = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      const configurableKeys = [
        'google_analytics_id', 'google_tag_manager_id', 'google_search_console_id',
        'recaptcha_site_key', 'recaptcha_secret_key', 
        'ai_engine_selected', 'openai_api_key', 'gemini_api_key', 'claude_api_key'
      ];
      const updates = settings
        .filter(s => configurableKeys.includes(s.key))
        .map(s => api.put(`/api/admin/settings/${s.key}`, { value: s.value }));

      await Promise.all(updates);

      Swal.fire({
        icon: 'success',
        title: 'Sistema Atualizado',
        text: 'Configurações do sistema salvas com sucesso!',
        background: '#0d1117',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao Salvar',
        text: 'Não foi possível salvar as configurações.',
        background: '#0d1117',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="text-3xl font-black">Configurações do Sistema</h1>
        <p className="opacity-40 text-sm">Ajuste os parâmetros globais da plataforma LinkPeças.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ferramentas de Marketing / Tracking */}
        <div className="gls p-8 space-y-6">
           <div className="flex items-center gap-4 mb-4">
              <BarChart3 size={24} className="text-green-400" />
              <h3 className="font-bold text-lg">Marketing & SEO</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Google Analytics (G-ID)</label>
                 <input 
                    type="text" 
                    value={getSettingValue('google_analytics_id')}
                    onChange={(e) => updateSettingLocal('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                 />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Google Tag Manager (GTM-ID)</label>
                 <input 
                    type="text" 
                    value={getSettingValue('google_tag_manager_id')}
                    onChange={(e) => updateSettingLocal('google_tag_manager_id', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                 />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Google Search Console (ID)</label>
                 <input 
                    type="text" 
                    value={getSettingValue('google_search_console_id')}
                    onChange={(e) => updateSettingLocal('google_search_console_id', e.target.value)}
                    placeholder="Código de verificação"
                    className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                 />
              </div>
           </div>
        </div>

        <div className="space-y-8">
            {/* Inteligência Artificial */}
            <div className="gls p-8 space-y-6">
               <div className="flex items-center gap-4 mb-4">
                  <Bot size={24} className="text-purple-400" />
                  <h3 className="font-bold text-lg">Inteligência Artificial (LLM)</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Motor Principal</label>
                     <select 
                        value={getSettingValue('ai_engine_selected')}
                        onChange={(e) => updateSettingLocal('ai_engine_selected', e.target.value)}
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2"
                     >
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="claude">Anthropic Claude</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">OpenAI API Key</label>
                     <input 
                        type="password" 
                        value={getSettingValue('openai_api_key')}
                        onChange={(e) => updateSettingLocal('openai_api_key', e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                     />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Gemini API Key</label>
                     <input 
                        type="password" 
                        value={getSettingValue('gemini_api_key')}
                        onChange={(e) => updateSettingLocal('gemini_api_key', e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                     />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Claude API Key</label>
                     <input 
                        type="password" 
                        value={getSettingValue('claude_api_key')}
                        onChange={(e) => updateSettingLocal('claude_api_key', e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                     />
                  </div>
               </div>
            </div>

            {/* Segurança (reCAPTCHA) */}
            <div className="gls p-8 space-y-6">
               <div className="flex items-center gap-4 mb-4">
                  <KeySquare size={24} className="text-blue-400" />
                  <h3 className="font-bold text-lg">Segurança (reCAPTCHA)</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Site Key (Pública)</label>
                     <input 
                        type="text" 
                        value={getSettingValue('recaptcha_site_key')}
                        onChange={(e) => updateSettingLocal('recaptcha_site_key', e.target.value)}
                        placeholder="Chave pública do reCAPTCHA v2"
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                     />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Secret Key (Privada)</label>
                     <input 
                        type="password" 
                        value={getSettingValue('recaptcha_secret_key')}
                        onChange={(e) => updateSettingLocal('recaptcha_secret_key', e.target.value)}
                        placeholder="Chave secreta (Criptografada no BD)"
                        className="w-full bg-[var(--card)] px-4 py-3 mt-1 rounded-xl text-sm border border-[var(--border)] outline-none mt-2 font-mono text-xs" 
                     />
                  </div>
               </div>
            </div>

            <button 
              onClick={saveAllSettings} 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-orange to-orange2 text-white font-black py-4 rounded-xl shadow-2xl shadow-orange/20 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Salvar Configurações
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
