import React from "react";
import { Lock, Crown, ShieldCheck, Video, ExternalLink, Play, Sparkles } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "../lib/youtube";
import BackButton from "./BackButton";

export interface StudentVideoViewerProps {
  document?: {
    id: string;
    title: string;
    videoUrl?: string;
    video_url?: string;
    fileUrl?: string;
    isPremium?: boolean;
    is_premium?: boolean;
    access_level?: "free" | "premium";
    grade?: string;
    target_class?: string;
    module?: string;
    contentType?: string;
  } | null;
  user?: {
    isPremium?: boolean;
    is_premium?: boolean;
    role?: string;
  } | null;
  onBack?: () => void;
  onGoToShop?: () => void;
}

export const StudentVideoViewer: React.FC<StudentVideoViewerProps> = ({
  document,
  user,
  onBack,
  onGoToShop
}) => {
  if (!document) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white rounded-2xl">
        <Video size={48} className="text-slate-600 mb-3 animate-pulse" />
        <p className="text-sm font-semibold text-slate-400">Aucune ressource vidéo sélectionnée.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Retourner au catalogue
          </button>
        )}
      </div>
    );
  }

  const rawVideoUrl = document.videoUrl || document.video_url || document.fileUrl || "";
  const isPremiumResource = Boolean(
    document.isPremium || document.is_premium || document.access_level === "premium"
  );
  const isUserPremium = Boolean(
    user?.isPremium || user?.is_premium || user?.role === "admin" || user?.role === "agent"
  );

  const youtubeId = extractYouTubeId(rawVideoUrl);
  const embedUrl = youtubeId ? getYouTubeEmbedUrl(youtubeId) : null;
  const thumbnailUrl = youtubeId ? getYouTubeThumbnailUrl(youtubeId) : null;
  const isDirectMp4 = !youtubeId && (rawVideoUrl.endsWith(".mp4") || rawVideoUrl.includes("/uploads/"));

  const isLocked = isPremiumResource && !isUserPremium;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <BackButton onClick={onBack} label="" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                <Video size={11} />
                <span>Cours Vidéo {youtubeId ? "YouTube" : "MP4"}</span>
              </span>
              {isPremiumResource && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  <Crown size={10} />
                  <span>PREMIUM</span>
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-800 mt-1">{document.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Lecture Protégée A-Zed Info</span>
        </div>
      </div>

      {/* Main Video Container */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {isLocked ? (
          /* PREMIUM LOCK OVERLAY */
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="Miniature vidéo"
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
              />
            )}
            <div className="relative z-10 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl max-w-md w-full flex flex-col items-center space-y-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg animate-bounce">
                <Crown size={28} />
              </div>
              <h3 className="text-lg font-bold text-amber-400">Contenu Vidéo Réservé aux Membres Premium</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ce cours vidéo interactif exige un accès abonné Premium actif (120 DT/an). Débloquez l'intégralité des vidéos, séries de devoirs et fiches d'exercices.
              </p>
              {onGoToShop ? (
                <button
                  onClick={onGoToShop}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>S'abonner au Pass Premium (120 DT/an)</span>
                </button>
              ) : (
                <p className="text-[11px] text-amber-300/80 font-mono">Veuillez contacter le directeur M. Nabil Chaouch pour régulariser votre compte.</p>
              )}
            </div>
          </div>
        ) : embedUrl ? (
          /* YOUTUBE NOCookie SECURE EMBED IFRAME */
          <div className="relative w-full h-full group">
            <iframe
              src={embedUrl}
              title={document.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            {/* Distraction-Free Top Header Shield */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10 flex items-center justify-between px-4">
              <span className="text-[11px] font-bold text-white/80 drop-shadow-xs">Lecteur Vidéo Intégré • A-Zed Info</span>
            </div>
          </div>
        ) : isDirectMp4 || rawVideoUrl ? (
          /* LOCAL HTML5 VIDEO PLAYER */
          <video
            src={rawVideoUrl}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-contain"
          >
            Votre navigateur ne supporte pas la lecture vidéo directe.
          </video>
        ) : (
          /* NO VIDEO SOURCE AVAILABLE */
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
            <Video size={40} className="text-slate-600" />
            <p className="text-sm font-semibold">Lien de la vidéo indisponible ou format invalide.</p>
            <p className="text-xs text-slate-500">Veuillez vérifier l'URL renseignée dans le panneau d'administration.</p>
          </div>
        )}
      </div>

      {/* Video Details Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {document.module || document.target_class || document.grade || "Ressource Pédagogique"}
          </p>
          <h3 className="text-sm font-bold text-slate-800">{document.title}</h3>
        </div>
        {youtubeId && !isLocked && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
            <span>ID YouTube : <strong className="text-purple-600">{youtubeId}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoPlayerView = StudentVideoViewer;
export default StudentVideoViewer;
