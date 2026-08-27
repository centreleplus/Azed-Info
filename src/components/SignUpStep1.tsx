import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { ACADEMIC_BRANCHES } from '../constants/academic';
import { calculateStudentPrice } from '../utils/pricingDiscount';

export const getBranchOptions = (selectedLevel: string = '') => {
  if (selectedLevel && (selectedLevel.includes('1') || selectedLevel.toLowerCase().includes('première') || selectedLevel.toLowerCase().includes('premiere'))) {
    return ['Tronc Commun'];
  }

  return [
    'Tronc Commun',
    "Sciences de l'Informatique",
    'Mathématiques',
    'Sciences Expérimentales',
    'Sciences Techniques',
    'Économie & Gestion',
    'Lettres',
    'Sport'
  ];
};

const TUNISIAN_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Bizerte",
  "Nabeul",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
  "Zaghouan"
];

interface SignUpStep1Props {
  formData: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
    level?: string;
    grade?: string;
    niveau?: string;
    section?: string;
    branche?: string;
    branch?: string;
    schoolYear?: string;
    school?: string;
    highSchool?: string;
    option?: string;
    governorate?: string;
    city?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBackToLogin?: () => void;
}

export const SignUpStep1: React.FC<SignUpStep1Props> = ({
  formData,
  setFormData,
  onNext,
  onBackToLogin
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const currentLevel = formData.level || formData.grade || (formData as any).niveau || '4ème Année';

  // Gestion de la sélection automatique si 1ère Année
  useEffect(() => {
    if (currentLevel && (currentLevel.includes('1') || currentLevel.toLowerCase().includes('première') || currentLevel.toLowerCase().includes('premiere'))) {
      setFormData((prev: any) => {
        if (prev.section === 'Tronc Commun' && (prev.branche === 'Tronc Commun' || !prev.branche)) {
          return prev;
        }
        return {
          ...prev,
          section: 'Tronc Commun',
          branche: 'Tronc Commun',
          branch: 'Tronc Commun'
        };
      });
    }
  }, [currentLevel, setFormData]);

  // Contrôle strict du numéro de téléphone (chiffres uniquement, max 8)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Conserve uniquement les chiffres
    if (value.length <= 8) {
      setFormData((prev: any) => ({
        ...prev,
        phone: value
      }));
      if (value.length > 0 && value.length < 8) {
        setPhoneError("Le numéro de téléphone doit comporter exactement 8 chiffres.");
      } else {
        setPhoneError(null);
      }
    }
  };

  const branchOptions = getBranchOptions(currentLevel);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm space-y-5 border border-slate-100">
      {/* Title block strictly matching the original design */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
          Bienvenue Chez <span className="text-emerald-500">A-Zed info</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Créez votre compte élève en quelques instants
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-4 text-left"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Nom et Prénom */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Nom et Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Foullen Fouleni"
              value={formData.fullName || ''}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  fullName: e.target.value
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          {/* Numéro de téléphone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Numéro de Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Ex: 12345678"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              maxLength={8}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
              required
            />
            {phoneError && (
              <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{phoneError} ({formData.phone?.length || 0}/8)</span>
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Ex: foulenfouleni@gmail.com"
            value={formData.email || ''}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                email: e.target.value
              }))
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 caractères"
                value={formData.password || ''}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    password: e.target.value
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Confirmer mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmer votre mot de passe"
                value={formData.confirmPassword || ''}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-[10px] text-amber-600 font-bold mt-1">
                Les mots de passe ne correspondent pas.
              </p>
            )}
          </div>
        </div>

        {/* Level & Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Niveau (Classe) <span className="text-red-500">*</span>
            </label>
            <select
              value={currentLevel}
              onChange={(e) => {
                const newLevel = e.target.value;
                const isFirstYear = newLevel.includes('1') || newLevel.toLowerCase().includes('première') || newLevel.toLowerCase().includes('premiere');
                setFormData((prev: any) => ({
                  ...prev,
                  level: newLevel,
                  grade: newLevel,
                  niveau: newLevel,
                  section: isFirstYear ? 'Tronc Commun' : (prev.section === 'Tronc Commun' ? "Sciences de l'Informatique" : (prev.section || "Sciences de l'Informatique")),
                  branche: isFirstYear ? 'Tronc Commun' : (prev.branche === 'Tronc Commun' ? "Sciences de l'Informatique" : (prev.branche || "Sciences de l'Informatique")),
                  branch: isFirstYear ? 'Tronc Commun' : (prev.branch === 'Tronc Commun' ? "Sciences de l'Informatique" : (prev.branch || "Sciences de l'Informatique"))
                }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-emerald-500 outline-none cursor-pointer"
              required
            >
              <option value="">-- Sélectionner le niveau --</option>
              <option value="4ème Année">4ème Année</option>
              <option value="3ème Année">3ème Année</option>
              <option value="2ème Année">2ème Année</option>
              <option value="1ère Année">1ère Année</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Branche <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.section || (formData as any).branche || (formData as any).branch || (currentLevel.includes('1') ? "Tronc Commun" : "Sciences de l'Informatique")}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  section: e.target.value,
                  branche: e.target.value,
                  branch: e.target.value
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-emerald-500 outline-none cursor-pointer"
              required
            >
              <option value="">-- Sélectionner la branche --</option>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {(() => {
              const selectedBranch = formData.section || (formData as any).branche || (formData as any).branch || '';
              const calc = calculateStudentPrice(100, selectedBranch, currentLevel);
              if (calc.hasDiscount) {
                return (
                  <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold">
                    <Sparkles size={13} className="text-emerald-600 shrink-0" />
                    <span>🎉 Remise Exceptionnelle de -20% appliquée automatiquement sur toutes les formules !</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Academic Year */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Année Scolaire <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.schoolYear || "2026 / 2027"}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, schoolYear: e.target.value }))}
            readOnly
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 cursor-not-allowed select-none"
            required
          />
        </div>

        {/* Highschool & Governorat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Option / Établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Lycée Fleni"
              value={formData.school || formData.highSchool || formData.option || ''}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  school: e.target.value,
                  highSchool: e.target.value,
                  option: e.target.value
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gouvernorat <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.governorate || formData.city || 'Tunis'}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  governorate: e.target.value,
                  city: e.target.value
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-emerald-500 outline-none cursor-pointer"
              required
            >
              <option value="">-- Sélectionner le gouvernorat --</option>
              {TUNISIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#1A2B6D] hover:bg-[#132052] text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center"
        >
          <span>S'inscrire</span>
        </button>

        {onBackToLogin && (
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Vous avez déjà un compte ? </span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-emerald-600 font-bold hover:underline cursor-pointer ml-1"
            >
              Se connecter
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignUpStep1;
