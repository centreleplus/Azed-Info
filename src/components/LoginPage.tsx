import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { signInUser } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface LoginPageProps {
  onNavigate?: (page: string) => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Veuillez saisir votre adresse e-mail.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const { user, sessionToken, error } = await signInUser(email, password);
      if (error || !user) {
        throw error || new Error("Impossible de se connecter. Identifiants invalides.");
      }

      setUser(user);
      if (sessionToken) {
        localStorage.setItem("session_token", sessionToken);
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      } else if (onNavigate) {
        const role = user.role?.toUpperCase();
        if (role === 'ADMIN') {
          onNavigate('admin');
        } else if (role === 'AGENT') {
          onNavigate('agent');
        } else {
          onNavigate('cours');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm my-6">
      {/* Bouton de retour en haut à droite */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className="inline-flex items-center gap-2.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors group cursor-pointer"
        >
          <span className="w-7 h-7 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </span>
          <span>Retour à l'accueil</span>
        </button>
      </div>

      {/* Titres */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800">Bienvenue Chez</h1>
        <h2 className="text-3xl font-black text-emerald-600">A-Zed info</h2>
        <p className="text-xs font-semibold text-slate-400">Connexion à votre espace</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Formulaire de connexion */}
      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            Adresse E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex : eleve@azed.info"
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Saisissez votre clé ou mot de passe"
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-right">
          <button type="button" onClick={() => alert("Veuillez contacter l'administration au +216 98 000 000 ou par mail à centreleplus@gmail.com pour réinitialiser votre accès.")} className="text-xs font-extrabold text-slate-600 hover:underline cursor-pointer">
            Mot de passe oublié ?
          </button>
        </div>

        {/* Bouton Connexion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <span>SE CONNECTER À MON ESPACE</span>
          )}
        </button>
      </form>

      {/* Section Inscription avec flèche encerclée */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-400">Nouveau candidat sur la plateforme ?</p>
        
        <button
          onClick={() => onNavigate && onNavigate('signup')}
          type="button"
          className="inline-flex items-center gap-2.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-all group cursor-pointer"
        >
          <span>CRÉER UN PROFIL GRATUITEMENT</span>
          <span className="w-7 h-7 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
