import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  X, 
  Video, 
  ShoppingBag, 
  BookOpen, 
  UserPlus, 
  CreditCard, 
  HelpCircle,
  FileText,
  Sparkles
} from "lucide-react";
import { Notification } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NotificationsDropdownProps {
  userId: string;
  userRole?: "student" | "admin" | "agent";
  notifications: Notification[];
  onMarkRead: (id?: string) => void;
  onClearAll: () => void;
  onDeleteOne: (id: string) => void;
  onNavigate?: (path: string) => void;
}

export default function NotificationsDropdown({
  userId,
  userRole = "student",
  notifications = [],
  onMarkRead,
  onClearAll,
  onDeleteOne,
  onNavigate
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute unread count for current user
  const unreadCount = notifications.filter((n) => {
    if (n.readBy && Array.isArray(n.readBy) && n.readBy.includes(userId)) {
      return false;
    }
    return !n.isRead && !n.read;
  }).length;

  const handleMarkAllAsRead = async () => {
    try {
      if (onMarkRead) {
        onMarkRead();
      }
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (notif: Notification) => {
    const typeUpper = (notif.type || "").toUpperCase();
    const titleUpper = (notif.title || "").toUpperCase();

    if (typeUpper.includes("LIVE") || titleUpper.includes("LIVE") || notif.icon === "video") {
      return <Video size={15} className="text-sky-500" />;
    }
    if (typeUpper.includes("PURCHASE") || typeUpper.includes("SHOP") || typeUpper.includes("CART") || notif.icon === "shopping-bag") {
      return <ShoppingBag size={15} className="text-emerald-500" />;
    }
    if (typeUpper.includes("SIGNUP") || typeUpper.includes("ACCOUNT") || typeUpper.includes("USER") || notif.icon === "user-plus") {
      return <UserPlus size={15} className="text-indigo-500" />;
    }
    if (typeUpper.includes("PAYMENT") || typeUpper.includes("COMMISSION") || notif.icon === "credit-card") {
      return <CreditCard size={15} className="text-amber-500" />;
    }
    if (typeUpper.includes("CONTENT") || typeUpper.includes("COURSE") || typeUpper.includes("CHAPTER") || typeUpper.includes("FICHE")) {
      return <BookOpen size={15} className="text-purple-500" />;
    }
    if (typeUpper.includes("QUIZ") || typeUpper.includes("EXAM")) {
      return <HelpCircle size={15} className="text-rose-500" />;
    }
    if (typeUpper.includes("REVISION") || typeUpper.includes("COURSE")) {
      return <FileText size={15} className="text-teal-500" />;
    }
    return <Sparkles size={15} className="text-amber-500" />;
  };

  const handleActionClick = (notif: Notification) => {
    // Mark as read
    onMarkRead(notif.id);

    // Dynamic routing path calculation
    const link = notif.link || notif.eventData?.link || notif.eventData?.zoom_link;
    if (link) {
      if (link.startsWith("http://") || link.startsWith("https://")) {
        window.open(link, "_blank");
      } else if (onNavigate) {
        onNavigate(link);
      } else {
        window.location.hash = link.startsWith("#") ? link : `#${link}`;
      }
    }
    setIsOpen(false);
  };

  const filteredNotifs = React.useMemo(() => {
    const seenIds = new Set<string>();
    const seenEventIds = new Set<string>();
    return notifications.filter((n) => {
      if (!n || !n.id) return false;
      if (seenIds.has(n.id)) return false;
      seenIds.add(n.id);

      const evtId = n.eventId || n.eventData?.id;
      if (evtId) {
        if (seenEventIds.has(evtId)) return false;
        seenEventIds.add(evtId);
      }

      const isRead = (n.readBy && Array.isArray(n.readBy) && n.readBy.includes(userId)) || n.isRead || n.read;
      const isUnread = !isRead;
      if (activeTab === "unread") return isUnread;
      return true;
    });
  }, [notifications, activeTab, userId]);

  return (
    <div id="notifications-wrapper" className="relative select-none" ref={dropdownRef}>
      {/* Trigger Button with Dynamic Unread Badge */}
      <button
        id="notif-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl border border-[#E5E7EB] text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
        title="Centre de Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-white text-[10px] font-black items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Interactive Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 z-50 overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-4 bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications {userRole && <span className="text-[10px] font-bold text-emerald-600 uppercase">({userRole})</span>}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes les notifications sont à jour"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={12} />
                  <span>Tout lire</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-xs">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                    activeTab === "unread"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Non lues ({unreadCount})
                </button>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[10px] font-bold text-gray-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Effacer l'historique"
                >
                  <Trash2 size={12} />
                  <span>Effacer</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/60">
              {filteredNotifs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-gray-300 dark:text-slate-600">
                    <Bell size={24} />
                  </div>
                  <p className="text-xs font-semibold">Aucune notification</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {activeTab === "unread" ? "Aucun message non lu" : "Vous êtes à jour !"}
                  </p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const isRead = (notif.readBy && Array.isArray(notif.readBy) && notif.readBy.includes(userId)) || notif.isRead || notif.read;
                  const isUnread = !isRead;
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors relative group flex items-start gap-3 ${
                        isUnread
                          ? "bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Icon Container */}
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
                        {getNotificationIcon(notif)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${isUnread ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300"}`}>
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {notif.content || notif.message}
                        </p>

                        {/* Extra Event / Metadata Box */}
                        {notif.eventData && (
                          <div className="mt-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 text-[10px] text-sky-900 dark:text-sky-200">
                            <div className="font-extrabold flex items-center justify-between">
                              <span className="truncate">📅 {notif.eventData.title}</span>
                              <span className="px-1.5 py-0.5 rounded bg-sky-200/60 dark:bg-sky-800 text-[9px] font-black">
                                {notif.eventData.time || "22:30"}
                              </span>
                            </div>
                            <div className="mt-1 text-slate-600 dark:text-slate-400 font-medium">
                              Date : <strong>{notif.eventData.date}</strong>
                            </div>
                          </div>
                        )}

                        {/* Footer & Actions */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500">
                          <span>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onDeleteOne(notif.id)}
                              className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                              title="Supprimer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-gray-50/80 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 text-center text-[10px] text-gray-400">
              A-Zed Info Real-Time Notification Engine
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
