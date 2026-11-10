import { useEffect, useState, useRef } from "react";
import { normalizeGrade } from "./utils";
import {
  normalizeUploadedDocumentMetadata,
  saveDocument,
  saveGlobalDocument,
  deleteStoredDocument,
  deleteGlobalDocument,
  clearStudentSessionCache
} from "../utils/documentAccess";

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
  studentData?: any;
  userProfile?: any;
  user?: any;
  newBadge?: string;
  [key: string]: any;
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
      instructor: eventDetails.instructor || "Professeur Nabil Chaouch",
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

// Admin action publisher for new quizzes: synchronizes AZED_NOTIFS and emits realtime signal
export const publishQuizNotification = (quizDetails: any, notifMessage?: string) => {
  if (typeof window === "undefined") return;

  const title = quizDetails.title || "Évaluation Interactive";
  const typeLabel = quizDetails.type === "qcm" ? "QCM interactif" : quizDetails.type === "fllblanks" ? "Texte à trous" : "Défi Python";
  const defaultMsg = notifMessage || `Un nouveau quiz (${typeLabel}) sur "${quizDetails.chapterTitle || quizDetails.title}" est disponible.`;

  const notifPayload = {
    id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type: "QUIZ_ASSIGNED",
    title: `🎯 Nouveau Quiz : ${title}`,
    message: defaultMsg,
    content: defaultMsg,
    link: `#/qcm/play/${quizDetails.id || quizDetails._id}`,
    targetClasse: quizDetails.grade || "Tous",
    targetSpecialite: quizDetails.section || "Tous",
    targetGroups: ["ALL"],
    target_role: "STUDENT",
    target_group: "ALL",
    icon: "help-circle",
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    isRead: false,
    is_read: false,
    eventData: {
      id: quizDetails.id || quizDetails._id,
      title: title,
      description: defaultMsg,
      type: "QUIZ",
      level: quizDetails.grade || "Tous",
      section: quizDetails.section || "Tous",
      link: `#/qcm/play/${quizDetails.id || quizDetails._id}`
    }
  };

  // Persist in LocalStorage
  try {
    const currentNotifs = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");
    localStorage.setItem("AZED_NOTIFS", JSON.stringify([notifPayload, ...currentNotifs.filter((n: any) => n.id !== notifPayload.id)]));
  } catch (e) {}

  // Broadcast in real-time
  broadcastLocalEvent({
    type: "SYNC_EVENT_AND_NOTIF",
    notification: notifPayload,
    payload: notifPayload
  });

  broadcastLocalEvent({
    type: "NOTIFICATION_CREATED",
    notification: notifPayload
  });

  broadcastLocalEvent({
    type: "QUIZ_CREATED",
    quiz: quizDetails,
    notification: notifPayload
  });
};

let sharedWs: WebSocket | null = null;
let sharedWsConnected = false;
let sharedReconnectTimer: ReturnType<typeof setTimeout> | null = null;
const connectionStateListeners = new Set<(connected: boolean) => void>();

function notifyConnectionState(connected: boolean) {
  sharedWsConnected = connected;
  connectionStateListeners.forEach((listener) => {
    try {
      listener(connected);
    } catch {}
  });
}

let lastToastDocKey = "";
let activeToastTimer: ReturnType<typeof setTimeout> | null = null;

function showDiscreetDocumentSyncToast(doc: any, mode: "CREATE" | "UPDATE" = "CREATE") {
  if (typeof window === "undefined" || typeof document === "undefined" || !doc) return;
  const hash = window.location.hash || "";
  // Do not show the student toast while the admin is actively inside the upload/gestion-docs page
  if (hash.includes("/admin/nouveau-doc") || hash.includes("/admin/gestion-docs")) return;

  const toastKey = `${mode}:${doc.id || doc._id}:${doc.title || ""}:${doc.fileUrl || ""}:${Math.floor(Date.now() / 3000)}`;
  if (toastKey === lastToastDocKey) return;
  lastToastDocKey = toastKey;

  try {
    const existing = document.getElementById("azed-realtime-doc-toast");
    if (existing) {
      existing.remove();
    }
    if (activeToastTimer) {
      clearTimeout(activeToastTimer);
      activeToastTimer = null;
    }

    const container = document.createElement("div");
    container.id = "azed-realtime-doc-toast";
    container.className =
      "fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-start gap-3 transition-all duration-200";

    const badgeDot = document.createElement("div");
    badgeDot.className =
      "w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold";
    badgeDot.textContent = "PDF";

    const contentWrap = document.createElement("div");
    contentWrap.className = "min-w-0 flex-1 text-left";

    const titleEl = document.createElement("p");
    titleEl.className = "text-xs font-bold text-slate-900 truncate";
    titleEl.textContent =
      mode === "UPDATE"
        ? `Support mis à jour : ${doc.title || "Ressource pédagogique"}`
        : `Nouveau support disponible : ${doc.title || "Ressource pédagogique"}`;

    const metaEl = document.createElement("p");
    metaEl.className = "text-[11px] text-slate-500 truncate mt-0.5 tabular-nums";
    const catLabel = doc.category || "Fiches & cours";
    const chapLabel = doc.chapterTitle || doc.chapter || doc.module || "Général";
    metaEl.textContent = `${catLabel} · ${chapLabel}`;

    contentWrap.appendChild(titleEl);
    contentWrap.appendChild(metaEl);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className =
      "text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer shrink-0";
    closeBtn.textContent = "✕";
    closeBtn.onclick = () => {
      container.remove();
    };

    container.appendChild(badgeDot);
    container.appendChild(contentWrap);
    container.appendChild(closeBtn);
    document.body.appendChild(container);

    activeToastTimer = setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 4500);
  } catch {}
}

let lastProcessedDocSyncSignature = "";
let lastProcessedDocSyncTimestamp = 0;

function handleIncomingRealtimeDocumentPacket(parsed: any) {
  if (!parsed || typeof parsed !== "object") return;
  if (
    parsed.type === "SYNC_NEW_DOCUMENT" ||
    parsed.type === "NEW_DOCUMENT_PUBLISHED" ||
    parsed.type === "DOCUMENT_CREATED" ||
    parsed.type === "DOCUMENT_UPDATED_GLOBAL" ||
    parsed.type === "DOCUMENT_UPDATED" ||
    parsed.type === "COURSES_UPDATED" ||
    parsed.type === "DOCUMENT_DELETED"
  ) {
    const isDeleteEvent =
      parsed.type === "DOCUMENT_DELETED" ||
      parsed.deleted === true ||
      parsed.payload?.deleted === true;

    if (isDeleteEvent) {
      const deletedId = String(
        parsed.payload?.id ||
        parsed.id ||
        parsed.document?.id ||
        parsed.course?.id ||
        ""
      ).trim();

      const now = Date.now();
      const delSig = `DELETE:${deletedId}`;
      if (deletedId && delSig === lastProcessedDocSyncSignature && now - lastProcessedDocSyncTimestamp < 1500) {
        return;
      }
      lastProcessedDocSyncSignature = delSig;
      lastProcessedDocSyncTimestamp = now;

      if (deletedId) {
        try {
          deleteStoredDocument(deletedId);
          deleteGlobalDocument(deletedId);
        } catch (delErr) {
          console.warn("Erreur suppression document WebSocket:", delErr);
        }
      }
      clearStudentSessionCache();
      window.dispatchEvent(
        new CustomEvent("zed-document-sync", {
          detail: { action: "DELETE", id: deletedId }
        })
      );
      window.dispatchEvent(new Event("zed-documents-updated"));
      window.dispatchEvent(
        new CustomEvent("document-updated", { detail: { id: deletedId, deleted: true } })
      );
      return;
    }

    const rawCandidate =
      (parsed.payload && typeof parsed.payload === "object" && (parsed.payload.id || parsed.payload._id || parsed.payload.title)
        ? parsed.payload
        : null) ||
      parsed.payload?.document ||
      parsed.payload?.course ||
      parsed.document ||
      parsed.course ||
      (parsed.id ? parsed : null);

    if (rawCandidate && (rawCandidate.id || rawCandidate._id) && !rawCandidate.deleted) {
      try {
        const normalized = normalizeUploadedDocumentMetadata(rawCandidate);
        const syncAction =
          parsed.type === "DOCUMENT_UPDATED" || parsed.type === "DOCUMENT_UPDATED_GLOBAL"
            ? "UPDATE"
            : "CREATE";

        const now = Date.now();
        const docSig = `${syncAction}:${normalized.id}:${normalized.title || ""}:${normalized.fileUrl || ""}:${normalized.grade || ""}:${normalized.section || ""}:${(normalized.allowedBadges || []).join(",")}`;
        if (docSig === lastProcessedDocSyncSignature && now - lastProcessedDocSyncTimestamp < 1500) {
          return;
        }
        lastProcessedDocSyncSignature = docSig;
        lastProcessedDocSyncTimestamp = now;

        saveDocument(normalized, true);
        saveGlobalDocument(normalized);
        clearStudentSessionCache();

        window.dispatchEvent(
          new CustomEvent("zed-document-sync", {
            detail: { action: syncAction, document: normalized, id: String(normalized.id) }
          })
        );

        if (
          parsed.type === "SYNC_NEW_DOCUMENT" ||
          parsed.type === "NEW_DOCUMENT_PUBLISHED" ||
          parsed.type === "DOCUMENT_CREATED" ||
          parsed.type === "DOCUMENT_UPDATED"
        ) {
          showDiscreetDocumentSyncToast(normalized, syncAction);
        }
      } catch (syncErr) {
        console.warn("Erreur normalisation document WebSocket:", syncErr);
      }
    } else {
      clearStudentSessionCache();
    }
    window.dispatchEvent(new Event("zed-documents-updated"));
    window.dispatchEvent(new CustomEvent("document-updated", { detail: rawCandidate || parsed }));
  }
}

function ensureSharedWebSocket() {
  if (typeof window === "undefined") return;
  if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  if (sharedReconnectTimer) {
    clearTimeout(sharedReconnectTimer);
    sharedReconnectTimer = null;
  }

  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    sharedWs = ws;

    ws.onopen = () => {
      notifyConnectionState(true);
    };

    ws.onmessage = (event) => {
      if (!event.data) return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && typeof parsed === "object") {
          handleIncomingRealtimeDocumentPacket(parsed);
          window.dispatchEvent(new CustomEvent("realtime-event", { detail: parsed }));
        }
      } catch {
        // Ignore non-JSON frames
      }
    };

    ws.onerror = () => {
      notifyConnectionState(false);
    };

    ws.onclose = () => {
      if (sharedWs === ws) {
        sharedWs = null;
      }
      notifyConnectionState(false);
      if (!sharedReconnectTimer) {
        sharedReconnectTimer = setTimeout(() => {
          sharedReconnectTimer = null;
          ensureSharedWebSocket();
        }, 5000);
      }
    };
  } catch {
    notifyConnectionState(false);
    if (!sharedReconnectTimer) {
      sharedReconnectTimer = setTimeout(() => {
        sharedReconnectTimer = null;
        ensureSharedWebSocket();
      }, 5000);
    }
  }
}

export function useRealtimeSync(onMessageReceived?: (msg: RealtimeMessage) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(sharedWsConnected);
  const callbackRef = useRef(onMessageReceived);
  callbackRef.current = onMessageReceived;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStateChange = (connected: boolean) => {
      setIsConnected(connected);
    };
    connectionStateListeners.add(handleStateChange);
    ensureSharedWebSocket();

    // Listener for custom event dispatched in current window
    const handleLocalCustomEvent = (e: CustomEvent) => {
      if (callbackRef.current && e.detail) {
        callbackRef.current(e.detail);
      }
    };
    window.addEventListener("realtime-event", handleLocalCustomEvent as EventListener);

    // Listener for BroadcastChannel messages from other tabs
    const handleBroadcastMessage = (evt: MessageEvent) => {
      if (!evt.data) return;
      handleIncomingRealtimeDocumentPacket(evt.data);
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
          handleIncomingRealtimeDocumentPacket(parsed);
          window.dispatchEvent(new CustomEvent("realtime-event", { detail: parsed }));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      connectionStateListeners.delete(handleStateChange);
      window.removeEventListener("realtime-event", handleLocalCustomEvent as EventListener);
      window.removeEventListener("storage", handleStorageChange);
      if (syncChannel) {
        syncChannel.removeEventListener("message", handleBroadcastMessage);
      }
    };
  }, []);

  return { isConnected };
}


