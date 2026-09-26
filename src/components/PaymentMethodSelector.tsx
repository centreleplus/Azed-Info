import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle, ExternalLink, ChevronDown, Phone, Smartphone, Landmark } from 'lucide-react';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { PAYMENT_METHODS, PaymentMethodConfig } from '../config/paymentMethods';
import { useSettings } from './SettingsContext';

interface PaymentMethodSelectorProps {
  onSelectMethod?: (methodId: string) => void;
  selectedMethod?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  onSelectMethod,
  selectedMethod: controlledSelectedMethod
}) => {
  const { settings } = useSettings();
  const [internalSelectedMethod, setInternalSelectedMethod] = useState<string>('d17');
  const selectedMethod = controlledSelectedMethod !== undefined ? controlledSelectedMethod : internalSelectedMethod;

  const handleSelectMethod = (methodId: string) => {
    setInternalSelectedMethod(methodId);
    if (onSelectMethod) onSelectMethod(methodId);

    // Si l'une des options de paiement direct est cochée, ouvrir la section Localisation du Footer
    if (methodId === 'cash_mornag' || methodId === 'cash_mourouj' || methodId.includes('mornag') || methodId.includes('mourouj') || methodId === 'direct' || methodId === 'cash') {
      const footerLocationSection = document.getElementById('footer-location-section') || document.getElementById('footer-location');
      // Déclencher l'événement d'ouverture ou l'état global
      window.dispatchEvent(new CustomEvent('open-footer-location'));
      if (footerLocationSection) {
        setTimeout(() => {
          footerLocationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          footerLocationSection.classList.add('ring-4', 'ring-[#00b87c]', 'transition-all', 'duration-500');
          setTimeout(() => {
            footerLocationSection.classList.remove('ring-4', 'ring-[#00b87c]');
          }, 2000);
        }, 80);
      }
    }
  };

  const getMethodPhone = (method: PaymentMethodConfig) => {
    if (method.id === 'd17') return settings.payments.d17.phone || method.phone;
    if (method.id === 'cash_mornag') return settings.payments.cash_mornag.phone || method.phone;
    if (method.id === 'cash_mourouj') return settings.payments.cash_mourouj.phone || method.phone;
    return method.phone;
  };

  const getMethodSubtitle = (method: PaymentMethodConfig) => {
    if (method.id === 'd17') return settings.payments.d17.notes || method.subtitle;
    if (method.id === 'rib') return `Banque ${settings.payments.rib.bankName} : ${settings.payments.rib.ribNumber}`;
    if (method.id === 'cash_mornag') return `${settings.payments.cash_mornag.address || 'Morneg Centre'} | Tél : ${getMethodPhone(method)}`;
    if (method.id === 'cash_mourouj') return `${settings.payments.cash_mourouj.address || '2 rue de Tunis, El Mourouj'} | Tél : ${getMethodPhone(method)}`;
    return method.subtitle;
  };

  const getMethodMapUrl = (method: PaymentMethodConfig) => {
    if (method.id === 'cash_mornag') return settings.payments.cash_mornag.mapUrl || method.mapUrl;
    if (method.id === 'cash_mourouj') return settings.payments.cash_mourouj.mapUrl || method.mapUrl;
    return method.mapUrl;
  };

  return (
    <div className="space-y-4 select-none">
      {/* Grille des 4 Modes de Règlement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id || 
            (method.id === 'cash_mourouj' && (selectedMethod === 'cash' || selectedMethod === 'direct')) ||
            (method.id === 'cash_mornag' && selectedMethod === 'wafacash');
          const isDirectCash = method.id === 'cash_mornag' || method.id === 'cash_mourouj';
          const phone = getMethodPhone(method);
          const subtitle = getMethodSubtitle(method);
          const mapUrl = getMethodMapUrl(method);

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelectMethod(method.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 flex items-start justify-between cursor-pointer w-full ${
                isSelected
                  ? 'bg-emerald-50/70 border-[#00b87c] shadow-md ring-2 ring-[#00b87c]/20 scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`w-11 h-11 rounded-xl transition-colors shrink-0 flex items-center justify-center overflow-hidden ${
                  isSelected ? 'bg-[#00b87c] text-white' : 'bg-slate-100 text-[#0F1E36]'
                }`}>
                  <PaymentMethodIcon 
                    methodId={method.id} 
                    fallbackIconSize={20}
                    fallbackIconClassName={isSelected ? 'text-white' : 'text-[#0F1E36]'}
                  />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {method.title}
                    </h4>
                    {isDirectCash && (
                      <span className="text-[9px] text-teal-700 font-extrabold bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded-full">
                        📍 Centre
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {subtitle}
                  </p>

                  {isDirectCash && mapUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900 bg-teal-100/60 hover:bg-teal-100 px-2 py-0.5 rounded-md font-bold transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Ouvrir itinéraire maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Choisi */}
              {isSelected && (
                <span className="px-2 py-0.5 bg-[#00b87c] text-white text-[9px] font-black rounded-md shadow-xs flex items-center gap-0.5 shrink-0">
                  <CheckCircle className="w-3 h-3" />
                  CHOISI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bloc explicatif quand une option directe Mornag/Mourouj est sélectionnée */}
      {(selectedMethod === 'cash_mornag' || selectedMethod === 'cash_mourouj' || selectedMethod === 'direct' || selectedMethod === 'cash') && (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-[#00b87c]" />
              <span>
                {selectedMethod === 'cash_mornag' 
                  ? "Paiement direct en espèces à Mornag (Morneg Centre)" 
                  : "Paiement direct en espèces à Mourouj (2 rue de Tunis)"}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => handleSelectMethod(selectedMethod)}
              className="text-[11px] font-extrabold text-[#00b87c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Afficher le plan dans le footer</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-slate-600 space-y-1">
            <p>
              <strong>Contact & Horaires :</strong> Tél : {selectedMethod === 'cash_mornag' ? '98 538 398' : '20 881 122'} | Lun - Sam (08h00 - 19h00)
            </p>
            <p className="text-slate-500 text-[11px]">
              Présentez simplement votre numéro de commande ou reçu au guichet pour activation immédiate de vos accès.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
