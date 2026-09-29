import React from 'react';

export const UserProfileHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <span className="block text-sm font-bold text-slate-800">Professeur Nabil Chaouch</span>
        <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">ADMIN</span>
      </div>
      <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-300">
        NC
      </div>
    </div>
  );
};

export default UserProfileHeader;
