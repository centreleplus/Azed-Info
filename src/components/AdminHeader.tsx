import React from 'react';
import { SITE_CONFIG } from '../config/siteConfig';

interface AdminHeaderProps {
  logoUrl?: string;
  logoText?: string;
  teacherName?: string;
  teacherRole?: string;
  className?: string;
  onLogout?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  logoUrl,
  logoText = "A-Zed Info",
  teacherName = SITE_CONFIG.teacher.name,
  teacherRole = "PROFESSEUR",
  className = "",
  onLogout
}) => {
  return (
    <header className={`w-full bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs select-none ${className}`}>
      {/* Brand Identity / Logo Area */}
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt={logoText} className="w-10 h-10 object-contain rounded-xl" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-base shadow-sm">
            AZ
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-base font-black text-slate-900 tracking-tight leading-none">
            {logoText}
          </span>
          {/* Sous le Logo A-Zed Info */}
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            PROFESSEUR NABIL CHAOUCH
          </span>
        </div>
      </div>

      {/* Profil utilisateur en haut à droite */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900">{teacherName}</div>
          <div className="text-[10px] font-bold text-emerald-600 uppercase">{teacherRole}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center">
          NC
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
