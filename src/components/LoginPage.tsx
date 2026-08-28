import React from 'react';

export interface LoginPageProps {
  onNavigate?: (page: string) => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 text-center space-y-6">
      {/* Bouton de retour en haut à droite avec flèche dans un cercle */}
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
          <span>Retour à la page d'accueil</span>
        </button>
      </div>

      {/* Titres */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800">Bienvenue Chez</h1>
        <h2 className="text-3xl font-black text-emerald-600">A-Zed info</h2>
        <p className="text-xs font-semibold text-slate-400">Connexion à votre espace</p>
      </div>

      {/* Formulaire de connexion */}
      <form className="space-y-4 text-left" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            Adresse E-mail
          </label>
          <input
            type="email"
            autoComplete="off"
            placeholder="Ex : eleve@azed.info"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            autoComplete="off"
            placeholder="Saisissez votre clé ou mot de passe"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-right">
          <button type="button" className="text-xs font-extrabold text-slate-600 hover:underline cursor-pointer">
            Mot de passe oublié ?
          </button>
        </div>

        {/* Bouton Connexion : Flèche '→' complètement supprimée */}
        <button
          type="submit"
          className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
        >
          SE CONNECTER À MON ESPACE
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
          {/* Cercle contenant la flèche orientée vers la droite */}
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
