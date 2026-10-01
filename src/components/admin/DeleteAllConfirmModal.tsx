import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface DeleteAllConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemCount: number;
  itemTypeLabel: string; // e.g., "documents", "quiz"
  onClose: () => void;
  onConfirm: () => Promise<void>;
  confirmWord?: string;
}

export const DeleteAllConfirmModal: React.FC<DeleteAllConfirmModalProps> = ({
  isOpen,
  title,
  itemCount,
  itemTypeLabel,
  onClose,
  onConfirm,
  confirmWord = "SUPPRIMER"
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
      setIsDeleting(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteDelete = async () => {
    if (confirmInput.trim() !== confirmWord || isDeleting) return;

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la suppression.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-100 text-left animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3.5 text-red-600 mb-4">
          <div className="p-3 bg-red-100 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.25]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">Action irréversible !</h3>
            <p className="text-xs text-red-600 font-bold mt-0.5">Attention, cette action est définitive.</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
          Êtes-vous absolument sûr de vouloir supprimer <strong>TOUS les {itemTypeLabel}</strong> ({itemCount} {itemTypeLabel}) ? Cette action effacera définitivement l'ensemble des enregistrements de la base de données.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <div className="mb-5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">
            Pour confirmer, tapez <span className="font-extrabold text-red-600 tracking-wider select-none">{confirmWord}</span> ci-dessous :
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={confirmWord}
            autoFocus
            disabled={isDeleting}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-red-950 placeholder:text-gray-300 uppercase"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={confirmInput.trim() !== confirmWord || isDeleting}
            onClick={handleExecuteDelete}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all ${
              confirmInput.trim() === confirmWord && !isDeleting
                ? 'bg-red-600 hover:bg-red-700 shadow-md cursor-pointer active:scale-95'
                : 'bg-red-300 cursor-not-allowed opacity-70'
            }`}
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Suppression en cours...' : `Confirmer la suppression totale (${itemCount})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllConfirmModal;
