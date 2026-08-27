import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, ExternalLink, Clock } from 'lucide-react';

export const FooterLocation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenFooter = () => {
      setIsOpen(true); // Ouvre automatiquement le menu de localisation
    };

    window.addEventListener('open-footer-location', handleOpenFooter);
    return () => window.removeEventListener('open-footer-location', handleOpenFooter);
  }, []);

  return (
    <div
      id="footer-location"
      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00b87c]" />
          <span>Localisation du Centre (Centre Le Plus)</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
          <p><strong>Adresse complète :</strong> Centre Le Plus / Al Idhafa, Borj Cédria / El Mourouj</p>
          <p className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>Horaires d'ouverture :</strong> Lundi au Samedi, 08h00 - 19h00</span>
          </p>
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-medium border border-emerald-100">
            💡 Présentez votre identifiant d'inscription au guichet pour l'activation immédiate de votre compte ou forfait.
          </div>
          <div className="pt-1">
            <a
              href="https://maps.app.goo.gl/HDzt85ZEMJTUVEGH6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-teal-600 hover:underline font-bold"
            >
              <span>Ouvrir dans Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterLocation;
