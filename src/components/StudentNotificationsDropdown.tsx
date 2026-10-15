import React, { useState, useEffect, useRef } from 'react';

export const StudentNotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('azed_user_id') || localStorage.getItem('user_id') || '';
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/student/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Erreur de récupération des notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling toutes les 20s
    return () => clearInterval(interval);
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/student/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Erreur suppression notification", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
        title="Notifications étudiant"
      >
        <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Panneau Flottant avec Liste Scrollable CSS */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-xs">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span>🔔 Notifications Étudiant</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {notifications.length} nouvelles
            </span>
          </div>

          {/* Conteneur avec Scroll CSS strict */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 p-2 scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">Aucune notification pour le moment.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-3 hover:bg-slate-50 transition-all rounded-xl relative group flex flex-col gap-1 border border-transparent hover:border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{notif.title}</h4>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveNotification(notif.id, e)}
                      className="text-slate-400 hover:text-red-600 text-xs font-bold transition-all p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">Emplacement : <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{notif.location}</span></p>
                  <span className="text-[9px] text-slate-400 mt-1 self-end font-medium">{notif.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
