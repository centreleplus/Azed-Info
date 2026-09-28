import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, Youtube, RefreshCw, Play, ExternalLink, ShieldCheck } from 'lucide-react';

export function toYoutubeEmbedUrl(inputUrl: string): string {
  if (!inputUrl) return "";
  const trimmed = inputUrl.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return trimmed;
}

export const DesignBrandingAdmin: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [playerKey, setPlayerKey] = useState(Date.now());

  // Charger la configuration actuelle au montage
  const fetchBrandingConfig = async () => {
    try {
      const res = await fetch('/api/public/branding');
      const data = await res.json();
      const url = data?.aboutUsYoutubeUrl || data?.aboutYoutubeUrl || data?.config?.aboutUsYoutubeUrl || data?.config?.aboutYoutubeUrl || '';
      if (url) {
        setYoutubeUrl(url);
      }
    } catch (err) {
      console.warn('Erreur chargement branding public, tentative route admin:', err);
      try {
        const adminRes = await fetch('/api/admin/branding');
        const adminData = await adminRes.json();
        const url = adminData?.aboutUsYoutubeUrl || adminData?.aboutYoutubeUrl || '';
        if (url) setYoutubeUrl(url);
      } catch (e) {
        // Fallback
      }
    }
  };

  useEffect(() => {
    fetchBrandingConfig();
  }, []);

  // Action 1: Enregistrement Global en Base de Données / VPS
  const handleGlobalSave = async () => {
    if (!youtubeUrl.trim()) {
      setStatusMessage('Veuillez saisir une URL YouTube valide.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setLoading(true);
    setStatusMessage('Enregistrement global en cours sur la base de données / VPS...');
    setSaved(false);

    try {
      const formattedUrl = toYoutubeEmbedUrl(youtubeUrl);
      
      const response = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aboutUsYoutubeUrl: formattedUrl,
          aboutYoutubeUrl: formattedUrl,
          rawYoutubeUrl: youtubeUrl
        }),
      });

      const result = await response.json();

      if (result.success) {
        const savedUrl = result.aboutUsYoutubeUrl || result.aboutYoutubeUrl || formattedUrl;
        setYoutubeUrl(savedUrl);
        setSaved(true);
        setPlayerKey(Date.now());
        setStatusMessage('Modifications enregistrées à l\'échelle globale et diffusées en temps réel !');
        setTimeout(() => {
          setSaved(false);
          setStatusMessage('');
        }, 4000);
      } else {
        setStatusMessage(result.error || 'Erreur lors de la sauvegarde globale.');
      }
    } catch (err: any) {
      setStatusMessage('Erreur de connexion au serveur / API VPS.');
    } finally {
      setLoading(false);
    }
  };

  // Action 2: Actualisation Instantanée / Force Reload du lecteur sans rechargement de page
  const handleForceRefresh = async () => {
    setRefreshing(true);
    setStatusMessage('Actualisation du lecteur en cours...');
    await fetchBrandingConfig();
    setPlayerKey(Date.now());
    setTimeout(() => {
      setRefreshing(false);
      setStatusMessage('Lecteur vidéo synchronisé avec le serveur !');
      setTimeout(() => setStatusMessage(''), 2500);
    }, 400);
  };

  const previewEmbedUrl = toYoutubeEmbedUrl(youtubeUrl);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl text-left space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
            <Youtube size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Configuration Média Landing Page
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={12} /> Persistance Globale VPS
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Personnalisez la vidéo officielle affichée dans la section « Qui sommes-nous ? » pour tous les visiteurs
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Lien Vidéo YouTube (« Qui sommes-nous ? » / « À propos de nous »)</span>
          <span className="text-[11px] text-slate-400 font-normal">Formats supportés : watch?v=, youtu.be/, embed/</span>
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX ou https://youtu.be/XXXXXXXXXXX"
            className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition-all bg-slate-50/50"
          />
          {youtubeUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Play size={16} />
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Le lien renseigné est automatiquement converti en format d'intégration haute performance pour le composant <code className="text-emerald-700 font-mono bg-slate-100 px-1 py-0.5 rounded">iframe</code> de la page d'accueil.
        </p>
      </div>

      {/* Live Preview Player */}
      {previewEmbedUrl && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Aperçu en direct du lecteur :
            </span>
            <div className="flex items-center gap-2">
              <a
                href={youtubeUrl.includes('embed/') ? youtubeUrl.replace('embed/', 'watch?v=') : youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
              >
                <span>Ouvrir sur YouTube</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-700/60 shadow-inner">
            <iframe
              key={playerKey}
              src={previewEmbedUrl}
              title="A-Zed Info - Aperçu vidéo"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-md">
              URL Embed normalisée : <span className="font-mono text-emerald-400">{previewEmbedUrl}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons & Status */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        {/* Action 1: Enregistrement Global */}
        <button
          type="button"
          onClick={handleGlobalSave}
          disabled={loading || refreshing}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-emerald-600/20 disabled:opacity-50 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sauvegarde globale...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </>
          )}
        </button>

        {/* Action 2: Actualisation Instantanée / Force Refresh */}
        <button
          type="button"
          onClick={handleForceRefresh}
          disabled={loading || refreshing}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 border border-slate-200 disabled:opacity-50 active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Mettre à jour & Actualiser le lecteur</span>
        </button>

        {/* Status messages */}
        {saved && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            Modifications enregistrées à l'échelle globale !
          </span>
        )}

        {statusMessage && !saved && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export const MediaLandingConfig = DesignBrandingAdmin;
export default DesignBrandingAdmin;
