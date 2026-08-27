import React, { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  Link as LinkIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';

export interface LiveSessionItem {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  durationMinutes: number;
  grade: string;
  section: string; // branch
  zoomLink: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export const AdminLivePlanning: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([
    {
      id: 'live-1',
      title: 'Algorithmique & Structures de Données - Séance Live N°12',
      instructor: 'M. Nabil Chaouch',
      date: '2026-08-28',
      time: '18:30',
      durationMinutes: 90,
      grade: '4éme',
      section: "Sciences de l'Informatique",
      zoomLink: 'https://zoom.us/j/azed_live_info_2026',
      status: 'upcoming'
    },
    {
      id: 'live-2',
      title: 'Comptabilité Analytique & Gestion Financière',
      instructor: 'M. Karim Ben Salah',
      date: '2026-08-29',
      time: '19:00',
      durationMinutes: 75,
      grade: '4éme',
      section: 'Économie & Gestion',
      zoomLink: 'https://zoom.us/j/azed_live_eco_2026',
      status: 'upcoming'
    },
    {
      id: 'live-3',
      title: 'Techniques d’Analyse Littéraire & Dissertation',
      instructor: 'Mme. Salma Trabelsi',
      date: '2026-08-30',
      time: '17:00',
      durationMinutes: 90,
      grade: '4éme',
      section: 'Lettres',
      zoomLink: 'https://zoom.us/j/azed_live_lettres_2026',
      status: 'upcoming'
    },
    {
      id: 'live-4',
      title: 'Méthodologie de Préparation aux Épreuves Sportives',
      instructor: 'M. Yassine Dridi',
      date: '2026-08-31',
      time: '16:00',
      durationMinutes: 60,
      grade: '4éme',
      section: 'Sport',
      zoomLink: 'https://zoom.us/j/azed_live_sport_2026',
      status: 'upcoming'
    }
  ]);

  const [selectedSectionFilter, setSelectedSectionFilter] = useState('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('M. Nabil Chaouch');
  const [date, setDate] = useState('2026-09-01');
  const [time, setTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [grade, setGrade] = useState('4éme');
  const [section, setSection] = useState("Sciences de l'Informatique");
  const [zoomLink, setZoomLink] = useState('https://zoom.us/j/...');

  const filteredSessions = sessions.filter((s) => {
    if (selectedSectionFilter === 'Tous') return true;
    return s.section === selectedSectionFilter;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSession: LiveSessionItem = {
      id: `live-${Date.now()}`,
      title: title.trim(),
      instructor: instructor.trim(),
      date,
      time,
      durationMinutes: Number(durationMinutes),
      grade,
      section,
      zoomLink: zoomLink.trim(),
      status: 'upcoming'
    };

    setSessions((prev) => [newSession, ...prev]);
    setIsModalOpen(false);
    setTitle('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cette séance live planifiée ?")) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Video className="text-purple-600" size={24} />
            Planning des Séances Live & Directs
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planification des cours interactifs en direct ciblés par filières académiques (Sciences de l'Informatique, Mathématiques, Sciences Expérimentales, Sciences Techniques, Économie & Gestion, Lettres, Sport).
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          Planifier un Live
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
          <Filter size={11} /> Filtrer par filière :
        </span>
        {ALL_SECTIONS_OPTIONS.map((sec) => {
          const isSelected = selectedSectionFilter === sec;
          return (
            <button
              key={sec}
              onClick={() => setSelectedSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun live planifié pour cette filière pour le moment.
          </div>
        ) : (
          filteredSessions.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-purple-200 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                    {s.grade} • {s.section}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{s.title}</h3>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-purple-600" />
                  <span className="font-semibold">{s.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-purple-600" />
                  <span>{s.time} ({s.durationMinutes} min)</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Users size={13} />
                  <span>Enseignant : <strong>{s.instructor}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={s.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 underline"
                >
                  <LinkIcon size={12} /> Lien d'accès Live
                </a>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Confirmé
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal New Live */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Video className="text-purple-600" size={20} />
              Planifier une Nouvelle Séance Live
            </h2>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de la Séance *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Révision Devoir Synthèse N°2 - Chapitre 3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enseignant / Formateur</label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure de Début</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niveau Académique</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Tous">Tous les niveaux</option>
                    <option value="1ère">1ère Année</option>
                    <option value="2ème">2ème Année</option>
                    <option value="3ème">3ème Année</option>
                    <option value="4éme">4ème Année (Bac)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Filière / Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Tous">Toutes les filières</option>
                    {ALL_SECTIONS_OPTIONS.filter(s => s !== 'Tous').map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lien de la réunion (Zoom / Meet)</label>
                <input
                  type="url"
                  required
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Publier la Séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLivePlanning;
