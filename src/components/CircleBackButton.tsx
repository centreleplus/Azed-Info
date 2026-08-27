import React from 'react';

export interface CircleBackButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

export const CircleBackButton: React.FC<CircleBackButtonProps> = ({
  onClick,
  label = "Retour à la page d'accueil",
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors group cursor-pointer select-none ${className}`}
    >
      {/* Cercle avec la flèche */}
      <span className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors shrink-0 shadow-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </span>
      <span>{label}</span>
    </button>
  );
};

export default CircleBackButton;
