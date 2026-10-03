import React, { useState, useEffect } from 'react';
import { UniversalBadge } from '../../components/UniversalBadge';
import { getHighestPack } from '../../constants/packages';
import { formatAcademicLevel } from '../../constants/academicLevels';
import { Check, X, Users, RefreshCw } from 'lucide-react';

export interface AccountValidationProps {
  users?: any[];
  onValidate?: (userId: string) => void;
  onReject?: (userId: string) => void;
}

export const AccountValidation: React.FC<AccountValidationProps> = ({
  users: propUsers,
  onValidate,
  onReject
}) => {
  const [users, setUsers] = useState<any[]>(propUsers || []);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
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
      fetchPending();
    }
  }, [propUsers]);

  const handleValidate = async (userId: string) => {
    if (onValidate) {
      onValidate(userId);
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', verified: true })
      });
      if (res.ok) {
        fetchPending();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (userId: string) => {
    if (onReject) {
      onReject(userId);
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', verified: false })
      });
      if (res.ok) {
        fetchPending();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingStudents = users.filter(u => u.role === 'student' && (u.status === 'pending' || !u.verified));

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4 sm:p-6 text-left">
      <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="p-5 border-b border-[#E5E7EB] bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#0F1E36] text-sm">Validation manuelle des inscriptions d'élèves</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Vérifiez la formule choisie (Freemium, Essentiel, Live +, Révision + ou Intégrale) et validez l'accès.
            </p>
          </div>
          <button
            onClick={fetchPending}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold text-[10px] uppercase">
                <th className="p-4">Élève & Contact</th>
                <th className="p-4">Niveau / Filière</th>
                <th className="p-4">Ville & Établissement</th>
                <th className="p-4">FORMULE CHOISIE</th>
                <th className="p-4 text-center">Date d'inscription</th>
                <th className="p-4 text-right">Actions de Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {pendingStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Aucun compte élève en attente de validation pour le moment. 🎉
                  </td>
                </tr>
              ) : (
                pendingStudents.map((u) => {
                  const chosenPack = getHighestPack(u.activePackages || [u.status, u.userCategory, u.tier, u.badgeLabel, u.accountType === 'freemium' ? 'Freemium' : 'Live +']);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase border border-blue-200">
                            {u.fullName?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{u.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.email}</p>
                            {u.phone && <p className="text-[10px] text-gray-400 font-mono">📞 {u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 block w-fit">
                          {formatAcademicLevel(u.grade || u.level || "4ème")}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{u.section || "Sciences de l'Informatique"}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{u.city || "Tunis"}</p>
                        <p className="text-[10px] text-gray-400">{u.highSchool || "Lycée"}</p>
                      </td>
                      <td className="p-4">
                        {/* FORMULE CHOISIE AVEC LE BADGE EXACT */}
                        <UniversalBadge category={chosenPack} size="md" />
                      </td>
                      <td className="p-4 text-center text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleValidate(u.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                          >
                            <Check size={11} />
                            <span>Valider l'accès</span>
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            <X size={11} />
                            <span>Refuser</span>
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
      </div>
    </div>
  );
};

export default AccountValidation;
