import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Sliders, Check, Copy } from 'lucide-react';

interface AdvancedColorPickerProps {
  label: string;
  value: string; // Ex: "#10B981"
  onChange: (color: string) => void;
}

// Helper de conversion HEX vers RGB
const hexToRgb = (hex: string) => {
  if (!hex) return '0, 0, 0';
  const cleanHex = hex.trim().replace('#', '');
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split('').map(c => c + c).join('');
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  label,
  value = '#10B981',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const safeHexValue = (value && value.startsWith('#')) ? value : `#${value || '000000'}`;

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(safeHexValue.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-1.5 relative text-start" ref={popoverRef}>
      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {/* Champ d'activation principal */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg border border-slate-300 shadow-inner shrink-0 transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: safeHexValue }}
          title="Ouvrir le sélecteur visuel"
        />
        <input
          type="text"
          value={safeHexValue.toUpperCase()}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            onChange(val);
          }}
          placeholder="#000000"
          className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 uppercase outline-none"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
          title="Sélecteur de couleur"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* POPOVER DU SÉLECTEUR STYLE GOOGLE */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xl w-72 flex flex-col gap-3 animate-in fade-in zoom-in-95">
          {/* Zone du canevas 2D + Slider Hue (react-colorful) */}
          <div className="w-full flex justify-center [&_.react-colorful]:w-full [&_.react-colorful]:h-40 [&_.react-colorful]:rounded-xl">
            <HexColorPicker color={safeHexValue} onChange={onChange} />
          </div>

          {/* Formats de sortie (HEX & RGB) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400">HEX</span>
              <span className="text-xs font-mono font-bold text-slate-800 truncate">{safeHexValue.toUpperCase()}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400">RGB</span>
              <span className="text-xs font-mono font-bold text-slate-800 truncate">{hexToRgb(safeHexValue)}</span>
            </div>
          </div>

          {/* Bouton Copier / Valider */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.98]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier le code HEX'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedColorPicker;
