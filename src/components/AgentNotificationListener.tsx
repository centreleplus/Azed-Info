import React from "react";

export interface StudentPaymentDetail {
  title: string;
  message: string;
  data: {
    studentName?: string;
    studentId?: string;
    amount?: number;
    method?: string;
    timestamp?: string;
    receiptId?: string;
    [key: string]: any;
  };
}

export const AgentNotificationListener: React.FC = () => {
  // Masquer définitivement toutes les notifications toast flottantes
  return null;
};

export default AgentNotificationListener;
