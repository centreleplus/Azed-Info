import React, { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  PlayCircle, 
  Sparkles,
  Filter,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';
import { isLiveActive, handleJoinClick } from '../lib/meetingSecurity';

export interface StudentLiveProps {
  userSection?: string;
  userGrade?: string;
  isPremium?: boolean;
}

export const StudentLive: React.FC<StudentLiveProps> = ({
  userSection = "Sciences de l'Informatique",
  userGrade = "4éme",
  isPremium = true
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>(userSection || 'Tous');

  const liveSessions = [
    {
      id: 'live-1',
      title: 'Algorithmique & Structures de Données - Séance Live N°12',
      instructor: 'M. Nabil Chaouch',
      date: '2026-08-28',
      time: '18:30',
      duration: '90 min',
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
      duration: '75 min',
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
      duration: '90 min',
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
      duration: '60 min',
      durationMinutes: 60,
      grade: '4éme',
      section: 'Sport',
      zoomLink: 'https://zoom.us/j/azed_live_sport_2026',
      status: 'upcoming'
    }
  ];

  const filteredSessions = liveSessions.filter((s) => {
    if (selectedBranch === 'Tous') return true;
    return s.section === selectedBranch || s.section === 'Tous';
  });

  return (
    <div className="space-y-6 text-left">
      {/* Featured Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-300" /> Séances Live Interactives
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Planning des Directs & Lives Pédagogiques
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
            Assistez aux cours en direct avec vos enseignants, posez vos questions en temps réel et préparez vos examens nationaux dans toutes les filières.
          </p>
        </div>
      </div>

      {/* Branch Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter size={12} /> Filière :
        </span>
        {ALL_SECTIONS_OPTIONS.map((sec) => {
          const isSelected = selectedBranch === sec;
          return (
            <button
              key={sec}
              onClick={() => setSelectedBranch(sec)}
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

      {/* Grid of Lives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun cours en direct prévu prochainement pour cette filière.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const startIso = `${s.date}T${s.time}:00`;
            const active = isLiveActive(startIso, s.durationMinutes);

            return (
              <div
                key={s.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                      {s.section}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Confirmé
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <Users size={13} className="text-purple-600" />
                    <span>Enseignant : <strong>{s.instructor}</strong></span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-600" />
                    <span className="font-semibold">{s.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-purple-600" />
                    <span className="font-semibold">{s.time} ({s.duration})</span>
                  </div>
                </div>

                {/* Bouton sécurisé sans affichage d'URL brute */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleJoinClick(s.zoomLink)}
                    disabled={!active}
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                      active
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {active ? <Video size={16} /> : <Lock size={15} />}
                    <span>{active ? 'Rejoindre la réunion Live' : 'Live non démarré'}</span>
                  </button>
                  {!active && (
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                      Le bouton d'accès sera actif 15 min avant le début du Live.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentLive;
