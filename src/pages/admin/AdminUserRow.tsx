import React from 'react';
import { UniversalBadge } from '../../components/UniversalBadge';
import { ALL_PACKS, PackType, getHighestPack, normalizePackName } from '../../constants/packages';

export interface AdminUserRowProps {
  user: any;
  onUpdatePacks: (userId: string, packs: PackType[]) => void;
  onEdit?: (user: any) => void;
  onDelete?: (userId: string) => void;
}

export const AdminUserRow: React.FC<AdminUserRowProps> = ({
  user,
  onUpdatePacks,
  onEdit,
  onDelete
}) => {
  const rawPacks: string[] = Array.isArray(user.activePackages) && user.activePackages.length > 0
    ? user.activePackages
    : (Array.isArray(user.packs) && user.packs.length > 0 ? user.packs : [user.userCategory || user.status || (user.accountType === 'freemium' ? 'Freemium' : 'Live +')]);
  
  const activePackages: PackType[] = Array.from(new Set(rawPacks.map(p => normalizePackName(p))));
  const highestPack = getHighestPack(activePackages);

  const handleRemovePack = (pName: PackType) => {
    const next = activePackages.filter(p => p !== pName);
    onUpdatePacks(user.id, next.length > 0 ? next : ['Freemium']);
  };

  const handleAddPack = (pName: PackType) => {
    const next = Array.from(new Set([...activePackages.filter(p => p !== 'Freemium'), pName]));
    onUpdatePacks(user.id, next);
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
        <span className="font-bold text-slate-800">{user.grade || user.level || "4ème"}</span>
        <span className="text-gray-400 block text-[10px]">{user.section || "Sciences de l'Informatique"}</span>
      </td>

      {/* Forfaits Actifs : Badges sous forme de pilules avec la croix de suppression ✕ */}
      <td className="p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 max-w-[220px] items-center">
            {activePackages.map((pName) => (
              <span key={pName} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold shadow-2xs">
                <UniversalBadge category={pName} size="sm" />
                <button
                  type="button"
                  onClick={() => handleRemovePack(pName)}
                  className="hover:text-red-600 text-[10px] leading-none shrink-0 font-bold ml-0.5 cursor-pointer text-slate-400 hover:scale-110 transition-transform"
                  title={`Révoquer ${pName}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            <span className="text-[9px] text-gray-400 font-bold">Ajouter :</span>
            {(['Essentiel', 'Live +', 'Révision +', 'Intégrale'] as PackType[]).map((packOpt) => (
              <button
                key={packOpt}
                type="button"
                onClick={() => handleAddPack(packOpt)}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              >
                +{packOpt}
              </button>
            ))}
          </div>
        </div>
      </td>

      {/* Status : Forfait le plus élevé */}
      <td className="p-4 text-center">
        <UniversalBadge category={highestPack} size="md" />
      </td>

      {/* États d'accès : Valeur synchronisée (ex: Live + ACTIF) */}
      <td className="p-4 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          {highestPack} ACTIF
        </span>
      </td>

      <td className="p-4 text-right">
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="px-2 py-1 text-xs font-bold text-blue-600 hover:underline"
          >
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
};

export default AdminUserRow;
