import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

export interface CircleBackButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  className?: string;
  useHomeIcon?: boolean;
}

export const CircleBackButton: React.FC<CircleBackButtonProps> = ({
  onClick,
  label = "Retour à l'accueil",
  className = "",
  useHomeIcon,
}) => {
  const isHome =
    useHomeIcon !== undefined
      ? useHomeIcon
      : !label ||
        label.toLowerCase().includes("accueil") ||
        label.toLowerCase().includes("home") ||
        label.toLowerCase().includes("principale");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#/student/courses';
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-2.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors group cursor-pointer select-none relative z-20 ${className}`}
      title={label}
      aria-label={label}
    >
      {/* Cercle vert avec icône Home ou Flèche de retour */}
      <span className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors shrink-0 shadow-xs pointer-events-none">
        {isHome ? (
          <Home className="w-4 h-4 text-emerald-600" />
        ) : (
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
        )}
      </span>
      {label && <span className="pointer-events-none">{label}</span>}
    </button>
  );
};

export default CircleBackButton;
