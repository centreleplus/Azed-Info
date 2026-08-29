import React, { useState } from "react";
import { Search, Ban, Check, Edit, Trash2, Key, Users, Filter, Plus } from "lucide-react";
import { User } from "../../types";

interface UserManagementTableProps {
  users: User[];
  onToggleUserStatus: (userId: string, currentStatus: string) => void;
  onUpdateSubscription: (userId: string, newType: string) => void;
  onUpdateStudyGroup: (userId: string, group: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddNewUser?: () => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onToggleUserStatus,
  onUpdateSubscription,
  onUpdateStudyGroup,
  onDeleteUser,
  onAddNewUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin" | "agent">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "freemium" | "premium">("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.grade && u.grade.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "premium" ? u.accountType === "premium" : u.accountType !== "premium");
    return matchesSearch && matchesRole && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Gestion des Utilisateurs & Élèves
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifications en temps réel avec synchronisation instantanée dans le stockage local
          </p>
        </div>

        {onAddNewUser && (
          <button
            onClick={onAddNewUser}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md self-start lg:self-auto cursor-pointer"
          >
            <Plus size={16} />
            Créer un Utilisateur
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Nom, email, classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Tous les Rôles</option>
          <option value="student">Élèves</option>
          <option value="admin">Administrateurs</option>
          <option value="agent">Agents Commercials</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Tous les Accès</option>
          <option value="freemium">Freemium (Gratuit)</option>
          <option value="premium">Premium (Payant)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Utilisateur</th>
              <th className="p-3.5">Classe & Groupe</th>
              <th className="p-3.5">Compte & Type</th>
              <th className="p-3.5">Statut</th>
              <th className="p-3.5 text-right">Actions Directes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 shrink-0 uppercase">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          u.fullName[0] || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          {u.fullName}
                          {u.role === "admin" && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-black text-[9px]">
                              ADMIN
                            </span>
                          )}
                          {u.role === "agent" && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-black text-[9px]">
                              AGENT
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-slate-700">{u.grade || "Non spécifié"}</p>
                    <select
                      value={u.groupe_etude || u.studyGroup || "Non assigné"}
                      onChange={(e) => onUpdateStudyGroup(u.id, e.target.value)}
                      className="mt-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Non assigné">Non assigné</option>
                      <option value="Groupe A">Groupe A</option>
                      <option value="Groupe B">Groupe B</option>
                      <option value="Groupe C">Groupe C</option>
                    </select>
                  </td>

                  <td className="p-3.5">
                    <select
                      value={u.subscriptionType || (u.accountType === "premium" ? "mensuel" : "freemium")}
                      onChange={(e) => onUpdateSubscription(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="freemium">Freemium (Gratuit)</option>
                      <option value="mensuel">Pass Mensuel</option>
                      <option value="trimestriel">Pass Trimestriel</option>
                      <option value="annuel">Pass Annuel</option>
                      <option value="revision">Pack Révision Bac</option>
                    </select>
                  </td>

                  <td className="p-3.5">
                    {u.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        <Check size={12} /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                        <Ban size={12} /> Bloqué
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onToggleUserStatus(u.id, u.status)}
                      title={u.status === "active" ? "Bloquer" : "Débloquer"}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                        u.status === "active"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {u.status === "active" ? "Bloquer" : "Débloquer"}
                    </button>

                    {u.role !== "admin" && (
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer définitivement ${u.fullName} ?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        title="Supprimer"
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer inline-block"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
