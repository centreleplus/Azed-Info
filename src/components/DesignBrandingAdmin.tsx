import React, { useState, useEffect } from 'react';

// Convertisseur universel YouTube
export const extractYoutubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2] && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1` 
    : trimmed;
};

export const DesignBrandingVideoManager: React.FC = () => {
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 1. Charger l'URL actuellement enregistrée en BDD/VPS au démarrage
  useEffect(() => {
    fetch('/api/public/branding?t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.rawYoutubeUrl || data?.aboutUsYoutubeUrl) {
          setYoutubeUrlInput(data.rawYoutubeUrl || data.aboutUsYoutubeUrl);
        }
      })
      .catch((err) => console.error("Erreur de récupération de l'URL courante:", err));
  }, []);

  // 2. Action Globale d'enregistrement
  const handleSaveAndBroadcast = async () => {
    if (!youtubeUrlInput.trim()) {
      setNotification({ type: 'error', msg: 'Veuillez saisir un lien YouTube valide.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    const formattedEmbedUrl = extractYoutubeEmbedUrl(youtubeUrlInput);

    try {
      const response = await fetch('/api/admin/branding/update-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          rawYoutubeUrl: youtubeUrlInput,
          aboutUsYoutubeUrl: formattedEmbedUrl,
          updatedAt: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', msg: 'Lien vidéo mis à jour à l\'échelle globale avec succès !' });
        // Rafraîchissement automatique de la vue globale après 800ms
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setNotification({ type: 'error', msg: data.message || 'Erreur lors de la sauvegarde.' });
      }
    } catch (error) {
      setNotification({ type: 'error', msg: 'Erreur réseau/serveur lors de la tentative de mise à jour.' });
    } finally {
      setIsSaving(false);
    }
  };

  const previewEmbed = extractYoutubeEmbedUrl(youtubeUrlInput);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl text-left">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Configuration Média Landing Page</h3>
      <p className="text-xs text-slate-500 mb-4">
        Personnalisez la vidéo de présentation institutionnelle.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            LIEN VIDÉO YOUTUBE ("À PROPOS DE NOUS" / "QUI SOMMES-NOUS ?")
          </label>
          <input
            type="text"
            value={youtubeUrlInput}
            onChange={(e) => setYoutubeUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            className="w-full h-11 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Ce lien alimente directement le lecteur vidéo de la section "Qui sommes-nous ?" sur la page d'accueil (URL standard ou format embed supportés).
          </p>
        </div>

        {/* Live Preview If URL Entered */}
        {previewEmbed && (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-200 font-semibold">Aperçu en direct du lecteur</span>
              <span className="font-mono text-emerald-400 truncate max-w-xs">{previewEmbed}</span>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={previewEmbed}
                title="Aperçu vidéo"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {notification && (
          <div className={`p-3 rounded-xl text-xs font-bold ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {notification.msg}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSaveAndBroadcast}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span>✓</span>
            {isSaving ? 'Enregistrement en cours...' : 'Enregistrer les modifications (Global)'}
          </button>

          <button
            onClick={() => window.location.reload()}
            type="button"
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 cursor-pointer"
          >
            🔄 Actualiser la page
          </button>
        </div>
      </div>
    </div>
  );
};

export const DesignBrandingAdmin = DesignBrandingVideoManager;
export const MediaLandingConfig = DesignBrandingVideoManager;
export default DesignBrandingVideoManager;
