import React, { useState, useEffect } from 'react';
import { Video, Check, Loader2, Sparkles, Youtube } from 'lucide-react';

export const DesignBrandingAdmin: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/design-branding')
      .then(res => res.json())
      .then(data => {
        if (data.config?.aboutYoutubeUrl) {
          setYoutubeUrl(data.config.aboutYoutubeUrl);
        } else if (data.aboutYoutubeUrl) {
          setYoutubeUrl(data.aboutYoutubeUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/design-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutYoutubeUrl: youtubeUrl })
      });
      const data = await res.json();
      if (data.config?.aboutYoutubeUrl) {
        setYoutubeUrl(data.config.aboutYoutubeUrl);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-2xl text-left space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Youtube size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Configuration Média Landing Page</h3>
          <p className="text-xs text-slate-500">Personnalisez la vidéo de présentation institutionnelle</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Lien Vidéo YouTube ("À propos de nous / Qui sommes-nous ?")
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={youtubeUrl} 
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX" 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Ce lien alimente directement le lecteur vidéo de la section "Qui sommes-nous ?" sur la page d'accueil (URL standard ou format embed supportés).
        </p>
      </div>

      {youtubeUrl && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium truncate max-w-md">
            URL actuelle : <span className="font-mono text-emerald-700">{youtubeUrl}</span>
          </span>
          <a 
            href={youtubeUrl.includes('embed/') ? youtubeUrl.replace('embed/', 'watch?v=') : youtubeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline shrink-0 ml-2"
          >
            Tester le lien
          </a>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button 
          type="button"
          onClick={handleSave} 
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </>
          )}
        </button>
        {saved && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Lien vidéo YouTube mis à jour à l'échelle du système !
          </span>
        )}
      </div>
    </div>
  );
};

export default DesignBrandingAdmin;
