import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Video, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  Download, 
  ExternalLink,
  Sparkles,
  Info,
  Layers,
  Award,
  Filter,
  Check,
  MapPin,
  CalendarDays,
  FileText
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  topic: string;
  dateTime: string;
  instructor: string;
  link: string;
  duration: string;
  grade: string;
  type: "Live Zoom" | "Examen Blanc" | "Séance Présentielle";
  durationMinutes: number;
  exactDate?: string; // Format: "YYYY-MM-DD"
  recurringDay?: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  description?: string;
}

interface TodoEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH:MM
  dueDate: string; // YYYY-MM-DD
  pdfUrl?: string;
  pdfName?: string;
  notes?: string;
  createdAt: string;
  reminder?: string;
  isPremium?: boolean;
  targetClass?: string;
}

const DEFAULT_SCHEDULE_DATA: ScheduleEvent[] = [
  {
    id: "e1",
    topic: "Algorithmique Pratique - Correction du Devoir de Synthèse N°2",
    dateTime: "Tous les lundis à 18h30",
    instructor: "M. Nabil Chaouch",
    link: "https://zoom.us/j/simulated_nabil_zoom",
    duration: "1h 30min",
    grade: "4ème Année (Bac Info)",
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
    grade: "4ème Année (Bac Info)",
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
    grade: "3ème Année",
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
    grade: "4ème Année (Bac Info)",
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

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WEEKDAYS_FR = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

interface CalendrierAnnuelViewProps {
  isPremiumUser: boolean;
  userId?: string;
  userRole?: string;
  userGrade?: string;
}

export default function CalendrierAnnuelView({ isPremiumUser, userId, userRole, userGrade }: CalendrierAnnuelViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(DEFAULT_SCHEDULE_DATA);
  const [todoEvents, setTodoEvents] = useState<TodoEvent[]>([]);
  const [completedTodos, setCompletedTodos] = useState<Record<string, boolean>>({});
  const [filterGrade, setFilterGrade] = useState<string>("Tous");
  const [filterType, setFilterType] = useState<string>("Tous"); // "Tous", "devoirs", "lives", "examens"
  const [activeViewTab, setActiveViewTab] = useState<"grid" | "timeline">("grid");
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Day Details Modal / Card State
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>({ year: 2026, month: 5, day: 15 }); // Default to June 15, 2026 as a starting interactive view

  useEffect(() => {
    // Sync completed state
    try {
      const saved = localStorage.getItem("completed_todo_events");
      if (saved) {
        setCompletedTodos(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    let userGroup = "";
    const storedUserStr = localStorage.getItem("current_user");
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        userGroup = u.study_group || u.groupe_etude || u.studyGroup || "";
      } catch (e) {}
    }

    // Fetch schedule events
    const fetchSchedules = fetch("/api/events", {
      headers: {
        "x-user-grade": userGrade || "Tous",
        "x-user-role": userRole || "student",
        "x-user-group": userGroup
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((item: any) => {
            const groups = item.targetGroups || item.target_groups;
            if (groups && Array.isArray(groups) && groups.length > 0 && !groups.includes("ALL")) {
              if (!userGroup || !groups.includes(userGroup)) {
                return false;
              }
            }
            return true;
          });

          const mapped: ScheduleEvent[] = filtered.map((item: any) => {
            let typeMapped: "Live Zoom" | "Examen Blanc" | "Séance Présentielle" = "Live Zoom";
            if (item.type === "exam") typeMapped = "Examen Blanc";
            else if (item.type === "event") typeMapped = "Séance Présentielle";

            return {
              id: item.id,
              topic: item.title,
              dateTime: `${item.date} à ${item.time}`,
              instructor: "M. Nabil Chaouch",
              link: item.zoomLink || "#",
              duration: `${item.durationMinutes} min`,
              grade: item.grade || "Tous",
              type: typeMapped,
              durationMinutes: Number(item.durationMinutes) || 90,
              exactDate: item.date,
              description: item.description || "Séance collective."
            };
          });

          // Merge without duplicate keys
          const merged = [...DEFAULT_SCHEDULE_DATA];
          mapped.forEach((item) => {
            if (!merged.some((m) => m.id === item.id)) {
              merged.push(item);
            }
          });
          return merged;
        }
        return DEFAULT_SCHEDULE_DATA;
      })
      .catch((err) => {
        console.warn("Using fallback default schedule events", err);
        return DEFAULT_SCHEDULE_DATA;
      });

    // Fetch todo/homework events
    const fetchTodos = fetch("/api/todo-events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      })
      .catch((err) => {
        console.warn("Could not load homework events", err);
        return [];
      });

    Promise.all([fetchSchedules, fetchTodos]).then(([schList, todoList]) => {
      setScheduleEvents(schList);
      setTodoEvents(todoList);
      setLoading(false);
    });
  }, [userGrade, userRole]);

  const handleToggleTodo = (id: string) => {
    const updated = {
      ...completedTodos,
      [id]: !completedTodos[id]
    };
    setCompletedTodos(updated);
    localStorage.setItem("completed_todo_events", JSON.stringify(updated));
  };

  // Helper date functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeekIndex = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
  };

  // Check if a day has events
  const getEventsForDay = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    // Filters match helper
    const matchesFilterGrade = (grade: string) => {
      if (filterGrade === "Tous") return true;
      const gLow = grade.toLowerCase();
      const fLow = filterGrade.toLowerCase();
      if (fLow.includes("4ème") && !gLow.includes("4ème")) return false;
      if (fLow.includes("3ème") && !gLow.includes("3ème")) return false;
      if (fLow.includes("1ère") && !gLow.includes("1ère")) return false;
      return gLow.includes(fLow) || gLow === "tous";
    };

    // Filter devoirs
    const devoirsOnDay = todoEvents.filter((evt) => {
      // Devoir target class or filter
      const matchesGrade = filterGrade === "Tous" || !evt.targetClass || evt.targetClass === "Tous" || evt.targetClass.toLowerCase().includes(filterGrade.toLowerCase());
      if (!matchesGrade) return false;

      // Event falls on exact date
      return evt.dueDate === dateStr || evt.date === dateStr;
    });

    // Filter lives/exams
    const scheduleOnDay = scheduleEvents.filter((evt) => {
      if (!matchesFilterGrade(evt.grade)) return false;

      // Exact Date match
      if (evt.exactDate) {
        return evt.exactDate === dateStr;
      }

      // Recurring day of the week match
      if (evt.recurringDay !== undefined) {
        const dObj = new Date(year, month, day);
        return dObj.getDay() === evt.recurringDay;
      }

      return false;
    });

    // Map combined events
    const combined: Array<{
      id: string;
      title: string;
      time: string;
      category: "devoir" | "live" | "examen" | "presentiel";
      raw: any;
    }> = [];

    devoirsOnDay.forEach((evt) => {
      combined.push({
        id: evt.id,
        title: `📚 Devoir : ${evt.name}`,
        time: evt.hour || "Toute la journée",
        category: "devoir",
        raw: evt
      });
    });

    scheduleOnDay.forEach((evt) => {
      let category: "live" | "examen" | "presentiel" = "live";
      if (evt.type === "Examen Blanc") category = "examen";
      else if (evt.type === "Séance Présentielle") category = "presentiel";

      combined.push({
        id: evt.id,
        title: evt.topic,
        time: evt.dateTime.includes("à") ? evt.dateTime.split("à")[1].trim() : "À définir",
        category,
        raw: evt
      });
    });

    // Apply Filter Type
    if (filterType === "devoirs") {
      return combined.filter(c => c.category === "devoir");
    } else if (filterType === "lives") {
      return combined.filter(c => c.category === "live");
    } else if (filterType === "examens") {
      return combined.filter(c => c.category === "examen" || c.category === "presentiel");
    }

    return combined;
  };

  const handleJoinZoom = (link: string) => {
    if (!isPremiumUser) {
      alert("⚠️ L'accès aux séances Lives Zoom est réservé exclusivement aux élèves abonnés Premium.");
      return;
    }
    alert(`🌐 Redirection vers le Live Zoom :\n${link}`);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6" id="calendrier-annuel-container">
      {/* Control Toolbar and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-150 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Toggle Grid vs Timeline & Year selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setActiveViewTab("grid")}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeViewTab === "grid"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              <CalendarDays size={14} />
              Vue Calendrier 12-Mois
            </button>
            <button
              onClick={() => setActiveViewTab("timeline")}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeViewTab === "timeline"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              <Layers size={14} />
              Fil Chronologique
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
              title="Année précédente"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-black tracking-wider px-2 text-gray-900 dark:text-white">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
              title="Année suivante"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-wider uppercase text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
            <span>Devoirs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
            <span>Lives Zoom</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
            <span>Examens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
            <span>Présentiel</span>
          </div>
        </div>

        {/* Filter select inputs */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-300">
            <Filter size={12} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none focus:outline-hidden text-xs pr-2 cursor-pointer"
            >
              <option value="Tous">Tous les Types</option>
              <option value="devoirs">Devoirs Uniquement</option>
              <option value="lives">Lives Zoom</option>
              <option value="examens">Examens & Présentiel</option>
            </select>
          </div>

          <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-300">
            <BookOpen size={12} className="text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-transparent border-none focus:outline-hidden text-xs pr-2 cursor-pointer"
            >
              <option value="Tous">Tous les Niveaux</option>
              <option value="4ème Année">4ème Année (Bac Info)</option>
              <option value="3ème Année">3ème Année</option>
              <option value="1ère Année">1ère Année</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Chargement des agendas scolaires...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Calendar View Area */}
          <div className="lg:col-span-8 space-y-4">
            {activeViewTab === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {MONTHS_FR.map((monthName, monthIdx) => {
                  const daysInMonth = getDaysInMonth(selectedYear, monthIdx);
                  const firstDayOffset = getFirstDayOfWeekIndex(selectedYear, monthIdx);
                  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                  const offsetArray = Array.from({ length: firstDayOffset }, (_, i) => i);

                  return (
                    <div 
                      key={monthIdx}
                      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-3xs flex flex-col justify-between"
                    >
                      {/* Month Name */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-slate-200">
                          {monthName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {selectedYear}
                        </span>
                      </div>

                      {/* Day of week headers */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {WEEKDAYS_FR.map((wd, i) => (
                          <span key={i} className="text-[9px] font-bold text-gray-400 uppercase">
                            {wd}
                          </span>
                        ))}
                      </div>

                      {/* Grid days */}
                      <div className="grid grid-cols-7 gap-1">
                        {offsetArray.map((_, i) => (
                          <div key={`offset-${i}`} className="aspect-square" />
                        ))}
                        
                        {daysArray.map((day) => {
                          const evts = getEventsForDay(selectedYear, monthIdx, day);
                          const isSelected = selectedDayInfo?.year === selectedYear &&
                                             selectedDayInfo?.month === monthIdx &&
                                             selectedDayInfo?.day === day;

                          // Indicators background coloring logic
                          const hasDevoir = evts.some(e => e.category === "devoir");
                          const hasLive = evts.some(e => e.category === "live");
                          const hasExamen = evts.some(e => e.category === "examen");
                          const hasPres = evts.some(e => e.category === "presentiel");

                          let bgClass = "bg-transparent text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700";
                          let borderClass = "border-transparent";

                          if (isSelected) {
                            bgClass = "bg-[#0F1E36] dark:bg-slate-900 text-white font-black";
                            borderClass = "border-[#3B82F6]";
                          }

                          return (
                            <button
                              key={`day-${day}`}
                              onClick={() => setSelectedDayInfo({ year: selectedYear, month: monthIdx, day })}
                              className={`aspect-square text-[10px] font-semibold rounded-md flex flex-col items-center justify-between p-0.5 transition-all relative border ${bgClass} ${borderClass} cursor-pointer group`}
                            >
                              <span>{day}</span>
                              
                              {/* Bottom colored indicator dots */}
                              <div className="flex justify-center items-center gap-0.5 mt-0.5 w-full">
                                {hasDevoir && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                                {hasLive && <span className="w-1 h-1 rounded-full bg-indigo-500" />}
                                {hasExamen && <span className="w-1 h-1 rounded-full bg-rose-500" />}
                                {hasPres && <span className="w-1 h-1 rounded-full bg-amber-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Chronological linear list
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-150 dark:border-slate-700 shadow-3xs space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    Fil Chronologique des Devoirs & Lives de l'Année {selectedYear}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                    Parcourez la totalité de l'emploi du temps chronologique filtré par niveau.
                  </p>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {MONTHS_FR.map((monthName, monthIdx) => {
                    // Collect all events in this month
                    const monthEvents: Array<{
                      day: number;
                      events: any[];
                    }> = [];

                    const daysInMonth = getDaysInMonth(selectedYear, monthIdx);
                    for (let d = 1; d <= daysInMonth; d++) {
                      const evts = getEventsForDay(selectedYear, monthIdx, d);
                      if (evts.length > 0) {
                        monthEvents.push({ day: d, events: evts });
                      }
                    }

                    if (monthEvents.length === 0) return null;

                    return (
                      <div key={monthIdx} className="space-y-2">
                        <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg">
                          {monthName} {selectedYear}
                        </h4>
                        
                        <div className="space-y-2 pl-3 border-l border-gray-100 dark:border-slate-700 ml-2">
                          {monthEvents.map(({ day, events }) => (
                            <div key={day} className="flex gap-4">
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-12 pt-1 shrink-0">
                                {day} {monthName.substring(0, 4)}.
                              </span>
                              <div className="space-y-1.5 flex-1">
                                {events.map((evt) => (
                                  <div 
                                    key={evt.id}
                                    onClick={() => setSelectedDayInfo({ year: selectedYear, month: monthIdx, day })}
                                    className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/60 bg-gray-50/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer flex items-center justify-between text-[11px] font-semibold transition-all"
                                  >
                                    <div className="flex items-center gap-2">
                                      {evt.category === "devoir" ? (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      ) : evt.category === "live" ? (
                                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                      ) : evt.category === "examen" ? (
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                      ) : (
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                      )}
                                      <span className="text-gray-800 dark:text-slate-200 line-clamp-1">{evt.title}</span>
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-mono shrink-0">{evt.time}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Selected Day Sidebar Details Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-150 dark:border-slate-700 shadow-3xs sticky top-6">
              
              {selectedDayInfo ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Événements programmés</p>
                      <h3 className="text-base font-extrabold text-[#0F1E36] dark:text-slate-200">
                        {selectedDayInfo.day} {MONTHS_FR[selectedDayInfo.month]} {selectedDayInfo.year}
                      </h3>
                    </div>
                    <Calendar className="text-blue-500 shrink-0" size={20} />
                  </div>

                  {/* Day's specific events count check */}
                  {(() => {
                    const dayEvts = getEventsForDay(selectedDayInfo.year, selectedDayInfo.month, selectedDayInfo.day);
                    if (dayEvts.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-gray-500">
                          <Info size={32} className="mb-2 text-gray-300 dark:text-slate-600" />
                          <p className="text-xs font-bold uppercase tracking-wider">Aucun événement</p>
                          <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed">
                            Aucune séance Live Zoom ou devoir n'est planifié pour ce jour précis.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {dayEvts.map((item) => {
                          const isCompleted = completedTodos[item.id];
                          
                          return (
                            <div 
                              key={item.id}
                              className={`p-4 rounded-xl border text-xs transition-all ${
                                item.category === "devoir" 
                                  ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40" 
                                  : item.category === "live"
                                    ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/40"
                                    : item.category === "examen"
                                      ? "bg-rose-50/20 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40"
                                      : "bg-amber-50/20 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                                    item.category === "devoir"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : item.category === "live"
                                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                        : item.category === "examen"
                                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  }`}>
                                    {item.category === "devoir" ? "Devoir" : item.category === "live" ? "Live Zoom" : item.category === "examen" ? "Examen" : "Présentiel"}
                                  </span>
                                  <h4 className="font-extrabold text-gray-900 dark:text-white leading-tight">
                                    {item.title}
                                  </h4>
                                </div>

                                {item.category === "devoir" && (
                                  <button
                                    onClick={() => handleToggleTodo(item.id)}
                                    className="p-1 rounded-md text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                    title={isCompleted ? "Marquer comme non fait" : "Marquer comme complété"}
                                  >
                                    {isCompleted ? (
                                      <CheckSquare size={16} className="text-emerald-500" />
                                    ) : (
                                      <Square size={16} />
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Details fields */}
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/60 space-y-2 text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <Clock size={12} className="text-gray-400" />
                                  <span className="font-mono">{item.time}</span>
                                </div>

                                {item.category === "live" && (
                                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-slate-700/80">
                                    <p className="text-[10px] text-gray-400 font-bold">Enseignant : <span className="text-gray-800 dark:text-slate-300">{item.raw?.instructor}</span></p>
                                    <p className="text-[10px] text-gray-400 font-bold">Durée : <span className="text-gray-800 dark:text-slate-300">{item.raw?.duration}</span></p>
                                    <p className="text-[10px] text-gray-400 font-bold">Niveau : <span className="text-blue-500 font-bold">{item.raw?.grade}</span></p>
                                    
                                    <button
                                      onClick={() => handleJoinZoom(item.raw?.link)}
                                      className="w-full mt-2 py-1.5 bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Video size={12} />
                                      Rejoindre le Live Zoom
                                    </button>
                                  </div>
                                )}

                                {item.category === "devoir" && (
                                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/80">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Description / Notes :</p>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 italic">
                                      {item.raw?.notes || "Aucun détail complémentaire fourni."}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1">Échéance : <span className="text-rose-500 font-mono font-bold">{item.raw?.dueDate}</span></p>

                                    {item.raw?.pdfName && (
                                      <div className="mt-2 pt-2 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between gap-1.5">
                                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                                          <FileText size={11} className="text-red-500" />
                                          <span className="text-[9px] text-gray-500 truncate">{item.raw?.pdfName}</span>
                                        </div>
                                        {item.raw?.pdfContent ? (
                                          <a
                                            href={item.raw?.pdfContent || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-md text-[9px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                                          >
                                            <FileText size={10} />
                                            Consulter
                                          </a>
                                        ) : (
                                          <span className="text-[8px] text-gray-400 font-semibold italic">Non hébergé</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {item.category === "examen" && (
                                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/80">
                                    <p className="text-[10px] text-gray-400 font-bold">Coordinateur : <span className="text-gray-800 dark:text-slate-300">{item.raw?.instructor}</span></p>
                                    <p className="text-[10px] text-gray-400 font-bold">Durée : <span className="text-gray-800 dark:text-slate-300">{item.raw?.duration}</span></p>
                                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1 italic">{item.raw?.description}</p>
                                  </div>
                                )}

                                {item.category === "presentiel" && (
                                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/80">
                                    <p className="text-[10px] text-gray-400 font-bold">Adresse : <span className="text-blue-600 dark:text-blue-400 font-bold">El Mourouj 1, Centre Le Plus</span></p>
                                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1 italic">{item.raw?.description}</p>
                                    <a
                                      href={item.raw?.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <MapPin size={11} />
                                      Voir sur Google Maps
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <CalendarDays size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold uppercase">Sélectionnez un jour</p>
                  <p className="text-[10px] mt-1">Cliquez sur n'importe quel jour du calendrier annuel pour inspecter le détail des Lives, examens et devoirs.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
