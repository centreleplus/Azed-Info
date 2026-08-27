import React from 'react';
import { useAuth } from './AuthContext';
import { canValidateSubscriptions } from '../utils/permissions';
import { CheckCircle } from 'lucide-react';

export interface PendingValidationRequest {
  id: string;
  studentId: string;
  studentName: string;
  planType: 'FREEMIUM' | 'PREMIUM' | string;
  amount: number;
  [key: string]: any;
}

export interface ValidationPendingListProps {
  pendingRequests?: PendingValidationRequest[];
  onValidate: (requestId: string, studentId: string, planType: 'FREEMIUM' | 'PREMIUM' | string, amount: number) => void;
}

export const ValidationPendingList: React.FC<ValidationPendingListProps> = ({
  pendingRequests = [],
  onValidate,
}) => {
  const { user } = useAuth();
  const hasValidationAccess = canValidateSubscriptions(user?.role);

  if (!hasValidationAccess) {
    return <p className="text-xs text-slate-400">Vous n'avez pas les droits requis pour valider les comptes.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-800">Demandes de validation (Freemium & Premium)</h3>
      
      <div className="space-y-3">
        {pendingRequests.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs text-slate-400">
            Aucune demande de validation en attente.
          </div>
        ) : (
          pendingRequests.map((req) => {
            const isFreemium = String(req.planType).toUpperCase() === 'FREEMIUM' || req.amount === 0;
            return (
              <div key={req.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="font-bold text-xs text-slate-800">{req.studentName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      isFreemium ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.planType || (isFreemium ? 'FREEMIUM' : 'PREMIUM')}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{req.amount || 0} DT</span>
                    {isFreemium && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Comm. 0 DT
                      </span>
                    )}
                  </div>
                </div>

                {/* Validation directe par l'Agent */}
                <button
                  onClick={() => onValidate(req.id, req.studentId, req.planType, req.amount)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <CheckCircle className="w-3.5 h-3.5"/>
                  <span>Valider l'inscription</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ValidationPendingList;
