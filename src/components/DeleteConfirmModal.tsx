import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  studentName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  studentName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-2xl space-y-5">
        
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5"/>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-800 mb-1">
            Supprimer définitivement l'élève ?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer la fiche de <span className="font-bold text-slate-800">{studentName}</span> ? Cette action est <strong className="text-red-600">irréversible</strong> et effacera toutes ses données en base de données.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                <span>Suppression en cours...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5"/>
                <span>Confirmer la suppression</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;
