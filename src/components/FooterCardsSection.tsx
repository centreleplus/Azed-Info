import React, { useState } from 'react';
import { 
  GraduationCap, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Clock 
} from 'lucide-react';

export const FooterCardsSection: React.FC = () => {
  // Gestion de l'ouverture/fermeture des accordéons
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setOpenCard(openCard === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 text-left">
      {/* Grille des 3 cartes / accordéons du bas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARTE 1 : A-Zed Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleCard('azed')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">A-Zed Info</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
                Découvrir
              </span>
              {openCard === 'azed' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* Contenu de la carte A-Zed Info */}
          {openCard === 'azed' && (
            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p>
                Plateforme éducative d'apprentissage et de révision interactive guidée par M. Nabil Chaouch.
              </p>
            </div>
          )}
        </div>

        {/* CARTE 2 : Contact (REMPLACE INTRO) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleCard('contact')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Icône violette mise à jour pour le Contact */}
              <div className="w-10 h-10 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Contact</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
                Afficher
              </span>
              {openCard === 'contact' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* Contenu dépliable Contact */}
          {openCard === 'contact' && (
            <div className="px-4 pb-4 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold">+216 20 000 000 / +216 71 000 000</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>contact@azedinfo.tn</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Lun - Sam : 08:30 - 19:00</span>
              </div>
            </div>
          )}
        </div>

        {/* CARTE 3 : Localisation (Centre Le Plus) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleCard('location')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Localisation (Centre Le Plus)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
                Voir cartes
              </span>
              {openCard === 'location' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* Contenu dépliable Localisation */}
          {openCard === 'location' && (
            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Centre Le Plus — El Mourouj</p>
              <p>Proche des transports et commodités. Cours en présentiel et séances de devoirs.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FooterCardsSection;
