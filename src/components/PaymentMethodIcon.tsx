import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Send, Building2 } from 'lucide-react';
import { PaymentMethodVisualConfig, PaymentMethodId } from '../types/paymentMethods';
import { getPaymentMethodConfig, getStoredPaymentMethodsConfig } from '../lib/paymentMethodsStore';

export interface PaymentMethodIconProps {
  methodId?: PaymentMethodId | string;
  config?: Partial<PaymentMethodVisualConfig> | null;
  defaultIcon?: React.ReactNode;
  className?: string;
  fallbackIconSize?: number;
  fallbackIconClassName?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  methodId = 'd17',
  config: explicitConfig,
  defaultIcon,
  className = '',
  fallbackIconSize = 22,
  fallbackIconClassName = ''
}) => {
  const [resolvedConfig, setResolvedConfig] = useState<PaymentMethodVisualConfig>(() => {
    if (explicitConfig && explicitConfig.customIconUrl !== undefined) {
      return {
        id: explicitConfig.id || methodId,
        label: explicitConfig.label || methodId,
        customIconUrl: explicitConfig.customIconUrl || '',
        size: explicitConfig.size || 24,
        borderRadiusClass: explicitConfig.borderRadiusClass || 'rounded-md'
      };
    }
    return getPaymentMethodConfig(methodId);
  });

  useEffect(() => {
    if (explicitConfig && explicitConfig.customIconUrl !== undefined) {
      setResolvedConfig({
        id: explicitConfig.id || methodId,
        label: explicitConfig.label || methodId,
        customIconUrl: explicitConfig.customIconUrl || '',
        size: explicitConfig.size || 24,
        borderRadiusClass: explicitConfig.borderRadiusClass || 'rounded-md'
      });
      return;
    }

    const updateFromStore = () => {
      const stored = getPaymentMethodConfig(methodId);
      setResolvedConfig(stored);
    };

    updateFromStore();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setResolvedConfig(getPaymentMethodConfig(methodId, e.detail));
      } else {
        updateFromStore();
      }
    };

    window.addEventListener('payment_methods_config_updated', handleUpdate);
    window.addEventListener('storage', updateFromStore);
    window.addEventListener('site_settings_updated', updateFromStore);

    return () => {
      window.removeEventListener('payment_methods_config_updated', handleUpdate);
      window.removeEventListener('storage', updateFromStore);
      window.removeEventListener('site_settings_updated', updateFromStore);
    };
  }, [methodId, explicitConfig]);

  // If a custom uploaded/configured icon exists, render it dynamically
  if (resolvedConfig?.customIconUrl) {
    const size = resolvedConfig.size || 24;
    const radiusClass = resolvedConfig.borderRadiusClass || 'rounded-md';

    return (
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`
        }}
        className={`flex items-center justify-center shrink-0 overflow-hidden ${radiusClass} ${className}`}
      >
        <img
          src={resolvedConfig.customIconUrl}
          alt={resolvedConfig.label || String(methodId)}
          className="max-w-full max-h-full object-contain mx-auto my-auto"
        />
      </div>
    );
  }

  // Fallback to explicit defaultIcon if provided
  if (defaultIcon) {
    return (
      <div className={`flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
        {defaultIcon}
      </div>
    );
  }

  // Default fallback Lucide icons per payment method
  const normId = String(methodId).toLowerCase();
  const iconCls = fallbackIconClassName || 'shrink-0';

  let renderedFallback = <CreditCard size={fallbackIconSize} className={iconCls} />;

  if (normId === 'd17') {
    renderedFallback = <CreditCard size={fallbackIconSize} className={iconCls} />;
  } else if (normId === 'rib' || normId === 'virement') {
    renderedFallback = <Landmark size={fallbackIconSize} className={iconCls} />;
  } else if (normId === 'wafacash' || normId === 'mandat') {
    renderedFallback = <Send size={fallbackIconSize} className={iconCls} />;
  } else if (normId === 'cash' || normId === 'direct' || normId.includes('espèce') || normId.includes('espece')) {
    renderedFallback = <Building2 size={fallbackIconSize} className={iconCls} />;
  }

  return (
    <div className={`flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      {renderedFallback}
    </div>
  );
};

export default PaymentMethodIcon;
