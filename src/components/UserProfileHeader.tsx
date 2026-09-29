import React from 'react';

export const UserProfileHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-bold text-slate-900">Nabil Chaouch</div>
        <div className="text-[10px] font-bold text-emerald-600 uppercase">PROFESSEUR</div>
      </div>
      <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-300">
        NC
      </div>
    </div>
  );
};

export default UserProfileHeader;
