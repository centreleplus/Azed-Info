import React, { useState, useEffect, useContext } from 'react';
import { AdminUserRow } from './AdminUserRow';
import { PackType, getHighestPack, normalizeSubscriptionTier } from '../../constants/packages';
import { EditUserModal } from '../../components/admin/EditUserModal';
import { RefreshCw, Search, Users } from 'lucide-react';
import { UserContext } from '../../components/AuthContext';
import { syncAndSaveUser } from '../../services/UserService';

export interface UsersListProps {
  users?: any[];
  onRefresh?: () => void;
}

// Liste des options de filtre de statut
const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'HOLD', label: 'En attente (Hold)' },
  { value: 'ACTIVE', label: 'Actif (Validé)' },
  { value: 'BLOCKED', label: 'Bloqué / Suspendu' }
];

export const UsersList: React.FC<UsersListProps> = ({
  users: propUsers,
  onRefresh
}) => {
  const [users, setUsers] = useState<any[]>(propUsers || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propUsers && propUsers.length > 0) {
      setUsers(propUsers);
    } else {
      fetchUsers();
    }
  }, [propUsers]);

  const auth = useContext(UserContext);

  const handleUpdatePacks = async (userId: string, newPacks: PackType[]) => {
    try {
      const highest = getHighestPack(newPacks);
      const canonicalBadge = normalizeSubscriptionTier(highest);

      syncAndSaveUser({
        id: userId,
        badge: canonicalBadge,
        subscriptionTier: canonicalBadge,
        activePackages: newPacks,
        packs: newPacks,
        userCategory: highest
      });

      if (auth?.updateStudentBadge) {
        auth.updateStudentBadge(userId, canonicalBadge);
      }

      const res = await fetch(`/api/admin/students/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activePackages: newPacks,
          packs: newPacks,
          userCategory: highest,
          status: highest,
          accessStatus: highest,
          accountType: highest === "Freemium" ? "freemium" : "premium"
        })
      });
      if (res.ok) {
        fetchUsers();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveUser = async (updatedData: any) => {
    try {
      const userId = updatedData.id;
      const pack = updatedData.subscriptionPackage || 'Freemium';
      const canonicalBadge = normalizeSubscriptionTier(pack);

      syncAndSaveUser({
        id: userId,
        email: updatedData.email,
        fullName: updatedData.name || updatedData.fullName,
        badge: canonicalBadge,
        subscriptionTier: canonicalBadge,
        filiere: updatedData.section,
        section: updatedData.section,
        niveau: updatedData.academicLevel || updatedData.grade,
        grade: updatedData.academicLevel || updatedData.grade,
        phone: updatedData.phone,
        activePackages: [pack],
        packs: [pack]
      });

      if (auth?.updateStudentBadge) {
        auth.updateStudentBadge(userId, canonicalBadge);
      }

      const statusMap: Record<string, string> = {
        'ACTIVE': 'active',
        'HOLD': 'pending',
        'BLOCKED': 'disabled'
      };
      const apiStatus = statusMap[updatedData.accountStatus] || updatedData.accountStatus || 'active';

      const res = await fetch(`/api/admin/students/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: updatedData.name || updatedData.fullName,
          email: updatedData.email,
          password: updatedData.password,
          grade: updatedData.academicLevel || updatedData.grade,
          level: updatedData.academicLevel || updatedData.level,
          section: updatedData.section,
          phone: updatedData.phone,
          city: updatedData.governorate || updatedData.city,
          governorate: updatedData.governorate,
          highSchool: updatedData.schoolName || updatedData.highSchool,
          schoolName: updatedData.schoolName,
          address: updatedData.address,
          activePackages: [pack],
          packs: [pack],
          userCategory: pack,
          accountType: pack === "Freemium" ? "freemium" : "premium",
          status: apiStatus,
          accountStatus: updatedData.accountStatus,
          verified: updatedData.accountStatus === 'ACTIVE'
        })
      });

      if (res.ok) {
        fetchUsers();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error("Failed to update user:", e);
    }
  };

  const filtered = users.filter(u => {
    if (u.role !== 'student') return false;

    // 1. Text Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchText = (u.fullName || '').toLowerCase().includes(q) || 
                        (u.email || '').toLowerCase().includes(q) ||
                        (u.phone || '').includes(q);
      if (!matchText) return false;
    }

    // 2. Status Filter
    if (selectedStatusFilter === 'HOLD') {
      const isHold = u.status === 'pending' || u.accountStatus === 'HOLD' || (!u.verified && u.status !== 'disabled' && u.status !== 'blocked');
      if (!isHold) return false;
    } else if (selectedStatusFilter === 'ACTIVE') {
      const isActive = (u.status === 'active' || u.status === 'actif' || u.accountStatus === 'ACTIVE' || u.verified === true) && 
                       u.status !== 'disabled' && u.status !== 'blocked' && !u.isBlocked;
      if (!isActive) return false;
    } else if (selectedStatusFilter === 'BLOCKED') {
      const isBlocked = u.status === 'disabled' || u.status === 'blocked' || u.accountStatus === 'BLOCKED' || u.isBlocked === true || u.status === 'banni';
      if (!isBlocked) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4 sm:p-6 text-left">
      <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="p-5 border-b border-[#E5E7EB] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-2">
              <Users className="text-blue-600" size={18} />
              <span>Gestion des Lycéens & Comptes Élèves</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Pilotez les forfaits actifs (Freemium, Essentiel, Live +, Révision +, Intégrale), le statut et l'état d'accès.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Statut filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1">STATUT :</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg font-medium text-sm focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1">RECHERCHE :</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-52 bg-white"
                />
              </div>
            </div>

            <button
              onClick={fetchUsers}
              className="p-2.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors border border-gray-200 bg-white"
              title="Rafraîchir"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold text-[10px] uppercase">
                <th className="p-4">Élève & Contact</th>
                <th className="p-4">Niveau / Filière</th>
                <th className="p-4">Forfaits Actifs</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">États d'accès</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Aucun élève trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <AdminUserRow
                    key={u.id}
                    user={u}
                    onUpdatePacks={handleUpdatePacks}
                    onEdit={(selected) => setEditingUser(selected)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition complet avec pré-remplissage immédiat */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UsersList;
