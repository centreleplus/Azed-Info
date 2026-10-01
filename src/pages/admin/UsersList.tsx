import React, { useState, useEffect } from 'react';
import { AdminUserRow } from './AdminUserRow';
import { PackType, getHighestPack } from '../../constants/packages';
import { RefreshCw, Search, Users } from 'lucide-react';

export interface UsersListProps {
  users?: any[];
  onRefresh?: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users: propUsers,
  onRefresh
}) => {
  const [users, setUsers] = useState<any[]>(propUsers || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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

  const handleUpdatePacks = async (userId: string, newPacks: PackType[]) => {
    try {
      const highest = getHighestPack(newPacks);
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

  const filtered = users.filter(u => {
    if (u.role !== 'student') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par élève..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none w-52 bg-white"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
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
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
