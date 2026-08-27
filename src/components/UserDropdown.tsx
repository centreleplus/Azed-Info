import React from 'react';
import { PlayCircle, ShoppingBag, User as UserIcon, LogOut, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';

interface UserDropdownProps {
  user: {
    name?: string;
    fullName?: string;
    role: 'admin' | 'agent' | 'student' | string;
    grade?: string;
  };
  onLogout: () => void;
  onNavigate?: (tab: string) => void;
  onOpenShop?: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, onNavigate, onOpenShop }) => {
  const role = user?.role?.toLowerCase() || 'student';

  return (
    <div className="w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 z-50">
      {/* EN-TÊTE DYNAMIQUE SELON LE RÔLE */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {role === 'student' ? "PROMOTION D'ÉTUDES" : role === 'agent' ? "RÔLE & SERVICE" : "RÔLE & PRIVILÈGES"}
        </span>

        <div className="flex items-center justify-between mt-1.5 gap-2">
          <span className="text-xs font-extrabold text-slate-900 truncate">
            {role === 'admin' && 'Administration Globale'}
            {role === 'agent' && 'Validation & Comptabilité'}
            {role === 'student' && (user?.grade || '4ème')}
          </span>

          {/* BADGES DISTINCTS */}
          {role === 'admin' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full flex-shrink-0">
              <ShieldCheck className="w-3 h-3 text-indigo-600"/> Admin
            </span>
          )}

          {role === 'agent' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full flex-shrink-0">
              <UserCheck className="w-3 h-3 text-sky-600"/> Agent
            </span>
          )}

          {role === 'student' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex-shrink-0">
              <GraduationCap className="w-3 h-3 text-emerald-600"/> Élève Actif
            </span>
          )}
        </div>
      </div>

      <div className="p-1 space-y-1">
        {/* Visible uniquement pour les élèves (masqué pour agent et admin) */}
        {role === 'student' && onNavigate && (
          <button
            onClick={() => onNavigate('demos')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition group cursor-pointer text-left"
          >
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-200 transition">
              <PlayCircle className="w-4 h-4 text-purple-600"/>
            </div>
            <span>Démo & Extraits Vidéo</span>
          </button>
        )}

        {role === 'student' && onNavigate && (
          <>
            {/* Option 2 : Mon Profil & Forfaits */}
            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition group cursor-pointer text-left"
            >
              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md group-hover:bg-slate-200 transition">
                <UserIcon className="w-4 h-4 text-slate-500"/>
              </div>
              <span>Mon Profil & Forfaits</span>
            </button>

            {/* Option 3 : Boutique Scolaire */}
            {onOpenShop && (
              <button
                onClick={onOpenShop}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition group cursor-pointer text-left"
              >
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md group-hover:bg-emerald-200 transition">
                  <ShoppingBag className="w-4 h-4 text-emerald-600"/>
                </div>
                <span>Boutique Scolaire</span>
              </button>
            )}
          </>
        )}

        <div className="border-t border-slate-100 my-1" />

        {/* BOUTON DÉCONNEXION */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition group cursor-pointer text-left"
        >
          <div className="p-1.5 bg-rose-50 text-rose-500 rounded-md group-hover:bg-rose-100 transition">
            <LogOut className="w-4 h-4 stroke-[2]"/>
          </div>
          <span>Terminer la Session</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
