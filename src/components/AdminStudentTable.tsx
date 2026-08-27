import React from 'react';
import { Lock, Unlock, Edit3, Trash2 } from 'lucide-react';
import { User } from '../types';
import { StudentBadgeTag } from './StudentBadgeTag';
import { OfferPack } from '../types/offers';

interface AdminStudentTableProps {
  students: User[];
  availablePacks?: OfferPack[] | any[];
  onToggleBlock: (student: User) => void;
  onEditStudent: (student: User) => void;
  onRequestDelete: (student: User) => void;
  onGroupChange?: (studentId: string, group: string) => void;
  onUpdateSubscriptionType?: (studentId: string, subType: string) => void;
}

export const AdminStudentTable: React.FC<AdminStudentTableProps> = ({
  students,
  availablePacks = [],
  onToggleBlock,
  onEditStudent,
  onRequestDelete,
  onGroupChange
}) => {
  return (
    <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-400 font-bold">
              <th className="p-4 whitespace-nowrap">Élève & Localité</th>
              <th className="p-4 whitespace-nowrap text-[#0F1E36] font-extrabold text-left">📍 Ville</th>
              <th className="p-4 whitespace-nowrap text-[#0F1E36] font-extrabold text-left">🏫 Établissement</th>
              <th className="p-4 whitespace-nowrap">Niveau / Filière</th>
              <th className="p-4 whitespace-nowrap">📚 Groupe d'affectation</th>
              <th className="p-4 text-center whitespace-nowrap bg-slate-50">Date Inscription</th>
              <th className="p-4 text-center whitespace-nowrap bg-slate-50/50">Statut</th>
              <th className="p-4 text-center whitespace-nowrap">Actions de Direction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Aucun membre trouvé.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isBlocked = student.status === 'disabled' || (student as any).isBlocked;
                const matchedPack = availablePacks.find(p => 
                  p.id === student.packId || 
                  p.id === (student as any).pack_id || 
                  p.category === (student as any).packCategory ||
                  p.category === (student as any).category ||
                  p.category === (student as any).subscriptionCategory ||
                  (student.accountType === 'freemium' && (p.category === 'FREEMIUM' || p.category === 'Freemium')) ||
                  (student.accountType === 'premium' && (p.category === 'PREMIUM' || p.category === 'Premium'))
                );

                const isGroupAssigned = Boolean(
                  (student as any).groupName && (student as any).groupName !== 'Non assigné' ||
                  student.groupe_etude && student.groupe_etude !== 'Non assigné' && student.groupe_etude !== '' ||
                  student.studyGroup && student.studyGroup !== 'Non assigné' && student.studyGroup !== ''
                );

                const packCategory = matchedPack?.category || (student as any).packCategory || (student.accountType === 'premium' ? 'Premium' : 'Freemium');
                const badgeLabel = matchedPack?.badgeLabel || student.badgeLabel || student.badge_label || (student.accountType === 'premium' ? '⭐ Premium' : 'Option Gratuit');

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0F1E36] uppercase border border-gray-150 shrink-0">
                          {student.fullName?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            {student.fullName}
                          </p>
                          
                          {/* BADGES DYNAMIQUES DU PACK & GROUPE */}
                          <StudentBadgeTag
                            badgeLabel={badgeLabel}
                            packCategory={packCategory}
                            isGroupAssigned={isGroupAssigned}
                          />

                          <p className="text-[10px] text-gray-400 font-mono mt-1">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {student.city || 'Non spécifiée'}
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {student.highSchool || (student as any).schoolName || 'Non spécifié'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-700 text-xs">{student.grade || 'Bac'}</p>
                      <p className="text-[10px] text-[#0F1E36] font-mono">{student.section || 'Générale'}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <select 
                        value={(student as any).groupName || student.groupe_etude || student.studyGroup || 'Non assigné'}
                        onChange={(e) => {
                          if (onGroupChange) {
                            onGroupChange(student.id, e.target.value === 'Non assigné' ? '' : e.target.value);
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Non assigné">Non assigné</option>
                        <option value="A">Groupe A</option>
                        <option value="B">Groupe B</option>
                        <option value="C">Groupe C</option>
                        <option value="D">Groupe D</option>
                        <option value="Groupe A">Groupe A (Libellé)</option>
                        <option value="Groupe B">Groupe B (Libellé)</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-700 whitespace-nowrap text-center bg-slate-50/30">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {isBlocked ? (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-250">
                          🔒 Bloqué
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          student.accountType === 'premium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-250'
                        }`}>
                          {badgeLabel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* BOUTON BLOQUER / DÉBLOQUER */}
                        <button
                          type="button"
                          onClick={() => onToggleBlock(student)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            isBlocked
                              ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title={isBlocked ? 'Débloquer le compte' : 'Bloquer le compte'}
                        >
                          {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{isBlocked ? 'Débloquer' : 'Bloquer'}</span>
                        </button>

                        {/* BOUTON MODIFIER */}
                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title="Modifier l'élève"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        {/* BOUTON SUPPRIMER (RED DESIGN) */}
                        <button
                          type="button"
                          onClick={() => onRequestDelete(student)}
                          className="p-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
};

export default AdminStudentTable;
