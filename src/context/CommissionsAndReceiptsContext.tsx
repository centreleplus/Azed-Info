import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Receipt {
  id: string;
  studentName: string;
  amount: number;
  agentId?: string;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED_BY_AGENT' | 'APPROVED' | 'REJECTED' | 'REJECTED_BY_ADMIN' | string;
  studentEmail?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  uploadedAt?: string;
  [key: string]: any;
}

export interface AgentCommission {
  agentId: string;
  totalCommissions: number;
}

export interface AgentCommissionTransaction {
  id: string;
  agentId: string;
  description: string;
  date: string;
  amount: number;
  type: 'COMMISSION' | 'DEDUCTION';
  studentName?: string;
  receiptId?: string;
  status?: string;
}

interface CommissionsAndReceiptsContextType {
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  agentCommissions: Record<string, number>;
  setAgentCommissions: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleAdminOverrideReject: (
    receiptId: string,
    reason?: string
  ) => Promise<void>;
  addAgentNotification: (agentId: string, notification: any) => void;
}

const CommissionsAndReceiptsContext = createContext<CommissionsAndReceiptsContextType | undefined>(undefined);

export const handleAdminOverrideReject = (
  receiptId: string,
  receipts: Receipt[],
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>,
  setAgentCommissions: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  addAgentNotification: (agentId: string, notification: any) => void,
  reason: string = "Non conforme"
) => {
  const targetReceipt = receipts.find((r) => r.id === receiptId);

  if (!targetReceipt) return;

  // 1. Mettre à jour le statut du reçu/commande
  setReceipts((prev) =>
    prev.map((item) =>
      item.id === receiptId ? { ...item, status: 'REJECTED_BY_ADMIN', rejectionReason: reason } : item
    )
  );

  // 2. Si la commande avait été validée par un agent, RETRANCHER la commission
  if (targetReceipt.agentId && targetReceipt.commissionAmount > 0) {
    const agentId = targetReceipt.agentId;
    const commissionToDeduct = targetReceipt.commissionAmount;

    setAgentCommissions((prev) => ({
      ...prev,
      [agentId]: Math.max(0, (prev[agentId] || 0) - commissionToDeduct),
    }));

    // 3. Notifier l'AGENT dans son espace notification interne (sans toast flottant)
    addAgentNotification(agentId, {
      id: Date.now().toString(),
      type: 'COMMISSION_DEDUCTED',
      title: '⚠️ Commission Annulée',
      message: `La commande #${receiptId} de ${targetReceipt.studentName} (${targetReceipt.amount} DT) a été rejetée par l'administration. La commission de ${commissionToDeduct} DT a été retranchée de votre solde.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
};

export const CommissionsAndReceiptsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [agentCommissions, setAgentCommissions] = useState<Record<string, number>>({});

  const addAgentNotification = (agentId: string, notification: any) => {
    // Dispatch interne pour rafraîchir les notifications sans popup flottant
    window.dispatchEvent(
      new CustomEvent('internal-agent-notification', {
        detail: { agentId, notification },
      })
    );
  };

  const handleOverrideReject = async (receiptId: string, reason: string = "Non conforme") => {
    handleAdminOverrideReject(
      receiptId,
      receipts,
      setReceipts,
      setAgentCommissions,
      addAgentNotification,
      reason
    );

    try {
      await fetch('/api/admin/receipts/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId, rejection_reason: reason }),
      });
    } catch (err) {
      console.error("Erreur lors du surpassement par l'administrateur :", err);
    }
  };

  return (
    <CommissionsAndReceiptsContext.Provider
      value={{
        receipts,
        setReceipts,
        agentCommissions,
        setAgentCommissions,
        handleAdminOverrideReject: handleOverrideReject,
        addAgentNotification,
      }}
    >
      {children}
    </CommissionsAndReceiptsContext.Provider>
  );
};

export const useCommissionsAndReceipts = () => {
  const context = useContext(CommissionsAndReceiptsContext);
  if (!context) {
    return {
      receipts: [],
      setReceipts: () => {},
      agentCommissions: {},
      setAgentCommissions: () => {},
      handleAdminOverrideReject: async () => {},
      addAgentNotification: () => {},
    };
  }
  return context;
};

export default CommissionsAndReceiptsContext;
