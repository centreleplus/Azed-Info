import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2, Sparkles } from 'lucide-react';

interface BoutiqueCardEditorProps {
  product: any;
  onChange: (field: string, value: any) => void;
  className?: string;
}

export const BoutiqueCardEditor: React.FC<BoutiqueCardEditorProps> = ({ product, onChange, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Téléversement du fichier image sélectionné (via multipart / multer)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de la taille (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (limite max : 5 Mo).");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setUploadSuccess(false);
    setPreviewError(false);

    try {
      const res = await fetch('/api/admin/boutique/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        onChange('imageUrl', data.imageUrl);
        if (onChange) onChange('image', data.imageUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert(data.message || "Erreur lors du téléchargement.");
      }
    } catch (err) {
      console.error("Erreur upload image:", err);
      alert("Erreur réseau lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const currentImage = product.imageUrl || product.image || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400";

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs ${className}`}>
      {/* Aperçu de l'image actuelle */}
      <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
        {!previewError ? (
          <img 
            src={currentImage} 
            alt={product.title || "Aperçu Produit"} 
            onError={() => setPreviewError(true)}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <ImageIcon size={28} className="mb-1 opacity-50" />
            <span className="text-[11px] font-bold">Image indisponible</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
            <Loader2 size={22} className="animate-spin text-emerald-400" />
            <span>Téléversement en cours...</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md animate-fade-in">
            <Check size={12} />
            <span>Image enregistrée</span>
          </div>
        )}
      </div>

      {/* Zone de téléchargement direct de fichier image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Image du Produit / Pack
          </label>
          <span className="text-[10px] text-slate-400 font-medium">Max 5 Mo (.png, .jpg, .webp)</span>
        </div>

        <div className="flex gap-2">
          <label className="flex-1 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer text-center transition-all flex items-center justify-center gap-2 active:scale-98">
            <Upload size={14} />
            <span>{uploading ? "Téléversement..." : "📁 Choisir / Changer l'image"}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={uploading}
              className="hidden" 
            />
          </label>
        </div>

        {/* Champ URL de secours */}
        <div className="relative">
          <LinkIcon size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={product.imageUrl || product.image || ''}
            onChange={(e) => {
              setPreviewError(false);
              onChange('imageUrl', e.target.value);
              onChange('image', e.target.value);
            }}
            placeholder="Ou collez un lien URL d'image (https://...)"
            className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-700 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default BoutiqueCardEditor;
