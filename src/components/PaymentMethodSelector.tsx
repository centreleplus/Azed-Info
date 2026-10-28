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
  const [activeMapCenter, setActiveMapCenter] = useState<'mourouj' | 'morneg'>('mourouj');
  const selectedMethod = controlledSelectedMethod !== undefined ? controlledSelectedMethod : internalSelectedMethod;

  const handleSelectMethod = (methodId: string) => {
    setInternalSelectedMethod(methodId);
    if (onSelectMethod) onSelectMethod(methodId);

    // Si l'option Paiement direct Mourouj - Morneg est cochée, ouvrir automatiquement la section Localisation
    if (methodId === 'cash_mourouj' || methodId.includes('mourouj') || methodId === 'direct' || methodId === 'cash') {
      const footerLocationSection = document.getElementById('footer-location-section') || document.getElementById('footer-location');
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

  const getMethodSubtitle = (method: PaymentMethodConfig) => {
    if (method.id === 'd17') return settings.payments.d17.notes || method.subtitle;
    if (method.id === 'rib') {
      const intitule = settings.payments.rib?.intitule || settings.payments.rib?.bankName || 'Banque BIAT';
      const ribNum = settings.payments.rib?.numeroRib || settings.payments.rib?.ribNumber || '08 043 0001928372615 42';
      return `${intitule} : ${ribNum}`;
    }
    if (method.id === 'cash_mornag') {
      const intitule = settings.payments.cash_mornag?.intitule || settings.payments.cash_mornag?.location || 'La Poste Tunisienne';
      const ribNum = settings.payments.cash_mornag?.numeroRib || settings.payments.cash_mornag?.ribNumber || '17 000 0000000000000 00';
      return `${intitule} : ${ribNum}`;
    }
    if (method.id === 'cash_mourouj') {
      const adr1 = settings.payments.cash_mourouj?.adresse1 || settings.payments.cash_mourouj?.address || '2 rue de Tunis, El Mourouj';
      const adr2 = settings.payments.cash_mourouj?.adresse2 || 'Morneg Centre';
      const tel1 = settings.payments.cash_mourouj?.numTel1 || settings.payments.cash_mourouj?.phone || '20 881 122';
      const tel2 = settings.payments.cash_mourouj?.numTel2 || '98 538 398';
      return `${adr1} (${tel1}) • ${adr2} (${tel2})`;
    }
    return method.subtitle;
  };

  const adresse1 = settings.payments.cash_mourouj?.adresse1 || settings.payments.cash_mourouj?.address || '2 rue de Tunis, El Mourouj';
  const adresse2 = settings.payments.cash_mourouj?.adresse2 || 'Morneg Centre';
  const numTel1 = settings.payments.cash_mourouj?.numTel1 || settings.payments.cash_mourouj?.phone || '20 881 122';
  const numTel2 = settings.payments.cash_mourouj?.numTel2 || '98 538 398';

  return (
    <div className="space-y-4 select-none">
      {/* Grille des 4 Modes de Règlement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id || 
            (method.id === 'cash_mourouj' && (selectedMethod === 'cash' || selectedMethod === 'direct')) ||
            (method.id === 'cash_mornag' && selectedMethod === 'wafacash');
          const isDirectCash = method.id === 'cash_mourouj';
          const subtitle = getMethodSubtitle(method);

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
                        📍 Localisation
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {subtitle}
                  </p>
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

      {/* Carte de localisation interactive quand Paiement direct Mourouj - Morneg est sélectionné */}
      {(selectedMethod === 'cash_mourouj' || selectedMethod === 'direct' || selectedMethod === 'cash') && (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-[#00b87c]" />
              <span>Carte de Localisation — Paiement direct Mourouj - Morneg</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMapCenter('mourouj')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                  activeMapCenter === 'mourouj'
                    ? 'bg-[#00b87c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                📍 Adresse 1 (Mourouj)
              </button>
              <button
                type="button"
                onClick={() => setActiveMapCenter('morneg')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                  activeMapCenter === 'morneg'
                    ? 'bg-[#00b87c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                📍 Adresse 2 (Morneg)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
              <p className="font-bold text-slate-800">Adresse 1 : {adresse1}</p>
              <p className="text-slate-600 font-mono font-bold text-teal-700">Tél 1 : {numTel1}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
              <p className="font-bold text-slate-800">Adresse 2 : {adresse2}</p>
              <p className="text-slate-600 font-mono font-bold text-teal-700">Tél 2 : {numTel2}</p>
            </div>
          </div>

          <div className="w-full h-48 rounded-xl overflow-hidden border border-emerald-200 bg-slate-100">
            <iframe
              title="Localisation Centre Mourouj - Morneg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMapCenter === 'mourouj' ? adresse1 : adresse2)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
