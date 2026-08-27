import { useEffect, useState } from "react";
import { normalizeGrade } from "./utils";

export { normalizeGrade };

export interface RealtimeMessage {
  type: "EVENT_CREATED" | "EVENT_UPDATED" | "EVENT_DELETED" | "TODO_CREATED" | "TODO_DELETED" | "NOTIFICATION_CREATED" | string;
  event?: any;
  todo?: any;
  notification?: any;
  id?: string;
  targetGroups?: string[];
  grade?: string;
  payload?: any;
  timestamp?: number;
}

// Singleton BroadcastChannel for multi-tab synchronization in AI Studio
const syncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("azed_platform_sync")
    : null;

// Helper to broadcast events locally and across browser tabs
export const broadcastLocalEvent = (msg: RealtimeMessage) => {
  if (typeof window === "undefined") return;

  const data: RealtimeMessage = {
    ...msg,
    timestamp: msg.timestamp || Date.now()
  };

  // 1. Dispatch custom event locally in current tab
  window.dispatchEvent(new CustomEvent("realtime-event", { detail: data }));

  // 2. Broadcast to other tabs via BroadcastChannel
  if (syncChannel) {
    try {
      syncChannel.postMessage(data);
    } catch (e) {
      console.warn("BroadcastChannel postMessage error:", e);
    }
  }

  // 3. Fallback to localStorage trigger for cross-tab sync in restricted frames
  try {
    localStorage.setItem("AZED_LAST_SYNC_MSG", JSON.stringify(data));
  } catch (e) {}
};

// Helper to evaluate if a student profile matches target selection criteria (Grade/Classe, Section/Specialite, Target Groups)
export function isStudentTargeted(
  student: { grade?: string; section?: string; study_group?: string; groupe_etude?: string } | null | undefined,
  target: { grade?: string; section?: string; targetGroups?: string[]; target_groups?: string[]; groups?: string[]; targetClasse?: string; targetSpecialite?: string; selectedGroups?: string[] }
): boolean {
  if (!student) return false;

  const sGrade = normalizeGrade(student.grade);
  const tGrade = normalizeGrade(target.grade || target.targetClasse || "Tous");
  const gradeMatch = tGrade === "Tous" || sGrade === "Tous" || sGrade === tGrade;

  const sSection = (student.section || "").toLowerCase().trim();
  const tSection = (target.section || target.targetSpecialite || "Tous").toLowerCase().trim();
  const sectionMatch =
    tSection === "tous" ||
    tSection === "toutes les sections" ||
    !sSection ||
    sSection.includes(tSection) ||
    tSection.includes(sSection);

  const rawGroups = target.targetGroups || target.target_groups || target.groups || target.selectedGroups || ["ALL"];
  const sGroup = ((student.study_group || student.groupe_etude || "").replace(/^gr\.\s*|^groupe\s*/i, "").trim()).toUpperCase();
  const normTargetGroups = rawGroups.map(g => g.replace(/^gr\.\s*|^groupe\s*/i, "").trim().toUpperCase());

  const groupMatch =
    rawGroups.includes("ALL") ||
    normTargetGroups.includes("ALL") ||
    rawGroups.length === 0 ||
    normTargetGroups.length === 0 ||
    (sGroup && normTargetGroups.includes(sGroup));

  return gradeMatch && sectionMatch && groupMatch;
}

// Admin action publisher: synchronizes AZED_NOTIFS & AZED_EVENTS and emits realtime signal
export const publishAdminEvent = (eventDetails: any, notifMessage?: string) => {
  if (typeof window === "undefined") return;

  const title = eventDetails.title || eventDetails.topic || "Séance Live Zoom";
  const date = eventDetails.date || eventDetails.exactDate || "2026-08-01";
  const time = eventDetails.time || "22:30";
  const duration = eventDetails.duration || `${eventDetails.durationMinutes || 90} min`;
  const rawTargetGroups = eventDetails.targetGroups || eventDetails.target_groups || eventDetails.selectedGroups || ["ALL"];

  const defaultMsg = notifMessage || `Une séance Live Zoom: "${title}" est prévue le ${date} à ${time}.`;

  const notifPayload = {
    id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type: "LIVE_SESSION",
    title: "Nouvelle séance Live disponible !",
    message: defaultMsg,
    content: defaultMsg,
    link: "/calendrier",
    targetClasse: eventDetails.grade || eventDetails.classe || "Tous",
    targetSpecialite: eventDetails.section || eventDetails.specialite || "Tous",
    targetGroups: rawTargetGroups,
    target_role: "STUDENT",
    target_group: rawTargetGroups[0] || "ALL",
    icon: "video",
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    isRead: false,
    is_read: false,
    eventData: {
      id: eventDetails.id || "evt_" + Date.now(),
      title: title,
      description: eventDetails.description || eventDetails.notes || "Séance pédagogique collective en direct.",
      date: date,
      time: time,
      duration: duration,
      durationMinutes: Number(eventDetails.durationMinutes) || 90,
      instructor: eventDetails.instructor || "M. Nabil Chaouch",
      level: eventDetails.grade || eventDetails.classe || "Tous",
      section: eventDetails.section || eventDetails.specialite || "Tous",
      type: eventDetails.type || "LIVE",
      status: "PROCHAINEMENT",
      groups: rawTargetGroups,
      zoom_link: eventDetails.zoomLink || eventDetails.zoom_link || "",
      link: eventDetails.zoomLink || eventDetails.zoom_link || ""
    }
  };

  // Persist in LocalStorage
  try {
    const currentNotifs = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");
    const currentEvents = JSON.parse(localStorage.getItem("AZED_EVENTS") || "[]");
    localStorage.setItem("AZED_NOTIFS", JSON.stringify([notifPayload, ...currentNotifs.filter((n: any) => n.id !== notifPayload.id)]));
    localStorage.setItem("AZED_EVENTS", JSON.stringify([eventDetails, ...currentEvents.filter((e: any) => e.id !== eventDetails.id)]));
  } catch (e) {}

  // Broadcast in real-time
  broadcastLocalEvent({
    type: "SYNC_EVENT_AND_NOTIF",
    notification: notifPayload,
    event: eventDetails,
    payload: notifPayload
  });

  broadcastLocalEvent({
    type: "EVENT_CREATED",
    event: eventDetails,
    targetGroups: rawTargetGroups,
    grade: eventDetails.grade
  });

  broadcastLocalEvent({
    type: "NOTIFICATION_CREATED",
    notification: notifPayload
  });
};

export function useRealtimeSync(onMessageReceived?: (msg: RealtimeMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isMounted = true;

    // Listener for custom event dispatched in current window
    const handleLocalCustomEvent = (e: CustomEvent) => {
      if (onMessageReceived && e.detail) {
        onMessageReceived(e.detail);
      }
    };
    window.addEventListener("realtime-event", handleLocalCustomEvent as EventListener);

    // Listener for BroadcastChannel messages from other tabs
    const handleBroadcastMessage = (evt: MessageEvent) => {
      if (!evt.data) return;
      window.dispatchEvent(new CustomEvent("realtime-event", { detail: evt.data }));
    };

    if (syncChannel) {
      syncChannel.addEventListener("message", handleBroadcastMessage);
    }

    // Listener for storage events (cross-tab fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "AZED_LAST_SYNC_MSG" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent("realtime-event", { detail: parsed }));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // WebSocket Connection setup
    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isMounted) setIsConnected(true);
        };

        ws.onmessage = (evt) => {
          try {
            const data: RealtimeMessage = JSON.parse(evt.data);
            broadcastLocalEvent(data);
          } catch (e) {
            console.error("Error parsing WS frame:", e);
          }
        };

        ws.onclose = () => {
          if (isMounted) setIsConnected(false);
          // Auto reconnect after 3 seconds
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          if (isMounted) setIsConnected(false);
        };
      } catch (err) {
        console.error("Failed to establish WebSocket:", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      window.removeEventListener("realtime-event", handleLocalCustomEvent as EventListener);
      window.removeEventListener("storage", handleStorageChange);
      if (syncChannel) {
        syncChannel.removeEventListener("message", handleBroadcastMessage);
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [onMessageReceived]);

  return { isConnected };
}

