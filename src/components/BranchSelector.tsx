import React, { useMemo } from 'react';

export const FILIERE_OPTIONS = [
  "Tronc Commun",
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport"
] as const;

export type FiliereOption = typeof FILIERE_OPTIONS[number];

export interface BranchSelectorProps {
  label?: string;
  value: string[] | string;
  onChange: (selected: string[], formattedString: string) => void;
  className?: string;
  idPrefix?: string;
  disabled?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  label = "FILIÈRE / NIVEAU D'ÉTUDES (COCHEZ POUR PUBLIER DANS PLUSIEURS FILIÈRES)",
  value,
  onChange,
  className = "",
  idPrefix = "filiere-grid",
  disabled = false,
}) => {
  // Normalize incoming value to an array of selected filières
  const currentSelected = useMemo<string[]>(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      if (value.includes("Tous") || value.includes("Toutes les filières") || value.includes("ALL")) {
        return ["Tous", ...FILIERE_OPTIONS];
      }
      return value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "Tous" || trimmed === "Toutes les filières" || trimmed === "Toutes les sections" || trimmed === "ALL") {
        return ["Tous", ...FILIERE_OPTIONS];
      }
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  // "Toutes les filières" is checked if "Tous" is explicitly present OR if all individual branches are present
  const isAllChecked = useMemo(() => {
    if (currentSelected.includes("Tous") || currentSelected.includes("Toutes les filières")) {
      return true;
    }
    return (
      FILIERE_OPTIONS.length > 0 &&
      FILIERE_OPTIONS.every((f) => currentSelected.includes(f))
    );
  }, [currentSelected]);

  // Handle toggling "Toutes les filières" or individual branches
  const handleToggle = (option: string) => {
    if (disabled) return;

    if (option === "ALL") {
      if (isAllChecked) {
        // Deselect all
        onChange([], "");
      } else {
        // Select all
        onChange(["Tous", ...FILIERE_OPTIONS], "Tous");
      }
      return;
    }

    // Toggle a specific branch
    let nextSelected: string[];

    if (isAllChecked) {
      // If all were selected and one is unchecked, keep all other 7 branches
      nextSelected = FILIERE_OPTIONS.filter((f) => f !== option);
    } else if (currentSelected.includes(option)) {
      // Deselect option
      nextSelected = currentSelected.filter((s) => s !== option && s !== "Tous" && s !== "Toutes les filières");
    } else {
      // Add option
      const base = currentSelected.filter((s) => s !== "Tous" && s !== "Toutes les filières");
      nextSelected = [...base, option];
    }

    // Check if all branches are now selected
    const nowHasAll = FILIERE_OPTIONS.every((f) => nextSelected.includes(f));
    if (nowHasAll) {
      onChange(["Tous", ...FILIERE_OPTIONS], "Tous");
    } else {
      onChange(nextSelected, nextSelected.join(", "));
    }
  };

  return (
    <div id={`${idPrefix}-container`} className={`space-y-2 text-left ${className}`}>
      {label && (
        <label
          id={`${idPrefix}-label`}
          className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block"
        >
          {label}
        </label>
      )}

      <div
        id={`${idPrefix}-grid`}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3.5 bg-slate-50/90 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-2xl"
      >
        {/* Option 1: Toutes les filières */}
        <label
          id={`${idPrefix}-item-all`}
          className={`flex items-center gap-2.5 text-xs font-bold cursor-pointer p-2.5 rounded-xl transition-all select-none border ${
            isAllChecked
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-2xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-slate-100/90 dark:hover:bg-gray-700/60 border-slate-200 dark:border-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="checkbox"
            id={`${idPrefix}-checkbox-all`}
            checked={isAllChecked}
            onChange={() => handleToggle("ALL")}
            disabled={disabled}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-gray-300 dark:border-gray-600 cursor-pointer shrink-0"
          />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate">Toutes les filières</span>
        </label>

        {/* Options 2 à 9: Individual Branches in exact requested order */}
        {FILIERE_OPTIONS.map((filiere) => {
          const isChecked = isAllChecked || currentSelected.includes(filiere);
          const safeKey = filiere.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const safeId = `${idPrefix}-checkbox-${safeKey}`;

          return (
            <label
              key={filiere}
              id={`${idPrefix}-item-${safeKey}`}
              className={`flex items-center gap-2.5 text-xs font-semibold cursor-pointer p-2.5 rounded-xl transition-all select-none border ${
                isChecked
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold shadow-2xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-slate-100/80 dark:hover:bg-gray-700/60 border-slate-200 dark:border-gray-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                id={safeId}
                checked={isChecked}
                onChange={() => handleToggle(filiere)}
                disabled={disabled}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-gray-300 dark:border-gray-600 cursor-pointer shrink-0"
              />
              <span className="truncate">{filiere}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

// Aliases for unified importing
export const FiliereCheckboxGrid = BranchSelector;
export const BranchCheckboxGroup = BranchSelector;

export default BranchSelector;
