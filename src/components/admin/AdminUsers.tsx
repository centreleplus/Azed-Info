import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Edit, 
  Lock, 
  Unlock, 
  GraduationCap, 
  Sparkles, 
  Crown, 
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  MapPin,
  Building2,
  Clock,
  Mail
} from "lucide-react";
import { User } from "../../types";
import MetricCard from "../MetricCard";
import { normalizeBadge } from "../../constants/badges";
import { DynamicPagination } from "../DynamicPagination";
import { EditUserModal, normalizeStudyGroup, normalizeAcademicLevel } from "./EditUserModal";
import { DeleteConfirmModal } from "../DeleteConfirmModal";
import { syncAndSaveUser } from "../../services/UserService";

const GRADES_OPTIONS = ["1ère", "2ème", "3ème", "4ème"];
const SECTIONS_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport"
];
const BADGE_OPTIONS = ["FREEMIUM", "ESSENTIEL", "LIVE+", "REVISION+", "INTEGRAL"] as const;
const GROUP_OPTIONS = ["Non assigné", ...Array.from({ length: 26 }, (_, i) => `Gr.${String.fromCharCode(65 + i)}`)];

const getBadgeSelectClasses = (badge: string): string => {
  switch (badge) {
    case "INTEGRAL":
      return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-700";
    case "REVISION+":
      return "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-700";
    case "LIVE+":
      return "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-700";
    case "ESSENTIEL":
      return "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-700";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

const formatConnectionDateTime = (rawDate?: string | null): { datePart: string; timePart: string } => {
  if (!rawDate) {
    return { datePart: "Non connecté", timePart: "—" };
  }
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return { datePart: String(rawDate), timePart: "" };
  }
  const datePart = parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const timePart = parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return { datePart, timePart };
};

export interface AdminUsersProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  onRefresh?: () => void;
  onShowFeedback?: (msg: string, type?: "success" | "error") => void;
  passwordResets?: any[];
  onRefreshPasswordResets?: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users = [],
  setUsers,
  onRefresh,
  onShowFeedback,
  passwordResets = [],
  onRefreshPasswordResets
}) => {
  const [userSubTab, setUserSubTab] = useState<"students" | "resets">("students");
  const [userSearch, setUserSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Tous les Niveaux");
  const [sectionFilter, setSectionFilter] = useState("Toutes les sections");
  const [groupFilter, setGroupFilter] = useState("Tous les groupes");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [currentPage, setCurrentPage] = useState(1);

  // Per-row password visibility & copy feedback
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyText = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedField(key);
    setTimeout(() => {
      setCopiedField((prev) => (prev === key ? null : prev));
    }, 1500);
  };

  const studentList = users.filter((u) => u.role === "student" || !u.role);
  const totalActive = studentList.filter(
    (u) =>
      ((u.status as any) === "active" || (u.status as any) === "actif" || u.verified === true) &&
      !(u as any).isBlocked &&
      u.status !== "disabled" &&
      (u.status as any) !== "blocked"
  ).length;
  const freemiumCount = studentList.filter((u) => {
    const b = normalizeBadge(
      (u as any).activeBadge || u.badge || (u as any).subscriptionBadge || u.userCategory || "FREEMIUM"
    );
    return b === "FREEMIUM";
  }).length;
  const premiumCount = studentList.length - freemiumCount;

  // Filter students
  const filteredStudents = studentList.filter((u) => {
    if (userSearch) {
      const q = userSearch.toLowerCase();
      const matchName = (u.fullName || (u as any).name || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      const matchPhone = (u.phone || "").toLowerCase().includes(q);
      const matchCity = (u.city || (u as any).governorate || "").toLowerCase().includes(q);
      const matchSchool = (u.highSchool || (u as any).schoolName || "").toLowerCase().includes(q);
      const matchGroup = normalizeStudyGroup(u.groupe_etude || u.studyGroup).toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchSchool && !matchGroup) return false;
    }
    if (gradeFilter !== "Tous les Niveaux" && gradeFilter !== "Tous") {
      const g = (u.grade || u.level || "").toLowerCase();
      if (!g.includes(gradeFilter.toLowerCase())) return false;
    }
    if (sectionFilter !== "Toutes les sections" && sectionFilter !== "Tous") {
      const s = (u.section || u.stream || "").toLowerCase();
      if (!s.includes(sectionFilter.toLowerCase())) return false;
    }
    if (groupFilter !== "Tous les groupes" && groupFilter !== "Tous") {
      const grp = normalizeStudyGroup(u.groupe_etude || u.studyGroup);
      if (groupFilter === "Non assigné") {
        if (grp !== "Non assigné") return false;
      } else if (grp !== groupFilter) {
        return false;
      }
    }
    if (statusFilter !== "Tous les statuts" && statusFilter !== "Tous") {
      const isBlocked =
        (u as any).isBlocked === true ||
        u.status === "disabled" ||
        (u.status as any) === "blocked" ||
        (u as any).accountStatus === "BLOCKED";
      if (statusFilter === "ACTIVE") {
        if (isBlocked || ((u.status as any) !== "active" && (u.status as any) !== "actif" && !u.verified)) return false;
      } else if (statusFilter === "HOLD") {
        if (isBlocked || ((u.status as any) !== "pending" && (u.status as any) !== "hold")) return false;
      } else if (statusFilter === "BLOCKED") {
        if (!isBlocked) return false;
      }
    }
    return true;
  });

  const itemsPerPage = 12;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateBadge = async (userId: string, newBadge: string) => {
    try {
      const canonical = normalizeBadge(newBadge);
      const targetUser = users.find((u) => u.id === userId);
      // Optimistic local state update for immediate UI reactivity (updates both Col 1 and Col 6)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                badge: canonical as any,
                activeBadge: canonical,
                userCategory: canonical,
                subscriptionType: canonical,
                accountType: canonical === "FREEMIUM" ? "freemium" : "premium",
                packs: [canonical]
              }
            : u
        )
      );

      // Synchronisation immédiate avec le profil/session de l'étudiant connecté
      syncAndSaveUser({
        id: userId,
        email: targetUser?.email,
        badge: canonical,
        activeBadge: canonical,
        subscriptionTier: canonical,
        userCategory: canonical
      });

      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/badge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          badge: canonical,
          activeBadge: canonical,
          newBadge: canonical,
          subscriptionTier: canonical
        })
      });

      if (!res.ok) {
        const fallbackRes = await fetch("/api/admin/users/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            badge: canonical,
            activeBadge: canonical,
            subscriptionType: canonical,
            userCategory: canonical
          })
        });
        if (!fallbackRes.ok) {
          throw new Error("Erreur mise à jour badge");
        }
      }

      if (onShowFeedback) onShowFeedback(`Badge mis à jour : ${canonical}`, "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur de mise à jour", "error");
    }
  };

  const handleUpdateGroup = async (userId: string, newGroupValue: string) => {
    try {
      const normalizedGrp = normalizeStudyGroup(newGroupValue);
      const storedGrp = normalizedGrp === "Non assigné" ? "" : normalizedGrp;
      const targetUser = users.find((u) => u.id === userId);

      // Mise à jour immédiate de l'état local Admin
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? ({
                ...u,
                groupe_etude: storedGrp,
                studyGroup: storedGrp
              } as User)
            : u
        )
      );

      // Synchronisation immédiate avec le profil/session de l'étudiant connecté
      syncAndSaveUser({
        id: userId,
        email: targetUser?.email,
        groupe_etude: storedGrp,
        studyGroup: storedGrp
      });

      const res = await fetch(`/api/admin/students/${encodeURIComponent(userId)}/group`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupe_etude: storedGrp,
          studyGroup: storedGrp,
          study_group: storedGrp
        })
      });

      if (!res.ok) {
        await fetch("/api/admin/users/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            groupe_etude: storedGrp,
            studyGroup: storedGrp
          })
        });
      }

      if (onShowFeedback) {
        onShowFeedback(`Groupe mis à jour : ${normalizedGrp}`, "success");
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur mise à jour du groupe", "error");
    }
  };

  const handleToggleStatus = async (user: User) => {
    const isCurrentlyBlocked =
      (user as any).isBlocked === true ||
      user.status === "disabled" ||
      (user.status as any) === "blocked" ||
      (user as any).accountStatus === "BLOCKED";
    const newStatus = isCurrentlyBlocked ? "active" : "disabled";
    const newAccountStatus = isCurrentlyBlocked ? "ACTIVE" : "BLOCKED";

    try {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? ({
                ...u,
                status: newStatus as any,
                verified: newStatus === "active",
                isBlocked: newStatus === "disabled",
                accountStatus: newAccountStatus
              } as User)
            : u
        )
      );

      syncAndSaveUser({
        id: user.id,
        email: user.email,
        status: newStatus,
        verified: newStatus === "active",
        isBlocked: newStatus === "disabled",
        accountStatus: newAccountStatus
      });

      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          status: newStatus,
          verified: newStatus === "active",
          isBlocked: newStatus === "disabled",
          accountStatus: newAccountStatus
        })
      });
      if (res.ok) {
        if (onShowFeedback) {
          onShowFeedback(
            `Compte ${newStatus === "active" ? "débloqué et activé" : "bloqué"} avec succès`,
            "success"
          );
        }
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur mise à jour statut");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback("Erreur de mise à jour du statut", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(selectedUserForDelete.id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserForDelete.id));
        if (onShowFeedback) onShowFeedback("Élève supprimé définitivement.", "success");
        setSelectedUserForDelete(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur suppression");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur de suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEditUser = async (updatedData: any) => {
    try {
      const canonicalBadge = normalizeBadge(
        updatedData.subscriptionPackage || updatedData.badge || updatedData.activeBadge || "FREEMIUM"
      );
      const statusMap: Record<string, "active" | "pending" | "disabled"> = {
        ACTIVE: "active",
        HOLD: "pending",
        BLOCKED: "disabled"
      };
      const resolvedStatus = statusMap[updatedData.accountStatus] || "active";
      const isBlocked = resolvedStatus === "disabled";
      const resolvedGrade = normalizeAcademicLevel(updatedData.academicLevel || updatedData.grade || updatedData.level || "4ème");
      const resolvedSection = updatedData.section || updatedData.stream || updatedData.filiere || "Sciences de l'Informatique";
      const resolvedCity = updatedData.governorate ?? updatedData.city ?? "";
      const resolvedSchool = updatedData.schoolName ?? updatedData.highSchool ?? "";
      const normalizedGroup = normalizeStudyGroup(updatedData.studyGroup ?? updatedData.groupe_etude);
      const resolvedGroup = normalizedGroup === "Non assigné" ? "" : normalizedGroup;

      const payload = {
        userId: updatedData.id,
        fullName: updatedData.name || updatedData.fullName,
        email: updatedData.email,
        password: updatedData.password,
        phone: updatedData.phone,
        grade: resolvedGrade,
        level: resolvedGrade,
        academicLevel: resolvedGrade,
        niveau: resolvedGrade,
        section: resolvedSection,
        stream: resolvedSection,
        filiere: resolvedSection,
        city: resolvedCity,
        governorate: resolvedCity,
        highSchool: resolvedSchool,
        schoolName: resolvedSchool,
        address: updatedData.address || "",
        groupe_etude: resolvedGroup,
        studyGroup: resolvedGroup,
        status: resolvedStatus,
        verified: resolvedStatus === "active",
        isBlocked,
        accountStatus: updatedData.accountStatus || "ACTIVE",
        badge: canonicalBadge,
        activeBadge: canonicalBadge,
        subscriptionType: canonicalBadge,
        userCategory: canonicalBadge,
        packs: [canonicalBadge],
        accountType: canonicalBadge === "FREEMIUM" ? "freemium" : "premium"
      };

      // Synchronisation immédiate avec le profil/session de l'étudiant connecté
      syncAndSaveUser({
        id: updatedData.id,
        ...payload
      });

      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === updatedData.id
              ? ({
                  ...u,
                  fullName: payload.fullName,
                  email: payload.email,
                  password: payload.password,
                  phone: payload.phone,
                  grade: payload.grade,
                  level: payload.level,
                  academicLevel: payload.academicLevel,
                  niveau: payload.niveau,
                  section: payload.section,
                  stream: payload.stream,
                  filiere: payload.filiere,
                  city: payload.city,
                  highSchool: payload.highSchool,
                  groupe_etude: payload.groupe_etude,
                  studyGroup: payload.studyGroup,
                  status: payload.status,
                  verified: payload.verified,
                  isBlocked: payload.isBlocked,
                  badge: canonicalBadge as any,
                  activeBadge: canonicalBadge,
                  userCategory: canonicalBadge,
                  subscriptionType: canonicalBadge,
                  packs: [canonicalBadge]
                } as User)
              : u
          )
        );
        if (onShowFeedback) onShowFeedback("Profil élève mis à jour avec succès !", "success");
        setSelectedUserForEdit(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur sauvegarde");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur lors de la mise à jour", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Sub-Tabs: Tous les Lycéens VS Demandes de Réinitialisation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setUserSubTab("students")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              userSubTab === "students"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Users className="w-4 h-4 stroke-[2]" />
            <span>Tous les Lycéens & Comptes</span>
            <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-200 rounded-full font-mono">
              {studentList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setUserSubTab("resets")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
              userSubTab === "resets"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <KeyRound className="w-4 h-4 stroke-[2] text-amber-400" />
            <span>Demandes de Réinitialisation</span>
            {passwordResets.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white font-bold rounded-full animate-pulse">
                {passwordResets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {userSubTab === "students" ? (
        <>
          {/* Dynamic KPI Cards Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Lycéens Actifs"
              value={totalActive}
              badgeText={`${studentList.length} Inscrits`}
              icon={<GraduationCap size={20} />}
              color="blue"
            />
            <MetricCard
              title="Comptes Freemium"
              value={freemiumCount}
              badgeText="Freemium"
              icon={<Sparkles size={20} />}
              color="emerald"
            />
            <MetricCard
              title="Comptes Premium"
              value={premiumCount}
              badgeText="Premium"
              icon={<Crown size={20} />}
              color="amber"
            />
          </div>

          {/* Filter Bar with Search and Dropdowns */}
          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 backdrop-blur-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 min-w-[240px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-2xs">
              <Search className="text-slate-400 shrink-0 w-4 h-4 stroke-[2]" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, ville, lycée, groupe..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-medium border-0 bg-transparent focus:outline-hidden placeholder:text-slate-400 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2.5 flex-wrap items-center text-xs">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-extrabold uppercase text-[10px]">Niveau :</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Tous les Niveaux">Tous les Niveaux</option>
                  {GRADES_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-extrabold uppercase text-[10px]">Filière :</span>
                <select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer max-w-[160px] truncate"
                >
                  <option value="Toutes les sections">Toutes les sections</option>
                  {SECTIONS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-extrabold uppercase text-[10px]">Groupe :</span>
                <select
                  value={groupFilter}
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Tous les groupes">Tous les groupes</option>
                  {GROUP_OPTIONS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <span className="text-slate-500 font-extrabold uppercase text-[10px]">Statut :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="ACTIVE">Actif (Validé)</option>
                  <option value="HOLD">En attente (Hold)</option>
                  <option value="BLOCKED">Bloqué</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Directory Table - 8 Required Columns */}
          <div className="border border-[#E5E7EB] dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800 text-[#0F1E36] dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB] dark:border-slate-700">
                  <tr>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">1. Nom & Prénom</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">2. Niveau & Filière</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">3. Adresse email</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">4. Mot de passe / Clé</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">5. Ville & Établissement</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">6. Badge / Formule</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap">7. Date & Heure Connexion</th>
                    <th className="px-3.5 py-3.5 text-right whitespace-nowrap">8. Mesures Administratives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-mono italic">
                        Aucun élève trouvé pour ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => {
                      const isBlocked =
                        (s as any).isBlocked === true ||
                        s.status === "disabled" ||
                        (s.status as any) === "blocked" ||
                        (s as any).accountStatus === "BLOCKED";
                      const isActive =
                        !isBlocked &&
                        ((s.status as any) === "active" ||
                          (s.status as any) === "actif" ||
                          s.verified === true ||
                          (s as any).accountStatus === "ACTIVE");

                      const activeBadge = normalizeBadge(
                        (s as any).activeBadge ||
                          s.badge ||
                          (s as any).subscriptionBadge ||
                          s.userCategory ||
                          s.subscriptionType ||
                          "FREEMIUM"
                      );

                      const rawPassword = s.password || (s as any).plainPassword || "student123";
                      const isPasswordVisible = Boolean(visiblePasswords[s.id]);
                      const studentCity = s.city || (s as any).governorate || "Non renseignée";
                      const studentSchool = s.highSchool || (s as any).schoolName || "Non renseigné";
                      const rawLoginTimestamp =
                        (s as any).lastLoginAt ||
                        (s as any).lastLogin ||
                        (s as any).lastActiveAt ||
                        (s as any).updatedAt ||
                        s.createdAt;
                      const { datePart, timePart } = formatConnectionDateTime(rawLoginTimestamp);
                      const normalizedGroup = normalizeStudyGroup(s.groupe_etude || s.studyGroup);

                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isBlocked ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                          }`}
                        >
                          {/* 1. Nom & Prénom + Badge Dynamique + Sélecteur de Groupe (Gr.A à Gr.Z) */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex flex-col gap-1.5">
                              {/* Ligne 1 : Nom et prénom de l'élève (+ téléphone) */}
                              <div className="flex flex-col">
                                <span className="font-extrabold text-[#0F1E36] dark:text-white text-xs">
                                  {s.fullName || (s as any).name || "Élève sans nom"}
                                </span>
                                {s.phone && (
                                  <span className="text-[10px] text-slate-500 font-mono">📞 {s.phone}</span>
                                )}
                              </div>

                              {/* Ligne 2 : Badge visuel dynamique (synchronisé instantanément avec la colonne 6) */}
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border w-fit ${getBadgeSelectClasses(
                                    activeBadge
                                  )}`}
                                >
                                  <span>●</span>
                                  <span>{activeBadge}</span>
                                </span>
                              </div>

                              {/* Ligne 3 : Sélecteur direct de Groupe (Gr.A à Gr.Z) */}
                              <div className="flex items-center gap-1">
                                <select
                                  value={normalizedGroup}
                                  onChange={(e) => handleUpdateGroup(s.id, e.target.value)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all w-fit ${
                                    normalizedGroup !== "Non assigné"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
                                      : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                  }`}
                                  title="Assigner ou modifier le Groupe (Gr.A à Gr.Z)"
                                >
                                  {GROUP_OPTIONS.map((grpOpt) => (
                                    <option
                                      key={grpOpt}
                                      value={grpOpt}
                                      className="bg-white text-slate-900 font-bold"
                                    >
                                      {grpOpt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>

                          {/* 2. Niveau & Filière */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] w-fit">
                                {normalizeAcademicLevel(s.grade || s.level || (s as any).academicLevel || (s as any).niveau || "4ème")}
                              </span>
                              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                                {s.section || s.stream || (s as any).filiere || "Sciences de l'Informatique"}
                              </span>
                            </div>
                          </td>

                          {/* 3. Adresse email */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">
                                {s.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(s.email, `email-${s.id}`)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                                title="Copier l'email"
                              >
                                {copiedField === `email-${s.id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 4. Mot de passe / Clé d'accès */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                              <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                                {isPasswordVisible ? rawPassword : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(s.id)}
                                className="p-0.5 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                                title={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                              >
                                {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyText(rawPassword, `pwd-${s.id}`)}
                                className="p-0.5 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                                title="Copier le mot de passe"
                              >
                                {copiedField === `pwd-${s.id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 5. Ville & Établissement scolaire */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                <MapPin size={11} className="text-blue-500 shrink-0" />
                                <span>{studentCity}</span>
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Building2 size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate max-w-[170px]" title={studentSchool}>
                                  {studentSchool}
                                </span>
                              </span>
                            </div>
                          </td>

                          {/* 6. Badge / Formule (Changement Direct via Select) */}
                          <td className="px-3.5 py-3 align-middle">
                            <select
                              value={activeBadge}
                              onChange={(e) => handleUpdateBadge(s.id, e.target.value)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all ${getBadgeSelectClasses(
                                activeBadge
                              )}`}
                              title="Changer directement le badge / la formule de l'élève"
                            >
                              {BADGE_OPTIONS.map((bOpt) => (
                                <option
                                  key={bOpt}
                                  value={bOpt}
                                  className="bg-white text-slate-900 font-bold"
                                >
                                  {bOpt}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 7. Date & Heure de Connexion */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                <Clock size={11} className="text-slate-400 shrink-0" />
                                <span>{datePart}</span>
                                {timePart && timePart !== "—" && (
                                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                                    {timePart}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider w-fit ${
                                  isBlocked
                                    ? "text-rose-600"
                                    : isActive
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }`}
                              >
                                ● {isBlocked ? "Compte Bloqué" : isActive ? "Compte Actif" : "En attente"}
                              </span>
                            </div>
                          </td>

                          {/* 8. Mesures Administratives (Actions : Bloquer/Débloquer, Modifier, Supprimer) */}
                          <td className="px-3.5 py-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Action 1: Bloquer / Débloquer */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(s)}
                                className={`p-2 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer ${
                                  isBlocked
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                }`}
                                title={isBlocked ? "Débloquer l'accès" : "Bloquer l'accès"}
                                aria-label={isBlocked ? "Débloquer l'accès" : "Bloquer l'accès"}
                              >
                                {isBlocked ? <Unlock size={15} /> : <Lock size={15} />}
                              </button>

                              {/* Action 2: Modifier */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(s)}
                                className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer"
                                title="Modifier le compte"
                                aria-label="Modifier le compte"
                              >
                                <Edit size={15} />
                              </button>

                              {/* Action 3: Supprimer */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForDelete(s)}
                                className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer"
                                title="Supprimer définitivement ce compte"
                                aria-label="Supprimer définitivement ce compte"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredStudents.length > itemsPerPage && (
              <DynamicPagination
                totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      ) : (
        /* Password Resets Table */
        <div className="border border-[#E5E7EB] dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-[#0F1E36] dark:text-white text-sm">
                Centre de Gestion des Mots de Passe Oubliés
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {passwordResets.length} demande(s) enregistrée(s).
              </p>
            </div>
            <button
              type="button"
              onClick={onRefreshPasswordResets}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Actualiser</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {passwordResets.length === 0 ? (
              <p className="text-center py-8 text-gray-400 font-mono text-xs">
                Aucune demande de réinitialisation en attente.
              </p>
            ) : (
              passwordResets.map((r: any) => (
                <div key={r.id || r._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">{r.userName || r.email}</h5>
                    <p className="text-[11px] text-gray-500">{r.email}</p>
                    <span className="text-[10px] text-gray-400">
                      Demandé le {new Date(r.createdAt || Date.now()).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        r.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {r.status === "resolved" ? "Résolu" : "En attente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <EditUserModal
          user={selectedUserForEdit}
          isOpen={!!selectedUserForEdit}
          onClose={() => setSelectedUserForEdit(null)}
          onSave={handleSaveEditUser}
        />
      )}

      {/* Delete User Modal */}
      {selectedUserForDelete && (
        <DeleteConfirmModal
          isOpen={!!selectedUserForDelete}
          studentName={selectedUserForDelete.fullName || selectedUserForDelete.email}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelectedUserForDelete(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;

