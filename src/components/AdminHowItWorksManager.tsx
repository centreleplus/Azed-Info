import React, { useState, useEffect } from 'react';
import { Youtube, Save, CheckCircle, Eye, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export interface StepVideoConfig {
  id: number;
  badgeNumber: string;
  title: string;
  description: string;
  youtubeUrl: string;
}

// Données par défaut si le backend ne répond pas
const DEFAULT_STEPS: StepVideoConfig[] = [
  {
    id: 1,
    badgeNumber: '1',
    title: 'Crée ton compte',
    description: 'Inscription gratuite et rapide en 30 secondes chrono pour accéder à l\'espace élève.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 2,
    badgeNumber: '2',
    title: 'Choisis ta formule',
    description: 'Sélectionne le pack idéal selon tes besoins, tes objectifs et ton niveau.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 3,
    badgeNumber: '3',
    title: 'Recharge ton solde',
    description: 'Active tes cours, fiches pratiques et outils premium en un clic sécurisé.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 4,
    badgeNumber: '4',
    title: 'Révise & Brille !',
    description: 'Pratique le Python, suis les cours en direct et assure ta mention au bac.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

// Helper pour extraire l'ID YouTube et retourner l'URL d'intégration embed
export const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2] && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : trimmed;
};

// Récupération initiale synchrone depuis le localStorage pour éviter tout écran blanc
const getInitialSteps = (): StepVideoConfig[] => {
  try {
    const saved = localStorage.getItem('how_it_works_config') || localStorage.getItem('how_it_works_steps');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || idx + 1,
          badgeNumber: item.badgeNumber || String(idx + 1),
          title: item.title || DEFAULT_STEPS[idx]?.title || `Étape ${idx + 1}`,
          description: item.description || DEFAULT_STEPS[idx]?.description || '',
          youtubeUrl: item.youtubeUrl || item.videoUrl || DEFAULT_STEPS[idx]?.youtubeUrl || ''
        }));
      }
    }
  } catch (e) {
    // Ignorer
  }
  return DEFAULT_STEPS;
};

export const AdminHowItWorksManager: React.FC = () => {
  // État initial immédiat avec fallback local (zéro blocage)
  const [steps, setSteps] = useState<StepVideoConfig[]>(getInitialSteps);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<number>(1);

  // Synchronisation en arrière-plan avec l'API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes max

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config/how-it-works', {
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error(`Status ${res.status}`);
        
        const data = await res.json();
        if (isMounted && data && Array.isArray(data.steps) && data.steps.length > 0) {
          const formatted: StepVideoConfig[] = data.steps.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            badgeNumber: item.badgeNumber || String(idx + 1),
            title: item.title || DEFAULT_STEPS[idx]?.title || `Étape ${idx + 1}`,
            description: item.description || DEFAULT_STEPS[idx]?.description || '',
            youtubeUrl: item.youtubeUrl || item.videoUrl || DEFAULT_STEPS[idx]?.youtubeUrl || ''
          }));
          setSteps(formatted);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('API non disponible, utilisation du stockage local :', err?.message);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (id: number, field: keyof StepVideoConfig, value: string) => {
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    // Normalisation des URLs YouTube
    const cleanedSteps = steps.map(s => ({
      ...s,
      youtubeUrl: getEmbedUrl(s.youtubeUrl)
    }));

    // 1. Sauvegarde locale immédiate garantie
    try {
      localStorage.setItem('how_it_works_config', JSON.stringify(cleanedSteps));
      localStorage.setItem('how_it_works_steps', JSON.stringify(cleanedSteps));
    } catch (e) {
      console.warn('Erreur localStorage', e);
    }

    // 2. Tentative de sauvegarde sur l'API backend
    try {
      const res = await fetch('/api/config/how-it-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: cleanedSteps })
      });

      if (!res.ok) {
        setError('Enregistré en local (Mode hors-ligne).');
      }
    } catch (err: any) {
      setError('Enregistré en local (Mode secours / API temporairement injoignable).');
    } finally {
      setSteps(cleanedSteps);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const activePreview = steps.find(s => s.id === previewId) || steps[0] || DEFAULT_STEPS[0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* En-tête de la section d'administration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600"/>
            <h3 className="text-lg font-bold text-slate-800">
              Gestion des Vidéos : "Comment ça marche ?"
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modifiez les liens YouTube des 4 démonstrations vidéo affichées sur la Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00b87c] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
            <span>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
          </button>
        </div>
      </div>

      {/* Message d'état / Avertissement */}
      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0"/>
          <span>{error}</span>
        </div>
      )}

      {/* Message de confirmation */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0"/>
          <span>Modifications enregistrées avec succès ! La Landing Page est synchronisée.</span>
        </div>
      )}

      {/* Grille : Formulaire à gauche / Aperçu à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulaire des 4 étapes (7 colonnes) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                previewId === step.id
                  ? 'border-[#00b87c] bg-emerald-50/30 shadow-xs ring-1 ring-[#00b87c]/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                    {step.badgeNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Étape {step.badgeNumber} : {step.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewId(step.id)}
                  className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    previewId === step.id
                      ? 'bg-[#00b87c] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5"/>
                  <span>Aperçu</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Titre */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Titre de l'étape
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleInputChange(step.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b87c]/20 focus:border-[#00b87c] bg-slate-50/50 focus:bg-white"
                    placeholder="Ex: Crée ton compte"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Description de l'étape
                  </label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => handleInputChange(step.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b87c]/20 focus:border-[#00b87c] bg-slate-50/50 focus:bg-white"
                    placeholder="Courte explication..."
                  />
                </div>

                {/* Lien YouTube */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Lien Vidéo YouTube
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={step.youtubeUrl}
                      onChange={(e) => handleInputChange(step.id, 'youtubeUrl', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50 focus:bg-white font-mono"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <Youtube className="w-4 h-4 text-red-500 absolute left-2.5 top-2.5"/>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Formats supportés : <code className="bg-slate-100 px-1 py-0.5 rounded">youtube.com/watch?v=...</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">youtu.be/...</code> ou <code className="bg-slate-100 px-1 py-0.5 rounded">embed/...</code>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </form>

        {/* Panneau de Prévisualisation (5 colonnes) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 bg-slate-900 rounded-2xl p-5 text-white space-y-4 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b87c] animate-pulse" />
                <span className="text-xs font-bold text-slate-300">
                  Aperçu Live - Étape {activePreview.badgeNumber}
                </span>
              </div>
              <span className="text-[11px] text-[#00b87c] font-bold">
                {activePreview.title}
              </span>
            </div>

            {/* Frame Vidéo Live */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              {activePreview.youtubeUrl ? (
                <iframe
                  src={getEmbedUrl(activePreview.youtubeUrl)}
                  title={activePreview.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                  <Youtube className="w-8 h-8 mb-2 opacity-50 text-red-500"/>
                  <span>Saisissez un lien YouTube valide pour afficher l'aperçu</span>
                </div>
              )}
            </div>

            <div className="space-y-1 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <h5 className="text-xs font-bold text-slate-200">{activePreview.title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {activePreview.description}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Export de secours sous les deux noms
export const HowItWorksVideoManager = AdminHowItWorksManager;
export default AdminHowItWorksManager;
