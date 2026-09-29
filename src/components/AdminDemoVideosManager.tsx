import React, { useState, useEffect } from 'react';
import { 
  Film, Plus, RefreshCw, Save, Eye, Edit2, Trash2, Video, 
  ArrowUp, ArrowDown, CheckCircle, AlertTriangle, X, Play, 
  Sparkles, ExternalLink, Globe, Layers, Radio
} from 'lucide-react';
export interface DemoVideo {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  isPublished: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface AdminDemoVideosManagerProps {
  onSuccessToast?: (msg: string) => void;
}

// Convert various YouTube links (watch, youtu.be, shorts, embed) to standard embed URL
export const toEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  
  if (trimmed.includes('youtube.com/watch')) {
    const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (trimmed.includes('youtube.com/shorts/')) {
    const id = trimmed.split('shorts/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }
  return trimmed;
};

export const AdminDemoVideosManager: React.FC<AdminDemoVideosManagerProps> = ({ onSuccessToast }) => {
  const [demoList, setDemoList] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDemo, setEditingDemo] = useState<DemoVideo | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Extrait Cours');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);

  // Preview modal
  const [previewVideo, setPreviewVideo] = useState<DemoVideo | null>(null);

  // Delete confirm modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Notification helper
  const notify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    if (type === 'success' && onSuccessToast) {
      onSuccessToast(msg);
    }
  };

  // Charger les vidéos existantes depuis l'API serveur VPS
  const loadDemoVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/demo-videos?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        // Trier par ordre ascendant
        const sorted = [...data.videos].sort((a, b) => (a.order || 0) - (b.order || 0));
        setDemoList(sorted);
      } else if (Array.isArray(data)) {
        const mapped: DemoVideo[] = data.map((d: any, idx: number) => ({
          id: d.id || `demo_${idx + 1}`,
          order: typeof d.order === 'number' ? d.order : (d.displayOrder || idx + 1),
          title: d.title || 'Vidéo Démo',
          description: d.description || '',
          category: d.category || 'Extrait Cours',
          youtubeUrl: d.youtubeUrl || d.videoUrl || '',
          videoUrl: d.videoUrl || d.youtubeUrl || '',
          thumbnailUrl: d.thumbnailUrl,
          duration: d.duration || '10:00',
          isPublished: d.isPublished !== undefined ? Boolean(d.isPublished) : true,
          featured: Boolean(d.featured ?? d.isFeatured)
        }));
        mapped.sort((a, b) => a.order - b.order);
        setDemoList(mapped);
      }
    } catch (err) {
      console.error("Erreur de chargement des démos:", err);
      notify('error', "Impossible de charger la liste des vidéos démo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemoVideos();
  }, []);

  // 1. Action STRATÉGIQUE : ENREGISTRER TOUT GLOBALEMENT (Bouton bleu/émeraude)
  const handleSaveAllGlobal = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      // Normaliser l'ordre de chaque vidéo
      const payloadVideos = demoList.map((v, index) => ({
        ...v,
        order: Number(v.order) || index + 1,
        youtubeUrl: toEmbedUrl(v.youtubeUrl || v.videoUrl || ''),
        videoUrl: toEmbedUrl(v.youtubeUrl || v.videoUrl || ''),
        isPublished: v.isPublished !== false
      }));

      const response = await fetch('/api/admin/demo-videos/save-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          videos: payloadVideos,
          updatedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        notify('success', 'Toutes les vidéos démo ont été enregistrées globalement avec succès !');
        // Synchroniser également via BroadcastChannel pour rafraîchissement immédiat inter-onglets
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const bc1 = new BroadcastChannel('azed_demo_videos_sync');
            bc1.postMessage({ type: 'DEMOS_UPDATED', videos: payloadVideos, timestamp: Date.now() });
            bc1.close();
            const bc2 = new BroadcastChannel('azed_demo_sync');
            bc2.postMessage({ type: 'DEMOS_UPDATED', videos: payloadVideos, timestamp: Date.now() });
            bc2.close();
          } catch (_) {}
        }
        window.dispatchEvent(new CustomEvent('azed_demos_updated', { detail: payloadVideos }));
        if (Array.isArray(data.videos)) {
          setDemoList(data.videos);
        }
      } else {
        notify('error', data.message || "Erreur lors de l'enregistrement global sur le VPS.");
      }
    } catch (err: any) {
      console.error("Erreur save-all:", err);
      notify('error', err.message || "Erreur réseau lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Action STRATÉGIQUE : REFRESH DÉMO ÉLÈVE (Bouton d'actualisation)
  const handleRefreshStudentView = async () => {
    setIsRefreshing(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/demo-videos/broadcast-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();

      // Émission d'un événement BroadcastChannel & CustomEvent pour synchroniser instantanément l'interface vidéo côté élève
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc1 = new BroadcastChannel('azed_demo_videos_sync');
          bc1.postMessage({ type: 'REFRESH_DEMOS', action: 'reload', timestamp: Date.now() });
          bc1.close();
          const bc2 = new BroadcastChannel('azed_demo_sync');
          bc2.postMessage({ type: 'REFRESH_DEMOS', timestamp: Date.now() });
          bc2.close();
        } catch (_) {}
      }

      window.dispatchEvent(new CustomEvent('azed_demos_refresh', { detail: { timestamp: Date.now() } }));

      if (data.success) {
        notify('success', "Cache CDN/navigateur purgé ! Interface élève synchronisée instantanément.");
      } else {
        notify('error', data.message || "Erreur lors de l'actualisation côté élève.");
      }
    } catch (err) {
      // Secours BroadcastChannel local
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc1 = new BroadcastChannel('azed_demo_videos_sync');
          bc1.postMessage({ type: 'REFRESH_DEMOS', action: 'reload', timestamp: Date.now() });
          bc1.close();
          const bc2 = new BroadcastChannel('azed_demo_sync');
          bc2.postMessage({ type: 'REFRESH_DEMOS', timestamp: Date.now() });
          bc2.close();
        } catch (_) {}
      }
      notify('success', "Signal de synchronisation BroadcastChannel émis à tous les écrans élèves !");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Réordonner les vidéos (Monter)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...demoList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    // Réattribuer les numéros d'ordre 1, 2, 3...
    const reordered = updated.map((v, i) => ({ ...v, order: i + 1 }));
    setDemoList(reordered);
  };

  // Réordonner les vidéos (Descendre)
  const moveDown = (index: number) => {
    if (index === demoList.length - 1) return;
    const updated = [...demoList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    const reordered = updated.map((v, i) => ({ ...v, order: i + 1 }));
    setDemoList(reordered);
  };

  // Basculer la publication
  const togglePublish = (id: string) => {
    setDemoList(prev => prev.map(d => d.id === id ? { ...d, isPublished: !d.isPublished } : d));
  };

  // Ouvrir modal de création
  const handleOpenCreate = () => {
    setEditingDemo(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Extrait Cours');
    setFormYoutubeUrl('');
    setFormOrder(demoList.length + 1);
    setFormIsPublished(true);
    setIsModalOpen(true);
  };

  // Ouvrir modal de modification
  const handleOpenEdit = (demo: DemoVideo) => {
    setEditingDemo(demo);
    setFormTitle(demo.title);
    setFormDescription(demo.description || '');
    setFormCategory(demo.category || 'Extrait Cours');
    setFormYoutubeUrl(demo.youtubeUrl || demo.videoUrl || '');
    setFormOrder(demo.order || 1);
    setFormIsPublished(demo.isPublished !== false);
    setIsModalOpen(true);
  };

  // Soumission du formulaire Ajouter / Modifier
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Veuillez spécifier un titre pour la vidéo.');
      return;
    }
    if (!formYoutubeUrl.trim()) {
      alert('Veuillez renseigner le lien YouTube de la vidéo démo.');
      return;
    }

    const cleanEmbedUrl = toEmbedUrl(formYoutubeUrl);

    if (editingDemo) {
      // Mise à jour de l'existant
      setDemoList(prev => prev.map(item => {
        if (item.id === editingDemo.id) {
          return {
            ...item,
            title: formTitle.trim(),
            description: formDescription.trim(),
            category: formCategory,
            youtubeUrl: cleanEmbedUrl,
            videoUrl: cleanEmbedUrl,
            order: Number(formOrder) || item.order,
            isPublished: formIsPublished
          };
        }
        return item;
      }));
      notify('success', `Vidéo "${formTitle}" mise à jour dans la liste locale.`);
    } else {
      // Nouvelle vidéo
      const newVideo: DemoVideo = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        youtubeUrl: cleanEmbedUrl,
        videoUrl: cleanEmbedUrl,
        order: Number(formOrder) || demoList.length + 1,
        isPublished: formIsPublished,
        createdAt: new Date().toISOString()
      };
      setDemoList(prev => [...prev, newVideo]);
      notify('success', `Nouvelle vidéo "${formTitle}" ajoutée. N'oubliez pas de cliquer sur "Enregistrer tout".`);
    }

    setIsModalOpen(false);
  };

  // Supprimer une vidéo
  const handleDelete = (id: string) => {
    setDemoList(prev => prev.filter(d => d.id !== id));
    setDeleteConfirmId(null);
    notify('success', 'Vidéo démo supprimée de la liste.');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* HEADER PRINCIPAL AVEC LES 2 BOUTONS D'ACTION STRATÉGIQUES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Gestion des Vidéos Démo & Extraits
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full font-mono">
                /admin/videos_demo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configurez la vitrine vidéo publique accessible par tous les élèves et visiteurs.
            </p>
          </div>
        </div>

        {/* CONTENEUR DES BOUTONS D'ACTION EN HAUT À DROITE */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* BOUTON D'ACTION 2 : REFRESH DÉMO ÉLÈVE (Bouton d'actualisation) */}
          <button
            type="button"
            onClick={handleRefreshStudentView}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
            title="Purge le cache navigateur/CDN des élèves et synchronise via BroadcastChannel & WebSockets"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Synchronisation...' : 'Refresh démo élève'}</span>
          </button>

          {/* BOUTON D'ACTION 1 : ENREGISTRER TOUT (Bouton bleu / émeraude stratégique) */}
          <button
            type="button"
            onClick={handleSaveAllGlobal}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Sauvegarde globalement la liste des vidéos démo, leur ordre, leurs titres et URLs en base de données / VPS"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-bounce' : ''}`} />
            <span>{isSaving ? 'Enregistrement VPS...' : 'Enregistrer tout'}</span>
          </button>

          {/* BOUTON D'AJOUT NOUVELLE DÉMO */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Démo</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE DE NOTIFICATION VISUELLE */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LISTE DES VIDÉOS DÉMO AVEC TABLEAU / CARTES INTERACTIVES */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Chargement des vidéos démo depuis la base de données...</p>
        </div>
      ) : demoList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-black text-slate-900">Aucune vidéo démo configurée</h3>
            <p className="text-xs text-slate-500 font-medium">
              Ajoutez vos vidéos de cours, méthodologies ou présentations pour donner envie aux élèves de s'abonner.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            + Publier une Première Vidéo Démo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span>{demoList.length} vidéo{demoList.length > 1 ? 's' : ''} au catalogue démo</span>
            <span className="text-[11px] text-slate-400">Glissez ou utilisez les flèches pour réorganiser l'ordre</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {demoList.map((demo, index) => {
                const embedUrl = toEmbedUrl(demo.youtubeUrl || demo.videoUrl || '');
                const ytMatch = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
                const ytId = ytMatch ? ytMatch[1] : '';
                const thumb = demo.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

                return (
                  <div
                    key={demo.id}
                    className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 ${
                      !demo.isPublished ? 'opacity-65 bg-slate-50/40' : ''
                    }`}
                  >
                    {/* Colonne gauche : Ordre + Miniature + Métadonnées */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Flèches de tri & ordre */}
                      <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-slate-500 hover:text-indigo-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Monter"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          #{demo.order || index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === demoList.length - 1}
                          className="p-1 text-slate-500 hover:text-indigo-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Descendre"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Miniature Vidéo avec bouton play */}
                      <div 
                        onClick={() => setPreviewVideo(demo)}
                        className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative group cursor-pointer border border-slate-200 shadow-xs"
                      >
                        {thumb ? (
                          <img 
                            src={thumb} 
                            alt={demo.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Video className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <div className="w-7 h-7 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-md">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Titre, catégorie et description */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-md border border-indigo-200/60">
                            {demo.category || 'Général'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            demo.isPublished !== false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {demo.isPublished !== false ? '● En ligne' : '○ Masqué'}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {demo.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {demo.description || 'Aucune description détaillée.'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {embedUrl}
                        </p>
                      </div>
                    </div>

                    {/* Colonne droite : Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* Toggle En ligne / Masqué */}
                      <button
                        type="button"
                        onClick={() => togglePublish(demo.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          demo.isPublished !== false
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                        title="Bascule le statut de publication"
                      >
                        {demo.isPublished !== false ? 'Actif' : 'Désactivé'}
                      </button>

                      {/* Aperçu vidéo */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(demo)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                        title="Visionner la vidéo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Modifier */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(demo)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer"
                        title="Modifier cette vidéo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Supprimer */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(demo.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                        title="Supprimer cette vidéo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION / MODIFICATION VIDÉO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Header modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingDemo ? 'Modifier la Vidéo Démo' : 'Ajouter une Nouvelle Vidéo Démo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire modal */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                  Titre de la Vidéo Démo *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Extrait de Cours : Les Algorithmes de Tri en Python"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                  Lien YouTube ou Embed URL *
                </label>
                <input
                  type="text"
                  required
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Les liens youtube.com, youtu.be et shorts sont automatiquement convertis au format embed responsive.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    Catégorie Thématique
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Extrait Cours">Extrait Cours</option>
                    <option value="Présentation Plateforme">Présentation Plateforme</option>
                    <option value="Algorithmique">Algorithmique</option>
                    <option value="Base de Données">Base de Données & SQL</option>
                    <option value="Développement Web">Développement Web</option>
                    <option value="Méthodologie">Méthodologie & Astuces</option>
                    <option value="Bac">Sujets Bac Pratique</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    Ordre d'Affichage (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                  Description Pédagogique
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Décrivez brièvement les notions abordées dans cet extrait vidéo..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Publier immédiatement (visible côté élève)
                  </span>
                </label>
              </div>

              {/* Boutons actions modal */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  {editingDemo ? 'Mettre à jour la vidéo' : 'Insérer dans la liste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Confirmation de suppression</span>
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Êtes-vous certain de vouloir supprimer cette vidéo démo de la vitrine ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRÉVISUALISATION LECTEUR VIDÉO */}
      {previewVideo && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-black truncate">{previewVideo.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${toEmbedUrl(previewVideo.youtubeUrl || previewVideo.videoUrl || '')}?autoplay=1&rel=0`}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-900 text-slate-300 text-xs">
              <p>{previewVideo.description || 'Extrait vidéo de démonstration de la plateforme A-Zed Info.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDemoVideosManager;
