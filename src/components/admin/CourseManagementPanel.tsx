import React, { useState } from "react";
import { BookOpen, Plus, Trash2, Video, FileText, Check } from "lucide-react";
import { CourseItem } from "../../types";

interface CourseManagementPanelProps {
  courses?: CourseItem[];
  onAddCourse?: (course: Partial<CourseItem>) => void;
  onDeleteCourse?: (id: string) => void;
}

export const CourseManagementPanel: React.FC<CourseManagementPanelProps> = ({
  courses = [],
  onAddCourse,
  onDeleteCourse,
}) => {
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("4ème Année");
  const [module, setModule] = useState("Algorithmique & Programmation");
  const [fileType, setFileType] = useState<"mp4" | "pdf">("mp4");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onAddCourse) {
      onAddCourse({
        id: `crs_${Date.now()}`,
        title,
        grade,
        module,
        fileType,
        videoUrl: videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "15 min",
        isPremium,
        contentType: "course",
      });
    }

    setSuccessMsg("Nouveau contenu pédagogique ajouté avec succès !");
    setTitle("");
    setVideoUrl("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Create New Course Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          Ajouter un Nouveau Contenu / Fiche de Cours
        </h2>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Titre de la leçon / Fiche</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Structures de Données Éléments - Fichiers & Récursivité"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Niveau Solaire / Classe</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
            >
              <option value="4ème Année">4ème Année Bac Informatique</option>
              <option value="3ème Année">3ème Année Informatique</option>
              <option value="2ème Année">2ème Année Sciences</option>
              <option value="1ère Année">1ère Année Secondaire</option>
            </select>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Module / Chapitre</label>
            <input
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Type de Ressource</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
            >
              <option value="mp4">Vidéo HD Interactive (YouTube / MP4)</option>
              <option value="pdf">Document PDF / Fiche de Synthèse</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-extrabold text-slate-700 mb-1">Lien de la Vidéo / Fichier PDF</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou URL du document PDF"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Réservé aux abonnés Premium (Exclusif)
            </label>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus size={16} /> Publier le Contenu
            </button>
          </div>
        </form>
      </div>

      {/* Published Content List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          Contenus Récents Publiés ({courses.length})
        </h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {courses.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Aucun cours personnalisé n'a encore été ajouté.
            </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {c.fileType === "mp4" ? <Video size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{c.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {c.grade} • {c.module} • {c.isPremium ? "Premium" : "Gratuit"}
                    </p>
                  </div>
                </div>

                {onDeleteCourse && (
                  <button
                    onClick={() => onDeleteCourse(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
