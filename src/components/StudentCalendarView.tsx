import React, { useState } from 'react';
import { Video, Lock } from 'lucide-react';
import { isLiveActive, handleJoinClick } from '../lib/meetingSecurity';

// Type pour les événements
export interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string; // ISO string YYYY-MM-DD
  time: string;
  durationMinutes?: number;
  meetingUrl?: string;
  status: 'ongoing' | 'upcoming' | 'completed'; // en cours, à venir, terminé
  type: 'live' | 'devoir' | 'quiz' | 'cours';
}

/* Styles centralisés des statuts selon la charte graphique */
export const CALENDAR_STATUS_STYLES = {
  en_cours: {
    label: "En cours",
    legendBadge: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    legendDot: "bg-emerald-600",
    cardStyle: "bg-emerald-100 border-l-4 border-emerald-600 text-emerald-950 shadow-sm hover:bg-emerald-200"
  },
  prochainement: {
    label: "Prochainement",
    legendBadge: "bg-sky-100 text-sky-900 border-sky-300 font-bold",
    legendDot: "bg-sky-600",
    cardStyle: "bg-sky-100 border-l-4 border-sky-600 text-sky-950 shadow-sm hover:bg-sky-200"
  },
  termine: {
    label: "Terminé",
    legendBadge: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
    legendDot: "bg-rose-600",
    cardStyle: "bg-rose-100 border-l-4 border-rose-600 text-rose-950 opacity-90 hover:bg-rose-200 shadow-sm"
  }
};

/* Styles des badges selon le statut */
export const getStatusBadgeStyle = (status: 'en_cours' | 'prochainement' | 'termine' | 'ongoing' | 'upcoming' | 'completed' | string) => {
  const norm = String(status || '').toLowerCase().replace(' ', '_');
  if (norm === 'en_cours' || norm === 'ongoing') {
    const config = CALENDAR_STATUS_STYLES.en_cours;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-bold`,
      dot: config.legendDot,
      cardBorder: `${config.cardStyle} rounded-r-lg border border-emerald-200`,
      eventCard: `${config.cardStyle} rounded-r-lg border border-emerald-200`,
      label: config.label,
      cardStyle: config.cardStyle
    };
  } else if (norm === 'termine' || norm === 'terminé' || norm === 'completed') {
    const config = CALENDAR_STATUS_STYLES.termine;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-medium`,
      dot: config.legendDot,
      cardBorder: `${config.cardStyle} rounded-r-lg border border-rose-200`,
      eventCard: `${config.cardStyle} rounded-r-lg border border-rose-200`,
      label: config.label,
      cardStyle: config.cardStyle
    };
  } else {
    const config = CALENDAR_STATUS_STYLES.prochainement;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-semibold`,
      dot: config.legendDot,
      cardBorder: `${config.cardStyle} rounded-r-lg border border-sky-200`,
      eventCard: `${config.cardStyle} rounded-r-lg border border-sky-200`,
      label: config.label,
      cardStyle: config.cardStyle
    };
  }
};

export const StudentCalendarView: React.FC = () => {
  const [currentView, setCurrentView] = useState<'Mois' | 'Semaine' | 'Jour' | 'Agenda'>('Mois');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');

  // Exemple d'évènements
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Algorithmique Pratique - Correction du Devoir de Synthèse N°2',
      subject: "Sciences de l'Informatique",
      teacher: 'M. Nabil Chaouch',
      date: '2026-08-21',
      time: '18:30',
      durationMinutes: 90,
      meetingUrl: 'https://zoom.us/j/azed_live_info_2026',
      status: 'ongoing', // En cours -> Vert Vif Émeraude
      type: 'live',
    },
    {
      id: '2',
      title: 'Interface Utilisateur & Web React',
      subject: 'Web & Multimédia',
      teacher: 'M. Nabil Chaouch',
      date: '2026-08-23',
      time: '15:00',
      durationMinutes: 90,
      meetingUrl: 'https://zoom.us/j/azed_live_web_2026',
      status: 'upcoming', // À venir -> Orange
      type: 'cours',
    },
    {
      id: '3',
      title: 'Quiz Interactif #37 - Structure de Données',
      subject: 'Algorithmique',
      teacher: 'M. Nabil Chaouch',
      date: '2026-08-04',
      time: '10:00',
      durationMinutes: 45,
      status: 'completed', // Terminé -> Rouge
      type: 'quiz',
    },
  ]);

  // Événement à la une (Live / En cours)
  const featuredEvent = events.find((e) => e.status === 'ongoing') || events[0];
  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6 text-left">
      
      {/* LÉGENDE DU CALENDRIER (AVEC CHARTE GRAPHIQUE VERT ÉMERAUDE / ORANGE / ROUGE) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Vues (Mois, Semaine, Jour, Agenda) */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['Mois', 'Semaine', 'Jour', 'Agenda'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setCurrentView(view)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === view
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Navigation Date */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 cursor-pointer"
            aria-label="Mois précédent"
          >
            &lt;
          </button>
          <span className="text-sm font-black text-slate-800 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200">
            Août 2026
          </span>
          <button 
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 cursor-pointer"
            aria-label="Mois suivant"
          >
            &gt;
          </button>
        </div>

        {/* 3 BADGES DE STATUT DYNAMIQUES */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">
          
          {/* 1. EN COURS -> VERT ÉMERAUDE */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-2xs font-bold text-[11px] border ${CALENDAR_STATUS_STYLES.en_cours.legendBadge}`}>
            <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.en_cours.legendDot} animate-pulse`}></span>
            <span>{CALENDAR_STATUS_STYLES.en_cours.label}</span>
          </div>

          {/* 2. PROCHAINEMENT -> BLEU CIEL */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-2xs font-bold text-[11px] border ${CALENDAR_STATUS_STYLES.prochainement.legendBadge}`}>
            <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.prochainement.legendDot}`}></span>
            <span>{CALENDAR_STATUS_STYLES.prochainement.label}</span>
          </div>

          {/* 3. TERMINÉ -> ROUGE ROSE */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-2xs font-bold text-[11px] border ${CALENDAR_STATUS_STYLES.termine.legendBadge}`}>
            <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.termine.legendDot}`}></span>
            <span>{CALENDAR_STATUS_STYLES.termine.label}</span>
          </div>

        </div>
      </div>

      {/* BANNIÈRE LIVE PLANIFIÉ - VERT ÉMERAUDE */}
      {featuredEvent && (
        <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/70 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider bg-emerald-600 animate-pulse">
                LIVE PLANIFIÉ
              </span>
              <h2 className="font-black text-sm text-slate-900">
                {featuredEvent.title}
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-600">
              📅 {featuredEvent.date} à {featuredEvent.time} | 👨‍🏫 {featuredEvent.teacher}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {featuredEvent.meetingUrl && (() => {
              const startIso = `${featuredEvent.date}T${featuredEvent.time}:00`;
              const active = isLiveActive(startIso, featuredEvent.durationMinutes || 90);
              return (
                <button
                  type="button"
                  onClick={() => active && handleJoinClick(featuredEvent.meetingUrl!)}
                  disabled={!active}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  {active ? <Video size={14} /> : <Lock size={14} />}
                  <span>{active ? 'Rejoindre le Live' : 'Live non démarré'}</span>
                </button>
              );
            })()}
            <button 
              type="button"
              onClick={() => setSelectedDate(featuredEvent.date)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Voir sur le calendrier
            </button>
          </div>
        </div>
      )}

      {/* RAPPEL DES ÉVÉNEMENTS AVEC ÉTIQUETTES DYNAMIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Événement En Cours */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm space-y-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En cours
          </span>
          <p className="font-bold text-xs text-slate-800">Session Live Algorithmique</p>
        </div>

        {/* Événement À venir (Orange) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 border-l-4 border-l-orange-500 shadow-sm space-y-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs bg-orange-100 text-orange-800 border border-orange-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Prochainement
          </span>
          <p className="font-bold text-xs text-slate-800">Interface Utilisateur & Web</p>
        </div>

        {/* Événement Terminé (Rouge) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 border-l-4 border-l-red-500 shadow-sm space-y-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Terminé
          </span>
          <p className="font-bold text-xs text-slate-800">Quiz Interactif #37</p>
        </div>

      </div>

      {/* CONTENU PRINCIPAL : Grille du calendrier & Barre latérale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Grille Mensuelle (3/4) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
            <div>Lundi</div>
            <div>Mardi</div>
            <div>Mercredi</div>
            <div>Jeudi</div>
            <div>Vendredi</div>
            <div>Samedi</div>
            <div>Dimanche</div>
          </div>

          {/* Exemple de jours dans la grille */}
          <div className="grid grid-cols-7 gap-2">
            
            {/* Jour exemple : 04 Août (Terminé / Rouge) */}
            <div 
              onClick={() => setSelectedDate('2026-08-04')}
              className={`min-h-[90px] p-2 rounded-xl space-y-1 cursor-pointer transition-all ${
                selectedDate === '2026-08-04' 
                  ? 'bg-red-50/70 border-2 border-red-400' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-red-700">04</span>
              <div className="bg-red-100 text-red-800 border border-red-300 p-1.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Quiz #37...</span>
              </div>
            </div>

            {/* Jours vides d'illustration */}
            {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((day) => (
              <div key={day} className="min-h-[90px] p-2 bg-slate-50/40 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-medium text-slate-400">{day < 10 ? `0${day}` : day}</span>
              </div>
            ))}

            {/* Jour exemple : 21 Août (Sélectionné & En cours) */}
            <div 
              onClick={() => setSelectedDate('2026-08-21')}
              className={`min-h-[90px] p-2 rounded-xl space-y-1 cursor-pointer transition-all ${
                selectedDate === '2026-08-21' 
                  ? 'bg-emerald-50/70 border-2 border-emerald-400' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-xs font-black text-emerald-700">21</span>
              <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 p-1.5 rounded-lg text-[10px] font-bold truncate shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Algorithmique...</span>
              </div>
            </div>

            <div className="min-h-[90px] p-2 bg-slate-50/40 border border-slate-100 rounded-xl space-y-1">
              <span className="text-xs font-medium text-slate-400">22</span>
            </div>

            {/* Jour exemple : 23 Août (À venir / Orange) */}
            <div 
              onClick={() => setSelectedDate('2026-08-23')}
              className={`min-h-[90px] p-2 rounded-xl space-y-1 cursor-pointer transition-all ${
                selectedDate === '2026-08-23' 
                  ? 'bg-orange-50/70 border-2 border-orange-400' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-orange-700">23</span>
              <div className="bg-orange-100 text-orange-800 border border-orange-300 p-1.5 rounded-lg text-[10px] font-bold truncate shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Interface UI...</span>
              </div>
            </div>

            {[24, 25, 26, 27, 28, 29, 30, 31].map((day) => (
              <div key={day} className="min-h-[90px] p-2 bg-slate-50/40 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-medium text-slate-400">{day}</span>
              </div>
            ))}

          </div>
        </div>

        {/* Panneau latéral : Détails de la journée (1/4) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800">
            Séances du {selectedDate === '2026-08-21' ? '21 Août 2026' : selectedDate === '2026-08-23' ? '23 Août 2026' : selectedDate === '2026-08-04' ? '04 Août 2026' : selectedDate}
          </h3>

          <div className="space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => {
                const style = getStatusBadgeStyle(event.status);
                  const active = event.meetingUrl ? isLiveActive(`${event.date}T${event.time}:00`, event.durationMinutes || 90) : false;

                  return (
                    <div
                      key={event.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 bg-slate-50/70 border-slate-200 shadow-2xs ${style.cardBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${event.status === 'ongoing' ? 'animate-pulse' : ''}`} />
                          {style.label}
                        </span>
                        <span className="font-bold text-slate-500">{event.time}</span>
                      </div>
                      <p className="font-extrabold text-slate-900 leading-snug">{event.title}</p>
                      <p className="text-[10px] text-slate-600 font-medium">{event.teacher}</p>

                      {event.type === 'live' && event.meetingUrl && (
                        <div className="pt-1.5">
                          <button
                            onClick={() => active && handleJoinClick(event.meetingUrl!)}
                            disabled={!active}
                            className={`w-full py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                              active
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98 shadow-xs'
                                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                            }`}
                          >
                            {active ? <Video size={13} /> : <Lock size={13} />}
                            <span>{active ? 'Rejoindre la réunion Live' : 'Live non démarré'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">Aucune séance pour cette date.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export const StudentCalendarViewFixed = StudentCalendarView;
export default StudentCalendarView;
