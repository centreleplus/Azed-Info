import React, { useState, useEffect, useRef } from 'react';

export const StudentNotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // Fonction pour jouer le signal sonore (Web Audio API synth chime + fallback Audio mp3)
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.play().catch(() => {
        // Fallback doux et discret via Web Audio API (aucun fichier externe requis)
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          }
        } catch (e) {}
      });
    } catch (err) {
      console.warn("Audio alert error:", err);
    }
  };

  // Récupération dynamique AJAX / Polling
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
        // Déclencher le son si une nouvelle notification réelle est reçue
        if (data.notifications.length > prevCountRef.current && prevCountRef.current > 0) {
          playNotificationSound();
        }
        prevCountRef.current = data.notifications.length;
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n: any) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Erreur de récupération des notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling toutes les 15s
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

  // Marquer toutes les notifications comme lues (Bouton Coche ✓)
  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
    try {
      const token = localStorage.getItem('token') || '';
      const userId = localStorage.getItem('azed_user_id') || localStorage.getItem('user_id') || '';
      await fetch('/api/student/notifications/read-all', { 
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId
        }
      });
    } catch (e) {
      console.error("Erreur read-all:", e);
    }
  };

  // Tout supprimer (Bouton Corbeille 🗑️)
  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    prevCountRef.current = 0;
    try {
      const token = localStorage.getItem('token') || '';
      const userId = localStorage.getItem('azed_user_id') || localStorage.getItem('user_id') || '';
      await fetch('/api/student/notifications/clear-all', { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId
        }
      });
    } catch (e) {
      console.error("Erreur clear-all:", e);
    }
  };

  // Supprimer une notification unique (Bouton ✕)
  const handleRemoveOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
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
        aria-label="Notifications étudiant"
      >
        <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Fenêtre déroulante NOTIFICATIONS ÉTUDIANT */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
          {/* En-tête de la modale */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h3 className="font-extrabold text-blue-950 text-sm tracking-wide">NOTIFICATIONS ÉTUDIANT</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {unreadCount} nouvelles
              </span>
              {/* Bouton Tout marquer comme lu (Icône Coche UNIQUEMENT) */}
              <button 
                type="button" 
                onClick={handleMarkAllAsRead} 
                className="p-1 hover:bg-gray-100 rounded-lg text-emerald-600 font-bold transition-all cursor-pointer text-sm leading-none" 
                title="Tout marquer comme lu"
              >
                ✓
              </button>
              {/* Bouton Tout supprimer (Icône Corbeille UNIQUEMENT) */}
              <button 
                type="button" 
                onClick={handleClearAll} 
                className="p-1 hover:bg-gray-100 rounded-lg text-red-500 transition-all cursor-pointer text-sm leading-none" 
                title="Tout supprimer"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Conteneur avec défilement CSS strict */}
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8 font-medium">Aucune notification pour le moment.</p>
            ) : (
              notifications.map((notif) => {
                const isRead = notif.isRead || notif.read;
                return (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-2xl border transition-all flex justify-between items-start gap-2 ${
                      isRead ? 'bg-gray-50/50 border-gray-100' : 'bg-blue-50/30 border-blue-100 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-bold text-gray-900">{notif.title}</span>
                      {notif.location && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Emplacement : {notif.location}
                        </span>
                      )}
                      {notif.time && (
                        <span className="text-[10px] text-purple-700 font-semibold">
                          Heure : {notif.time}
                        </span>
                      )}
                      <span className="text-[9px] text-gray-400 mt-1 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => handleRemoveOne(notif.id, e)} 
                      className="text-gray-300 hover:text-red-500 text-xs font-bold transition-all p-1 rounded-md cursor-pointer shrink-0"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const StudentNotificationsModal = StudentNotificationsDropdown;
export default StudentNotificationsDropdown;
