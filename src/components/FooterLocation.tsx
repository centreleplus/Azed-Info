import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, ExternalLink, Clock, Phone } from 'lucide-react';

export const FooterLocation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenFooter = () => {
      setIsOpen(true); // Ouvre automatiquement le menu de localisation
      setTimeout(() => {
        const el = document.getElementById('footer-location-section') || document.getElementById('footer-location');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#00b87c]', 'transition-all', 'duration-500');
          setTimeout(() => el.classList.remove('ring-4', 'ring-[#00b87c]'), 2000);
        }
      }, 100);
    };

    window.addEventListener('open-footer-location', handleOpenFooter);
    return () => window.removeEventListener('open-footer-location', handleOpenFooter);
  }, []);

  return (
    <div
      id="footer-location-section"
      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00b87c]" />
          <span>Localisation (Centre Le Plus)</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-3 animate-fadeIn">
          {/* Mourouj */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Centre Le Plus — El Mourouj
              </span>
              <a
                href="https://maps.google.com/?q=El+Mourouj"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:underline font-bold"
              >
                <span>Itinéraire Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-600">
              <strong>Adresse :</strong> 2 rue de Tunis, El Mourouj | <strong>Tél :</strong> 20 881 122
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Horaires : Lun - Sam (08h00 - 19h00)</span>
            </p>
          </div>

          {/* Mornag */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Centre Le Plus — Morneg Centre
              </span>
              <a
                href="https://maps.google.com/?q=Morneg+Centre"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:underline font-bold"
              >
                <span>Itinéraire Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-600">
              <strong>Adresse :</strong> Morneg Centre | <strong>Tél :</strong> 98 538 398
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Horaires : Lun - Sam (08h00 - 19h00)</span>
            </p>
          </div>

          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-medium border border-emerald-100">
            💡 <strong>Paiement Direct :</strong> Présentez votre identifiant d'inscription au guichet pour l'activation immédiate de votre compte ou forfait.
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterLocation;
