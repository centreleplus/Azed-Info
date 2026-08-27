import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';

export const FloatingNavControls: React.FC = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Détecter le défilement pour afficher/masquer le bouton "Retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    window.dispatchEvent(new CustomEvent('open-intro-footer'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* BOUTON 1 : Contactez-nous (Bleu A-Zed Info) */}
      <button
        onClick={scrollToContact}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2B6D] hover:bg-[#121f50] text-white font-extrabold text-xs rounded-full shadow-lg shadow-[#1A2B6D]/30 border border-[#2a4099]/40 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
        title="Contacter le support / l'équipe"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform"/>
        <span className="tracking-wide">Contactez-nous</span>
      </button>

      {/* BOUTON 2 : Retour en haut (Apparaît au scroll) */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Retour en haut de page"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]"/>
        </button>
      )}
    </div>
  );
};
