import React, { useState } from 'react';
import { CreditCard, Sparkles, Sliders, Shield } from 'lucide-react';
import { AdminPaymentMethodsConfig } from './AdminPaymentMethodsConfig';

export const AdminContentConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPaymentMethodsConfig />
    </div>
  );
};

export { AdminPaymentMethodsConfig };
export default AdminContentConfig;
