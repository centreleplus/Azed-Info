import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { StudentNotification, Notification } from "../types";
import { isStudentTargeted } from "../lib/useRealtimeSync";
import { useAuth } from "../components/AuthContext";

export interface NotificationContextType {
  notifications: StudentNotification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notif: Partial<StudentNotification>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAllRead: (id?: string) => Promise<void>;
  deleteNotification: (id: string) => void;
  deleteOne: (id: string) => Promise<void>;
  clearAll: () => void;
  notifyFileAdded: (fileTitle: string, location?: string, targetGrade?: string, targetSection?: string) => void;
  notifyQuizAdded: (quizTitle: string, trimesterOrSubject?: string, targetGrade?: string, targetSection?: string) => void;
  notifyCalendarEventAdded: (eventTitle: string, dateTime?: string, targetGrade?: string, targetSection?: string) => void;
  notifyShopProductAdded: (productName: string, category?: string, targetGrade?: string) => void;
  notifyCartAdded: (productName: string) => void;
  notifyWishlistAdded: (productName: string) => void;
  notifyOrderConfirmed: (orderRef: string, badgeOrPackStatus?: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  currentUser?: any;
}

// Map types to exact badges
function resolveCategoryBadge(type: StudentNotification['type'], rawBadge?: string): string {
  if (rawBadge && rawBadge.trim()) return rawBadge.trim().toUpperCase();
  switch (type) {
    case 'FILE': return "COURS";
    case 'QUIZ': return "QUIZ";
    case 'CALENDAR': return "CALENDRIER";
    case 'SHOP_NEW': return "BOUTIQUE";
    case 'CART': return "PANIER";
    case 'WISHLIST': return "FAVORIS";
    case 'ORDER': return "COMMANDE";
    default: return "INFO";
  }
}

// Convert arbitrary notification payload to standardized StudentNotification
export function toStudentNotification(raw: any, currentUserId?: string): StudentNotification {
  const rawType = (raw.type || "").toUpperCase();
  let type: StudentNotification['type'] = 'FILE';

  if (rawType.includes('QUIZ') || rawType.includes('EXAM') || rawType.includes('EVALUATION')) {
    type = 'QUIZ';
  } else if (rawType.includes('CALENDAR') || rawType.includes('EVENT') || rawType.includes('LIVE') || rawType.includes('TODO')) {
    type = 'CALENDAR';
  } else if (rawType.includes('SHOP_NEW') || rawType.includes('PRODUCT') || rawType.includes('BOUTIQUE')) {
    type = 'SHOP_NEW';
  } else if (rawType.includes('CART') || rawType.includes('SHOPPING') || rawType.includes('PANIER')) {
    type = 'CART';
  } else if (rawType.includes('WISHLIST') || rawType.includes('FAVORIS')) {
    type = 'WISHLIST';
  } else if (rawType.includes('ORDER') || rawType.includes('COMMANDE') || rawType.includes('PAYMENT')) {
    type = 'ORDER';
  } else {
    type = 'FILE';
  }

  const categoryBadge = resolveCategoryBadge(type, raw.categoryBadge || raw.badge);

  // Determine standard title
  let title = raw.title || "";
  if (!title) {
    switch (type) {
      case 'FILE': title = "Nouveau document disponible"; break;
      case 'QUIZ': title = "Nouvelle évaluation disponible"; break;
      case 'CALENDAR': title = "Nouvel événement à l'agenda"; break;
      case 'SHOP_NEW': title = "Nouveauté dans la boutique"; break;
      case 'CART': title = "Article ajouté au panier"; break;
      case 'WISHLIST': title = "Ajouté aux favoris"; break;
      case 'ORDER': title = "Votre commande a été confirmée"; break;
    }
  }

  // Determine standard message
  const message = raw.message || raw.content || raw.title || "";

  // Determine standard locationOrTime
  let locationOrTime = raw.locationOrTime || raw.location || "";
  if (!locationOrTime) {
    if (raw.event_date || raw.event_time) {
      locationOrTime = [raw.event_date, raw.event_time].filter(Boolean).join(" à ");
    } else if (raw.eventData?.date || raw.eventData?.time) {
      locationOrTime = [raw.eventData.date, raw.eventData.time].filter(Boolean).join(" à ");
    } else if (raw.targetClasse || raw.grade || raw.section) {
      locationOrTime = [raw.targetClasse || raw.grade, raw.targetSpecialite || raw.section].filter(Boolean).join(" - ");
    } else if (type === 'FILE') {
      locationOrTime = "Fiches & cours";
    } else if (type === 'QUIZ') {
      locationOrTime = "Quiz Interactifs";
    } else if (type === 'CALENDAR') {
      locationOrTime = "Agenda des lives";
    } else if (type === 'SHOP_NEW' || type === 'CART' || type === 'WISHLIST') {
      locationOrTime = "Boutique A-Zed";
    } else if (type === 'ORDER') {
      locationOrTime = "Paiement validé";
    }
  }

  // Determine standard targetUrl
  let targetUrl = raw.targetUrl || raw.link || "";
  if (!targetUrl) {
    switch (type) {
      case 'FILE': targetUrl = "#/cours"; break;
      case 'QUIZ': targetUrl = "#/qcm"; break;
      case 'CALENDAR': targetUrl = "#/calendrier"; break;
      case 'SHOP_NEW': targetUrl = "#/shop"; break;
      case 'CART': targetUrl = "#/student/checkout"; break;
      case 'WISHLIST': targetUrl = "#/student/wishlist"; break;
      case 'ORDER': targetUrl = "#/shop"; break;
    }
  }

  const isRead = !!(raw.isRead || raw.read || (Array.isArray(raw.readBy) && currentUserId && raw.readBy.includes(currentUserId)));

  return {
    id: raw.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: raw.studentId || raw.userId || raw.target_user_id || currentUserId || "",
    type,
    categoryBadge,
    title,
    message,
    locationOrTime,
    targetUrl,
    isRead,
    createdAt: raw.createdAt || new Date().toISOString(),
    targetClasse: raw.targetClasse || raw.grade,
    targetSpecialite: raw.targetSpecialite || raw.section,
    targetGroups: raw.targetGroups || raw.target_groups,
    eventData: raw.eventData
  };
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, currentUser: propsUser }) => {
  const { user: authUser } = useAuth();
  const currentUser = propsUser || authUser;
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const userId = currentUser?.id || "";
  const userRole = currentUser?.role || "student";

  const getStorageKey = useCallback(() => {
    return userId ? `AZED_STUDENT_NOTIFS_${userId}` : "AZED_STUDENT_NOTIFS";
  }, [userId]);

  // Fetch and normalize all notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let serverNotifs: any[] = [];
    try {
      const res = await fetch(`/api/notifications/${userId}?role=${encodeURIComponent(userRole.toUpperCase())}&group=ALL`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverNotifs = data;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // Load locally saved notifications
    let localNotifs: any[] = [];
    try {
      const stored = localStorage.getItem(getStorageKey()) || localStorage.getItem("AZED_NOTIFS") || "[]";
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        localNotifs = parsed;
      }
    } catch (e) {}

    // Load deleted notification IDs
    let deletedIdSet = new Set<string>();
    try {
      const deletedIds = JSON.parse(localStorage.getItem(`AZED_DELETED_NOTIFS_${userId}`) || localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      deletedIdSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);
    } catch (e) {}

    const combined: StudentNotification[] = [];
    const seenIds = new Set<string>();

    const processItem = (item: any) => {
      if (!item || !item.id || deletedIdSet.has(item.id)) return;
      if (seenIds.has(item.id)) return;

      const stdNotif = toStudentNotification(item, userId);

      // Private notifications (CART, WISHLIST, ORDER) must match user ID strictly
      if (['CART', 'WISHLIST', 'ORDER'].includes(stdNotif.type)) {
        if (userRole === "agent" || userRole === "admin") return;
        if (stdNotif.studentId && stdNotif.studentId !== userId) return;
      } else if (userRole === "student" && currentUser) {
        // General notifications (FILE, QUIZ, CALENDAR, SHOP_NEW) must match student class/section
        const isTargeted = isStudentTargeted(currentUser, {
          grade: item.targetClasse || item.grade,
          section: item.targetSpecialite || item.section,
          targetGroups: item.targetGroups || item.target_groups
        });
        if (!isTargeted && (item.targetClasse || item.grade)) return;
      }

      seenIds.add(stdNotif.id);
      combined.push(stdNotif);
    };

    [...serverNotifs, ...localNotifs].forEach(processItem);

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifications(combined);
  }, [userId, userRole, currentUser, getStorageKey]);

  // Save changes to localStorage
  const persistLocal = useCallback((items: StudentNotification[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
      localStorage.setItem("AZED_NOTIFS", JSON.stringify(items));
    } catch (e) {}
  }, [getStorageKey]);

  // Initial load and periodic polling (6s)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time Event Listener (WebSockets, Custom Events & Global Event Bus)
  useEffect(() => {
    if (!userId) return;

    // Handler for global bus: app:notification
    const handleGlobalNotification = (e: CustomEvent) => {
      const detail = e.detail;
      if (!detail) return;
      
      const newNotif = toStudentNotification(detail, userId);
      
      // Filter logic according to permissions
      if (['CART', 'WISHLIST', 'ORDER'].includes(newNotif.type)) {
        if (userRole === "agent" || userRole === "admin") return;
        if (newNotif.studentId && newNotif.studentId !== userId) return;
      } else if (userRole === "student" && currentUser) {
        const isTargeted = isStudentTargeted(currentUser, {
          grade: (detail as any).targetClasse || (detail as any).grade,
          section: (detail as any).targetSpecialite || (detail as any).section,
          targetGroups: (detail as any).targetGroups || (detail as any).target_groups
        });
        if (!isTargeted && ((detail as any).targetClasse || (detail as any).grade)) return;
      }

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        const updated = [newNotif, ...prev];
        persistLocal(updated);
        return updated;
      });
    };

    const handleRealtime = (e: CustomEvent) => {
      const msg = e.detail;
      if (!msg) return;

      const actionTypes = [
        "NOTIFICATION_CREATED",
        "NEW_NOTIFICATION",
        "SYNC_EVENT_AND_NOTIF",
        "QUIZ_CREATED",
        "FILE_CREATED",
        "EVENT_CREATED",
        "SHOP_PRODUCT_CREATED",
        "ORDER_CONFIRMED"
      ];

      if (actionTypes.includes(msg.type)) {
        const payload = msg.notification || msg.payload || msg;
        if (payload && payload.title) {
          const newNotif = toStudentNotification(payload, userId);
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            const updated = [newNotif, ...prev];
            persistLocal(updated);
            return updated;
          });
        }
        fetchNotifications();
      }
    };

    window.addEventListener("app:notification", handleGlobalNotification as EventListener);
    window.addEventListener("app-notification", handleGlobalNotification as EventListener);
    window.addEventListener("custom-notification", handleGlobalNotification as EventListener);
    window.addEventListener("realtime-event", handleRealtime as EventListener);
    window.addEventListener("refresh-notifications", fetchNotifications);

    return () => {
      window.removeEventListener("app:notification", handleGlobalNotification as EventListener);
      window.removeEventListener("app-notification", handleGlobalNotification as EventListener);
      window.removeEventListener("custom-notification", handleGlobalNotification as EventListener);
      window.removeEventListener("realtime-event", handleRealtime as EventListener);
      window.removeEventListener("refresh-notifications", fetchNotifications);
    };
  }, [userId, userRole, currentUser, fetchNotifications, persistLocal]);

  // Direct helper to add notification
  const addNotification = useCallback((notif: Partial<StudentNotification>) => {
    if (!userId) return;
    const stdNotif = toStudentNotification({
      ...notif,
      studentId: notif.studentId || userId,
      createdAt: new Date().toISOString(),
      isRead: false
    }, userId);

    setNotifications((prev) => {
      const updated = [stdNotif, ...prev.filter((n) => n.id !== stdNotif.id)];
      persistLocal(updated);
      return updated;
    });

    // Sync to backend
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        target_user_id: stdNotif.studentId,
        target_role: "STUDENT",
        title: stdNotif.title,
        content: stdNotif.message,
        type: stdNotif.type.toLowerCase(),
        link: stdNotif.targetUrl,
        locationOrTime: stdNotif.locationOrTime,
        categoryBadge: stdNotif.categoryBadge
      })
    }).catch(() => {});
  }, [userId, persistLocal]);

  // 1. 📄 Nouveau fichier/document mis en ligne
  const notifyFileAdded = useCallback((fileTitle: string, location: string = "Fiches & cours > Chapitre", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'FILE',
      categoryBadge: "COURS",
      title: "Nouveau document disponible",
      message: `Le document "${fileTitle}" a été mis en ligne dans ${location}.`,
      locationOrTime: location,
      targetUrl: "#/cours",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 2. 📝 Nouveau quiz mis en ligne
  const notifyQuizAdded = useCallback((quizTitle: string, trimesterOrSubject: string = "Quiz Interactifs > 1ER TRIMESTRE", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'QUIZ',
      categoryBadge: "QUIZ",
      title: "Nouvelle évaluation disponible",
      message: `L'évaluation "${quizTitle}" est accessible pour votre entraînement.`,
      locationOrTime: trimesterOrSubject,
      targetUrl: "#/qcm",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 3. 📅 Événement / Tâche au calendrier
  const notifyCalendarEventAdded = useCallback((eventTitle: string, dateTime: string = "Prochainement", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'CALENDAR',
      categoryBadge: "CALENDRIER",
      title: "Nouvel événement à l'agenda",
      message: `La session live / devoir "${eventTitle}" a été planifiée.`,
      locationOrTime: dateTime,
      targetUrl: "#/calendrier",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 4. 🛒 Nouvel article ajouté à la boutique
  const notifyShopProductAdded = useCallback((productName: string, category: string = "Boutique", targetGrade?: string) => {
    addNotification({
      type: 'SHOP_NEW',
      categoryBadge: "BOUTIQUE",
      title: "Nouveauté dans la boutique",
      message: `Le pack "${productName}" (${category}) est maintenant disponible en boutique.`,
      locationOrTime: category,
      targetUrl: "#/shop",
      targetClasse: targetGrade
    });
  }, [addNotification]);

  // 5. 🛍️ Article ajouté au panier
  const notifyCartAdded = useCallback((productName: string) => {
    addNotification({
      type: 'CART',
      categoryBadge: "PANIER",
      studentId: userId,
      title: "Article ajouté au panier",
      message: `Le pack "${productName}" a été ajouté à votre panier.`,
      locationOrTime: "Boutique A-Zed",
      targetUrl: "#/student/checkout"
    });
  }, [addNotification, userId]);

  // 6. ❤️ Article ajouté à la liste de souhaits
  const notifyWishlistAdded = useCallback((productName: string) => {
    addNotification({
      type: 'WISHLIST',
      categoryBadge: "FAVORIS",
      studentId: userId,
      title: "Ajouté aux favoris",
      message: `"${productName}" a été enregistré dans votre liste de souhaits.`,
      locationOrTime: "Liste d'envies",
      targetUrl: "#/student/wishlist"
    });
  }, [addNotification, userId]);

  // 7. ✅ Commande confirmée / Transaction enregistrée
  const notifyOrderConfirmed = useCallback((orderRef: string, badgeOrPackStatus: string = "Validation en cours") => {
    addNotification({
      type: 'ORDER',
      categoryBadge: "COMMANDE",
      studentId: userId,
      title: "Votre commande a été confirmée",
      message: `Votre transaction n° ${orderRef} a été enregistrée avec succès. Statut : ${badgeOrPackStatus}.`,
      locationOrTime: `Réf: ${orderRef}`,
      targetUrl: "#/shop"
    });
  }, [addNotification, userId]);

  // Mark single as read
  const markAsRead = useCallback((id: string) => {
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      persistLocal(updated);
      return updated;
    });

    fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ userId, notificationId: id })
    }).catch(() => {});
  }, [userId, persistLocal]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      persistLocal(updated);
      return updated;
    });

    fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ userId })
    }).catch(() => {});
  }, [userId, persistLocal]);

  const markAllRead = useCallback(async (id?: string) => {
    if (id) {
      markAsRead(id);
    } else {
      markAllAsRead();
    }
  }, [markAsRead, markAllAsRead]);

  // Delete single notification without reloading
  const deleteNotification = useCallback((id: string) => {
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persistLocal(updated);
      return updated;
    });

    try {
      const deletedKey = `AZED_DELETED_NOTIFS_${userId}`;
      const currentDeleted = JSON.parse(localStorage.getItem(deletedKey) || localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      const updatedDeleted = Array.from(new Set([...currentDeleted, id]));
      localStorage.setItem(deletedKey, JSON.stringify(updatedDeleted));
      localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
      fetch(`/api/notifications/${userId}/${id}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  }, [userId, persistLocal]);

  const deleteOne = useCallback(async (id: string) => {
    deleteNotification(id);
  }, [deleteNotification]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    if (!userId) return;
    const idsToDelete = notifications.map((n) => n.id);
    setNotifications([]);
    persistLocal([]);

    try {
      const deletedKey = `AZED_DELETED_NOTIFS_${userId}`;
      const currentDeleted = JSON.parse(localStorage.getItem(deletedKey) || localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      const updatedDeleted = Array.from(new Set([...currentDeleted, ...idsToDelete]));
      localStorage.setItem(deletedKey, JSON.stringify(updatedDeleted));
      localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
      fetch(`/api/notifications/${userId}?role=${encodeURIComponent(userRole.toUpperCase())}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  }, [userId, userRole, notifications, persistLocal]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        markAllRead,
        deleteNotification,
        deleteOne,
        clearAll,
        notifyFileAdded,
        notifyQuizAdded,
        notifyCalendarEventAdded,
        notifyShopProductAdded,
        notifyCartAdded,
        notifyWishlistAdded,
        notifyOrderConfirmed,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const useNotificationContext = useNotifications;

/**
 * Global helper to dispatch notifications from any component without needing the React hook.
 */
export function dispatchGlobalNotification(notif: Partial<StudentNotification> | any) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:notification", { detail: notif }));
  }
}

