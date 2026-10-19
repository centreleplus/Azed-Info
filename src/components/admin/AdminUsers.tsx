import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  Key, 
  Lock, 
  Unlock, 
  GraduationCap, 
  Sparkles, 
  Crown, 
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { User } from "../../types";
import MetricCard from "../MetricCard";
import { UniversalBadge } from "../UniversalBadge";
import { SubscriptionSelect } from "../BadgeMapper";
import { normalizeBadge } from "../../constants/badges";
import { normalizeSubscriptionTier } from "../../constants/packages";
import { DynamicPagination } from "../DynamicPagination";
import { EditUserModal } from "./EditUserModal";
import { DeleteConfirmModal } from "../DeleteConfirmModal";

const GRADES_OPTIONS = ["1ère", "2ème", "3ème", "4ème"];
const SECTIONS_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport",
  "Tronc Commun"
];
const STUDY_GROUPS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

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
  currentUser,
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
  const [resetFilterStatus, setResetFilterStatus] = useState("all");

  // Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const studentList = users.filter((u) => u.role === "student" || !u.role);
  const totalActive = studentList.filter(
    (u) => ((u.status as any) === "active" || (u.status as any) === "actif" || u.verified === true) && !(u as any).isBlocked && u.status !== "disabled" && (u.status as any) !== "blocked"
  ).length;
  const freemiumCount = studentList.filter(
    (u) => {
      const b = (u.activeBadge || u.badge || u.subscriptionBadge || "FREEMIUM").toUpperCase();
      return b === "FREEMIUM";
    }
  ).length;
  const premiumCount = studentList.length - freemiumCount;

  // Filter students
  const filteredStudents = studentList.filter((u) => {
    if (userSearch) {
      const q = userSearch.toLowerCase();
      const matchName = (u.fullName || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      const matchPhone = (u.phone || "").toLowerCase().includes(q);
      const matchCity = (u.city || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCity) return false;
    }
    if (gradeFilter !== "Tous les Niveaux" && gradeFilter !== "Tous") {
      const g = (u.grade || "").toLowerCase();
      if (!g.includes(gradeFilter.toLowerCase())) return false;
    }
    if (sectionFilter !== "Toutes les sections" && sectionFilter !== "Tous") {
      const s = (u.section || "").toLowerCase();
      if (!s.includes(sectionFilter.toLowerCase())) return false;
    }
    if (groupFilter !== "Tous les groupes" && groupFilter !== "Tous") {
      const grp = u.groupe_etude || u.studyGroup || "";
      if (groupFilter === "Non assigné") {
        if (grp && grp !== "Non assigné") return false;
      } else if (grp !== groupFilter) {
        return false;
      }
    }
    if (statusFilter !== "Tous les statuts" && statusFilter !== "Tous") {
      if (statusFilter === "ACTIVE") {
        if (u.status !== "active" && u.status !== "actif" && !u.verified) return false;
      } else if (statusFilter === "HOLD") {
        if (u.status !== "pending" && u.status !== "hold") return false;
      } else if (statusFilter === "BLOCKED") {
        if (u.status !== "disabled" && u.status !== "blocked" && !u.isBlocked) return false;
      }
    }
    return true;
  });

  const itemsPerPage = 12;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateBadge = async (userId: string, newBadge: string) => {
    try {
      const canonical = normalizeBadge(newBadge);
      const res = await fetch("/api/admin/users/badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badge: canonical, subscriptionTier: canonical })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, badge: canonical, activeBadge: canonical, subscriptionTier: canonical } : u))
        );
        if (onShowFeedback) onShowFeedback(`Badge mis à jour : ${canonical}`, "success");
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur mise à jour badge");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur de mise à jour", "error");
    }
  };

  const handleToggleStatus = async (user: User) => {
    const isCurrentlyActive = ((user.status as any) === "active" || (user.status as any) === "actif") && !(user as any).isBlocked;
    const newStatus = isCurrentlyActive ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, status: newStatus, isBlocked: newStatus === "disabled" })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus, isBlocked: newStatus === "disabled" } : u))
        );
        if (onShowFeedback) onShowFeedback(`Statut mis à jour : ${newStatus === "active" ? "Actif" : "Bloqué"}`, "success");
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback("Erreur de mise à jour du statut", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForDelete.id}`, { method: "DELETE" });
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
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: updatedData.id, ...updatedData })
      });
      if (res.ok) {
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
            <div className="flex items-center gap-2.5 flex-1 min-w-[220px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-2xs">
              <Search className="text-slate-400 shrink-0 w-4 h-4 stroke-[2]" />
              <input 
                type="text"
                placeholder="Rechercher par nom, email, téléphone, ville..."
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
                    <option key={g} value={g}>{g}</option>
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
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer max-w-[150px] truncate"
                >
                  <option value="Toutes les sections">Toutes les sections</option>
                  {SECTIONS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
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

          {/* Students Directory Table */}
          <div className="border border-[#E5E7EB] dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800 text-[#0F1E36] dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB] dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Lycéen & Coordonnées</th>
                    <th className="px-4 py-3.5">Niveau & Filière</th>
                    <th className="px-4 py-3.5">Badge Forfait</th>
                    <th className="px-4 py-3.5">Statut Compte</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-mono italic">
                        Aucun élève trouvé pour ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => {
                      const isActive = (s.status === "active" || s.status === "actif") && !s.isBlocked;
                      const activeBadge = normalizeBadge(s.activeBadge || s.badge || s.subscriptionBadge || "FREEMIUM");

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#0F1E36] dark:text-white text-xs">{s.fullName}</span>
                              <span className="text-[11px] text-gray-500 font-mono">{s.email}</span>
                              {s.phone && <span className="text-[10px] text-gray-400 mt-0.5">📞 {s.phone}</span>}
                              {s.groupe_etude && s.groupe_etude !== "Non assigné" && (
                                <span className="mt-1 inline-flex items-center text-[9px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 w-fit">
                                  📚 Groupe {s.groupe_etude}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-800 dark:text-white text-xs">{s.grade || "4ème"}</span>
                              <span className="text-[11px] text-slate-500">{s.section || "Sciences de l'Informatique"}</span>
                              {s.city && <span className="text-[10px] text-gray-400">{s.city}</span>}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <UniversalBadge
                                badge={activeBadge}
                                onSelect={(b) => handleUpdateBadge(s.id, b)}
                                interactive={true}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(s)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              }`}
                              title="Cliquez pour changer le statut"
                            >
                              ● {isActive ? "Actif" : "En attente / Bloqué"}
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(s)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Modifier les informations"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedUserForDelete(s)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Supprimer définitivement"
                              >
                                <Trash2 size={14} />
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
                    <span className="text-[10px] text-gray-400">Demandé le {new Date(r.createdAt || Date.now()).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      r.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
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
