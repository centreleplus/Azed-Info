import React from 'react';

interface PaymentNotificationProps {
  status?: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'SUSPENDED_ADMIN' | 'REJECTED' | string;
  productName?: string;
  title?: string;
  message?: string;
  onClose?: () => void;
  onViewOrders?: () => void;
}

export const StudentPaymentStatusToast: React.FC<PaymentNotificationProps> = () => {
  // Masquer définitivement toutes les notifications toast flottantes
  return null;
};

export const ToastContainer: React.FC = () => {
  return null;
};

export default StudentPaymentStatusToast;
