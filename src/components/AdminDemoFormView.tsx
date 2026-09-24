import React, { useState } from 'react';
import { Save, Video, Eye, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { DemoItem } from '../types/demo';
import BackButton from './BackButton';

interface AdminDemoFormViewProps {
  demoToEdit?: DemoItem | null;
  onBack: () => void;
  onSave: (data: Partial<DemoItem>) => void | Promise<void>;
  saving?: boolean;
  errorMsg?: string;
}

export const AdminDemoFormView: React.FC<AdminDemoFormViewProps> = ({
  demoToEdit,
  onBack,
  onSave,
  saving = false,
  errorMsg = '',
}) => {
  const [formData, setFormData] = useState({
    title: demoToEdit?.title || '',
    videoUrl: demoToEdit?.videoUrl || '',
    description: demoToEdit?.description || '',
    category: demoToEdit?.category || 'Extrait Cours',
    duration: demoToEdit?.duration || '',
    thumbnailUrl: demoToEdit?.thumbnailUrl || '',
    displayOrder: demoToEdit?.displayOrder || demoToEdit?.order || 1,
    isFeatured: demoToEdit?.isFeatured ?? demoToEdit?.featured ?? false,
  });

  const [localError, setLocalError] = useState<string>('');

  // Helper pour convertir un lien YouTube standard en lien Embed pour le preview
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    let trimmed = url.trim();

    // YouTube watch URLs
    if (trimmed.includes('youtube.com/watch?v=')) {
      const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return trimmed.replace('watch?v=', 'embed/');
    }

    // YouTube short URLs
    if (trimmed.includes('youtu.be/')) {
      const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // YouTube shorts URLs
    if (trimmed.includes('youtube.com/shorts/')) {
      const id = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // Vimeo URLs
    if (trimmed.includes('vimeo.com/') && !trimmed.includes('player.vimeo.com')) {
      const id = trimmed.split('vimeo.com/')[1]?.split('?')[0];
      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }

    return trimmed;
  };

  // Helper pour générer automatiquement la miniature YouTube si elle n'est pas saisie
  const handleVideoUrlChange = (val: string) => {
    setFormData((prev) => {
      const next = { ...prev, videoUrl: val };
      if (!prev.thumbnailUrl) {
        const ytMatch = val.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        if (ytMatch && ytMatch[1]) {
          next.thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.title.trim()) {
      setLocalError('Veuillez saisir un titre pour la vidéo.');
      return;
    }
    if (!formData.videoUrl.trim()) {
      setLocalError('Veuillez renseigner le lien de la vidéo.');
      return;
    }

    onSave({
      title: formData.title.trim(),
      videoUrl: formData.videoUrl.trim(),
      description: formData.description.trim(),
      category: formData.category,
      duration: formData.duration.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim(),
      displayOrder: Number(formData.displayOrder) || 1,
      order: Number(formData.displayOrder) || 1,
      isFeatured: formData.isFeatured,
      featured: formData.isFeatured,
    });
  };

  const activeError = localError || errorMsg;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* BARRE SUPÉRIEURE / ENTÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} label="" />
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              {demoToEdit ? '✏️ Modifier la Vidéo Démo' : '➕ Ajouter une Nouvelle Vidéo Démo'}
            </h1>
            <p className="text-xs text-slate-500">
              Complétez le formulaire ci-dessous. Le contenu sera instantanément visible par les élèves.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-200 transition flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{demoToEdit ? 'Enregistrer les modifications' : 'Publier la vidéo'}</span>
          </button>
        </div>
      </div>

      {activeError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {/* DISPOSITION EN 2 COLONNES : FORMULAIRE & APERÇU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE : FORMULAIRE COMPLET (7 COLONNES) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Video className="w-4 h-4 text-purple-600" />
            Informations de la Vidéo
          </h2>

          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Titre de la vidéo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Présentation Complète de la Plateforme A-Zed Info"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-500 transition outline-none"
            />
          </div>

          {/* URL Vidéo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Lien Vidéo (YouTube, Vimeo, Embed) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Conversion automatique en Embed</span>
            </div>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 transition outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description & Sommaire du contenu
            </label>
            <textarea
              rows={5}
              placeholder="Explication détaillée du chapitre abordé, des objectifs pédagogiques et des prérequis..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 transition outline-none resize-none"
            />
          </div>

          {/* Métadonnées : Catégorie, Durée, Ordre */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
              >
                <option value="Extrait Cours">Extrait Cours</option>
                <option value="Présentation Plateforme">Présentation Plateforme</option>
                <option value="Bac">Bac / Examens</option>
                <option value="Méthodologie">Méthodologie</option>
                <option value="Algorithmes">Algorithmique & Python</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Durée (ex: 12:30)</label>
              <input
                type="text"
                placeholder="14:15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ordre d'affichage</label>
              <input
                type="number"
                min={1}
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
              />
            </div>
          </div>
        </form>

        {/* COLONNE DROITE : PRÉVISUALISATION EN DIRECT (5 COLONNES) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 sticky top-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Aperçu en direct (Vue Élève)
            </h3>

            {/* Lecteur iframe de test */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 mb-4 relative">
              {formData.videoUrl ? (
                <iframe
                  src={getEmbedUrl(formData.videoUrl)}
                  title="Prévisualisation"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  Saisissez un lien vidéo pour afficher le lecteur d'aperçu
                </div>
              )}
            </div>

            {/* Fiche récapitulative */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {formData.category}
                </span>
                {formData.duration && (
                  <span className="text-[10px] text-slate-400 font-mono">⏱️ {formData.duration}</span>
                )}
              </div>
              <h4 className="font-extrabold text-sm text-slate-100 line-clamp-2">
                {formData.title || 'Titre de la vidéo démo'}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {formData.description || 'La description apparaîtra ici sous la vidéo.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDemoFormView;
