import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { StudentNotification, Notification } from "../types";
import { isStudentTargeted } from "../lib/useRealtimeSync";
import { useAuth } from "../components/AuthContext";

export interface NotificationContextType {
  notifications: StudentNotification[];
  unreadCount: number;
  loading: boolean;
  markAllRead: (id?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteOne: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notif: Partial<StudentNotification>) => void;
  notifyFileAdded: (fileTitle: string, location: string, targetGrade?: string, targetSection?: string) => void;
  notifyQuizAdded: (quizTitle: string, trimesterOrSubject: string, targetGrade?: string, targetSection?: string) => void;
  notifyCalendarEventAdded: (eventTitle: string, dateTime: string, targetGrade?: string, targetSection?: string) => void;
  notifyShopProductAdded: (productName: string, category: string, targetGrade?: string) => void;
  notifyCartAdded: (productName: string) => void;
  notifyWishlistAdded: (productName: string) => void;
  notifyOrderConfirmed: (orderRef: string, badgeOrPackStatus: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  currentUser?: any;
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

  // Determine standard title
  let title = raw.title || "";
  if (!title) {
    switch (type) {
      case 'FILE': title = "Un nouveau document est disponible !"; break;
      case 'QUIZ': title = "Nouvelle évaluation disponible !"; break;
      case 'CALENDAR': title = "Nouvel événement ajouté à votre agenda !"; break;
      case 'SHOP_NEW': title = "Nouveauté dans la boutique !"; break;
      case 'CART': title = "Article ajouté à votre panier"; break;
      case 'WISHLIST': title = "Ajouté à votre liste de souhaits"; break;
      case 'ORDER': title = "Votre commande a été confirmée !"; break;
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
      locationOrTime = "Quiz interactif";
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

export function NotificationProvider({ children, currentUser: propsUser }: NotificationProviderProps) {
  const { user: authUser } = useAuth();
  const currentUser = propsUser || authUser;
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const userId = currentUser?.id || "";
  const userRole = currentUser?.role || "student";

  const getStorageKey = useCallback(() => {
    return userId ? `AZED_NOTIFS_${userId}` : "AZED_NOTIFS";
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
      // Offline / fallback
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

      // Filtering for student target audience
      const stdNotif = toStudentNotification(item, userId);

      // Private notifications (CART, WISHLIST, ORDER) must match user ID strictly
      if (['CART', 'WISHLIST', 'ORDER'].includes(stdNotif.type)) {
        if (userRole === "agent" || userRole === "admin") return;
        if (stdNotif.studentId && stdNotif.studentId !== userId) return;
      } else if (userRole === "student" && currentUser) {
        // General notifications (FILE, QUIZ, CALENDAR, SHOP_NEW) must match grade/section
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

  // Initial load and periodic polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time Event Listener (WebSockets & Custom Events)
  useEffect(() => {
    if (!userId) return;

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
            return [newNotif, ...prev];
          });
        }
        fetchNotifications();
      }
    };

    window.addEventListener("realtime-event", handleRealtime as EventListener);
    window.addEventListener("refresh-notifications", fetchNotifications);

    return () => {
      window.removeEventListener("realtime-event", handleRealtime as EventListener);
      window.removeEventListener("refresh-notifications", fetchNotifications);
    };
  }, [userId, fetchNotifications]);

  // Save changes to localStorage
  const persistLocal = useCallback((items: StudentNotification[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
      localStorage.setItem("AZED_NOTIFS", JSON.stringify(items));
    } catch (e) {}
  }, [getStorageKey]);

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

    // Sync to backend if possible
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
        locationOrTime: stdNotif.locationOrTime
      })
    }).catch(() => {});
  }, [userId, persistLocal]);

  // 1. 📄 Nouveau fichier/document mis en ligne
  const notifyFileAdded = useCallback((fileTitle: string, location: string = "Fiches & cours", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'FILE',
      title: "Un nouveau document est disponible !",
      message: `Le document "${fileTitle}" a été publié dans "${location}".`,
      locationOrTime: location,
      targetUrl: "#/cours",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 2. 📝 Nouveau quiz mis en ligne
  const notifyQuizAdded = useCallback((quizTitle: string, trimesterOrSubject: string = "Quiz interactif", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'QUIZ',
      title: "Nouvelle évaluation disponible !",
      message: `L'évaluation "${quizTitle}" est désormais accessible.`,
      locationOrTime: trimesterOrSubject,
      targetUrl: "#/qcm",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 3. 📅 Événement / Tâche ajouté au calendrier
  const notifyCalendarEventAdded = useCallback((eventTitle: string, dateTime: string = "Prochainement", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'CALENDAR',
      title: "Nouvel événement ajouté à votre agenda !",
      message: `Une nouvelle session live ou tâche "${eventTitle}" a été planifiée.`,
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
      title: "Nouveauté dans la boutique !",
      message: `Le produit "${productName}" (${category}) est maintenant disponible en boutique.`,
      locationOrTime: category,
      targetUrl: "#/shop",
      targetClasse: targetGrade
    });
  }, [addNotification]);

  // 5. 🛍️ Article ajouté au panier
  const notifyCartAdded = useCallback((productName: string) => {
    addNotification({
      type: 'CART',
      studentId: userId,
      title: "Article ajouté à votre panier",
      message: `Vous avez ajouté "${productName}" à votre panier de commande.`,
      locationOrTime: "Boutique A-Zed",
      targetUrl: "#/student/checkout"
    });
  }, [addNotification, userId]);

  // 6. ❤️ Article ajouté à la liste de souhaits
  const notifyWishlistAdded = useCallback((productName: string) => {
    addNotification({
      type: 'WISHLIST',
      studentId: userId,
      title: "Ajouté à votre liste de souhaits",
      message: `"${productName}" a été enregistré dans votre liste de souhaits.`,
      locationOrTime: "Liste d'envies",
      targetUrl: "#/student/wishlist"
    });
  }, [addNotification, userId]);

  // 7. ✅ Commande confirmée
  const notifyOrderConfirmed = useCallback((orderRef: string, badgeOrPackStatus: string = "Activation en cours") => {
    addNotification({
      type: 'ORDER',
      studentId: userId,
      title: "Votre commande a été confirmée !",
      message: `Votre commande n° ${orderRef} a été validée avec succès. Statut : ${badgeOrPackStatus}.`,
      locationOrTime: `Réf: ${orderRef}`,
      targetUrl: "#/shop"
    });
  }, [addNotification, userId]);

  // Mark one or all notifications as read
  const markAllRead = useCallback(async (id?: string) => {
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (!id || n.id === id) {
          return { ...n, isRead: true };
        }
        return n;
      });
      persistLocal(updated);
      return updated;
    });

    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ userId, notificationId: id })
      });
    } catch (e) {}
  }, [userId, persistLocal]);

  const markAsRead = useCallback(async (id: string) => {
    return markAllRead(id);
  }, [markAllRead]);

  // Delete single notification
  const deleteOne = useCallback(async (id: string) => {
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
      await fetch(`/api/notifications/${userId}/${id}`, { method: "DELETE" });
    } catch (e) {}
  }, [userId, persistLocal]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
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
      await fetch(`/api/notifications/${userId}?role=${encodeURIComponent(userRole.toUpperCase())}`, { method: "DELETE" });
    } catch (e) {}
  }, [userId, userRole, notifications, persistLocal]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAllRead,
        markAsRead,
        deleteOne,
        clearAll,
        addNotification,
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
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
