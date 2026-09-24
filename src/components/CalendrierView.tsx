import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, translations } from "../lib/translations";
import { useRealtimeSync, publishAdminEvent, isStudentTargeted } from "../lib/useRealtimeSync";
import { isLiveActive, handleJoinClick } from "../lib/meetingSecurity";
import { 
  Calendar, 
  Video, 
  Clock, 
  Users, 
  Copy, 
  Check, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Bell,
  RotateCw,
  X,
  Info,
  Lock
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  topic: string;
  dateTime: string;
  instructor: string;
  link: string;
  duration: string;
  grade: string;
  section?: string;
  targetGroups?: string[];
  type: "Live Zoom" | "Examen Blanc" | "Séance Présentielle" | "Devoir & Exercices";
  eventType?: "live_session" | "homework" | "exam" | "event";
  durationMinutes: number;
  exactDate?: string; // Format: "YYYY-MM-DD"
  recurringDay?: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  description?: string;
}

const SCHEDULE_DATA: ScheduleEvent[] = [
  {
    id: "e1",
    topic: "Algorithmique Pratique - Correction du Devoir de Synthèse N°2",
    dateTime: "Tous les lundis à 18h30",
    instructor: "M. Nabil Chaouch",
    link: "https://zoom.us/j/simulated_nabil_zoom",
    duration: "1h 30min",
    grade: "4éme",
    type: "Live Zoom",
    durationMinutes: 90,
    recurringDay: 1,
    description: "Session en direct pour analyser la correction rigoureuse du Devoir de Synthèse N°2 sur l'algorithmique récursive."
  },
  {
    id: "e2",
    topic: "Interfaçage Python-MySQL - Exercices types d'examen national",
    dateTime: "Tous les mercredis à 19h00",
    instructor: "M. Nabil Chaouch",
    link: "https://zoom.us/j/simulated_nabil_zoom_2",
    duration: "1h 45min",
    grade: "4éme",
    type: "Live Zoom",
    durationMinutes: 105,
    recurringDay: 3,
    description: "Modélisation et écriture de scripts d'interfaçage avec des bases SQL. Sujets types Bac Pratique."
  },
  {
    id: "e3",
    topic: "Structure de Données Complexes - Piles & Files",
    dateTime: "Tous les samedis à 17h00",
    instructor: "M. Nabil Chaouch",
    link: "https://zoom.us/j/simulated_nabil_zoom_3",
    duration: "1h 15min",
    grade: "3ème",
    type: "Live Zoom",
    durationMinutes: 75,
    recurringDay: 6,
    description: "Introduction critique et applications concrètes des structures linéaires de types piles, files et listes."
  },
  {
    id: "e4",
    topic: "Examen Blanc Pratique Blanc National Tunisie",
    dateTime: "Mardi 15 Juin de 08h00 à 11h00",
    instructor: "Équipe A-Zed Info",
    link: "#",
    duration: "3 heures",
    grade: "4éme",
    type: "Examen Blanc",
    durationMinutes: 180,
    exactDate: "2026-06-15",
    description: "Simulation en temps réel de l'examen pratique national du Baccalauréat d'informatique tunisien."
  },
  {
    id: "e5",
    topic: "Séance d'assistance physique au Centre Le Plus (El Mourouj)",
    dateTime: "Dimanche de 09h00 à 13h00",
    instructor: "M. Nabil Chaouch",
    link: "https://maps.app.goo.gl/Vb2WP2MxjkCWg3qL6",
    duration: "4 heures",
    grade: "Tous",
    type: "Séance Présentielle",
    durationMinutes: 240,
    recurringDay: 0,
    description: "Soutien individualisé sur place, révisions des projets d'élèves et conseils personnalisés."
  }
];

interface CalendrierViewProps {
  isPremiumUser: boolean;
  userId?: string;
  userRole?: string;
  userGrade?: string;
  selectedTrimestre?: string;
  currentLanguage?: Language;
  notifications?: any[];
}

// Helper to parse live notification objects into calendar ScheduleEvent items automatically
export const parseLiveNotificationToEvent = (notif: any): ScheduleEvent | null => {
  if (!notif) return null;

  // Handle explicit eventData payload
  if (notif.eventData) {
    const ed = notif.eventData;
    let recDay: number | undefined = undefined;
    if (ed.recurrence && ed.recurrence.toLowerCase().includes("samedi")) {
      recDay = 6;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("dimanche")) {
      recDay = 0;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("lundi")) {
      recDay = 1;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("mardi")) {
      recDay = 2;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("mercredi")) {
      recDay = 3;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("jeudi")) {
      recDay = 4;
    } else if (ed.recurrence && ed.recurrence.toLowerCase().includes("vendredi")) {
      recDay = 5;
    }

    return {
      id: ed.id || notif.id || `notif_evt_${Date.now()}`,
      topic: ed.title || ed.topic || "Structure de Données Complexes",
      dateTime: ed.dateTime || `${ed.date || "2026-08-01"} à ${ed.time || "22:30"}`,
      instructor: ed.instructor || notif.sender || "M. Nabil Chaouch",
      link: ed.zoom_link || ed.link || ed.zoomLink || "https://zoom.us/j/simulated_nabil_zoom",
      duration: ed.duration || "1h 30min",
      grade: ed.level || ed.grade || notif.target_group || "Tous",
      type: (ed.type === "exam" || ed.type === "Examen Blanc") ? "Examen Blanc" : (ed.type === "event" || ed.type === "Séance Présentielle") ? "Séance Présentielle" : "Live Zoom",
      durationMinutes: Number(ed.durationMinutes) || 90,
      exactDate: ed.date || ed.exactDate || notif.event_date || "2026-08-01",
      description: ed.description || notif.content || notif.message || "Séance pédagogique collective planifiée.",
      recurringDay: recDay
    };
  }

  const notifType = (notif.type || "").toUpperCase();
  const title = notif.title || "";
  const content = notif.content || notif.message || "";
  const combinedText = `${title} ${content}`;

  const isLiveOrEvent = 
    notifType === "LIVE" ||
    notifType === "LIVE_SESSION" ||
    notifType === "LIVE_SCHEDULED" ||
    notifType === "LIVE_CREATED" ||
    notifType === "EVENT_CREATED" ||
    title.toLowerCase().includes("live") ||
    title.toLowerCase().includes("événement") ||
    title.toLowerCase().includes("examen") ||
    title.toLowerCase().includes("rappel") ||
    content.toLowerCase().includes("live") ||
    content.toLowerCase().includes("planifié");

  if (!isLiveOrEvent) return null;

  // 1. Exact Date extraction (YYYY-MM-DD or DD/MM/YYYY)
  let exactDate = notif.event_date || notif.date || "";
  if (!exactDate) {
    const isoMatch = combinedText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      exactDate = isoMatch[1];
    } else {
      const frMatch = combinedText.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
      if (frMatch) {
        exactDate = `${frMatch[3]}-${frMatch[2]}-${frMatch[1]}`;
      }
    }
  }

  if (!exactDate) return null;

  // 2. Exact Time extraction
  let time = notif.event_time || notif.time || "";
  if (!time) {
    const timeMatch = combinedText.match(/\b(\d{1,2}:\d{2})\b/);
    if (timeMatch) {
      time = timeMatch[1];
    } else {
      const hourMatch = combinedText.match(/\b(\d{1,2})\s*h\s*(\d{2})?\b/i);
      if (hourMatch) {
        time = `${hourMatch[1].padStart(2, '0')}:${(hourMatch[2] || '00').padStart(2, '0')}`;
      } else {
        time = "20:00";
      }
    }
  }

  // 3. Topic extraction
  let topic = notif.title_event || notif.event_title || "";
  if (!topic) {
    let cleanContent = content.replace(/Nouveau Live Planifié\s*🗓️?/gi, "").trim();
    const parMatch = cleanContent.match(/^(.*?)(?=\s+(?:par|le|\d{4}-\d{2}-\d{2}|à\s*\d))/i);
    if (parMatch && parMatch[1].trim() && parMatch[1].trim().length > 1) {
      topic = parMatch[1].trim();
    } else {
      topic = title.replace(/[🗓️📅🔑❌✅]/g, "").trim() || "Live Planifié";
    }
  }

  let eventType: "Live Zoom" | "Examen Blanc" | "Séance Présentielle" = "Live Zoom";
  if (combinedText.toLowerCase().includes("examen")) {
    eventType = "Examen Blanc";
  } else if (combinedText.toLowerCase().includes("présentiel") || combinedText.toLowerCase().includes("physique")) {
    eventType = "Séance Présentielle";
  }

  return {
    id: notif.id || `notif_evt_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
    topic: topic,
    dateTime: `${exactDate} à ${time}`,
    instructor: notif.sender || "M. Nabil Chaouch",
    link: notif.zoomLink || "https://zoom.us/j/simulated_nabil_zoom",
    duration: "1h 30min",
    grade: notif.target_group || "Tous",
    type: eventType,
    durationMinutes: 90,
    exactDate: exactDate,
    description: content || "Séance en direct planifiée."
  };
};

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WEEKDAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Helper to determine the start and end hours for a specific event
const getEventHours = (event: ScheduleEvent) => {
  if (event.id === "e1") return { startHour: 18, startMinute: 30, endHour: 20, endMinute: 0 };
  if (event.id === "e2") return { startHour: 19, startMinute: 0, endHour: 20, endMinute: 45 };
  if (event.id === "e3") return { startHour: 17, startMinute: 0, endHour: 18, endMinute: 15 };
  if (event.id === "e4") return { startHour: 8, startMinute: 0, endHour: 11, endMinute: 0 };
  if (event.id === "e5") return { startHour: 9, startMinute: 0, endHour: 13, endMinute: 0 };
  
  // Parse hours from custom text like "18h30" or "19:00"
  let startHour = 18;
  let startMinute = 0;
  if (event.dateTime) {
    const timeMatch = event.dateTime.match(/(\d{2})[h:](\d{2})/);
    if (timeMatch) {
      startHour = parseInt(timeMatch[1]);
      startMinute = parseInt(timeMatch[2]);
    } else {
      const hourMatch = event.dateTime.match(/(\d{1,2})\s*h/);
      if (hourMatch) {
        startHour = parseInt(hourMatch[1]);
      }
    }
  }
  const durationMin = event.durationMinutes || 90;
  const totalMinutes = startHour * 60 + startMinute + durationMin;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  return { startHour, startMinute, endHour, endMinute };
};

// Determine the event status dynamically relative to current system clock time
export const getEventStatus = (event: ScheduleEvent, day: number, month: number, year: number): "Terminé" | "Prochainement" | "En cours" => {
  const refDate = new Date(); // Dynamic System Clock
  const targetDate = new Date(year, month, day);
  
  const refDayOnly = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  
  if (targetDate < refDayOnly) {
    return "Terminé";
  } else if (targetDate > refDayOnly) {
    return "Prochainement";
  } else {
    // Today according to local system clock
    const { startHour, startMinute, endHour, endMinute } = getEventHours(event);
    const refHours = refDate.getHours();
    const refMinutes = refDate.getMinutes();
    
    const refTotalMins = refHours * 60 + refMinutes;
    const startTotalMins = startHour * 60 + startMinute;
    const endTotalMins = endHour * 60 + endMinute;
    
    if (refTotalMins < startTotalMins) {
      return "Prochainement";
    } else if (refTotalMins >= startTotalMins && refTotalMins <= endTotalMins) {
      return "En cours";
    } else {
      return "Terminé";
    }
  }
};

/* Helper to format Date or year/month/day to strict ISO "YYYY-MM-DD" */
export const toIsoDateString = (year: number, month: number, day: number): string => {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDateToIso = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getEventIsoDate = (event: any): string => {
  const raw = event.exactDate || event.startDate || event.date || "";
  if (raw) {
    const str = String(raw).trim();
    if (str.includes("-")) {
      const parts = str.split("T")[0].split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        } else {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
    } else if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        } else {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
    }
  }
  if (event.dateTime) {
    const match = event.dateTime.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const matchSlash = event.dateTime.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (matchSlash) return `${matchSlash[3]}-${matchSlash[2]}-${matchSlash[1]}`;
  }
  return "";
};

/* Styles centralisés des statuts selon la charte graphique */
export const CALENDAR_STATUS_STYLES = {
  en_cours: {
    label: "En cours",
    legendBadge: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    legendDot: "bg-emerald-600",
    cardStyle: "bg-emerald-100 border-l-4 border-emerald-600 text-emerald-950 shadow-sm hover:bg-emerald-200"
  },
  prochainement: {
    label: "Prochainement",
    legendBadge: "bg-sky-100 text-sky-900 border-sky-300 font-bold",
    legendDot: "bg-sky-600",
    cardStyle: "bg-sky-100 border-l-4 border-sky-600 text-sky-950 shadow-sm hover:bg-sky-200"
  },
  termine: {
    label: "Terminé",
    legendBadge: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
    legendDot: "bg-rose-600",
    cardStyle: "bg-rose-100 border-l-4 border-rose-600 text-rose-950 opacity-90 hover:bg-rose-200 shadow-sm"
  }
};

/* Styles des badges selon le statut - Charte graphique Vert Émeraude / Bleu Ciel / Rouge Rose */
export const getStatusBadgeStyle = (status: "Terminé" | "Prochainement" | "En cours" | "termine" | "prochainement" | "en_cours" | "ongoing" | "upcoming" | "completed" | string) => {
  const norm = String(status || "").toLowerCase().replace(" ", "_");
  if (norm === "en_cours" || norm === "ongoing") {
    const config = CALENDAR_STATUS_STYLES.en_cours;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-bold`,
      timeline: `${config.cardStyle} transition-all rounded-r-lg border border-emerald-200`,
      eventCard: `${config.cardStyle} transition-all rounded-r-lg border border-emerald-200`,
      cardBorder: "border-l-4 border-l-emerald-600 bg-emerald-100",
      dot: config.legendDot,
      label: config.label,
      cardStyle: config.cardStyle
    };
  } else if (norm === "termine" || norm === "terminé" || norm === "completed") {
    const config = CALENDAR_STATUS_STYLES.termine;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-medium`,
      timeline: `${config.cardStyle} transition-all rounded-r-lg border border-rose-200`,
      eventCard: `${config.cardStyle} transition-all rounded-r-lg border border-rose-200`,
      cardBorder: "border-l-4 border-l-rose-600 bg-rose-100",
      dot: config.legendDot,
      label: config.label,
      cardStyle: config.cardStyle
    };
  } else {
    // Prochainement / Upcoming -> Sky Blue
    const config = CALENDAR_STATUS_STYLES.prochainement;
    return {
      badge: config.legendBadge,
      pill: `${config.legendBadge} font-semibold`,
      timeline: `${config.cardStyle} transition-all rounded-r-lg border border-sky-200`,
      eventCard: `${config.cardStyle} transition-all rounded-r-lg border border-sky-200`,
      cardBorder: "border-l-4 border-l-sky-600 bg-sky-100",
      dot: config.legendDot,
      label: config.label,
      cardStyle: config.cardStyle
    };
  }
};

export default function CalendrierView({ 
  isPremiumUser, 
  userId, 
  userRole, 
  userGrade: userGradeProp, 
  selectedTrimestre, 
  currentLanguage = "fr",
  notifications: notificationsProp
}: CalendrierViewProps) {
  const t = translations[currentLanguage];
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<ScheduleEvent[]>(SCHEDULE_DATA);
  const scheduleEventsList = calendarEvents;
  const setScheduleEventsList = setCalendarEvents;
  const [remindedEvents, setRemindedEvents] = useState<string[]>([]);
  const [selectedEventModal, setSelectedEventModal] = useState<ScheduleEvent | null>(null);

  const jumpToLiveDate = (exactDate?: string) => {
    if (!exactDate) return;
    let year = sysNow.getFullYear();
    let month = sysNow.getMonth();
    let day = sysNow.getDate();
    const str = String(exactDate).trim();
    if (str.includes("-")) {
      const parts = str.split("-").map(Number);
      if (parts[0] > 1000) {
        [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
      } else {
        [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
      }
    } else if (str.includes("/")) {
      const parts = str.split("/").map(Number);
      if (parts[0] > 1000) {
        [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
      } else {
        [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
      }
    }
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDayVal(day);
    setViewMode("mois");
  };
  
  // Dynamic System Clock date initialization
  const sysNow = new Date();
  const [viewMode, setViewMode] = useState<"mois" | "semaine" | "jour" | "agenda">("semaine");

  // Core Calendar Navigation states anchored to exact client local system date
  const [currentYear, setCurrentYear] = useState<number>(sysNow.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(sysNow.getMonth());
  const [selectedDayVal, setSelectedDayVal] = useState<number | null>(sysNow.getDate());

  // Filters state
  const [filterGrade, setFilterGrade] = useState<string>("Tous");
  const [filterType, setFilterType] = useState<string>("Tous");

  const resetToDefaultDate = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDayVal(today.getDate());
    setViewMode("semaine");
  };

  // Main loader for events and live notifications
  const loadEventsAndNotifications = () => {
    let userGrade = userGradeProp || "Tous";
    let userGroup = "";
    let userSection = "";
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.grade) userGrade = u.grade;
        if (u.section) userSection = u.section;
        userGroup = u.study_group || u.groupe_etude || u.studyGroup || "";
      } catch (e) {}
    }

    const eventsPromise = fetch("/api/events", {
      headers: {
        "x-user-grade": userGrade,
        "x-user-section": userSection,
        "x-user-role": userRole || "student",
        "x-user-group": userGroup
      }
    })
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);

    const notifUrl = userId 
      ? `/api/notifications/${userId}?role=${userRole || 'student'}&group=${userGroup || 'ALL'}`
      : `/api/notifications?role=${userRole || 'student'}&group=${userGroup || 'ALL'}`;
      
    const notifsPromise = fetch(notifUrl)
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);

    Promise.all([eventsPromise, notifsPromise]).then(([eventsData, notifsData]) => {
      const allNotifs = Array.isArray(notifsData) && notifsData.length > 0
        ? [...(notificationsProp || []), ...notifsData]
        : (notificationsProp || (Array.isArray(notifsData) ? notifsData : []));

      const mappedSrvEvents: ScheduleEvent[] = [];

      // Process direct backend events
      if (Array.isArray(eventsData)) {
        eventsData.forEach((srvEvt: any) => {
          const groups = srvEvt.targetGroups || srvEvt.target_groups;
          if (groups && Array.isArray(groups) && groups.length > 0 && !groups.includes("ALL")) {
            if (userGroup && !groups.includes(userGroup)) {
              return;
            }
          }
          let typeMapped: "Live Zoom" | "Examen Blanc" | "Séance Présentielle" | "Devoir & Exercices" = "Live Zoom";
          if (srvEvt.event_type === "homework" || srvEvt.type === "homework") typeMapped = "Devoir & Exercices";
          else if (srvEvt.event_type === "exam" || srvEvt.type === "exam") typeMapped = "Examen Blanc";
          else if (srvEvt.event_type === "event" || srvEvt.type === "event") typeMapped = "Séance Présentielle";

          mappedSrvEvents.push({
            id: srvEvt.id,
            topic: srvEvt.title,
            dateTime: `${srvEvt.date || ""} à ${srvEvt.time || "18:00"}`,
            instructor: "M. Nabil Chaouch",
            link: srvEvt.zoom_link || srvEvt.zoomLink || srvEvt.action_url || "#",
            duration: `${srvEvt.duration_minutes || srvEvt.durationMinutes || 90} min`,
            grade: srvEvt.target_class || srvEvt.grade || "Tous",
            section: srvEvt.target_specialty || srvEvt.section || "Tous",
            targetGroups: srvEvt.target_groups || srvEvt.targetGroups || ["ALL"],
            type: typeMapped,
            eventType: srvEvt.event_type || (typeMapped === "Devoir & Exercices" ? "homework" : "live_session"),
            durationMinutes: Number(srvEvt.duration_minutes || srvEvt.durationMinutes) || 90,
            exactDate: srvEvt.date || (srvEvt.date_start ? srvEvt.date_start.split("T")[0] : ""),
            description: srvEvt.instructions || srvEvt.description || "Séance pédagogique collective."
          });
        });
      }

      // Process live notifications into calendar events
      if (Array.isArray(allNotifs)) {
        allNotifs.forEach((notif: any) => {
          const parsedEvt = parseLiveNotificationToEvent(notif);
          if (parsedEvt) {
            mappedSrvEvents.push(parsedEvt);
          }
        });
      }

      // Check localStorage fallback for local cross-tab items
      try {
        const localEvents = JSON.parse(localStorage.getItem("AZED_EVENTS") || "[]");
        const localNotifs = JSON.parse(localStorage.getItem("AZED_NOTIFS") || "[]");

        const studentProfile = {
          grade: userGrade,
          section: userSection,
          study_group: userGroup,
          groupe_etude: userGroup
        };

        if (Array.isArray(localEvents)) {
          localEvents.forEach((ev: any) => {
            if (ev && (ev.topic || ev.title)) {
              if (userRole === "student" && !isStudentTargeted(studentProfile, ev)) {
                return;
              }

              mappedSrvEvents.push({
                id: ev.id || `local_evt_${Date.now()}`,
                topic: ev.topic || ev.title,
                dateTime: ev.dateTime || `${ev.date || "2026-08-01"} à ${ev.time || "22:30"}`,
                instructor: ev.instructor || "M. Nabil Chaouch",
                link: ev.link || ev.zoomLink || ev.zoom_link || "https://zoom.us/j/simulated_nabil_zoom",
                duration: ev.duration || `${ev.durationMinutes || 90} min`,
                grade: ev.grade || ev.level || "Tous",
                type: ev.type === "exam" ? "Examen Blanc" : ev.type === "event" ? "Séance Présentielle" : "Live Zoom",
                durationMinutes: Number(ev.durationMinutes) || 90,
                exactDate: ev.exactDate || ev.date || "2026-08-01",
                description: ev.description || "Séance pédagogique collective."
              });
            }
          });
        }
        if (Array.isArray(localNotifs)) {
          localNotifs.forEach((n: any) => {
            if (userRole === "student" && !isStudentTargeted(studentProfile, {
              grade: n.targetClasse || n.grade,
              section: n.targetSpecialite || n.section,
              targetGroups: n.targetGroups || n.target_groups
            })) {
              return;
            }
            const parsed = parseLiveNotificationToEvent(n);
            if (parsed) mappedSrvEvents.push(parsed);
          });
        }
      } catch (e) {}

      setScheduleEventsList(() => {
        const merged = [...SCHEDULE_DATA];
        mappedSrvEvents.forEach((item) => {
          const existingIdx = merged.findIndex((m) => m.id === item.id || (m.exactDate === item.exactDate && m.topic === item.topic));
          if (existingIdx >= 0) {
            merged[existingIdx] = { ...merged[existingIdx], ...item };
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
    });
  };

  // Connect to real-time WebSockets & local BroadcastChannel triggers
  useRealtimeSync((msg) => {
    if (
      msg.type === "EVENT_CREATED" ||
      msg.type === "EVENT_UPDATED" ||
      msg.type === "EVENT_DELETED" ||
      msg.type === "NOTIFICATION_CREATED" ||
      msg.type === "NEW_NOTIFICATION" ||
      msg.type === "SYNC_EVENT_AND_NOTIF" ||
      msg.type === "NEW_LIVE_SESSION"
    ) {
      loadEventsAndNotifications();
    }
  });

  const handleSetReminder = (event: ScheduleEvent) => {
    if (!userId) {
      alert("Veuillez vous connecter pour configurer des rappels.");
      return;
    }

    const notifMessage = `Vous recevrez une alerte pour l'événement "${event.topic}" planifié le ${event.dateTime}.`;
    const eventPayload = {
      id: event.id,
      title: event.topic,
      topic: event.topic,
      description: event.description || "Séance pédagogique collective.",
      date: event.exactDate || "2026-08-29",
      exactDate: event.exactDate || "2026-08-29",
      dateTime: event.dateTime,
      time: event.dateTime.includes("à") ? event.dateTime.split("à")[1].trim() : "17:00",
      duration: event.duration || "1h 15min",
      instructor: event.instructor || "M. Nabil Chaouch",
      level: event.grade || "Tous",
      grade: event.grade || "Tous",
      type: event.type || "LIVE",
      status: "PROCHAINEMENT",
      groups: ["ALL"]
    };

    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: "⏰ Rappel d'événement configuré",
        content: notifMessage,
        message: notifMessage,
        type: "LIVE_SCHEDULED",
        icon: "video",
        eventData: eventPayload
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        publishAdminEvent(eventPayload, notifMessage);
        setRemindedEvents((prev) => [...prev, event.id]);
        alert(`🔔 Rappel programmé avec succès pour :\n${event.topic}`);
        window.dispatchEvent(new CustomEvent("refresh-notifications"));
      })
      .catch((err) => console.error("Error setting reminder:", err));
  };

  useEffect(() => {
    loadEventsAndNotifications();

    const handleRefresh = () => loadEventsAndNotifications();
    window.addEventListener("refresh-notifications", handleRefresh);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
    };
  }, [userId, userRole, notificationsProp]);

  const handleJoinLive = (link: string, isEWhite: boolean) => {
    if (isEWhite) return;

    if (!isPremiumUser) {
      alert("⚠️ L'accès aux séances Lives Zoom est réservé exclusivement aux élèves abonnés Premium.");
      return;
    }
    
    handleJoinClick(link);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Helper date calculation functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeekIndex = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonthCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfWeekIndex(currentYear, currentMonth);

  // Unified backward/forward shifting logic matching current viewMode
  const navigatePrevious = () => {
    if (viewMode === "mois" || viewMode === "agenda") {
      setSelectedDayVal(null);
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else if (viewMode === "semaine") {
      const d = new Date(currentYear, currentMonth, (selectedDayVal || 8) - 7);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDayVal(d.getDate());
    } else if (viewMode === "jour") {
      const d = new Date(currentYear, currentMonth, (selectedDayVal || 8) - 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDayVal(d.getDate());
    }
  };

  const navigateNext = () => {
    if (viewMode === "mois" || viewMode === "agenda") {
      setSelectedDayVal(null);
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    } else if (viewMode === "semaine") {
      const d = new Date(currentYear, currentMonth, (selectedDayVal || 8) + 7);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDayVal(d.getDate());
    } else if (viewMode === "jour") {
      const d = new Date(currentYear, currentMonth, (selectedDayVal || 8) + 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDayVal(d.getDate());
    }
  };

  // Check if an event matches a specific date and active filters using strict ISO YYYY-MM-DD
  const getEventsForDate = (year: number, month: number, day: number) => {
    const targetIso = toIsoDateString(year, month, day);
    const dayOfWeekIndex = new Date(year, month, day).getDay();

    return scheduleEventsList.filter((event) => {
      // 1. Grade Filter
      if (filterGrade !== "Tous") {
        const checkG = (event.grade || "").toLowerCase();
        const fG = filterGrade.toLowerCase();
        if (fG.includes("4ème") && !checkG.includes("4ème") && !checkG.includes("4éme")) return false;
        if (fG.includes("3ème") && !checkG.includes("3ème") && !checkG.includes("3éme")) return false;
        if (fG.includes("1ère") && !checkG.includes("1ère") && !checkG.includes("1ere")) return false;
        if (!checkG.includes(fG) && checkG !== "tous" && fG !== "tous") return false;
      }

      // 2. Type Filter
      if (filterType !== "Tous" && event.type !== filterType) {
        return false;
      }

      // 3. Strict ISO Date match (supports YYYY-MM-DD)
      const eventIso = getEventIsoDate(event);
      if (eventIso) {
        return eventIso === targetIso;
      }

      // 4. Recurring Day of the week Match (only if no explicit exactDate)
      if (event.recurringDay !== undefined) {
        return dayOfWeekIndex === event.recurringDay;
      }

      return false;
    });
  };

  // Helper for Date object filtering
  const getEventsForDay = (dayDate: Date) => {
    return getEventsForDate(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
  };

  const getEventsForCurrentMonth = () => {
    const list: { day: number; events: ScheduleEvent[] }[] = [];
    for (let d = 1; d <= daysInMonthCount; d++) {
      const evs = getEventsForDate(currentYear, currentMonth, d);
      if (evs.length > 0) {
        list.push({ day: d, events: evs });
      }
    }
    return list;
  };

  // Days list construction to fill the calendar grid rows
  const previousMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(previousMonthYear, previousMonthIndex);

  const calendarCells = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dVal = daysInPrevMonth - i;
    calendarCells.push({
      day: dVal,
      month: previousMonthIndex,
      year: previousMonthYear,
      isCurrentMonth: false,
      events: getEventsForDate(previousMonthYear, previousMonthIndex, dVal)
    });
  }

  for (let d = 1; d <= daysInMonthCount; d++) {
    calendarCells.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      events: getEventsForDate(currentYear, currentMonth, d)
    });
  }

  const totalCellsNeeded = calendarCells.length <= 35 ? 35 : 42;
  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  let nextDayCounter = 1;
  while (calendarCells.length < totalCellsNeeded) {
    calendarCells.push({
      day: nextDayCounter,
      month: nextMonthIndex,
      year: nextMonthYear,
      isCurrentMonth: false,
      events: getEventsForDate(nextMonthYear, nextMonthIndex, nextDayCounter)
    });
    nextDayCounter++;
  }

  // Active events list for rendering on the right-hand panel
  const activeEventsToRender = (() => {
    const rawList = selectedDayVal 
      ? getEventsForDate(currentYear, currentMonth, selectedDayVal)
      : getEventsForCurrentMonth().flatMap(item => item.events);
    
    const seen = new Set<string>();
    return rawList.filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
  })();

  // 7-day structure for Semaine view
  const getWeekDays = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 (Dimanche) to 6 (Samedi)
    // Shift so Lundi is 0, Dimanche is 6
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month, day + offsetToMonday + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const activeWeekDays = getWeekDays(currentYear, currentMonth, selectedDayVal || 8);

  const hoursList = Array.from({ length: 16 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="space-y-6 bg-[#FFFFFF] text-[#1F2937] leading-relaxed max-w-full">
      
      {/* TOOLBAR & NAVIGATION HEADER */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-2xs">
        
        {/* View Selection Tabs (Mois, Semaine, Jour, Agenda) */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          {[
            { id: "mois", label: "Mois" },
            { id: "semaine", label: "Semaine" },
            { id: "jour", label: "Jour" },
            { id: "agenda", label: "Agenda" }
          ].map((tab) => {
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setViewMode(tab.id as any);
                  if (!selectedDayVal) setSelectedDayVal(8);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Month Navigation (< Août 2026 >) */}
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={navigatePrevious}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
            title="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              {viewMode === "mois" ? (
                `${MONTHS_FR[currentMonth]} ${currentYear}`
              ) : viewMode === "jour" ? (
                `${selectedDayVal || 8} ${MONTHS_FR[currentMonth]} ${currentYear}`
              ) : viewMode === "semaine" ? (
                `Semaine du ${activeWeekDays[0].getDate()} au ${activeWeekDays[6].getDate()} ${MONTHS_FR[currentMonth]} ${currentYear}`
              ) : (
                `Agenda ${MONTHS_FR[currentMonth]} ${currentYear}`
              )}
            </span>
            <button
              onClick={resetToDefaultDate}
              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
              title="Réinitialiser la date"
            >
              <RotateCw size={13} />
            </button>
          </div>

          <button 
            onClick={navigateNext}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
            title="Suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Filter and Legend Pills */}
        <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <select 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedDayVal(null);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:outline-none cursor-pointer hover:border-slate-300 transition-all shadow-2xs"
            >
              <option value="Tous">Tous les formats</option>
              <option value="Live Zoom">Lives Zoom</option>
              <option value="Examen Blanc">Examens Blancs</option>
              <option value="Séance Présentielle">Séance Présentielle</option>
            </select>
          </div>

          {/* Color Indicators / Legend */}
          <div className="flex items-center gap-2">
            <span className={`font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs border ${CALENDAR_STATUS_STYLES.en_cours.legendBadge}`}>
              <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.en_cours.legendDot} animate-pulse`} />
              {CALENDAR_STATUS_STYLES.en_cours.label}
            </span>
            <span className={`font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs border ${CALENDAR_STATUS_STYLES.prochainement.legendBadge}`}>
              <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.prochainement.legendDot}`} />
              {CALENDAR_STATUS_STYLES.prochainement.label}
            </span>
            <span className={`font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs border ${CALENDAR_STATUS_STYLES.termine.legendBadge}`}>
              <span className={`w-2 h-2 rounded-full ${CALENDAR_STATUS_STYLES.termine.legendDot}`} />
              {CALENDAR_STATUS_STYLES.termine.label}
            </span>
          </div>
        </div>
      </div>

      {/* UPCOMING ADMIN LIVES ANNOUNCEMENT BANNER */}
      {(() => {
        const liveEvent = calendarEvents.find(e => String(e.type || "").toUpperCase().includes("LIVE") || e.type === "Live Zoom");
        if (!liveEvent) return null;
        return (
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-sky-50 border border-emerald-200/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Video size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider">
                      Live Planifié
                    </span>
                    <strong className="text-slate-900 font-extrabold text-xs">{liveEvent.topic}</strong>
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span>📅 Date :</span>
                    <strong className="text-slate-900 font-extrabold">{liveEvent.exactDate || liveEvent.dateTime}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span>🕒 Heure :</span>
                    <strong className="text-slate-900 font-extrabold">{liveEvent.dateTime}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span>👨‍🏫 Enseignant :</span>
                    <strong className="text-slate-900 font-extrabold">{liveEvent.instructor}</strong>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => jumpToLiveDate(liveEvent.exactDate || liveEvent.dateTime)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap self-end sm:self-center flex items-center gap-1.5"
            >
              <span>🎯 Sélectionner sur le calendrier</span>
            </button>
          </div>
        );
      })()}

      {/* CORE CALENDAR GRID & TIMELINES (FULL WIDTH) */}
      <div className="w-full border border-slate-100 rounded-3xl bg-white shadow-2xs p-4 sm:p-6 overflow-hidden animate-fade-in">
        
        {/* MONTH VIEW GRID */}
        {viewMode === "mois" && (
          <div className="space-y-4">
            {/* Weekday Names Grid Header */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
              {WEEKDAYS_FR.map((wd) => (
                <div key={wd} className="text-xs font-bold text-slate-500 py-2 uppercase tracking-wider text-center">
                  {wd}
                </div>
              ))}
            </div>

            {/* Actual Grid Days list */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {calendarCells.map((cell, index) => {
                const isSelected = selectedDayVal === cell.day && cell.isCurrentMonth;
                const hasEvents = cell.events.length > 0;
                const realNow = new Date();
                const isToday = cell.day === realNow.getDate() && cell.month === realNow.getMonth() && cell.year === realNow.getFullYear();

                let dayCellClasses = "border border-slate-100 bg-white rounded-2xl p-2.5 hover:border-emerald-300 transition-all shadow-2xs min-h-[120px] flex flex-col justify-between cursor-pointer select-none relative ";
                
                if (!cell.isCurrentMonth) {
                  dayCellClasses = "border border-slate-100/60 bg-slate-50/40 rounded-2xl p-2.5 text-slate-350 hover:bg-slate-50/80 transition-all min-h-[120px] flex flex-col justify-between cursor-pointer select-none relative ";
                } else if (isSelected) {
                  dayCellClasses += "ring-2 ring-emerald-500 bg-emerald-50/30 border-emerald-400 ";
                }

                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => {
                      setCurrentMonth(cell.month);
                      setCurrentYear(cell.year);
                      setSelectedDayVal(cell.day);
                    }}
                    className={dayCellClasses}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs transition-all ${
                        isToday 
                          ? "bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-extrabold shadow-sm" 
                          : isSelected
                            ? "bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-lg text-xs"
                            : cell.isCurrentMonth ? "font-bold text-slate-800" : "font-semibold text-slate-400"
                      }`}>
                        {cell.day.toString().padStart(2, "0")}
                      </span>
                    </div>

                    {/* Minimalist event display in cell: Title + Duration */}
                    <div className="mt-1.5 space-y-1">
                      {hasEvents && (
                        <div className="flex flex-col gap-1.5">
                          {cell.events.slice(0, 3).map((e) => {
                            const status = getEventStatus(e, cell.day, cell.month, cell.year);
                            const statusStyle = getStatusBadgeStyle(status);
                            const durationLabel = e.duration || `${e.durationMinutes || 90} min`;
                            const typeLabel = (e.type === 'Live Zoom' || String(e.type).toUpperCase().includes('LIVE')) ? 'LIVE' : (e.type || 'COURS');

                            return (
                              <div 
                                key={e.id} 
                                onClick={(evtClick) => {
                                  evtClick.stopPropagation();
                                  setSelectedEventModal(e);
                                }}
                                className={`w-full p-2 rounded-r-lg shadow-sm border border-black/5 transition-all flex flex-col justify-between cursor-pointer ${statusStyle.eventCard}`}
                                title={`${e.topic} (${durationLabel})`}
                              >
                                <div className="font-bold text-xs truncate leading-tight text-slate-900">
                                  {e.topic}
                                </div>
                                <div className="flex items-center justify-between text-[11px] mt-1.5">
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                                    <Clock size={11} className="shrink-0" /> {durationLabel}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/80 text-slate-900 shadow-2xs border border-black/10">
                                    {typeLabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {cell.events.length > 3 && (
                            <div className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md w-fit">
                              + {cell.events.length - 3} séances
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEMAINE VIEW TIME GRID (DEFAULT) */}
        {viewMode === "semaine" && (
          <div className="flex flex-col h-[640px] overflow-hidden">
            {/* Day header columns */}
            <div className="grid grid-cols-8 gap-2 border-b border-slate-100 pb-2.5 text-center text-xs font-bold shrink-0">
              <div className="text-slate-400 py-1 font-semibold">Heure</div>
              {activeWeekDays.map((dayDate, idx) => {
                const isCurrentSelected = selectedDayVal === dayDate.getDate() && currentMonth === dayDate.getMonth();
                const realNow = new Date();
                const isActualToday = dayDate.getDate() === realNow.getDate() && dayDate.getMonth() === realNow.getMonth() && dayDate.getFullYear() === realNow.getFullYear();
                
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDayVal(dayDate.getDate())}
                    className={`py-1.5 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all ${
                      isCurrentSelected 
                        ? "bg-slate-100 border border-slate-200 shadow-2xs" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-semibold">{WEEKDAYS_FR[idx]}</span>
                    <span className={`text-xs mt-0.5 w-7 h-7 flex items-center justify-center rounded-full font-bold ${
                      isActualToday 
                        ? "bg-[#2BD4A2] text-white font-extrabold shadow-3xs" 
                        : isCurrentSelected ? "bg-slate-200 text-[#0F1E36]" : "text-slate-700"
                    }`}>
                      {dayDate.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time axis grid */}
            <div className="flex-1 overflow-y-auto pr-1 relative mt-2">
              <div className="grid grid-cols-8 gap-2 relative h-[800px]">
                
                {/* Horizontal Hour Lines Background */}
                {hoursList.map((_, hIdx) => (
                  <div 
                    key={hIdx} 
                    className="absolute left-0 right-0 border-t border-dashed border-slate-100/80 pointer-events-none" 
                    style={{ top: `${hIdx * 50}px`, height: "50px" }}
                  />
                ))}

                {/* Left Column: Hours */}
                <div className="col-span-1 flex flex-col justify-between h-full text-slate-400 text-[10px] font-bold text-left select-none pr-1">
                  {hoursList.map((h) => (
                    <div key={h} className="h-[50px] pt-1 flex items-start">
                      {h}
                    </div>
                  ))}
                </div>

                {/* 7 Columns for Weekdays */}
                {activeWeekDays.map((dayDate, colIdx) => {
                  const dayEvents = getEventsForDate(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
                  
                  return (
                    <div key={colIdx} className="col-span-1 relative h-full border-r border-slate-100/50">
                      {dayEvents.map((evt) => {
                        const { startHour, startMinute } = getEventHours(evt);
                        // Grid starts at 08:00 (index 0)
                        const startMins = (startHour - 8) * 60 + startMinute;
                        const durationMins = evt.durationMinutes || 90;
                        
                        const topPx = (startMins / 60) * 50;
                        const heightPx = Math.max((durationMins / 60) * 50, 48);

                        const status = getEventStatus(evt, dayDate.getDate(), dayDate.getMonth(), dayDate.getFullYear());
                        const statusStyle = getStatusBadgeStyle(status);
                        const durationLabel = evt.duration || `${evt.durationMinutes || 90} min`;
                        const typeLabel = (evt.type === 'Live Zoom' || String(evt.type).toUpperCase().includes('LIVE')) ? 'LIVE' : (evt.type || 'COURS');

                        return (
                          <div
                            key={evt.id}
                            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayVal(dayDate.getDate());
                              setSelectedEventModal(evt);
                            }}
                            className={`absolute left-[2px] right-[2px] p-2 rounded-r-lg shadow-sm border border-black/5 transition-all flex flex-col justify-between cursor-pointer select-none overflow-hidden ${statusStyle.eventCard}`}
                            title={`${evt.topic} (${durationLabel})`}
                          >
                            <div className="font-bold text-xs truncate leading-tight text-slate-900">
                              {evt.topic}
                            </div>
                            <div className="flex items-center justify-between text-[11px] mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                                <Clock size={11} className="shrink-0" /> {durationLabel}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/80 text-slate-900 shadow-2xs border border-black/10 shrink-0">
                                {typeLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        )}

        {/* JOUR VIEW SINGLE DAY GRID */}
        {viewMode === "jour" && (
          <div className="flex flex-col h-[640px] overflow-hidden text-left">
            <div className="border-b border-slate-100 pb-2.5 mb-2 text-xs font-bold flex justify-between items-center text-slate-700 shrink-0">
              <span>Séances du {selectedDayVal || sysNow.getDate()} {MONTHS_FR[currentMonth]} {currentYear}</span>
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg font-extrabold text-xs">Vue Journalière</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 relative">
              <div className="grid grid-cols-12 gap-2 relative h-[800px]">
                
                {/* Hour slots lines */}
                {hoursList.map((_, hIdx) => (
                  <div 
                    key={hIdx} 
                    className="absolute left-0 right-0 border-t border-slate-100/80 pointer-events-none" 
                    style={{ top: `${hIdx * 50}px`, height: "50px" }}
                  />
                ))}

                {/* Left Column: Hour label scale */}
                <div className="col-span-2 text-slate-400 text-xs font-bold pr-2 flex flex-col justify-between h-full select-none border-r border-slate-100">
                  {hoursList.map((h) => (
                    <div key={h} className="h-[50px] pt-1 flex items-start">
                      {h}
                    </div>
                  ))}
                </div>

                {/* Main Day Timeline column */}
                <div className="col-span-10 relative h-full">
                  {getEventsForDate(currentYear, currentMonth, selectedDayVal || sysNow.getDate()).map((evt) => {
                    const { startHour, startMinute, endHour, endMinute } = getEventHours(evt);
                    const startMins = (startHour - 8) * 60 + startMinute;
                    const durationMins = evt.durationMinutes || 90;
                    
                    const topPx = (startMins / 60) * 50;
                    const heightPx = Math.max((durationMins / 60) * 50, 52);

                    const status = getEventStatus(evt, selectedDayVal || sysNow.getDate(), currentMonth, currentYear);
                    const statusStyle = getStatusBadgeStyle(status);
                    const durationLabel = evt.duration || `${evt.durationMinutes || 90} min`;

                    return (
                      <div
                        key={evt.id}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventModal(evt);
                        }}
                        className={`absolute left-2 right-2 p-3 rounded-r-lg shadow-sm border border-black/5 transition-all flex flex-col justify-between cursor-pointer ${statusStyle.eventCard}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{evt.topic}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/80 text-slate-900 shadow-2xs border border-black/10 shrink-0">
                              {evt.type === 'Live Zoom' ? 'LIVE' : (evt.type || 'COURS')}
                            </span>
                          </div>
                          {evt.description && (
                            <p className="text-[10px] text-slate-600 font-medium mt-1 line-clamp-1">{evt.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-700 font-semibold border-t border-black/10 pt-1">
                          <span className="flex items-center gap-1"><Clock size={11} /> {startHour}:{startMinute.toString().padStart(2, "0")} - {endHour}:{endMinute.toString().padStart(2, "0")} ({durationLabel})</span>
                          <span className="flex items-center gap-1"><Users size={11} /> {evt.instructor || "M. Nabil Chaouch"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* AGENDA VIEW CHRONOLOGICAL LIST */}
        {viewMode === "agenda" && (
          <div className="space-y-4 text-left">
            <div className="border-b border-slate-100 pb-2 text-xs font-bold text-slate-400">
              Flux Chronologique des Cours de {MONTHS_FR[currentMonth]} {currentYear}
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {getEventsForCurrentMonth().length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-2xl">
                  <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-400 font-bold">Aucun cours planifié ce mois-ci.</p>
                </div>
              ) : (
                getEventsForCurrentMonth().map((dayObj, dIdx) => (
                  <div key={dIdx} className="border-b border-slate-50 pb-3 last:border-b-0">
                    <div className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg w-fit mb-2">
                      {dayObj.day} {MONTHS_FR[currentMonth]} {currentYear}
                    </div>

                    <div className="space-y-2">
                      {dayObj.events.map((evt) => {
                        const status = getEventStatus(evt, dayObj.day, currentMonth, currentYear);
                        const statusStyle = getStatusBadgeStyle(status);
                        const durationLabel = evt.duration || `${evt.durationMinutes || 90} min`;

                        return (
                          <div 
                            key={evt.id}
                            onClick={() => setSelectedEventModal(evt)}
                            className={`p-3.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${statusStyle.eventCard}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-3 h-3 rounded-full shrink-0 ${statusStyle.dot} ${status === 'En cours' ? 'animate-pulse' : ''}`} />
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{evt.topic}</h4>
                                <p className="text-[10px] text-slate-700 font-semibold flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1"><Clock size={11} /> {evt.dateTime}</span>
                                  <span>•</span>
                                  <span className="font-bold">{durationLabel}</span>
                                  <span>•</span>
                                  <span>{evt.instructor || "M. Nabil Chaouch"}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${statusStyle.badge}`}>
                                {statusStyle.label}
                              </span>
                              <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 border border-slate-200 rounded-md shrink-0 shadow-3xs text-slate-700">
                                {evt.type}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 text-left mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
          <span>💡 Cliquez sur une séance pour afficher sa fiche complète et le bouton d'accès direct.</span>
          <span>{scheduleEventsList.length} cours répertoriés</span>
        </div>
      </div>

      {/* DETAILED EVENT POPUP MODAL */}
      <AnimatePresence>
        {selectedEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative text-left"
            >
              <button
                onClick={() => setSelectedEventModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <Video size={12} className="text-emerald-600" />
                  {selectedEventModal.type || 'Live Session Zoom'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  Niveau : {selectedEventModal.grade}
                </span>
                {selectedEventModal.section && selectedEventModal.section !== 'Tous' && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {selectedEventModal.section}
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1E36] dark:text-slate-100 leading-snug">
                {selectedEventModal.topic}
              </h3>

              {selectedEventModal.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {selectedEventModal.description}
                </p>
              )}

              <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-center justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/60">
                  <span className="text-slate-500 font-medium">📅 Date :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedEventModal.exactDate || selectedEventModal.dateTime}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/60">
                  <span className="text-slate-500 font-medium">🕒 Heure de démarrage :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedEventModal.dateTime}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/60">
                  <span className="text-slate-500 font-medium">⏱️ Durée estimée :</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEventModal.duration || `${selectedEventModal.durationMinutes || 90} min`}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">👨‍🏫 Professeur / Enseignant :</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{selectedEventModal.instructor || "M. Nabil Chaouch"}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                {(() => {
                  const targetUrl = selectedEventModal.link && selectedEventModal.link !== '#' 
                    ? (selectedEventModal.link.startsWith('http') ? selectedEventModal.link : `https://${selectedEventModal.link}`)
                    : 'https://zoom.us/j/simulated_nabil_zoom';
                  
                  return (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 bg-[#2BD4A2] hover:bg-[#20b88a] active:scale-[0.98] text-white cursor-pointer"
                    >
                      <Video size={16} />
                      <span>Rejoindre la réunion Live</span>
                    </a>
                  );
                })()}
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
