import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  X, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  ShoppingCart,
  BookOpen, 
  CreditCard, 
  HelpCircle,
  FileText,
  Sparkles,
  Heart,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock
} from "lucide-react";
import { StudentNotification, Notification } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NotificationsDropdownProps {
  userId: string;
  userRole?: "student" | "admin" | "agent" | string;
  notifications: (StudentNotification | Notification | any)[];
  onMarkRead: (id?: string) => void;
  onClearAll: () => void;
  onDeleteOne: (id: string) => void;
  onNavigate?: (path: string) => void;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) {
      return `Aujourd'hui à ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " à " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
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
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => {
      if (n.readBy && Array.isArray(n.readBy) && n.readBy.includes(userId)) {
        return false;
      }
      return !n.isRead && !n.read;
    }).length;
  }, [notifications, userId]);

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

  // Icon mapping for the 7 official student notification types
  const getNotificationVisual = (notif: any) => {
    const typeUpper = (notif.type || "").toUpperCase();

    if (typeUpper === "FILE" || typeUpper.includes("DOC") || typeUpper.includes("FICHE") || typeUpper.includes("COURSE")) {
      return {
        icon: <FileText size={15} className="text-blue-500" />,
        bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
        badge: "Document"
      };
    }
    if (typeUpper === "QUIZ" || typeUpper.includes("EXAM") || typeUpper.includes("QCM")) {
      return {
        icon: <HelpCircle size={15} className="text-purple-500" />,
        bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
        badge: "Évaluation"
      };
    }
    if (typeUpper === "CALENDAR" || typeUpper.includes("LIVE") || typeUpper.includes("EVENT") || typeUpper.includes("TODO")) {
      return {
        icon: <CalendarIcon size={15} className="text-sky-500" />,
        bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
        badge: "Agenda Live"
      };
    }
    if (typeUpper === "SHOP_NEW" || typeUpper.includes("PRODUCT")) {
      return {
        icon: <Sparkles size={15} className="text-amber-500" />,
        bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
        badge: "Nouveauté"
      };
    }
    if (typeUpper === "CART" || typeUpper.includes("PANIER")) {
      return {
        icon: <ShoppingCart size={15} className="text-indigo-500" />,
        bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
        badge: "Panier"
      };
    }
    if (typeUpper === "WISHLIST" || typeUpper.includes("FAVORIS")) {
      return {
        icon: <Heart size={15} className="text-rose-500 fill-rose-500/20" />,
        bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
        badge: "Favoris"
      };
    }
    if (typeUpper === "ORDER" || typeUpper.includes("COMMANDE") || typeUpper.includes("PAYMENT")) {
      return {
        icon: <CheckCircle2 size={15} className="text-emerald-500" />,
        bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
        badge: "Commande"
      };
    }

    return {
      icon: <Sparkles size={15} className="text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
      badge: "Info"
    };
  };

  const handleActionClick = (notif: any) => {
    // Mark as read
    if (onMarkRead) {
      onMarkRead(notif.id);
    }

    // Dynamic routing path calculation
    const link = notif.targetUrl || notif.link || notif.eventData?.link || notif.eventData?.zoom_link;
    if (link) {
      if (link.startsWith("http://") || link.startsWith("https://")) {
        window.open(link, "_blank");
      } else if (onNavigate) {
        onNavigate(link);
      } else {
        const cleanHash = link.startsWith("#") ? link : `#${link.replace(/^\/?/, "/")}`;
        window.location.hash = cleanHash;
      }
    }
    setIsOpen(false);
  };

  const filteredNotifs = useMemo(() => {
    const seenIds = new Set<string>();
    return notifications.filter((n) => {
      if (!n || !n.id) return false;
      if (seenIds.has(n.id)) return false;
      seenIds.add(n.id);

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
        className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
        title="Centre de Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-white text-[10px] font-black items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
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
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    NOTIFICATIONS {userRole === "student" ? "(STUDENT)" : `(${userRole.toUpperCase()})`}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                    {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes les notifications sont à jour"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all hover:scale-105 active:scale-95"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={12} />
                  <span>Tout marquer comme lu</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-xs">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                    activeTab === "unread"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
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
                  title="Effacer tout l'historique"
                >
                  <Trash2 size={12} />
                  <span>Effacer</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/60">
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
                  const visual = getNotificationVisual(notif);
                  const locationOrTime = notif.locationOrTime || notif.event_date || notif.eventData?.date || "";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleActionClick(notif)}
                      className={`p-3.5 transition-all relative group flex items-start gap-3 cursor-pointer ${
                        isUnread
                          ? "bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Icon Container */}
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
                        {visual.icon}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${visual.bg}`}>
                              {visual.badge}
                            </span>
                            <h4 className={`text-xs truncate ${isUnread ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300"}`}>
                              {notif.title}
                            </h4>
                          </div>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-1 leading-snug">
                          {notif.message || notif.content}
                        </p>

                        {/* Location or Time Details Badge */}
                        {locationOrTime && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            <MapPin size={10} className="text-slate-400 shrink-0" />
                            <span className="truncate">{locationOrTime}</span>
                          </div>
                        )}

                        {/* Footer & Actions */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatRelativeTime(notif.createdAt)}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteOne(notif.id);
                              }}
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
            <div className="p-2.5 bg-gray-50/80 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 text-center text-[10px] text-gray-400 font-medium">
              A-Zed Info • Notifications en temps réel
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
