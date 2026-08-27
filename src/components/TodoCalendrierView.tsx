import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  CalendarRange, 
  Info, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  CalendarDays, 
  Download,
  Home,
  FileText,
  ExternalLink
} from "lucide-react";

export interface TodoEvent {
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

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface TodoCalendrierViewProps {
  userId?: string;
  userRole?: string;
}

export default function TodoCalendrierView({ userId, userRole }: TodoCalendrierViewProps) {
  // To-Do / Exercises & Deadlines State
  const [todoEvents, setTodoEvents] = useState<TodoEvent[]>([]);
  const [loadingTodos, setLoadingTodos] = useState<boolean>(true);
  const [completedTodos, setCompletedTodos] = useState<Record<string, boolean>>({});

  // To-Do Calendar Navigation with dynamic client system clock
  const sysDate = new Date();
  const [todoCalendarYear, setTodoCalendarYear] = useState<number>(sysDate.getFullYear());
  const [todoCalendarMonth, setTodoCalendarMonth] = useState<number>(sysDate.getMonth());

  // To-Do Form State
  const todayStr = sysDate.toISOString().split("T")[0];
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [todoForm, setTodoForm] = useState({
    name: "",
    date: todayStr,
    hour: "18:00",
    dueDate: todayStr,
    notes: "",
    pdfContent: "",
    pdfName: ""
  });
  const [isSubmittingTodo, setIsSubmittingTodo] = useState<boolean>(false);

  const fetchTodoEvents = () => {
    setLoadingTodos(true);
    fetch("/api/todo-events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTodoEvents(data);
        }
        setLoadingTodos(false);
      })
      .catch((err) => {
        console.error("Error fetching todo events:", err);
        setLoadingTodos(false);
      });
  };

  useEffect(() => {
    fetchTodoEvents();

    const handleRealtime = (e: any) => {
      const msg = e.detail;
      if (msg && (msg.type === "TODO_CREATED" || msg.type === "TODO_DELETED")) {
        fetchTodoEvents();
      }
    };
    window.addEventListener("realtime-event", handleRealtime as any);

    // Load local completed states
    try {
      const saved = localStorage.getItem("completed_todo_events");
      if (saved) {
        setCompletedTodos(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener("realtime-event", handleRealtime as any);
    };
  }, []);

  const handleToggleTodoCompleted = (id: string) => {
    const updated = {
      ...completedTodos,
      [id]: !completedTodos[id]
    };
    setCompletedTodos(updated);
    localStorage.setItem("completed_todo_events", JSON.stringify(updated));
  };

  const handleTodoPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Veuillez sélectionner un fichier PDF uniquement.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        alert("La taille du PDF ne doit pas dépasser 5 Mo.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setTodoForm((prev) => ({
          ...prev,
          pdfContent: reader.result as string,
          pdfName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoForm.name || !todoForm.date || !todoForm.hour || !todoForm.dueDate) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmittingTodo(true);
    fetch("/api/todo-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todoForm)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        alert("🎉 Devoir créé avec succès !");
        setTodoForm({
          name: "",
          date: "2026-06-25",
          hour: "18:00",
          dueDate: "2026-06-30",
          notes: "",
          pdfContent: "",
          pdfName: ""
        });
        setShowCreateForm(false);
        fetchTodoEvents();
      })
      .catch((err) => {
        console.error("Error creating todo event:", err);
        alert("Une erreur est survenue lors de la création du devoir.");
      })
      .finally(() => {
        setIsSubmittingTodo(false);
      });
  };

  const handleDeleteTodo = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce devoir ?")) return;

    fetch(`/api/todo-events/${id}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        return res.json();
      })
      .then(() => {
        fetchTodoEvents();
      })
      .catch((err) => {
        console.error("Error deleting todo event:", err);
        alert("Erreur lors de la suppression.");
      });
  };

  // ==================== TO-DO CALENDAR MATH ====================
  const getTodoDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getTodoFirstDayOfWeekIndex = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const todoDaysInMonthCount = getTodoDaysInMonth(todoCalendarYear, todoCalendarMonth);
  const todoFirstDayIndex = getTodoFirstDayOfWeekIndex(todoCalendarYear, todoCalendarMonth);

  const todoPrevMonth = () => {
    if (todoCalendarMonth === 0) {
      setTodoCalendarMonth(11);
      setTodoCalendarYear((y) => y - 1);
    } else {
      setTodoCalendarMonth((m) => m - 1);
    }
  };

  const todoNextMonth = () => {
    if (todoCalendarMonth === 11) {
      setTodoCalendarMonth(0);
      setTodoCalendarYear((y) => y + 1);
    } else {
      setTodoCalendarMonth((m) => m + 1);
    }
  };

  const todoPreviousMonthIndex = todoCalendarMonth === 0 ? 11 : todoCalendarMonth - 1;
  const todoPreviousMonthYear = todoCalendarMonth === 0 ? todoCalendarYear - 1 : todoCalendarYear;
  const todoDaysInPrevMonth = getTodoDaysInMonth(todoPreviousMonthYear, todoPreviousMonthIndex);

  const todoCalendarCells = [];

  // 1. Trail previous month
  for (let i = todoFirstDayIndex - 1; i >= 0; i--) {
    const dVal = todoDaysInPrevMonth - i;
    todoCalendarCells.push({
      day: dVal,
      month: todoPreviousMonthIndex,
      year: todoPreviousMonthYear,
      isCurrentMonth: false
    });
  }

  // 2. Current month days
  for (let d = 1; d <= todoDaysInMonthCount; d++) {
    todoCalendarCells.push({
      day: d,
      month: todoCalendarMonth,
      year: todoCalendarYear,
      isCurrentMonth: true
    });
  }

  // 3. Trail next month
  const todoTotalCellsNeeded = todoCalendarCells.length <= 35 ? 35 : 42;
  const todoNextMonthIndex = todoCalendarMonth === 11 ? 0 : todoCalendarMonth + 1;
  const todoNextMonthYear = todoCalendarMonth === 11 ? todoCalendarYear + 1 : todoCalendarYear;
  let todoNextDayCounter = 1;
  while (todoCalendarCells.length < todoTotalCellsNeeded) {
    todoCalendarCells.push({
      day: todoNextDayCounter,
      month: todoNextMonthIndex,
      year: todoNextMonthYear,
      isCurrentMonth: false
    });
    todoNextDayCounter++;
  }

  // Find all to-do events matching a specific date for rendering on the separate calendar cells
  const getTodoEventsForCell = (year: number, month: number, day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return todoEvents.filter((evt) => evt.date === formattedDate || evt.dueDate === formattedDate);
  };

  return (
    <div className="space-y-6 text-[#1F2937] leading-relaxed text-left w-full">
      {/* Admin Create Event Trigger */}
      {userRole === "admin" && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#0da673] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>{showCreateForm ? "Fermer le Formulaire" : "Créer un Devoir / Exercice"}</span>
          </button>
        </div>
      )}

      {/* ADMIN FORM */}
      <AnimatePresence>
        {showCreateForm && userRole === "admin" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleCreateTodoSubmit}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-4"
            >
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h4 className="font-bold text-sm text-[#0F1E36] flex items-center gap-1.5">
                  <Plus size={16} className="text-[#10B981]" />
                  Formulaire Administratif : Publier un nouvel Exercice / Devoir
                </h4>
                <p className="text-[11px] text-gray-500">
                  Ce devoir apparaîtra instantanément sur les calendriers d'échéances et de révisions de tous les étudiants.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Nom de l'exercice *
                  </label>
                  <input
                    type="text"
                    required
                    value={todoForm.name}
                    onChange={(e) => setTodoForm({ ...todoForm, name: e.target.value })}
                    placeholder="Ex: Série N°3 - Récursivité & Algorithmes de Tri"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Charger l'énoncé en PDF
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-between border border-dashed border-gray-300 rounded-lg p-2 bg-white cursor-pointer hover:bg-slate-50 text-xs transition-colors">
                      <span className="text-gray-500 truncate">
                        {todoForm.pdfName || "Aucun PDF sélectionné..."}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 border flex items-center gap-1 shrink-0">
                        <Upload size={12} /> Choisir
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleTodoPdfChange}
                        className="hidden"
                      />
                    </label>
                    {todoForm.pdfName && (
                      <button
                        type="button"
                        onClick={() => setTodoForm({ ...todoForm, pdfName: "", pdfContent: "" })}
                        className="p-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Supprimer le fichier"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Date de Début (Publication) *
                  </label>
                  <input
                    type="date"
                    required
                    value={todoForm.date}
                    onChange={(e) => setTodoForm({ ...todoForm, date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Heure de Publication *
                  </label>
                  <input
                    type="time"
                    required
                    value={todoForm.hour}
                    onChange={(e) => setTodoForm({ ...todoForm, hour: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Date Limite de Rendu (Deadline) *
                  </label>
                  <input
                    type="date"
                    required
                    value={todoForm.dueDate}
                    onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Remarques, notes & consignes pédagogiques
                </label>
                <textarea
                  rows={3}
                  value={todoForm.notes}
                  onChange={(e) => setTodoForm({ ...todoForm, notes: e.target.value })}
                  placeholder="Saisissez ici les instructions destinées aux lycéens (ex: Série facultative mais fortement recommandée...)"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTodo}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#0da673] disabled:bg-gray-400 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingTodo ? "Enregistrement..." : "Publier l'exercice"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOUBLE SUB-SCREEN LAYOUT FOR TODO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE SEPARATE CALENDAR OF DEADLINES */}
        <div className="lg:col-span-7 border border-[#E5E7EB] rounded-2xl bg-white shadow-xs p-5 flex flex-col justify-between">
          
          {/* Header navigation bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
            <div className="flex items-center gap-1">
              <button 
                onClick={todoPrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-[#E5E7EB] text-gray-600 cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button 
                onClick={todoNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-[#E5E7EB] text-gray-600 cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div>
              <span className="text-sm font-bold text-[#0F1E36] flex items-center gap-1.5">
                <CalendarRange size={15} className="text-emerald-500" />
                <span>Calendrier des Échéances • {MONTHS_FR[todoCalendarMonth]} {todoCalendarYear}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#3B82F6] inline-block"></span> Publication
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#EF4444] inline-block"></span> Échéance
              </span>
            </div>
          </div>

          {/* Weekday Names Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-gray-400 mb-2">
            {WEEKDAYS_FR.map((wd) => (
              <div key={wd} className="py-1">{wd}</div>
            ))}
          </div>

          {/* Actual Grid Days list */}
          <div className="grid grid-cols-7 gap-1.5">
            {todoCalendarCells.map((cell, index) => {
              const cellEvents = getTodoEventsForCell(cell.year, cell.month, cell.day);
              const cellDateString = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
              const hasEvents = cellEvents.length > 0;
              
              let containerStyle = "min-h-[85px] border rounded-xl p-1.5 flex flex-col justify-between transition-all relative select-none ";
              
              if (!cell.isCurrentMonth) {
                containerStyle += "bg-slate-50/40 border-slate-100/50 text-slate-300 ";
              } else {
                containerStyle += "bg-white border-slate-100 text-[#1E293B] ";
              }

              return (
                <div 
                  key={index}
                  className={containerStyle}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1 rounded ${
                      cell.isCurrentMonth ? "bg-slate-100 text-slate-700" : "text-slate-300"
                    }`}>
                      {cell.day}
                    </span>
                  </div>

                  {/* Render indicators inside separate calendar */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {hasEvents && cellEvents.map((todo) => {
                      const isPublish = todo.date === cellDateString;
                      const isDue = todo.dueDate === cellDateString;
                      
                      let badgeStyle = "text-[7.5px] font-bold px-1 py-0.5 rounded border truncate leading-tight block text-left ";
                      if (isPublish) {
                        badgeStyle += "bg-blue-50 text-blue-600 border-blue-100";
                      } else if (isDue) {
                        badgeStyle += "bg-red-50 text-red-600 border-red-100 animate-pulse";
                      }

                      return (
                        <div 
                          key={todo.id} 
                          className={badgeStyle}
                          title={`${todo.name} (${isPublish ? 'Publication' : 'Échéance'})`}
                        >
                          {isPublish ? "📄 " : "🚨 "}
                          {todo.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-400 text-left mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
            <Info size={12} className="text-emerald-500 shrink-0" />
            <span>Les devoirs possèdent une date de publication (📄) et une date limite de rendu (🚨). Respectez les délais !</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIST WITH COMPLETION CHECKBOXES */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs text-left flex flex-col h-full justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#0F1E36] mb-1 flex items-center gap-2">
                <BookOpen size={15} className="text-emerald-500" />
                <span>Vos Exercices & Tâches actives</span>
              </h4>
              <p className="text-[11px] text-gray-400">
                Cochez les tâches terminées pour suivre votre progression de révision.
              </p>

              <div className="mt-4 space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {loadingTodos ? (
                  <div className="text-center py-10 text-gray-400 text-xs font-semibold">
                    Chargement des devoirs...
                  </div>
                ) : todoEvents.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={20} />
                    <p className="text-xs text-slate-400 font-semibold">Aucun exercice ou devoir planifié pour le moment.</p>
                    <p className="text-[10px] text-slate-300 mt-1">Excellent travail ! Tout est à jour.</p>
                  </div>
                ) : (
                  todoEvents.map((todo) => {
                    const isCompleted = !!completedTodos[todo.id];
                    
                    // Calculate due state
                    const todayStr = new Date().toISOString().split("T")[0];
                    const isPastDue = todayStr > todo.dueDate && !isCompleted;

                    return (
                      <div
                        key={todo.id}
                        className={`p-3 border rounded-xl transition-all flex items-start gap-3 text-left relative ${
                          isCompleted 
                            ? "bg-slate-50/70 border-slate-200 opacity-75" 
                            : isPastDue 
                              ? "bg-rose-50/30 border-rose-200 hover:bg-rose-50/50" 
                              : "bg-white border-slate-200 hover:border-emerald-300 shadow-2xs"
                        }`}
                      >
                        {/* Student check-off checkbox */}
                        <button
                          onClick={() => handleToggleTodoCompleted(todo.id)}
                          className="mt-0.5 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                          title={isCompleted ? "Marquer comme non terminé" : "Marquer comme terminé"}
                        >
                          {isCompleted ? (
                            <CheckSquare size={18} className="text-[#10B981] fill-[#10B981]/10" />
                          ) : (
                            <Square size={18} className="text-gray-400 hover:text-[#10B981]" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className={`font-semibold text-xs leading-snug truncate pr-16 ${
                              isCompleted ? "line-through text-gray-400" : "text-[#0F1E36]"
                            }`}>
                              {todo.name}
                            </h5>
                            
                            {/* Admin delete button */}
                            {userRole === "admin" && (
                              <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-gray-400 transition-colors shrink-0 cursor-pointer"
                                title="Supprimer ce devoir"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {todo.notes && (
                            <p className="text-[11px] text-gray-500 font-sans leading-relaxed line-clamp-2">
                              {todo.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 border-t border-slate-50 pt-1.5">
                            <span className="flex items-center gap-1 font-sans">
                              <Clock size={11} />
                              <span>Publié : <strong>{todo.date}</strong> à {todo.hour}</span>
                            </span>
                            <span className="flex items-center gap-1 font-sans">
                              <CalendarDays size={11} className={isPastDue ? "text-rose-500 animate-pulse" : ""} />
                              <span className={isPastDue ? "text-rose-600 font-bold" : ""}>
                                Échéance : <strong>{todo.dueDate}</strong>
                              </span>
                            </span>
                          </div>

                          {/* Download PDF button if provided */}
                          {todo.pdfUrl && (
                            <div className="pt-1.5">
                              <a
                                href={todo.pdfUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-55 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                              >
                                <BookOpen size={11} />
                                <span>Consulter ({todo.pdfName || "Devoir"})</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Status pill overlay */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">
                              Terminé
                            </span>
                          ) : isPastDue ? (
                            <span className="text-[8px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                              En retard
                            </span>
                          ) : (
                            <span className="text-[8px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
                              À faire
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-4 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Votre progression :</span>
              <span className="font-bold text-slate-700">
                {todoEvents.length > 0 
                  ? `${Object.values(completedTodos).filter(Boolean).length} / ${todoEvents.length} terminés (${Math.round((Object.values(completedTodos).filter(Boolean).length / todoEvents.length) * 100)}%)`
                  : "0 / 0 devoirs"
                }
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
