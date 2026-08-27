import React, { useState } from 'react';
import { 
  Film, Plus, RefreshCw, Eye, Edit2, Trash2, Video, Sparkles, 
  PlayCircle, X, ExternalLink, Clock
} from 'lucide-react';
import { DemoItem } from '../types/demo';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDemoListViewProps {
  demos: DemoItem[];
  loading: boolean;
  onCreateClick: () => void;
  onEditClick: (demo: DemoItem) => void;
  onDeleteClick: (id: string, title: string) => void;
  onRefresh: () => void;
}

export const AdminDemoListView: React.FC<AdminDemoListViewProps> = ({
  demos,
  loading,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onRefresh,
}) => {
  const [previewModalDemo, setPreviewModalDemo] = useState<DemoItem | null>(null);

  // Helper pour convertir en URL embed si besoin
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    let trimmed = url.trim();
    if (trimmed.includes('youtube.com/watch?v=')) {
      const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return trimmed.replace('watch?v=', 'embed/');
    }
    if (trimmed.includes('youtu.be/')) {
      const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return trimmed;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Gestion des Vidéos Démo & Extraits</span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                {demos.length} vidéo{demos.length > 1 ? 's' : ''}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Gérez les démonstrations vidéo visibles par les élèves et visiteurs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Rafraîchir la liste"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Démo</span>
          </button>
        </div>
      </div>

      {/* DEMO LIST GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Chargement des vidéos démo...</p>
        </div>
      ) : demos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-extrabold text-slate-800">Aucune vidéo démo configurée</h3>
            <p className="text-xs text-slate-500">
              Ajoutez votre première vidéo de présentation ou un extrait de cours pour inciter vos élèves à s'abonner.
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
          >
            + Publier une Vidéo Démo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {demos.map((demo) => {
            const isFeatured = demo.featured || demo.isFeatured;
            const displayOrder = demo.displayOrder || demo.order || 1;

            return (
              <div
                key={demo.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* VIDEO / THUMBNAIL PREVIEW */}
                  <div className="relative aspect-video bg-slate-900 group">
                    {demo.thumbnailUrl ? (
                      <img
                        src={demo.thumbnailUrl}
                        alt={demo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Film className="w-10 h-10" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewModalDemo(demo)}
                        className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span>Tester Lecture</span>
                      </button>
                    </div>

                    {demo.category && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white font-extrabold text-[10px] rounded-md backdrop-blur-xs">
                        {demo.category}
                      </span>
                    )}

                    {demo.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white font-mono text-[10px] rounded">
                        ⏱ {demo.duration}
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400">
                        Ordre #{displayOrder}
                      </span>
                      {isFeatured && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>En Vedette</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">
                      {demo.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {demo.description || "Aucune description."}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">
                    {demo.videoUrl}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditClick(demo)}
                      className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-lg transition cursor-pointer"
                      title="Modifier dans la page dédiée"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteClick(demo.id, demo.title)}
                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PLAY PREVIEW MODAL */}
      <AnimatePresence>
        {previewModalDemo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-slate-800 text-xs truncate max-w-sm">
                    {previewModalDemo.title}
                  </h4>
                </div>
                <button
                  onClick={() => setPreviewModalDemo(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(previewModalDemo.videoUrl)}
                  title={previewModalDemo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDemoListView;
