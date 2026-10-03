import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, BookOpen, Layers, Phone, MapPin, Building, ShieldCheck, Check } from 'lucide-react';
import { ALL_PACKS, PackType } from '../../constants/packages';

export interface EditUserModalProps {
  user: any; // L'utilisateur sélectionné lors du clic sur "Modifier"
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // 🔴 CRUCIAL : Conservation et injection fidèle de toutes les données existantes lors de l'ouverture
  useEffect(() => {
    if (user && isOpen) {
      const ALLOWED_BADGES = ['Freemium', 'Essentiel', 'Live +', 'Révision +', 'Intégrale'];
      const activePkg = ALLOWED_BADGES.includes(user.activePackage)
        ? user.activePackage
        : (ALLOWED_BADGES.includes(user.badge)
        ? user.badge
        : (ALLOWED_BADGES.includes(user.statusBadge)
        ? user.statusBadge
        : (ALLOWED_BADGES.includes(user.subscriptionPackage)
        ? user.subscriptionPackage
        : (ALLOWED_BADGES.includes(user.userCategory)
        ? user.userCategory
        : (user.activePackages && ALLOWED_BADGES.includes(user.activePackages[0]) ? user.activePackages[0] : 'Freemium')))));

      const resolvedStatus = user.accountStatus || (user.isBlocked || user.status === 'disabled' || user.status === 'blocked' ? 'BLOCKED' : (user.status === 'active' || user.status === 'actif' || user.verified ? 'ACTIVE' : 'HOLD'));

      setFormData({
        id: user._id || user.id,
        name: user.fullName || user.name || '',
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: user.password || user.plainPassword || '', // Mot de passe d'assistance
        role: user.role || 'Élève (Student)',
        subscriptionPackage: activePkg,
        accountStatus: resolvedStatus,
        isAdminVerified: user.isAdminVerified ?? user.verified ?? true,
        academicLevel: user.academicLevel || user.grade || user.level || '4ème',
        section: user.section || "Sciences de l'Informatique",
        studyGroup: user.studyGroup || (user as any).study_group || user.groupe_etude || 'Non assigné',
        schoolName: user.schoolName || user.highSchool || '',
        phone: user.phone || '',
        governorate: user.governorate || user.city || '',
        address: user.address || 'Non spécifiée'
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-[#0F1E36] flex items-center gap-2">
              <span>✏️</span> Édition du Compte Élève : <span className="text-blue-600 font-extrabold">{formData.name || formData.fullName}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Identifiant ID : <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[11px] text-gray-700">{formData.id}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nom & Prénom */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-blue-600" />
                <span>Nom & Prénom *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Adresse E-mail */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-600" />
                <span>Adresse E-mail *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Mot de passe d'assistance */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-blue-600" />
                <span>Clé d'Accès / Mot de passe</span>
              </label>
              <input
                type="text"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-blue-600" />
                <span>Numéro de Téléphone</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Statut du Compte pré-rempli */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-blue-600" />
                <span>Statut du Compte</span>
              </label>
              <select
                name="accountStatus"
                value={formData.accountStatus || 'HOLD'}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="HOLD">En attente (Hold)</option>
                <option value="ACTIVE">Actif (Validé)</option>
                <option value="BLOCKED">Bloqué / Suspendu</option>
              </select>
            </div>

            {/* Type d'Abonnement (Forfait) */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-600" />
                <span>Type d'Abonnement (Forfait)</span>
              </label>
              <select
                name="subscriptionPackage"
                value={formData.subscriptionPackage || 'Freemium'}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                {ALL_PACKS.map((pack) => (
                  <option key={pack} value={pack}>
                    {pack}
                  </option>
                ))}
              </select>
            </div>

            {/* Niveau Scolaire */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <BookOpen size={13} className="text-blue-600" />
                <span>Niveau Scolaire</span>
              </label>
              <select
                name="academicLevel"
                value={formData.academicLevel || '4ème'}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="4ème">4ème Année (Baccalauréat)</option>
                <option value="3ème">3ème Année Secondaire</option>
                <option value="2ème">2ème Année Secondaire</option>
                <option value="1ère">1ère Année Secondaire</option>
              </select>
            </div>

            {/* Section / Filière */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Section / Filière</label>
              <select
                name="section"
                value={formData.section || "Sciences de l'Informatique"}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="Sciences de l'Informatique">Sciences de l'Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Sciences Expérimentales">Sciences Expérimentales</option>
                <option value="Économie et Gestion">Économie et Gestion</option>
                <option value="Technique">Technique</option>
                <option value="Lettres">Lettres</option>
              </select>
            </div>

            {/* Établissement / Lycée */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <Building size={13} className="text-blue-600" />
                <span>Établissement / Lycée</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName || ''}
                onChange={handleChange}
                placeholder="Ex: Lycée Pilote Bourguiba"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Ville / Gouvernorat */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-blue-600" />
                <span>Gouvernorat / Ville</span>
              </label>
              <input
                type="text"
                name="governorate"
                value={formData.governorate || ''}
                onChange={handleChange}
                placeholder="Ex: Tunis, Ben Arous, Sousse..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSaving ? "Enregistrement en cours..." : "Enregistrer et appliquer toutes les modifications"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
