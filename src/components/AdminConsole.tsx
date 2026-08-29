import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  BookOpen,
  Plus,
  Check
} from "lucide-react";
import { User, PaymentReceipt, CourseItem } from "../types";
import { Language } from "../lib/translations";
import {
  getStoredUsers,
  updateUserStatusInStorage,
  updateUserSubscriptionInStorage,
  updateUserGroupInStorage,
  deleteUserInStorage,
  approveReceiptInStorage,
  rejectReceiptInStorage,
  registerUserInStorage
} from "../utils/localDbAdapter";

import { StatsOverviewCards } from "./admin/StatsOverviewCards";
import { UserManagementTable } from "./admin/UserManagementTable";
import { SubscriptionsPanel } from "./admin/SubscriptionsPanel";
import { DocumentViewerModal } from "./admin/DocumentViewerModal";
import { CourseManagementPanel } from "./admin/CourseManagementPanel";

export interface AdminConsoleProps {
  currentUser?: User | null;
  setCurrentUser?: (user: User | null) => void;
  currentLanguage?: Language;
  onAdminActionRefetch?: () => void;
  allUsersList?: User[];
  initialActiveSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  logoUrl?: string;
  logoText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  heroImageUrl?: string;
  studentImageUrl?: string;
  loginImageUrl?: string;
  registerImageUrl?: string;
  platformIcon?: string;
  landingHeroTitle?: string;
  landingHeroHighlight?: string;
  landingHeroSubtext?: string;
  overlayAlAdmisText?: string;
  overlayAlAdmisBg?: string;
  overlayAlAdmisTextColor?: string;
  overlayKhaliaAlaynaText?: string;
  overlayKhaliaAlaynaBg?: string;
}

export default function AdminConsole({
  currentUser,
  currentLanguage = "fr",
  onAdminActionRefetch,
  allUsersList = [],
  initialActiveSubTab = "users",
  onSubTabChange,
  logoText = "A-Zed Info",
  primaryColor = "#0047AB",
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<string>(initialActiveSubTab || "users");
  const [users, setUsers] = useState<User[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserGrade, setNewUserGrade] = useState("4ème Année");
  const [newUserRole, setNewUserRole] = useState<"student" | "agent" | "admin">("student");

  const reloadLocalData = () => {
    const storedUsers = getStoredUsers();
    setUsers(storedUsers);

    try {
      const rawMock = localStorage.getItem("azed_mock_db_store");
      if (rawMock) {
        const parsed = JSON.parse(rawMock);
        if (parsed.receipts) setReceipts(parsed.receipts);
        if (parsed.courses) setCourses(parsed.courses);
      }
    } catch (e) {
      console.warn("Error reading mock receipts/courses:", e);
    }
  };

  useEffect(() => {
    reloadLocalData();
    window.addEventListener("app_users_updated", reloadLocalData);
    window.addEventListener("azed_db_updated", reloadLocalData);

    return () => {
      window.removeEventListener("app_users_updated", reloadLocalData);
      window.removeEventListener("azed_db_updated", reloadLocalData);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  const notifySuccess = (msg: string) => {
    setStatusNotification({ msg, type: "success" });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "pending" : "active";
    updateUserStatusInStorage(userId, nextStatus as any);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess(`Statut utilisateur mis à jour vers: ${nextStatus === "active" ? "Actif" : "Bloqué"}`);
  };

  const handleUpdateSubscription = (userId: string, newType: string) => {
    updateUserSubscriptionInStorage(userId, newType);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess(`Niveau de souscription mis à jour vers: ${newType.toUpperCase()}`);
  };

  const handleUpdateStudyGroup = (userId: string, group: string) => {
    updateUserGroupInStorage(userId, group);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess(`Groupe d'étude mis à jour : ${group}`);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserInStorage(userId);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess("Utilisateur supprimé définitivement du système.");
  };

  const handleApproveReceipt = (receiptId: string) => {
    approveReceiptInStorage(receiptId);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess("Reçu validé ! Compte élève activé instantanément.");
  };

  const handleRejectReceipt = (receiptId: string) => {
    rejectReceiptInStorage(receiptId);
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess("Reçu de paiement rejeté.");
  };

  const handleCreateNewUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    registerUserInStorage({
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      grade: newUserGrade,
      role: newUserRole,
      accountType: "premium",
      password: "student123",
    });

    setShowAddUserModal(false);
    setNewUserName("");
    setNewUserEmail("");
    reloadLocalData();
    if (onAdminActionRefetch) onAdminActionRefetch();
    notifySuccess(`Nouvel utilisateur ${newUserName} créé avec succès !`);
  };

  const handleAddCourse = (courseData: Partial<CourseItem>) => {
    const newCourseList = [courseData as CourseItem, ...courses];
    setCourses(newCourseList);
    try {
      const rawMock = localStorage.getItem("azed_mock_db_store");
      let mockDb = rawMock ? JSON.parse(rawMock) : {};
      mockDb.courses = newCourseList;
      localStorage.setItem("azed_mock_db_store", JSON.stringify(mockDb));
    } catch (e) {}
    notifySuccess("Cours publié avec succès !");
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    try {
      const rawMock = localStorage.getItem("azed_mock_db_store");
      let mockDb = rawMock ? JSON.parse(rawMock) : {};
      mockDb.courses = updated;
      localStorage.setItem("azed_mock_db_store", JSON.stringify(mockDb));
    } catch (e) {}
    notifySuccess("Contenu supprimé.");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl text-white font-black text-xl flex items-center justify-center shadow-md shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 tracking-tight">{logoText}</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                Console Administration
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Connecté en tant que : <strong className="text-slate-800">{currentUser?.fullName || "Super Admin"}</strong> ({currentUser?.email || "centreleplus@gmail.com"})
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-extrabold">
          <button
            onClick={() => handleTabChange("users")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={15} />
            Utilisateurs ({users.length})
          </button>

          <button
            onClick={() => handleTabChange("subscriptions")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "subscriptions"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck size={15} />
            Reçus ({receipts.filter((r) => r.status === "pending").length})
          </button>

          <button
            onClick={() => handleTabChange("courses")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen size={15} />
            Cours ({courses.length})
          </button>
        </div>
      </div>

      {/* Instant Notification Bar */}
      {statusNotification && (
        <div className="p-4 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check size={18} />
            <span>{statusNotification.msg}</span>
          </div>
          <span className="text-[10px] opacity-80 uppercase tracking-wider">Synchronisé dans LocalStorage</span>
        </div>
      )}

      {/* Global Analytics Overview Cards */}
      <StatsOverviewCards users={users} receipts={receipts} />

      {/* Tab Panels */}
      {activeTab === "users" && (
        <UserManagementTable
          users={users}
          onToggleUserStatus={handleToggleUserStatus}
          onUpdateSubscription={handleUpdateSubscription}
          onUpdateStudyGroup={handleUpdateStudyGroup}
          onDeleteUser={handleDeleteUser}
          onAddNewUser={() => setShowAddUserModal(true)}
        />
      )}

      {activeTab === "subscriptions" && (
        <SubscriptionsPanel
          receipts={receipts}
          onApproveReceipt={handleApproveReceipt}
          onRejectReceipt={handleRejectReceipt}
          onViewDocument={(r) => setSelectedReceipt(r)}
        />
      )}

      {activeTab === "courses" && (
        <CourseManagementPanel
          courses={courses}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
        />
      )}

      {/* Proof Document Viewer Modal */}
      <DocumentViewerModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onApprove={handleApproveReceipt}
        onReject={handleRejectReceipt}
      />

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">Ajouter un Utilisateur</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Mohamed Ben Ali"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="eleve@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Niveau / Classe</label>
                <select
                  value={newUserGrade}
                  onChange={(e) => setNewUserGrade(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                >
                  <option value="4ème Année">4ème Année Bac Informatique</option>
                  <option value="3ème Année">3ème Année Informatique</option>
                  <option value="2ème Année">2ème Année Sciences</option>
                  <option value="1ère Année">1ère Année Secondaire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                >
                  <option value="student">Élève</option>
                  <option value="agent">Agent Commercial</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Créer & Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
