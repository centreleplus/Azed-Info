import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SubscriptionContextType {
  validateStudentAccount: (
    requestId: string,
    studentId: string,
    planType: 'FREEMIUM' | 'PREMIUM' | string,
    amount: number,
    agentId?: string,
    agentRate?: number
  ) => Promise<{ success: boolean; message?: string }>;
  updateStudentStatus: (studentId: string, updates: any) => Promise<any>;
  registerAgentCommission: (commissionData: any) => Promise<any>;
  removePendingRequest: (requestId: string) => Promise<any>;
}

export const updateStudentStatus = async (studentId: string, updates: {
  status?: string;
  plan?: string;
  accountType?: string;
  verified?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  [key: string]: any;
}) => {
  const isFreemium = String(updates.plan || updates.accountType).toUpperCase() === 'FREEMIUM';
  const res = await fetch('/api/admin/users/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: studentId,
      status: updates.status?.toLowerCase() || 'active',
      verified: updates.verified !== undefined ? updates.verified : true,
      accountType: isFreemium ? 'freemium' : 'premium',
      subscriptionType: isFreemium ? 'freemium' : 'trimestriel',
      validatedBy: updates.validatedBy,
      validatedAt: updates.validatedAt || new Date().toISOString()
    })
  });
  return res.ok ? await res.json() : null;
};

export const registerAgentCommission = async (commissionData: {
  agentId: string;
  studentId?: string;
  receiptId?: string;
  planType: string;
  amountVersed: number;
  rateApplied: string;
  commission: number;
  type: string;
  status: string;
  date: string;
}) => {
  const res = await fetch('/api/commissions/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commissionData)
  });
  return res.ok ? await res.json() : null;
};

export const removePendingRequest = async (requestId: string) => {
  // If it's a receipt id or order id, notify server
  try {
    await fetch(`/api/admin/receipts/${requestId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Ignore silent fallback
  }
};

export const validateStudentAccount = async (
  requestId: string,
  studentId: string,
  planType: 'FREEMIUM' | 'PREMIUM' | string,
  amount: number,
  agentId?: string,
  agentRate: number = 0.10 // Exemple: 10%
): Promise<{ success: boolean; message?: string }> => {
  const isFreemium = String(planType).toUpperCase() === 'FREEMIUM' || amount === 0;

  // 1. Activation immédiate du compte de l'élève
  await updateStudentStatus(studentId, {
    status: 'ACTIVE',
    plan: isFreemium ? 'FREEMIUM' : 'PREMIUM',
    accountType: isFreemium ? 'freemium' : 'premium',
    verified: true,
    validatedBy: agentId || 'ADMIN',
    validatedAt: new Date().toISOString(),
  });

  // 2. Gestion de la commission agent si l'action est réalisée par un agent
  if (agentId) {
    // Si Freemium -> Commission = 0 DT, Sinon -> Calcul selon le montant versé
    const commissionGained = isFreemium ? 0 : amount * agentRate;

    await registerAgentCommission({
      agentId,
      studentId,
      receiptId: requestId,
      planType: isFreemium ? 'FREEMIUM' : 'PREMIUM',
      amountVersed: isFreemium ? 0 : amount,
      rateApplied: isFreemium ? '0%' : `${agentRate * 100}%`,
      commission: commissionGained, // Strictement 0 DT pour Freemium
      type: 'VALIDATION',
      status: 'GAINED',
      date: new Date().toISOString(),
    });
  }

  // 3. Retirer la demande de la liste des attentes / marquer le reçu approuvé
  if (requestId) {
    try {
      await fetch('/api/admin/receipts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: requestId,
          agentId: agentId || 'usr_admin',
          studentId: studentId,
          planType: isFreemium ? 'FREEMIUM' : 'PREMIUM',
          amount: isFreemium ? 0 : amount
        })
      });
    } catch (e) {
      await removePendingRequest(requestId);
    }
  }

  return { success: true, message: "Compte activé avec succès !" };
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  validateStudentAccount,
  updateStudentStatus,
  registerAgentCommission,
  removePendingRequest,
});

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SubscriptionContext.Provider
      value={{
        validateStudentAccount,
        updateStudentStatus,
        registerAgentCommission,
        removePendingRequest,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);

export default SubscriptionContext;
