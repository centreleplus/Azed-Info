import React, { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from "lucide-react";

interface ImagePickerInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  quickTemplates?: { name: string; url: string }[];
  className?: string;
}

export function ImagePickerInput({
  label = "Visuel du produit / Pack",
  value,
  onChange,
  placeholder = "https://images.unsplash.com/photo-...",
  quickTemplates,
  className = ""
}: ImagePickerInputProps) {
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);

  // Automatically adapt initial mode if editing or prefilled with http
  useEffect(() => {
    if (value && value.startsWith("http") && !value.startsWith("data:")) {
      setImageMode("url");
    }
  }, []);

  const handleFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Veuillez sélectionner un fichier image au format JPG, PNG ou WEBP.");
      return;
    }

    // 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (limite : 5 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setImageMode("upload")}
            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              imageMode === "upload"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📁 Importer Fichier
          </button>
          <button
            type="button"
            onClick={() => setImageMode("url")}
            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              imageMode === "url"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔗 Lien URL
          </button>
        </div>
      </div>

      {imageMode === "upload" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/60 scale-[1.01]"
              : "border-slate-200 hover:border-emerald-400 bg-slate-50/50"
          }`}
        >
          {value ? (
            <div className="relative max-w-xs mx-auto aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img src={value} alt="Aperçu produit" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-md hover:bg-emerald-700 cursor-pointer transition">
                  Changer
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg shadow-md hover:bg-rose-700 cursor-pointer transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3 group">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Cliquez ou glissez une image ici</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Formats autorisés : JPG, PNG, WEBP (Max : 5 Mo)</p>
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono transition-all"
          />

          {/* Quick templates if provided */}
          {quickTemplates && quickTemplates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[9px] text-gray-400 font-medium block w-full">Gabarits rapides :</span>
              {quickTemplates.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => onChange(tpl.url)}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    value === tpl.url
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-slate-100 text-slate-650 hover:bg-slate-200 border-slate-200"
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          )}

          {/* Live Preview for URL */}
          {value && value.startsWith("http") && (
            <div className="relative max-w-xs mx-auto aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-xs mt-2">
              <img src={value} alt="Aperçu URL" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
