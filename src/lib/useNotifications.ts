import { useState, useEffect, useCallback } from "react";
import { Notification } from "../types";
import { isStudentTargeted } from "./useRealtimeSync";

export function useNotifications(userRole?: string, userId?: string, studyGroup?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const roleParam = userRole || "STUDENT";
    const groupParam = studyGroup || "ALL";
    let serverNotifs: Notification[] = [];

    try {
      const res = await fetch(`/api/notifications/${userId}?role=${encodeURIComponent(roleParam)}&group=${encodeURIComponent(groupParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverNotifs = data;
        }
      }
    } catch (e) {
      // Network/server offline or temporary glitch: gracefully fallback to local notifications
    }

    // Merge with AZED_NOTIFS stored in localStorage
    const storedUser = localStorage.getItem("current_user");
    let studentProfile: any = null;
    if (storedUser) {
      try {
        studentProfile = JSON.parse(storedUser);
      } catch (err) {}
    }

    let localNotifs: Notification[] = [];
    try {
      const rawLocal = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");
      const deletedIds = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      const deletedIdSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);

      if (Array.isArray(rawLocal)) {
        localNotifs = rawLocal.filter((notif: any) => {
          // Check if deleted locally by ID
          if (deletedIdSet.has(notif.id)) return false;

          const currentRole = roleParam.toUpperCase();
          const notifType = (notif.type || "").toLowerCase();

          // ❌ SÉCURITÉ : Ne pas afficher les notifications de panier/achats pour les AGENTS ou ADMINS
          if (notifType === "shopping" || notifType === "cart" || notifType === "wishlist") {
            if (currentRole === "AGENT" || currentRole === "ADMIN") {
              return false;
            }
            if (userId && notif.userId && notif.userId !== userId && notif.target_user_id !== userId) {
              return false;
            }
          }

          // Check target_role: if set, must match user's role exactly (or ALL)
          const targetRole = (notif.target_role || notif.targetRole || "").toUpperCase();

          if (targetRole && targetRole !== "ALL" && targetRole !== currentRole) {
            return false;
          }

          if (currentRole === "STUDENT") {
            return isStudentTargeted(studentProfile, {
              grade: notif.targetClasse || notif.grade,
              section: notif.targetSpecialite || notif.section,
              targetGroups: notif.targetGroups || notif.target_groups
            });
          }
          return true;
        });
      }
    } catch (e) {}

    // Filter out locally deleted IDs from server notifications too
    let deletedIdSet = new Set<string>();
    try {
      const deletedIds = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
      deletedIdSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);
    } catch (e) {}

    // Combine server & local by unique ID and eventId while preserving order
    const notifMap = new Map<string, Notification>();
    const seenEventIds = new Set<string>();

    [...serverNotifs, ...localNotifs].forEach((n) => {
      if (n && n.id && !deletedIdSet.has(n.id)) {
        const evtId = n.eventId || n.eventData?.id;
        if (evtId) {
          if (seenEventIds.has(evtId)) return;
          seenEventIds.add(evtId);
        }
        if (!notifMap.has(n.id)) {
          notifMap.set(n.id, n);
        }
      }
    });

    setNotifications(Array.from(notifMap.values()));
  }, [userId, userRole, studyGroup]);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Light Polling every 5 seconds for background real-time sync
    const interval = setInterval(fetchNotifications, 5000);

    // WebSocket event listener for instant real-time pushes
    const handleRealtime = (e: CustomEvent) => {
      const msg = e.detail;
      if (!msg) return;

      if ((msg.type === "NOTIFICATION_CREATED" || msg.type === "SYNC_EVENT_AND_NOTIF" || msg.type === "NEW_NOTIFICATION") && (msg.notification || msg.payload)) {
        const notif: Notification = msg.notification || msg.payload;
        // Ignore deleted notifications
        let isDeletedLocally = false;
        try {
          const deletedIds = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
          if (Array.isArray(deletedIds) && deletedIds.includes(notif.id)) {
            isDeletedLocally = true;
          }
        } catch (err) {}
        if (isDeletedLocally) return;

        // Check if relevant to this profile
        const targetRole = (notif.target_role || notif.targetRole || "").toUpperCase();
        const currentRole = userRole?.toUpperCase() || "STUDENT";
        
        // Strict role matching: if targetRole is set and not ALL, reject if different from currentRole
        if (targetRole && targetRole !== "ALL" && targetRole !== currentRole) {
          return;
        }

        const roleMatch = !targetRole || targetRole === "ALL" || targetRole === currentRole;
        const userMatch = (notif.userId === userId || notif.target_user_id === userId);

        let studentMatch = true;
        if (currentRole === "STUDENT" && !userMatch) {
          const storedUser = localStorage.getItem("current_user");
          let studentProfile = null;
          if (storedUser) {
            try {
              studentProfile = JSON.parse(storedUser);
            } catch (err) {}
          }

          if (studentProfile) {
            studentMatch = isStudentTargeted(studentProfile, {
              grade: notif.targetClasse || notif.event_date ? (notif as any).grade : undefined,
              section: notif.targetSpecialite,
              targetGroups: notif.targetGroups || notif.target_groups
            });
          }
        }

        if (roleMatch && (userMatch || studentMatch)) {
          setNotifications((prev) => {
            const incomingEvtId = notif.eventId || notif.eventData?.id;
            const isDuplicate = prev.some((n) => {
              if (n.id === notif.id) return true;
              const existingEvtId = n.eventId || n.eventData?.id;
              if (incomingEvtId && existingEvtId && incomingEvtId === existingEvtId) return true;
              return false;
            });
            if (isDuplicate) return prev;
            return [notif, ...prev];
          });
        }
      } else if (["EVENT_CREATED", "EVENT_UPDATED", "TODO_CREATED", "TODO_DELETED"].includes(msg.type)) {
        fetchNotifications();
      }
    };

    window.addEventListener("realtime-event", handleRealtime as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("realtime-event", handleRealtime as EventListener);
    };
  }, [userId, userRole, studyGroup, fetchNotifications]);

  const markAllRead = async (id?: string) => {
    if (!userId) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => {
          if (!id || n.id === id) {
            const existingReadBy = Array.isArray(n.readBy) ? n.readBy : [];
            const newReadBy = existingReadBy.includes(userId) ? existingReadBy : [...existingReadBy, userId];
            return {
              ...n,
              isRead: true,
              read: true,
              readBy: newReadBy
            };
          }
          return n;
        })
      );

      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ userId, notificationId: id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOne = async (id: string) => {
    if (!userId) return;
    try {
      // 1. Optimistic UI update
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // 2. Persist deletion in localStorage
      try {
        const currentNotifs = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");
        const currentDeleted = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
        const updatedDeleted = Array.from(new Set([...currentDeleted, id]));
        localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
        localStorage.setItem("AZED_NOTIFS", JSON.stringify(currentNotifs.filter((n: any) => n.id !== id)));
      } catch (err) {}

      // 3. Sync deletion to backend
      await fetch(`/api/notifications/${userId}/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = async () => {
    if (!userId) return;
    try {
      const idsToDelete = notifications.map((n) => n.id);

      // 1. Optimistic UI update
      setNotifications([]);

      // 2. Persist deletion in localStorage
      try {
        const currentNotifs = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");
        const currentDeleted = JSON.parse(localStorage.getItem("AZED_DELETED_NOTIFS") || "[]");
        const updatedDeleted = Array.from(new Set([...currentDeleted, ...idsToDelete]));
        localStorage.setItem("AZED_DELETED_NOTIFS", JSON.stringify(updatedDeleted));
        localStorage.setItem("AZED_NOTIFS", JSON.stringify(currentNotifs.filter((n: any) => !idsToDelete.includes(n.id))));
      } catch (err) {}

      // 3. Sync clearAll to backend
      const roleParam = userRole || "STUDENT";
      await fetch(`/api/notifications/${userId}?role=${encodeURIComponent(roleParam)}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => {
    if (n.readBy && Array.isArray(n.readBy) && n.readBy.includes(userId)) return false;
    return !n.isRead && !n.read;
  }).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    deleteOne,
    clearAll,
    refreshNotifications: fetchNotifications
  };
}
