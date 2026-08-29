import React from "react";
import { X, ExternalLink, Check, Ban, Download } from "lucide-react";
import { PaymentReceipt } from "../../types";

interface DocumentViewerModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
  onApprove?: (receiptId: string) => void;
  onReject?: (receiptId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  receipt,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <h3 className="text-base font-extrabold">Reçu de Paiement - {receipt.userName}</h3>
              <p className="text-xs text-slate-400">Paiement par {receipt.paymentMethod} • {receipt.amount} TND</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Élève :</span>
              <p className="font-extrabold text-slate-800 mt-0.5">{receipt.userName}</p>
              <p className="text-slate-500">{receipt.userEmail}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Niveau :</span>
              <p className="font-extrabold text-slate-800 mt-0.5">{receipt.grade}</p>
              <p className="text-slate-500">Date : {new Date(receipt.uploadedAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {/* Receipt Preview Frame / Image */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[500px]">
            {receipt.receiptUrl ? (
              <img
                src={receipt.receiptUrl}
                alt="Reçu de paiement"
                className="max-h-[480px] w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-2">
                <p className="text-sm font-semibold">Aucun fichier image disponible</p>
                <p className="text-xs">Preuve enregistrée manuellement par administration</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {receipt.receiptUrl && (
            <a
              href={receipt.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Ouvrir l'original
            </a>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onReject && receipt.status === "pending" && (
              <button
                onClick={() => {
                  onReject(receipt.id);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban size={14} />
                Rejeter Le Reçu
              </button>
            )}

            {onApprove && receipt.status === "pending" && (
              <button
                onClick={() => {
                  onApprove(receipt.id);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Check size={14} />
                Valider & Activer
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
