import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { BookOpen, Clock, Check, ChevronDown, X } from 'lucide-react';

export interface AutoCompleteInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onSelectOption?: (selected: string) => void;
  helperText?: string;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Saisissez ou choisissez une option...",
  required = false,
  className = "",
  icon,
  onSelectOption,
  helperText
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Deduplicate and filter options based on input value
  const cleanOptions = Array.from(new Set(options.map(o => String(o || '').trim()))).filter(Boolean);
  const filteredOptions = cleanOptions.filter(opt =>
    opt.toLowerCase().includes((value || '').toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: string) => {
    onChange(opt);
    if (onSelectOption) {
      onSelectOption(opt);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
          {icon || <BookOpen size={12} className="text-emerald-600" />}
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3.5 py-2 border border-[#CBD5E1] rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] focus:outline-none bg-white shadow-xs placeholder:text-slate-400 placeholder:font-normal transition-all"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full"
            title="Effacer"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 font-medium">{helperText}</p>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 text-left animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between gap-1.5 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-emerald-600" />
              <span>Historique & Suggestions ({filteredOptions.length})</span>
            </span>
            {value.trim() && !filteredOptions.includes(value.trim()) && (
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                + Nouveau
              </span>
            )}
          </div>

          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 italic bg-white">
              {value.trim() ? (
                <div className="flex flex-col gap-1">
                  <span>Aucune suggestion trouvée pour "{value}".</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    💡 Cette valeur sera automatiquement enregistrée dans l'historique lors de la validation.
                  </span>
                </div>
              ) : (
                <span>Aucune option disponible dans l'historique. Commencez à saisir...</span>
              )}
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.toLowerCase() === value.trim().toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevents blur before click registers
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${
                    isHighlighted || isSelected
                      ? 'bg-emerald-50/80 text-emerald-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    {isSelected && <Check size={12} className="text-emerald-600 shrink-0" />}
                    <span>{opt}</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                    isSelected
                      ? 'bg-emerald-200/60 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isSelected ? 'Sélectionné' : 'Réutiliser'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
