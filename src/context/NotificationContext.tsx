import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
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

// Strict security filter: ensures NO administrative, agent, or system/technical notification leaks into the student dashboard
export function isStrictlyStudentSafeNotification(raw: any): boolean {
  if (!raw || typeof raw !== "object") return false;

  const targetRole = String(raw.target_role || raw.targetRole || "").toUpperCase().trim();
  if (targetRole === "ADMIN" || targetRole === "AGENT" || targetRole === "SUPER_ADMIN" || targetRole === "TEACHER") {
    return false;
  }

  const rawUserId = String(raw.userId || raw.target_user_id || "").toLowerCase().trim();
  if (rawUserId === "usr_admin" || rawUserId === "usr_admin_center" || rawUserId.startsWith("usr_agent")) {
    return false;
  }

  const rawType = String(raw.type || "").toLowerCase().trim();
  const forbiddenTypes = [
    "commission_deducted",
    "commission",
    "audit",
    "system_admin",
    "admin_alert",
    "security_log",
    "telemetry"
  ];
  if (forbiddenTypes.includes(rawType)) {
    return false;
  }

  // Block admin/agent password reset requests (only allow if explicitly targeted to a specific student id)
  if (rawType === "password_reset" && (!rawUserId || targetRole !== "STUDENT")) {
    return false;
  }

  const link = String(raw.targetUrl || raw.link || "").toLowerCase().trim();
  if (link.startsWith("/admin") || link.startsWith("#/admin") || link.startsWith("/agent") || link.startsWith("#/agent")) {
    return false;
  }

  const titleAndContent = `${raw.title || ""} ${raw.message || ""} ${raw.content || ""}`.toLowerCase();
  const forbiddenKeywords = [
    "nouvelle commande marketplace",
    "commission annulée",
    "demande d'avance/retrait",
    "demande de retrait",
    "demande de mot de passe élève",
    "alerte expiration admin",
    "abonnement expiré (admin)",
    "validation requise"
  ];
  if (forbiddenKeywords.some((kw) => titleAndContent.includes(kw))) {
    return false;
  }

  return true;
}

// Convert arbitrary notification payload to standardized StudentNotification for the 7 triggers
export function toStudentNotification(raw: any, currentUserId?: string): StudentNotification {
  const rawType = String(raw.type || "").toUpperCase();
  const rawTitle = String(raw.title || "");
  const rawTitleLower = rawTitle.toLowerCase();
  let type: StudentNotification['type'] = 'FILE';

  if (
    rawType.includes('QUIZ') ||
    rawType.includes('EXAM') ||
    rawType.includes('EVALUATION') ||
    rawType.includes('QCM') ||
    rawTitleLower.includes('quiz') ||
    rawTitleLower.includes('évaluation') ||
    rawTitleLower.includes('qcm')
  ) {
    type = 'QUIZ';
  } else if (
    rawType.includes('CALENDAR') ||
    rawType.includes('EVENT') ||
    rawType.includes('LIVE') ||
    rawType.includes('TODO') ||
    rawType.includes('HOMEWORK') ||
    rawTitleLower.includes('séance') ||
    rawTitleLower.includes('calendrier') ||
    rawTitleLower.includes('agenda') ||
    rawTitleLower.includes('tâche') ||
    rawTitleLower.includes('devoir assigné')
  ) {
    type = 'CALENDAR';
  } else if (
    rawType.includes('SHOP_NEW') ||
    rawType.includes('PRODUCT') ||
    rawType.includes('BOUTIQUE') ||
    rawTitleLower.includes('nouveauté dans la boutique') ||
    rawTitleLower.includes('nouvel article')
  ) {
    type = 'SHOP_NEW';
  } else if (
    rawType.includes('CART') ||
    rawType.includes('SHOPPING') ||
    rawType.includes('PANIER') ||
    rawTitleLower.includes('panier')
  ) {
    type = 'CART';
  } else if (
    rawType.includes('WISHLIST') ||
    rawType.includes('FAVORIS') ||
    rawTitleLower.includes('souhaits') ||
    rawTitleLower.includes('favoris')
  ) {
    type = 'WISHLIST';
  } else if (
    rawType.includes('ORDER') ||
    rawType.includes('COMMANDE') ||
    rawType.includes('PAYMENT') ||
    rawTitleLower.includes('commande') ||
    rawTitleLower.includes('transaction')
  ) {
    type = 'ORDER';
  } else {
    type = 'FILE';
  }

  const categoryBadge = resolveCategoryBadge(type, raw.categoryBadge || raw.badge);

  // Determine standard title
  let title = raw.title || "";
  if (!title) {
    switch (type) {
      case 'FILE': title = "Nouveau fichier mis en ligne"; break;
      case 'QUIZ': title = "Nouveau quiz mis en ligne"; break;
      case 'CALENDAR': title = "Nouvelle tâche / événement calendrier"; break;
      case 'SHOP_NEW': title = "Nouvel article ajouté à la boutique"; break;
      case 'CART': title = "Article ajouté au panier"; break;
      case 'WISHLIST': title = "Article ajouté à la liste de souhaits"; break;
      case 'ORDER': title = "Confirmation de commande"; break;
    }
  }

  // Determine standard message
  const message = raw.message || raw.content || raw.title || "";

  // Determine explicit location (emplacement) or scheduled time (heure prévue)
  let locationOrTime = raw.locationOrTime || raw.location || "";
  if (!locationOrTime) {
    if (type === 'CALENDAR') {
      if (raw.time && raw.date) {
        locationOrTime = `Heure prévue : ${raw.date} à ${raw.time}`;
      } else if (raw.event_date || raw.event_time) {
        locationOrTime = `Heure prévue : ${[raw.event_date, raw.event_time].filter(Boolean).join(" à ")}`;
      } else if (raw.eventData?.date || raw.eventData?.time) {
        locationOrTime = `Heure prévue : ${[raw.eventData.date, raw.eventData.time].filter(Boolean).join(" à ")}`;
      } else if (raw.time) {
        locationOrTime = `Heure prévue : ${raw.time}`;
      } else {
        locationOrTime = "Heure prévue : Agenda & Calendrier";
      }
    } else if (raw.event_date || raw.event_time) {
      locationOrTime = [raw.event_date, raw.event_time].filter(Boolean).join(" à ");
    } else if (raw.eventData?.date || raw.eventData?.time) {
      locationOrTime = [raw.eventData.date, raw.eventData.time].filter(Boolean).join(" à ");
    } else if (raw.module || raw.chapterTitle || raw.trimester || raw.trimestre) {
      locationOrTime = [raw.category || "Fiches & cours", raw.trimester || raw.trimestre, raw.module || raw.chapterTitle].filter(Boolean).join(" • ");
    } else if (raw.targetClasse || raw.grade || raw.section) {
      locationOrTime = [raw.targetClasse || raw.grade, raw.targetSpecialite || raw.section].filter(Boolean).join(" - ");
    } else if (type === 'FILE') {
      locationOrTime = "Emplacement : Fiches & cours";
    } else if (type === 'QUIZ') {
      locationOrTime = "Emplacement : Quiz Interactifs";
    } else if (type === 'SHOP_NEW') {
      locationOrTime = "Emplacement : Boutique A-Zed";
    } else if (type === 'CART') {
      locationOrTime = "Emplacement : Mon Panier";
    } else if (type === 'WISHLIST') {
      locationOrTime = "Emplacement : Liste de souhaits";
    } else if (type === 'ORDER') {
      locationOrTime = "Statut : Commande enregistrée";
    }
  } else if (type === 'CALENDAR' && !locationOrTime.toLowerCase().includes('heure') && (raw.time || raw.event_time || raw.eventData?.time)) {
    const scheduledTime = raw.time || raw.event_time || raw.eventData?.time;
    const scheduledDate = raw.date || raw.event_date || raw.eventData?.date;
    locationOrTime = `Heure prévue : ${[scheduledDate, scheduledTime].filter(Boolean).join(" à ")}`;
  }

  // Determine standard targetUrl
  let targetUrl = raw.targetUrl || raw.link || "";
  if (!targetUrl) {
    switch (type) {
      case 'FILE': targetUrl = "#/student/courses"; break;
      case 'QUIZ': targetUrl = "#/qcm"; break;
      case 'CALENDAR': targetUrl = "#/calendrier"; break;
      case 'SHOP_NEW': targetUrl = "#/shop"; break;
      case 'CART': targetUrl = "#/student/checkout"; break;
      case 'WISHLIST': targetUrl = "#/student/wishlist"; break;
      case 'ORDER': targetUrl = "#/shop"; break;
    }
  }

  const isRead = !!(raw.isRead || raw.read || (Array.isArray(raw.readBy) && currentUserId && raw.readBy.includes(currentUserId)));

  // Normalize createdAt ISO string (handling HH:mm timestamp if from studentNotifications)
  let createdAtIso = raw.createdAt || raw.created_at || "";
  if (!createdAtIso || isNaN(new Date(createdAtIso).getTime())) {
    createdAtIso = new Date().toISOString();
  }

  return {
    id: String(raw.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    studentId: String(raw.studentId || raw.userId || raw.target_user_id || currentUserId || ""),
    type,
    categoryBadge,
    title,
    message,
    locationOrTime,
    targetUrl,
    isRead,
    createdAt: createdAtIso,
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

  const userId = String(currentUser?.id || "");
  const userRole = String(currentUser?.role || "student").toLowerCase();
  const userGrade = String(currentUser?.grade || "");
  const userSection = String(currentUser?.section || "");
  const userStudyGroup = String((currentUser as any)?.study_group || (currentUser as any)?.groupe_etude || "");

  const getStorageKey = useCallback(() => {
    return userId ? `AZED_STUDENT_NOTIFS_${userId}` : "AZED_STUDENT_NOTIFS";
  }, [userId]);

  const getDeletedKey = useCallback(() => {
    return userId ? `AZED_DELETED_NOTIFS_${userId}` : "AZED_DELETED_NOTIFS";
  }, [userId]);

  // Save changes to localStorage
  const persistLocal = useCallback((items: StudentNotification[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
      if (userRole === "student") {
        localStorage.setItem("AZED_NOTIFS", JSON.stringify(items));
      }
    } catch (e) {}
  }, [getStorageKey, userRole]);

  // Fetch and normalize all notifications (used on mount, on realtime events, and by 30s AJAX polling fallback)
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let serverNotifs: any[] = [];
    let studentEndpointNotifs: any[] = [];

    try {
      const [resMain, resStudent] = await Promise.allSettled([
        fetch(`/api/notifications/${encodeURIComponent(userId)}?role=${encodeURIComponent(userRole.toUpperCase())}&group=ALL`),
        userRole === "student"
          ? fetch(`/api/student/notifications?studentId=${encodeURIComponent(userId)}`, {
              headers: { "x-user-id": userId }
            })
          : Promise.resolve(null)
      ]);

      if (resMain.status === "fulfilled" && resMain.value && resMain.value.ok) {
        const data = await resMain.value.json();
        if (Array.isArray(data)) {
          serverNotifs = data;
        }
      }

      if (resStudent.status === "fulfilled" && resStudent.value && resStudent.value.ok) {
        const sData = await resStudent.value.json();
        if (sData && Array.isArray(sData.notifications)) {
          studentEndpointNotifs = sData.notifications;
        } else if (Array.isArray(sData)) {
          studentEndpointNotifs = sData;
        }
      }
    } catch {
      // Offline / fallback handled gracefully
    }

    // Load locally saved notifications
    let localNotifs: any[] = [];
    try {
      const storedUser = localStorage.getItem(getStorageKey());
      const storedGlobal = localStorage.getItem("AZED_NOTIFS");
      const parsedUser = storedUser ? JSON.parse(storedUser) : [];
      const parsedGlobal = storedGlobal ? JSON.parse(storedGlobal) : [];
      localNotifs = [
        ...(Array.isArray(parsedUser) ? parsedUser : []),
        ...(Array.isArray(parsedGlobal) ? parsedGlobal : [])
      ];
    } catch (e) {}

    // Load deleted notification IDs
    let deletedIdSet = new Set<string>();
    try {
      const deletedUser = JSON.parse(localStorage.getItem(getDeletedKey()) || "[]");
      const deletedGlobal = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      deletedIdSet = new Set([
        ...(Array.isArray(deletedUser) ? deletedUser : []),
        ...(Array.isArray(deletedGlobal) ? deletedGlobal : [])
      ]);
    } catch (e) {}

    const combined: StudentNotification[] = [];
    const seenIds = new Set<string>();
    const seenFingerprints = new Set<string>();
    const studentProfile = { grade: userGrade, section: userSection, study_group: userStudyGroup };

    const processItem = (item: any) => {
      if (!item || !item.id) return;
      const itemId = String(item.id);
      if (deletedIdSet.has(itemId) || seenIds.has(itemId)) return;
      if (Array.isArray(item.deletedBy) && item.deletedBy.includes(userId)) return;

      // Strict isolation for student space: never allow admin/agent/system notifications
      if (userRole === "student" && !isStrictlyStudentSafeNotification(item)) {
        return;
      }

      const stdNotif = toStudentNotification(item, userId);

      // Private notifications (CART, WISHLIST, ORDER) must match user ID strictly
      if (['CART', 'WISHLIST', 'ORDER'].includes(stdNotif.type)) {
        if (userRole === "agent" || userRole === "admin") return;
        if (stdNotif.studentId && stdNotif.studentId !== "all" && stdNotif.studentId !== userId) return;
      } else if (userRole === "student") {
        // General notifications (FILE, QUIZ, CALENDAR, SHOP_NEW) must match student class/section if specified
        const targetGradeVal = item.targetClasse || item.grade;
        const targetSectionVal = item.targetSpecialite || item.section;
        const targetGroupsVal = item.targetGroups || item.target_groups;
        if (targetGradeVal || targetSectionVal || targetGroupsVal) {
          const isTargeted = isStudentTargeted(studentProfile, {
            grade: targetGradeVal,
            section: targetSectionVal,
            targetGroups: targetGroupsVal
          });
          if (!isTargeted && targetGradeVal) return;
        }
      }

      // Deduplicate dual-dispatched notifications (e.g. db.notifications + db.studentNotifications for same upload)
      const fingerprint = `${stdNotif.type}::${stdNotif.title.trim().toLowerCase()}::${stdNotif.locationOrTime.trim().toLowerCase()}`;
      if (seenFingerprints.has(fingerprint)) {
        return;
      }

      seenIds.add(stdNotif.id);
      seenFingerprints.add(fingerprint);
      combined.push(stdNotif);
    };

    [...serverNotifs, ...studentEndpointNotifs, ...localNotifs].forEach(processItem);

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifications(combined);
  }, [userId, userRole, userGrade, userSection, userStudyGroup, getStorageKey, getDeletedKey]);

  // Initial fetch + Asynchronous 30-second AJAX Polling Fallback (non-blocking)
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    // Periodic 30-second AJAX polling fallback so notifications stay synced even if WebSocket drops
    const pollingInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [userId, fetchNotifications]);

  // Direct helper to add notification (used by triggers 1-7)
  const addNotification = useCallback((notif: Partial<StudentNotification>) => {
    if (!userId) return;
    if (userRole === "student" && !isStrictlyStudentSafeNotification(notif)) return;

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

    // Sync to backend asynchronously without blocking UI
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        target_user_id: stdNotif.studentId,
        target_role: "STUDENT",
        title: stdNotif.title,
        content: stdNotif.message,
        message: stdNotif.message,
        type: stdNotif.type,
        link: stdNotif.targetUrl,
        locationOrTime: stdNotif.locationOrTime,
        categoryBadge: stdNotif.categoryBadge
      })
    }).catch(() => {});
  }, [userId, userRole, persistLocal]);

  // 1. 📄 Nouveau fichier/document mis en ligne
  const notifyFileAdded = useCallback((fileTitle: string, location: string = "Fiches & cours > Chapitre", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'FILE',
      categoryBadge: "COURS",
      title: `Nouveau fichier mis en ligne : ${fileTitle}`,
      message: `Le document "${fileTitle}" a été mis en ligne dans ${location}.`,
      locationOrTime: `Emplacement : ${location}`,
      targetUrl: "#/student/courses",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 2. 📝 Nouveau quiz mis en ligne
  const notifyQuizAdded = useCallback((quizTitle: string, trimesterOrSubject: string = "Quiz Interactifs > 1er Trimestre", targetGrade?: string, targetSection?: string) => {
    addNotification({
      type: 'QUIZ',
      categoryBadge: "QUIZ",
      title: `Nouveau quiz mis en ligne : ${quizTitle}`,
      message: `L'évaluation "${quizTitle}" est disponible dans ${trimesterOrSubject}.`,
      locationOrTime: `Emplacement : ${trimesterOrSubject}`,
      targetUrl: "#/qcm",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 3. 📅 Nouvelle tâche / Nouvel événement calendrier
  const notifyCalendarEventAdded = useCallback((eventTitle: string, dateTime: string = "Prochainement", targetGrade?: string, targetSection?: string) => {
    const formattedTime = dateTime.toLowerCase().includes("heure") ? dateTime : `Heure prévue : ${dateTime}`;
    addNotification({
      type: 'CALENDAR',
      categoryBadge: "CALENDRIER",
      title: `Nouvel événement calendrier : ${eventTitle}`,
      message: `La tâche / séance "${eventTitle}" a été planifiée (${formattedTime}).`,
      locationOrTime: formattedTime,
      targetUrl: "#/calendrier",
      targetClasse: targetGrade,
      targetSpecialite: targetSection
    });
  }, [addNotification]);

  // 4. 🛒 Nouvel article ajouté à la boutique
  const notifyShopProductAdded = useCallback((productName: string, category: string = "Boutique A-Zed", targetGrade?: string) => {
    addNotification({
      type: 'SHOP_NEW',
      categoryBadge: "BOUTIQUE",
      title: `Nouvel article en boutique : ${productName}`,
      message: `L'article "${productName}" est maintenant disponible dans la boutique (${category}).`,
      locationOrTime: `Emplacement : Boutique • ${category}`,
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
      title: `Article ajouté au panier : ${productName}`,
      message: `L'article "${productName}" a été ajouté à votre panier.`,
      locationOrTime: "Emplacement : Mon Panier",
      targetUrl: "#/student/checkout"
    });
  }, [addNotification, userId]);

  // 6. ❤️ Article ajouté à la liste de souhaits
  const notifyWishlistAdded = useCallback((productName: string) => {
    addNotification({
      type: 'WISHLIST',
      categoryBadge: "FAVORIS",
      studentId: userId,
      title: `Ajouté à la liste de souhaits : ${productName}`,
      message: `L'article "${productName}" a été enregistré dans votre liste de souhaits.`,
      locationOrTime: "Emplacement : Liste de souhaits",
      targetUrl: "#/student/wishlist"
    });
  }, [addNotification, userId]);

  // 7. ✅ Confirmation de commande
  const notifyOrderConfirmed = useCallback((orderRef: string, badgeOrPackStatus: string = "Confirmée") => {
    addNotification({
      type: 'ORDER',
      categoryBadge: "COMMANDE",
      studentId: userId,
      title: `Confirmation de commande : #${orderRef}`,
      message: `Votre commande n° ${orderRef} a bien été confirmée (${badgeOrPackStatus}).`,
      locationOrTime: `Statut : ${badgeOrPackStatus}`,
      targetUrl: "#/shop"
    });
  }, [addNotification, userId]);

  // Real-time Event Listener (WebSockets, Custom Events & Global Event Bus)
  useEffect(() => {
    if (!userId) return;

    const insertIncomingNotif = (rawPayload: any) => {
      if (!rawPayload) return;
      if (userRole === "student" && !isStrictlyStudentSafeNotification(rawPayload)) {
        return;
      }

      // Check deleted set so deleted notifications never reappear
      try {
        const deletedIds = JSON.parse(localStorage.getItem(getDeletedKey()) || "[]");
        if (Array.isArray(deletedIds) && rawPayload.id && deletedIds.includes(String(rawPayload.id))) {
          return;
        }
      } catch {}

      const newNotif = toStudentNotification(rawPayload, userId);

      if (['CART', 'WISHLIST', 'ORDER'].includes(newNotif.type)) {
        if (userRole === "agent" || userRole === "admin") return;
        if (newNotif.studentId && newNotif.studentId !== "all" && newNotif.studentId !== userId) return;
      } else if (userRole === "student") {
        const targetGradeVal = rawPayload.targetClasse || rawPayload.grade;
        const targetSectionVal = rawPayload.targetSpecialite || rawPayload.section;
        const targetGroupsVal = rawPayload.targetGroups || rawPayload.target_groups;
        if (targetGradeVal || targetSectionVal || targetGroupsVal) {
          const isTargeted = isStudentTargeted(
            { grade: userGrade, section: userSection, study_group: userStudyGroup },
            {
              grade: targetGradeVal,
              section: targetSectionVal,
              targetGroups: targetGroupsVal
            }
          );
          if (!isTargeted && targetGradeVal) return;
        }
      }

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        const updated = [newNotif, ...prev];
        persistLocal(updated);
        return updated;
      });
    };

    // Handler for global bus: app:notification
    const handleGlobalNotification = (e: CustomEvent) => {
      insertIncomingNotif(e.detail);
    };

    // Handler for WebSocket / BroadcastChannel realtime events covering all 7 triggers
    const handleRealtime = (e: CustomEvent) => {
      const msg = e.detail;
      if (!msg || typeof msg !== "object") return;

      // Direct notification payload
      if (
        msg.type === "NOTIFICATION_CREATED" ||
        msg.type === "NEW_NOTIFICATION" ||
        msg.type === "SYNC_EVENT_AND_NOTIF"
      ) {
        if (Array.isArray(msg.target_user_ids) && msg.target_user_ids.length > 0 && !msg.target_user_ids.includes(userId)) {
          return;
        }
        const payload = msg.notification || msg.payload || (Array.isArray(msg.notifications) ? msg.notifications[0] : null);
        if (payload && payload.title) {
          insertIncomingNotif(payload);
        }
        fetchNotifications();
        return;
      }

      // Trigger 1: Nouveau fichier mis en ligne
      if (msg.type === "DOCUMENT_CREATED" || msg.type === "FILE_CREATED") {
        const doc = msg.document || msg.course || msg.payload;
        if (doc && doc.title) {
          const loc = [doc.category || "Fiches & cours", doc.trimester || doc.trimestre, doc.chapterTitle || doc.module].filter(Boolean).join(" • ");
          insertIncomingNotif({
            id: `notif_file_${doc.id || Date.now()}`,
            type: "FILE",
            categoryBadge: "COURS",
            title: `Nouveau fichier mis en ligne : ${doc.title}`,
            message: `Le fichier "${doc.title}" a été mis en ligne dans ${loc || "Fiches & cours"}.`,
            locationOrTime: `Emplacement : ${loc || "Fiches & cours"}`,
            targetUrl: "#/student/courses",
            targetClasse: doc.grade,
            targetSpecialite: doc.section,
            createdAt: doc.createdAt || new Date().toISOString()
          });
        }
        fetchNotifications();
        return;
      }

      // Trigger 2: Nouveau quiz mis en ligne
      if (msg.type === "QUIZ_CREATED") {
        const qz = msg.quiz || msg.payload;
        if (msg.notification) {
          insertIncomingNotif(msg.notification);
        } else if (qz && qz.title) {
          const loc = [qz.trimestre || "1er Trimestre", qz.chapterTitle || "Quiz Interactifs"].filter(Boolean).join(" • ");
          insertIncomingNotif({
            id: `notif_quiz_${qz.id || Date.now()}`,
            type: "QUIZ",
            categoryBadge: "QUIZ",
            title: `Nouveau quiz mis en ligne : ${qz.title}`,
            message: `Le quiz "${qz.title}" est disponible dans ${loc}.`,
            locationOrTime: `Emplacement : ${loc}`,
            targetUrl: "#/qcm",
            targetClasse: qz.grade,
            targetSpecialite: qz.section,
            createdAt: qz.createdAt || new Date().toISOString()
          });
        }
        fetchNotifications();
        return;
      }

      // Trigger 3: Nouvelle tâche / Nouvel événement calendrier
      if (msg.type === "EVENT_CREATED" || msg.type === "TODO_CREATED") {
        const evt = msg.event || msg.todo || (Array.isArray(msg.events) ? msg.events[0] : null);
        if (evt) {
          const evtTitle = evt.title || evt.name || "Événement calendrier";
          const evtDate = evt.date || evt.dueDate || "";
          const evtTime = evt.time || evt.hour || "";
          const scheduledStr = [evtDate, evtTime].filter(Boolean).join(" à ");
          insertIncomingNotif({
            id: `notif_cal_${evt.id || Date.now()}`,
            type: "CALENDAR",
            categoryBadge: "CALENDRIER",
            title: `${msg.type === "TODO_CREATED" ? "Nouvelle tâche" : "Nouvel événement calendrier"} : ${evtTitle}`,
            message: `Planifié pour ${scheduledStr || "prochainement"}.`,
            locationOrTime: `Heure prévue : ${scheduledStr || "Agenda"}`,
            targetUrl: "#/calendrier",
            targetClasse: evt.grade || evt.target_class || evt.targetClass,
            targetSpecialite: evt.section || evt.target_specialty,
            targetGroups: evt.targetGroups || evt.target_groups,
            createdAt: evt.createdAt || evt.created_at || new Date().toISOString()
          });
        }
        fetchNotifications();
        return;
      }

      // Trigger 4: Nouvel article ajouté à la boutique
      if (msg.type === "SHOP_PRODUCT_CREATED") {
        const prod = msg.product || msg.payload;
        if (prod && prod.title) {
          insertIncomingNotif({
            id: `notif_shop_${prod.id || Date.now()}`,
            type: "SHOP_NEW",
            categoryBadge: "BOUTIQUE",
            title: `Nouvel article en boutique : ${prod.title}`,
            message: `L'article "${prod.title}" (${prod.price ? prod.price + " DT" : prod.category || "Boutique"}) a été ajouté à la boutique.`,
            locationOrTime: `Emplacement : Boutique • ${prod.category || "Packs & Cours"}`,
            targetUrl: "#/shop",
            createdAt: prod.createdAt || new Date().toISOString()
          });
        }
        fetchNotifications();
        return;
      }

      // Trigger 7: Confirmation de commande
      if (msg.type === "ORDER_CONFIRMED" || msg.type === "ORDER_UPDATED") {
        const ord = msg.order || msg.receipt || msg.payload;
        const targetStudentId = ord?.student_id || ord?.userId || msg.studentId;
        if (ord && (!targetStudentId || targetStudentId === userId)) {
          const statusUpper = String(ord.status || "").toUpperCase();
          const packName = ord.pack_title || ord.productName || "Commande Boutique";
          if (statusUpper === "APPROVED" || statusUpper === "PENDING" || msg.type === "ORDER_CONFIRMED") {
            insertIncomingNotif({
              id: `notif_order_${ord.id || Date.now()}_${statusUpper}`,
              studentId: userId,
              type: "ORDER",
              categoryBadge: "COMMANDE",
              title: statusUpper === "APPROVED"
                ? `Confirmation de commande validée : ${packName}`
                : `Confirmation de commande enregistrée : ${packName}`,
              message: statusUpper === "APPROVED"
                ? `Votre commande pour "${packName}" a été confirmée et activée.`
                : `Votre commande pour "${packName}" (${ord.amount || ""} DT) a bien été enregistrée.`,
              locationOrTime: `Statut : ${statusUpper === "APPROVED" ? "Commande validée" : "Enregistrée"}`,
              targetUrl: "#/shop",
              createdAt: new Date().toISOString()
            });
          }
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
  }, [userId, userRole, userGrade, userSection, userStudyGroup, fetchNotifications, persistLocal, getDeletedKey]);

  // Automatic localStorage & DOM observer for Cart (Trigger 5) & Wishlist (Trigger 6) in Student space
  const prevCartIdsRef = useRef<Set<string> | null>(null);
  const prevWishlistIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!userId || userRole !== "student") return;

    const readItemsFromStorage = (keys: string[]): any[] => {
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        } catch {}
      }
      return [];
    };

    const cartKeys = [`azed_cart_${userId}`, "azed_cart", "AZED_CART", "cart"];
    const wishlistKeys = [`azed_wishlist_${userId}`, "azed_wishlist", "AZED_WISHLIST", "wishlist"];

    // Initialize baseline sets on mount without firing notifications
    const initialCart = readItemsFromStorage(cartKeys);
    prevCartIdsRef.current = new Set(initialCart.map((item: any) => String(item?.id || item?.title || item)));

    const initialWishlist = readItemsFromStorage(wishlistKeys);
    prevWishlistIdsRef.current = new Set(initialWishlist.map((item: any) => String(item?.id || item?.title || item)));

    const checkCartAndWishlistDiff = () => {
      const currentCart = readItemsFromStorage(cartKeys);
      const currentCartSet = new Set<string>();
      currentCart.forEach((item: any) => {
        const key = String(item?.id || item?.title || item);
        if (!key) return;
        currentCartSet.add(key);
        if (prevCartIdsRef.current && !prevCartIdsRef.current.has(key)) {
          const title = item?.title || item?.name || (typeof item === "string" ? item : "Pack A-Zed");
          notifyCartAdded(title);
        }
      });
      prevCartIdsRef.current = currentCartSet;

      const currentWishlist = readItemsFromStorage(wishlistKeys);
      const currentWishlistSet = new Set<string>();
      currentWishlist.forEach((item: any) => {
        const key = String(item?.id || item?.title || item);
        if (!key) return;
        currentWishlistSet.add(key);
        if (prevWishlistIdsRef.current && !prevWishlistIdsRef.current.has(key)) {
          const title = item?.title || item?.name || (typeof item === "string" ? item : "Pack A-Zed");
          notifyWishlistAdded(title);
        }
      });
      prevWishlistIdsRef.current = currentWishlistSet;
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key) return;
      if (cartKeys.includes(e.key) || wishlistKeys.includes(e.key)) {
        checkCartAndWishlistDiff();
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("cart-updated", checkCartAndWishlistDiff);
    window.addEventListener("wishlist-updated", checkCartAndWishlistDiff);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("cart-updated", checkCartAndWishlistDiff);
      window.removeEventListener("wishlist-updated", checkCartAndWishlistDiff);
    };
  }, [userId, userRole, notifyCartAdded, notifyWishlistAdded]);

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
    fetch("/api/student/notifications/read-all", {
      method: "PUT",
      headers: { "x-user-id": userId }
    }).catch(() => {});
  }, [userId, persistLocal]);

  const markAllRead = useCallback(async (id?: string) => {
    if (id) {
      markAsRead(id);
    } else {
      markAllAsRead();
    }
  }, [markAsRead, markAllAsRead]);

  // Delete single notification in real time (optimistic UI + localStorage + backend DELETE)
  const deleteNotification = useCallback((id: string) => {
    if (!userId || !id) return;
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persistLocal(updated);
      return updated;
    });

    try {
      const deletedKey = getDeletedKey();
      const currentDeleted = JSON.parse(localStorage.getItem(deletedKey) || localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      const updatedDeleted = Array.from(new Set([...(Array.isArray(currentDeleted) ? currentDeleted : []), id]));
      localStorage.setItem(deletedKey, JSON.stringify(updatedDeleted));
      localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
    } catch (e) {}

    fetch(`/api/notifications/${encodeURIComponent(userId)}/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    fetch(`/api/student/notifications/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-user-id": userId }
    }).catch(() => {});
  }, [userId, persistLocal, getDeletedKey]);

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
      const deletedKey = getDeletedKey();
      const currentDeleted = JSON.parse(localStorage.getItem(deletedKey) || localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      const updatedDeleted = Array.from(new Set([...(Array.isArray(currentDeleted) ? currentDeleted : []), ...idsToDelete]));
      localStorage.setItem(deletedKey, JSON.stringify(updatedDeleted));
      localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
    } catch (e) {}

    fetch(`/api/notifications/${encodeURIComponent(userId)}?role=${encodeURIComponent(userRole.toUpperCase())}`, { method: "DELETE" }).catch(() => {});
    fetch("/api/student/notifications/clear-all", {
      method: "DELETE",
      headers: { "x-user-id": userId }
    }).catch(() => {});
  }, [userId, userRole, notifications, persistLocal, getDeletedKey]);

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


