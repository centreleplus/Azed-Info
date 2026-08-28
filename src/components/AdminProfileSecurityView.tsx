import React, { useState } from "react";
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  User, 
  Mail, 
  Building2, 
  Shield, 
  RefreshCw, 
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { User as UserType } from "../types";

interface AdminProfileSecurityViewProps {
  currentUser: UserType;
  setCurrentUser?: React.Dispatch<React.SetStateAction<UserType | null>>;
  onAdminActionRefetch?: () => void;
}

export default function AdminProfileSecurityView({
  currentUser,
  setCurrentUser,
  onAdminActionRefetch
}: AdminProfileSecurityViewProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isLengthValid = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanCurrent) {
      setErrorMessage("Veuillez saisir votre mot de passe actuel.");
      return;
    }

    if (!cleanNew || cleanNew.length < 6) {
      setErrorMessage("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMessage("Les deux champs du nouveau mot de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          currentPassword: cleanCurrent,
          oldPassword: cleanCurrent,
          newPassword: cleanNew,
          password: cleanNew
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Impossible de modifier le mot de passe.");
      }

      setSuccessMessage(data.message || "Mot de passe mis à jour avec succès et enregistré dans la base de données !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (setCurrentUser) {
        setCurrentUser(prev => prev ? { ...prev, password: cleanNew } : null);
      }

      if (onAdminActionRefetch) {
        onAdminActionRefetch();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* Top Banner / Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Sécurité & Authentification Super-Admin
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight">
            Profil & Sécurité Administrateur
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos informations d'accès système et modifiez le mot de passe de votre compte Super-Admin.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-black text-sm shadow-xs">
            {currentUser.fullName ? currentUser.fullName.charAt(0) : "A"}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.fullName || "M. Nabil Chaouch"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600">
              <Sparkles size={10} /> Super-Administrateur
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-emerald-900">Mise à jour réussie</p>
            <p className="text-emerald-700 text-xs mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-rose-900">Erreur de validation</p>
            <p className="text-rose-700 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Information (Read Only) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#0F1E36]">Informations du Compte</h2>
                  <p className="text-[10px] text-slate-400">Données système en lecture seule</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                Actif & Vérifié
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Adresse e-mail Super-Admin
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{currentUser.email || "centreleplus@gmail.com"}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nom & Prénom
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{currentUser.fullName || "Nabil Chaouch (Le Plus)"}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Rôle & Privilèges Système
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-900">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Super-Administrateur</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">
                    Accès Total
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Établissement & Siège
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{currentUser.address || "Centre Le Plus, El Mourouj, Tunis"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Session sécurisée
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Votre compte dispose des droits de gestion absolue sur les cours, les paiements, les quiz, et les utilisateurs de la plateforme A-zed Info.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#0F1E36]">Changement de Mot de Passe</h2>
                  <p className="text-[10px] text-slate-400">Mettez à jour vos identifiants d'accès sécurisés</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                Min. 6 car.
              </span>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              {/* Champ 1 : Mot de passe actuel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mot de passe actuel <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="off"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mot de passe initial par défaut : <span className="font-mono font-bold text-slate-600">admin123</span>
                </p>
              </div>

              <div className="border-t border-slate-100 my-2 pt-2" />

              {/* Champ 2 : Nouveau mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nouveau mot de passe <span className="text-rose-500">*</span>
                  </label>
                  {newPassword && (
                    <span className={`text-[10px] font-bold ${isLengthValid ? "text-emerald-600" : "text-rose-500"}`}>
                      {isLengthValid ? "Longueur valide (≥ 6)" : "Trop court (min. 6 car.)"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="off"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères..."
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white outline-none transition-all ${
                      newPassword && !isLengthValid 
                        ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" 
                        : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Champ 3 : Confirmation du nouveau mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirmation du nouveau mot de passe <span className="text-rose-500">*</span>
                  </label>
                  {confirmPassword && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isMatching ? "text-emerald-600" : "text-rose-500"}`}>
                      {isMatching ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Mots de passe identiques
                        </>
                      ) : (
                        "Ne correspond pas"
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="off"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le nouveau mot de passe..."
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white outline-none transition-all ${
                      confirmPassword && !isMatching 
                        ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" 
                        : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || !isLengthValid || !isMatching}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enregistrement en base de données...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
