import React from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const BRAND_PRESETS = [
  '#10B981', // Vert Émeraude A-Zed Info
  '#0F172A', // Bleu Nuit Sombre
  '#1E293B', // Slate Sombre
  '#3B82F6', // Bleu Accent
  '#2563EB', // Bleu Royal
  '#F59E0B', // Or / Amber
  '#EF4444', // Rouge Alerte
  '#FFFFFF', // Blanc
  '#F8FAFC', // Fond Très Clair
  '#E2E8F0', // Gris Bordure
];

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 text-start">
      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">{label}</label>
      
      <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
        {/* Interactive Color Wheel / Swatch */}
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-300 shadow-inner shrink-0 cursor-pointer">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer border-0 p-0"
          />
        </div>

        {/* Synchronized Direct HEX Input */}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 uppercase outline-none"
        />
        <Pipette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

      {/* Preset Swatches for A-Zed Info Brand Colors */}
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        {BRAND_PRESETS.map((preset) => {
          const isSelected = value?.toLowerCase() === preset.toLowerCase();
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`w-5 h-5 rounded-full border border-slate-300 transition-all cursor-pointer hover:scale-110 ${
                isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 scale-105 font-bold' : 'hover:opacity-90'
              }`}
              style={{ backgroundColor: preset }}
              title={preset}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorPickerInput;
