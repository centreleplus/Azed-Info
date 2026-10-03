import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Sparkles, Check, X } from 'lucide-react';

interface EditStudentModalProps {
  student: User;
  onClose: () => void;
  onSaveSuccess: (updatedStudent: User) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSaveSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: student.fullName || '',
    email: student.email || '',
    phone: student.phone || '',
    grade: student.grade || '4ème Année (Bac Info)',
    section: student.section || "Sciences de l'Informatique",
    activePlan: (student as any).userCategory || (student as any).subscriptionType || student.tierCategory || (student.accountType === 'premium' ? 'Premium' : 'Freemium'),
    status: student.status === 'disabled' ? 'disabled' : 'active',
    city: student.city || '',
    highSchool: student.highSchool || '',
    studyGroup: student.studyGroup || (student as any).groupe_etude || ''
  });

  const [isSubmitting, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMsg(null);

    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'usr_admin',
          'x-admin-name': 'Professeur Nabil Chaouch'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          grade: formData.grade,
          academicLevel: formData.grade,
          section: formData.section,
          field: formData.section,
          activePlan: formData.activePlan,
          subscriptionType: formData.activePlan,
          userCategory: formData.activePlan,
          status: formData.status,
          city: formData.city,
          highSchool: formData.highSchool,
          studyGroup: formData.studyGroup,
          groupe_etude: formData.studyGroup
        })
      });

      const result = await response.json();

      if (response.ok && (result.success || result.user || result.data)) {
        const updated = result.data || result.user;
        setToastMsg("Forfait et accès mis à jour avec succès ✅");
        setTimeout(() => {
          onSaveSuccess(updated);
          onClose();
        }, 1200);
      } else {
        alert("Erreur lors de la mise à jour : " + (result.message || result.msg || "Erreur serveur"));
      }
    } catch (err: any) {
      console.error("Erreur serveur lors de la mise à jour de l'élève :", err);
      alert("Erreur réseau ou serveur lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden text-left relative">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Ajustement du Compte Élève</h3>
              <p className="text-xs text-slate-300">Synchronisation synchrone & globale A-Zed Info</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {toastMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold text-center animate-bounce">
              {toastMsg}
            </div>
          )}

          {/* Nom & Prénom */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Nom & Prénom</label>
            <input 
              type="text" 
              value={formData.fullName} 
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Email & Téléphone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Adresse E-mail</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Forfait Actif (5 Tiers System) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Forfait d'Abonnement Actif</span>
            </label>
            <select 
              value={formData.activePlan} 
              onChange={(e) => setFormData({ ...formData, activePlan: e.target.value })}
              className="w-full px-3.5 py-2.5 border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="Freemium">⚪ Freemium (Accès Découverte Gratuit)</option>
              <option value="Essentiel">🔵 Essentiel (Supports & Fiches de Cours)</option>
              <option value="Live +">🟢 Live + (Séances Interactives & Replays)</option>
              <option value="Révision +">🟣 Révision + (Sujets d'Examens & Corrigés)</option>
              <option value="Intégrale">👑 Intégrale (Accès Total Illimité + Livres)</option>
            </select>
          </div>

          {/* Niveau Scolaire & Filière */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Niveau Académique</label>
              <select 
                value={formData.grade} 
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="1er Année">1ère Année (Tronc)</option>
                <option value="2ème Année">2ème Année</option>
                <option value="3ème Année">3ème Année</option>
                <option value="4ème Année (Bac Info)">4ème Année (Bac Info)</option>
                <option value="Tous">Tous les niveaux</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Filière / Branche</label>
              <select 
                value={formData.section} 
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Sciences de l'Informatique">Sciences de l'Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Sciences Expérimentales">Sciences Expérimentales</option>
                <option value="Économie et Gestion">Économie et Gestion</option>
                <option value="Technique">Technique</option>
                <option value="Lettres">Lettres</option>
                <option value="Toutes les sections">Toutes les filières</option>
              </select>
            </div>
          </div>

          {/* Statut du Compte */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Statut d'Accès</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="active">✅ Actif (Autorisé)</option>
                <option value="disabled">🔒 Bloqué / Banni</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Groupe d'Étude</label>
              <select 
                value={formData.studyGroup} 
                onChange={(e) => setFormData({ ...formData, studyGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Non assigné</option>
                <option value="A">Groupe A</option>
                <option value="B">Groupe B</option>
                <option value="C">Groupe C</option>
                <option value="D">Groupe D</option>
              </select>
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Mise à jour en cours..." : "Valider & Appliquer Globalement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
