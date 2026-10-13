import React from 'react';
import { UniversalBadge } from '../../components/UniversalBadge';
import { ALL_PACKS, PackType, getHighestPack, normalizePackName } from '../../constants/packages';
import { formatAcademicLevel } from '../../constants/academicLevels';

export interface AdminUserRowProps {
  user: any;
  onUpdatePacks?: (userId: string, packs: PackType[]) => void;
  onUpdateBadge?: (userId: string, badge: string) => void;
  onEdit?: (user: any) => void;
  onDelete?: (userId: string) => void;
}

export const AdminUserRow: React.FC<AdminUserRowProps> = ({
  user,
  onUpdatePacks,
  onUpdateBadge,
  onEdit,
  onDelete
}) => {
  const ALLOWED_BADGES = ['Freemium', 'Essentiel', 'Live +', 'Révision +', 'Intégrale'];
  const currentBadge = ALLOWED_BADGES.find(b => b === user.activeBadge) ||
    ALLOWED_BADGES.find(b => b === user.badge) ||
    ALLOWED_BADGES.find(b => b === user.statusBadge) ||
    ALLOWED_BADGES.find(b => b === user.userCategory) ||
    ALLOWED_BADGES.find(b => b === user.status) ||
    'Freemium';

  const handleChangeBadge = (newBadge: string) => {
    if (onUpdateBadge) {
      onUpdateBadge(user.id || user._id, newBadge);
    } else if (onUpdatePacks) {
      onUpdatePacks(user.id || user._id, [newBadge as PackType]);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0F1E36] uppercase border border-gray-150 shrink-0">
            {user.fullName?.charAt(0) || "E"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-xs">{user.fullName}</p>
            <p className="text-[10px] text-gray-500 font-mono">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="p-4 text-xs">
        <span className="font-bold text-slate-800">{formatAcademicLevel(user.grade || user.level || "4ème")}</span>
        <span className="text-gray-400 block text-[10px]">{user.section || "Sciences de l'Informatique"}</span>
      </td>

      {/* Forfaits Actifs : Sélecteur Choix Unique */}
      <td className="p-4">
        <select 
          value={currentBadge} 
          onChange={(e) => handleChangeBadge(e.target.value)}
          className="w-full max-w-[170px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs transition-all"
        >
          <option value="Freemium">Freemium</option>
          <option value="Essentiel">Essentiel</option>
          <option value="Live +">Live +</option>
          <option value="Révision +">Révision +</option>
          <option value="Intégrale">Intégrale</option>
        </select>
      </td>

      {/* Status : Badge Unique Source de Vérité */}
      <td className="p-4 text-center">
        <UniversalBadge category={currentBadge} size="md" />
      </td>

      {/* États d'accès : Valeur synchronisée */}
      <td className="p-4 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          {currentBadge} ACTIF
        </span>
      </td>

      <td className="p-4 text-right">
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="px-2 py-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
};

export default AdminUserRow;
