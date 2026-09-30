import React, { useState, useEffect } from 'react';

export const GlobalCalendarView: React.FC = () => {
  // 🟢 RÈGLE STRICTE : Tableau initial VIDE. Aucune donnée fictive par défaut.
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch('/api/calendar/events', { credentials: 'include' });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]); // S'il n'y a pas d'événements réels, laisser vide
      }
    } catch (error) {
      console.error("Erreur de chargement du calendrier :", error);
      setEvents([]); // Ne jamais basculer sur des mock data en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  if (loading) return <div className="p-4 text-center text-slate-400">Chargement du calendrier...</div>;

  return (
    <div className="calendar-container bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Calendrier Scolaire & Événements</h2>
      {events.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-bold text-sm">Aucun événement programmé pour le moment.</p>
          <p className="text-slate-400 text-xs mt-1">Les réunions, examens et séances programmés par l'administration apparaîtront ici.</p>
        </div>
      ) : (
        <div className="events-list space-y-2">
          {events.map((evt) => (
            <div key={evt.id || evt._id} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-800 text-sm block">{evt.title || evt.topic}</span>
                <span className="text-xs text-emerald-600 block">{evt.date || evt.dateTime || evt.date_start}</span>
              </div>
              {evt.type && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-lg">
                  {evt.type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalCalendarView;
