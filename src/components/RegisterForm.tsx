import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    level: '4ème Année',
    branch: "Sciences de l'Informatique",
    schoolYear: '2026 / 2027',
    school: '',
    governorate: 'Tunis'
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Conserve uniquement les chiffres
    if (value.length <= 8) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, phone, email, password, confirmPassword, level, branch, schoolYear, school, governorate } = formData;

    if (!fullName || !phone || !email || !password || !confirmPassword || !level || !branch || !schoolYear || !school || !governorate) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!/^\d{8}$/.test(phone)) {
      setErrorMsg("Le numéro de téléphone doit comporter exactement 8 chiffres.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas. Veuillez vérifier votre confirmation.");
      return;
    }

    setErrorMsg(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-2">✕</button>
        </div>
      )}

      {/* NOM ET PRÉNOM */}
      <div>
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
          Nom et Prénom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Foullen Fouleni"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* TELEPHONE */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Numéro de téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="Ex: 12345678"
            value={formData.phone}
            onChange={handlePhoneChange}
            maxLength={8}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
            required
          />
          {formData.phone.length > 0 && formData.phone.length < 8 && (
            <p className="text-[10px] text-amber-600 font-bold mt-1">
              Le numéro de téléphone doit comporter exactement 8 chiffres.
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Adresse Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Ex: foulenfouleni@gmail.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* MOT DE PASSE */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Minimum 6 caractères"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        {/* CONFIRMER MOT DE PASSE */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Confirmer mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Confirmer mot de passe"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* NIVEAU */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Niveau (Classe) <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.level}
            onChange={e => setFormData({ ...formData, level: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="4ème Année">4ème Année</option>
            <option value="3ème Année">3ème Année</option>
            <option value="2ème Année">2ème Année</option>
            <option value="1ère Année">1ère Année</option>
          </select>
        </div>

        {/* BRANCHE */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Branche <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.branch}
            onChange={e => setFormData({ ...formData, branch: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="Tronc Commun">Tronc Commun</option>
            <option value="Sciences de l'Informatique">Sciences de l'Informatique</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Sciences Expérimentales">Sciences Expérimentales</option>
            <option value="Sciences Techniques">Sciences Techniques</option>
            <option value="Économie & Gestion">Économie & Gestion</option>
            <option value="Lettres">Lettres</option>
            <option value="Sport">Sport</option>
          </select>
        </div>
      </div>

      {/* ÉTABLISSEMENT / LYCÉE */}
      <div>
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
          Option / Établissement <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Lycée Fleni"
          value={formData.school}
          onChange={e => setFormData({ ...formData, school: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-[#1A2B6D] hover:bg-[#132052] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
      >
        Valider l'inscription
      </button>
    </form>
  );
};

export default RegisterForm;
