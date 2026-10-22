import React, { useContext } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, LogOut, User as UserIcon, ShoppingBag, PlayCircle } from 'lucide-react';
import { StudentBadge } from './StudentBadge';
import { StudentBadgeView } from './StudentBadgeView';
import { mapOfferToCategory } from './BadgeResolver';
import { UserContext } from './AuthContext';

interface ProfileDropdownProps {
  user: {
    name?: string;
    fullName?: string;
    role: 'admin' | 'agent' | 'student' | string;
    grade?: string;
    level?: string;
    academicLevel?: string;
    niveau?: string;
    section?: string;
    stream?: string;
    badge?: string;
    userCategory?: string;
    tierCategory?: string;
    tier?: string;
    badgeLabel?: string;
    accountType?: string;
  };
  onLogout: () => void;
  onNavigate?: (tab: string) => void;
  onOpenShop?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onNavigate, onOpenShop }) => {
  const auth = useContext(UserContext);
  const role = user?.role?.toLowerCase() || 'student';
  const resolvedGrade =
    auth?.user?.grade ||
    auth?.user?.level ||
    (auth?.user as any)?.academicLevel ||
    user?.grade ||
    user?.level ||
    user?.academicLevel ||
    user?.niveau ||
    '4ème';
  const resolvedBadge = auth?.user?.activeBadge || auth?.user?.badge || user?.badge;

  const isProfAgent =
    String(
      (auth?.user as any)?.agentCategory ||
      (auth?.user as any)?.agentBadge ||
      auth?.user?.agentType ||
      (auth?.user as any)?.category ||
      (user as any)?.agentCategory ||
      (user as any)?.agentBadge ||
      (user as any)?.agentType ||
      (user as any)?.category ||
      ''
    ).toUpperCase().includes('PROF') ||
    Number(auth?.user?.commissionRate ?? auth?.user?.rate ?? (user as any)?.commissionRate ?? (user as any)?.rate) === 0.20 ||
    Number(auth?.user?.commissionRate ?? auth?.user?.rate ?? (user as any)?.commissionRate ?? (user as any)?.rate) === 20;

  return (
    <div className="w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 z-50">
      {/* EN-TÊTE DYNAMIQUE SELON LE RÔLE */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {role === 'student' ? "PROMOTION D'ÉTUDES" : role === 'agent' ? "CATÉGORIE & COMMISSION" : "RÔLE & PRIVILÈGES"}
        </span>

        <div className="flex items-center justify-between mt-1.5 gap-2">
          <span className="text-xs font-extrabold text-slate-900 truncate">
            {role === 'admin' && 'Administration Globale'}
            {role === 'agent' && (isProfAgent ? 'Commission 20%' : 'Commission 10%')}
            {role === 'student' && resolvedGrade}
          </span>

          {/* BADGES DISTINCTS */}
          {role === 'admin' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full flex-shrink-0">
              <ShieldCheck className="w-3 h-3 text-indigo-600"/> Admin
            </span>
          )}

          {role === 'agent' && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full flex-shrink-0 uppercase tracking-wider ${
                isProfAgent
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              <UserCheck className={`w-3 h-3 ${isProfAgent ? 'text-emerald-600' : 'text-indigo-600'}`} />
              {isProfAgent ? 'PROFESSEUR' : 'ASSISTANT'}
            </span>
          )}

          {role === 'student' && (
            <StudentBadgeView badge={resolvedBadge} />
          )}
        </div>
      </div>

      <div className="p-1 space-y-1">
        {/* Visible uniquement pour les élèves (masqué pour agent et admin) */}
        {role === 'student' && onNavigate && (
          <button
            onClick={() => onNavigate('demos')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition group cursor-pointer text-left"
          >
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md group-hover:bg-emerald-200 transition">
              <PlayCircle className="w-4 h-4 text-emerald-600"/>
            </div>
            <span>Démo & Extraits Vidéo</span>
          </button>
        )}

        {/* Option Profil pour tous les rôles */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition group cursor-pointer text-left"
          >
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md group-hover:bg-slate-200 transition">
              <UserIcon className="w-4 h-4 text-slate-500"/>
            </div>
            <span>
              {role === 'admin' ? "Profil & Sécurité Admin" : role === 'agent' ? "Mon Espace Profil" : "Mon Profil & Forfaits"}
            </span>
          </button>
        )}

        {role === 'student' && onNavigate && onOpenShop && (
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

        <div className="border-t border-slate-100 my-1" />

        {/* BOUTON DÉCONNEXION */}
        <button 
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition group cursor-pointer text-left"
          title="Déconnexion"
        >
          <div className="p-1.5 bg-rose-50 text-rose-500 rounded-md group-hover:bg-rose-100 transition">
            <LogOut className="w-4 h-4 stroke-[2]"/>
          </div>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

