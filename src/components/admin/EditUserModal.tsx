import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, BookOpen, Layers, Phone, MapPin, Building, ShieldCheck, Check, Eye, EyeOff, Users } from 'lucide-react';
import { normalizeBadge } from '../../constants/badges';

export interface EditUserModalProps {
  user: any; // L'utilisateur sélectionné lors du clic sur "Modifier"
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

const BADGE_OPTIONS = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'] as const;

const GRADE_OPTIONS = [
  { value: '1ère', label: '1ère Année Secondaire' },
  { value: '2ème', label: '2ème Année Secondaire' },
  { value: '3ème', label: '3ème Année Secondaire' },
  { value: '4ème', label: '4ème Année (Baccalauréat)' }
];

const STREAM_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport"
];

const STUDY_GROUPS = ['Non assigné', ...Array.from({ length: 26 }, (_, i) => `Gr.${String.fromCharCode(65 + i)}`)];

export const normalizeStudyGroup = (raw?: string | null): string => {
  if (!raw) return 'Non assigné';
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed.toLowerCase() === 'non assigné' || trimmed.toLowerCase() === 'non assigne') {
    return 'Non assigné';
  }
  const upper = trimmed.toUpperCase();
  if (/^GR\.[A-Z]$/.test(upper)) {
    return `Gr.${upper.slice(3)}`;
  }
  if (/^GROUPE\s+[A-Z]$/.test(upper)) {
    return `Gr.${upper.slice(-1)}`;
  }
  if (/^[A-Z]$/.test(upper)) {
    return `Gr.${upper}`;
  }
  return trimmed;
};

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Conservation et injection fidèle de toutes les données existantes lors de l'ouverture
  useEffect(() => {
    if (user && isOpen) {
      const activePkg = normalizeBadge(
        user.activeBadge ||
        user.badge ||
        user.activePackage ||
        user.statusBadge ||
        user.subscriptionPackage ||
        user.subscriptionTier ||
        user.userCategory ||
        (Array.isArray(user.activePackages) && user.activePackages[0]) ||
        (Array.isArray(user.packs) && user.packs[0]) ||
        'FREEMIUM'
      );

      const isBlocked =
        user.isBlocked === true ||
        user.status === 'disabled' ||
        user.status === 'blocked' ||
        user.accountStatus === 'BLOCKED';
      const isActive =
        !isBlocked &&
        (user.status === 'active' ||
          user.status === 'actif' ||
          user.accountStatus === 'ACTIVE' ||
          user.verified === true);

      const resolvedStatus = isBlocked ? 'BLOCKED' : isActive ? 'ACTIVE' : 'HOLD';

      setFormData({
        id: user._id || user.id,
        name: user.fullName || user.name || '',
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: user.password || user.plainPassword || 'student123',
        role: user.role || 'student',
        subscriptionPackage: activePkg,
        accountStatus: resolvedStatus,
        isAdminVerified: user.isAdminVerified ?? user.verified ?? true,
        academicLevel: user.academicLevel || user.grade || user.level || '4ème',
        section: user.section || user.stream || "Sciences de l'Informatique",
        studyGroup: normalizeStudyGroup(user.studyGroup || user.study_group || user.groupe_etude),
        schoolName: user.schoolName || user.highSchool || '',
        phone: user.phone || '',
        governorate: user.governorate || user.city || '',
        address: user.address || ''
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
      await onSave({
        ...formData,
        fullName: formData.name || formData.fullName,
        grade: formData.academicLevel,
        stream: formData.section,
        city: formData.governorate,
        highSchool: formData.schoolName,
        badge: formData.subscriptionPackage,
        activeBadge: formData.subscriptionPackage,
        groupe_etude: formData.studyGroup === 'Non assigné' ? '' : formData.studyGroup
      });
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-left animate-in fade-in zoom-in-95 duration-150">
        {/* En-tête de la modale */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0F1E36] dark:text-white flex items-center gap-2">
              <span>✏️</span> Édition du Compte Lycéen :{" "}
              <span className="text-blue-600 font-extrabold">{formData.name || formData.fullName}</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ID Compte :{" "}
              <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300">
                {formData.id}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulaire avec défilement interne et grille sur 2 colonnes */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Nom & Prénom */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-blue-600 shrink-0" />
                <span>Nom & Prénom *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Nom complet de l'élève"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* 2. Adresse E-mail */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-600 shrink-0" />
                <span>Adresse E-mail *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="eleve@exemple.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* 3. Mot de passe / Clé d'accès */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-blue-600 shrink-0" />
                <span>Mot de passe / Clé d'accès</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder="Mot de passe du compte"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* 4. Numéro de Téléphone */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-blue-600 shrink-0" />
                <span>Numéro de Téléphone</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Ex: +216 20 000 000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* 5. Niveau Scolaire */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen size={13} className="text-blue-600 shrink-0" />
                <span>Niveau Scolaire</span>
              </label>
              <select
                name="academicLevel"
                value={formData.academicLevel || '4ème'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Filière / Section */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen size={13} className="text-blue-600 shrink-0" />
                <span>Filière / Section</span>
              </label>
              <select
                name="section"
                value={formData.section || "Sciences de l'Informatique"}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                {STREAM_OPTIONS.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Gouvernorat / Ville */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span>Ville / Gouvernorat</span>
              </label>
              <input
                type="text"
                name="governorate"
                value={formData.governorate || ''}
                onChange={handleChange}
                placeholder="Ex: Tunis, Ariana, Sousse, Sfax..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* 8. Établissement scolaire / Lycée */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building size={13} className="text-blue-600 shrink-0" />
                <span>Établissement scolaire / Lycée</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName || ''}
                onChange={handleChange}
                placeholder="Ex: Lycée Pilote Bourguiba"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* 9. Badge / Formule (Forfait) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-600 shrink-0" />
                <span>Badge / Formule (userBadge)</span>
              </label>
              <select
                name="subscriptionPackage"
                value={formData.subscriptionPackage || 'FREEMIUM'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              >
                {BADGE_OPTIONS.map((pack) => (
                  <option key={pack} value={pack}>
                    {pack}
                  </option>
                ))}
              </select>
            </div>

            {/* 10. Statut du Compte & Groupe d'étude */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                  <span>Statut Compte</span>
                </label>
                <select
                  name="accountStatus"
                  value={formData.accountStatus || 'ACTIVE'}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Actif (Validé)</option>
                  <option value="HOLD">En attente</option>
                  <option value="BLOCKED">Bloqué</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Users size={13} className="text-blue-600 shrink-0" />
                  <span>Groupe (Gr.A–Z)</span>
                </label>
                <select
                  name="studyGroup"
                  value={formData.studyGroup || 'Non assigné'}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
                >
                  {STUDY_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Barre d'actions fixe/accessible en bas du formulaire */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSaving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

