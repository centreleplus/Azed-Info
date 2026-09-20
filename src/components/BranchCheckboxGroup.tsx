import React from 'react';
import { STANDARD_FILIERES } from '../constants/academic';

export interface BranchCheckboxGroupProps {
  label?: string;
  value: string[] | string;
  onChange: (selected: string[], formattedString: string) => void;
  className?: string;
  idPrefix?: string;
  disabled?: boolean;
}

export const BranchCheckboxGroup: React.FC<BranchCheckboxGroupProps> = ({
  label = "FILIÈRE / NIVEAU D'ÉTUDES (COCHEZ POUR PUBLIER DANS PLUSIEURS FILIÈRES)",
  value,
  onChange,
  className = "",
  idPrefix = "branch-group",
  disabled = false,
}) => {
  // Normalize value to array of strings
  const currentSelected: string[] = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value === "Tous" || value === "Toutes les filières" || value === "Toutes les sections") {
      return ["Tous"];
    }
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }, [value]);

  const isTousChecked = currentSelected.includes("Tous") || (
    currentSelected.length === STANDARD_FILIERES.length &&
    STANDARD_FILIERES.every((f) => currentSelected.includes(f))
  );

  const handleToggle = (val: string) => {
    if (disabled) return;

    if (val === "Tous") {
      if (isTousChecked) {
        onChange([], "");
      } else {
        onChange(["Tous"], "Tous");
      }
      return;
    }

    // Toggle specific branch
    let updated: string[];
    if (isTousChecked) {
      // If "Tous" was active and a branch is clicked, deselect that branch from all
      updated = STANDARD_FILIERES.filter((f) => f !== val);
    } else if (currentSelected.includes(val)) {
      updated = currentSelected.filter((s) => s !== val && s !== "Tous");
    } else {
      updated = [...currentSelected.filter((s) => s !== "Tous"), val];
    }

    // If all standard branches are selected, can be represented as "Tous"
    if (updated.length === STANDARD_FILIERES.length) {
      onChange(["Tous"], "Tous");
    } else {
      onChange(updated, updated.join(", "));
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl">
        <label className={`flex items-center gap-2.5 text-xs font-bold cursor-pointer p-2 rounded-lg transition-all select-none border ${
          isTousChecked
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800 font-extrabold shadow-2xs'
            : 'text-gray-700 hover:bg-slate-100/90 border-transparent hover:border-slate-200'
        }`}>
          <input
            type="checkbox"
            id={`${idPrefix}-tous`}
            checked={isTousChecked}
            onChange={() => handleToggle("Tous")}
            disabled={disabled}
            className="rounded text-[#10B981] focus:ring-[#10B981] w-4 h-4 border-gray-300 cursor-pointer shrink-0"
          />
          <span className="text-emerald-700">Toutes les filières</span>
        </label>
        {STANDARD_FILIERES.map((sec) => {
          const isChecked = !isTousChecked && currentSelected.includes(sec);
          const safeId = `${idPrefix}-${sec.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
          return (
            <label
              key={sec}
              className={`flex items-center gap-2.5 text-xs font-semibold cursor-pointer p-2 rounded-lg transition-all select-none border ${
                isChecked
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                  : 'text-gray-700 hover:bg-slate-100/80 border-transparent hover:border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                id={safeId}
                checked={isChecked}
                onChange={() => handleToggle(sec)}
                disabled={disabled}
                className="rounded text-[#10B981] focus:ring-[#10B981] w-4 h-4 border-gray-300 cursor-pointer shrink-0"
              />
              <span className="truncate">{sec}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default BranchCheckboxGroup;
