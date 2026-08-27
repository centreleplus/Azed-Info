import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface PaymentMethodSelectorProps {
  onSelectMethod?: (methodId: string) => void;
  selectedMethod?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  onSelectMethod,
  selectedMethod: controlledSelectedMethod
}) => {
  const [internalSelectedMethod, setInternalSelectedMethod] = useState<string>('direct');
  const selectedMethod = controlledSelectedMethod !== undefined ? controlledSelectedMethod : internalSelectedMethod;

  const handleSelectDirectPayment = () => {
    setInternalSelectedMethod('direct');
    if (onSelectMethod) onSelectMethod('direct');

    // 1. Déclencher l'événement pour ouvrir l'accordéon Localisation dans le Footer
    window.dispatchEvent(new CustomEvent('open-footer-location'));

    // 2. Défiler en douceur vers la section Footer
    setTimeout(() => {
      const footerElement = 
        document.getElementById('footer-location') || 
        document.getElementById('footer-location-accordion') ||
        document.getElementById('footer-sec-locations');

      if (footerElement) {
        footerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 3. Effet visuel d'activation sur le footer
        footerElement.classList.add('ring-4', 'ring-[#00b87c]', 'transition-all', 'duration-500');
        setTimeout(() => {
          footerElement.classList.remove('ring-4', 'ring-[#00b87c]');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Grille des Modes de Paiement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* BOUTON SENSITIF INTERACTIF : PAIEMENT DIRECT */}
        <button
          type="button"
          onClick={handleSelectDirectPayment}
          className={`relative text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer w-full ${
            selectedMethod === 'direct'
              ? 'bg-emerald-50/70 border-[#00b87c] shadow-md ring-2 ring-[#00b87c]/20 scale-[1.01]'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl transition-colors shrink-0 flex items-center justify-center overflow-hidden ${
              selectedMethod === 'direct' ? 'bg-[#00b87c] text-white' : 'bg-emerald-100 text-[#00b87c]'
            }`}>
              <PaymentMethodIcon 
                methodId="direct" 
                fallbackIconSize={20}
                fallbackIconClassName={selectedMethod === 'direct' ? 'text-white' : 'text-[#00b87c]'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black text-slate-800">
                  Paiement Direct
                </h4>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
                  📍 Voir adresse
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Espèces au Centre Le Plus / Al Idhafa
              </p>
            </div>
          </div>

          {/* Badge d'état selectionné */}
          {selectedMethod === 'direct' && (
            <span className="px-2.5 py-1 bg-[#00b87c] text-white text-[10px] font-black rounded-lg shadow-sm flex items-center gap-1 shrink-0 ml-2">
              <CheckCircle className="w-3 h-3" />
              CHOISI
            </span>
          )}
        </button>

      </div>

      {/* BLOC D'INFORMATION DÉROULANT DU PAIEMENT DIRECT */}
      {selectedMethod === 'direct' && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-[#00b87c]" />
              <span>Paiement Direct / Espèces au Centre :</span>
            </div>
            
            {/* Bouton Raccourci vers le Footer */}
            <button
              type="button"
              onClick={handleSelectDirectPayment}
              className="text-[11px] font-extrabold text-[#00b87c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Afficher le plan dans le footer</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-slate-600 space-y-1">
            <p><strong>Adresse :</strong> Centre Le Plus / Al Idhafa</p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Horaires : Lun - Sam (08h00 - 19h00)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
