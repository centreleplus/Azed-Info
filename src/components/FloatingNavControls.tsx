import React, { useState, useEffect } from 'react';
import { ArrowUp, ChevronUp, ChevronsUp, MessageSquare } from 'lucide-react';

interface FloatingNavControlsProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  icon?: 'arrow' | 'chevron' | 'chevrons';
  hideOnMobile?: boolean;
}

export const FloatingNavControls: React.FC<FloatingNavControlsProps> = ({
  position = 'bottom-right',
  icon = 'arrow',
  hideOnMobile = false,
}) => {
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    window.dispatchEvent(new CustomEvent('open-intro-footer'));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-24 right-6';
      case 'top-left':
        return 'top-24 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case 'chevron':
        return <ChevronUp className="w-4 h-4 text-white stroke-[2.5]" />;
      case 'chevrons':
        return <ChevronsUp className="w-4 h-4 text-white stroke-[2.5]" />;
      case 'arrow':
      default:
        return <ArrowUp className="w-4 h-4 text-white stroke-[2.5]" />;
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      {/* BOUTON 1 : Contactez-nous (Bleu A-Zedinfo) */}
      <button
        onClick={scrollToContact}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2B6D] hover:bg-[#121f50] text-white font-extrabold text-xs rounded-full shadow-lg shadow-[#1A2B6D]/30 border border-[#2a4099]/40 hover:scale-105 active:scale-95 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A2B6D]/50"
        title="Contacter le support / l'équipe"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform"/>
        <span className="tracking-wide">Contactez-nous</span>
      </button>

      {/* BOUTON 2 : Retour en haut (Apparaît au scroll) */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className={`p-3 bg-[#1A2B6D] hover:bg-[#121f50] text-white rounded-full shadow-lg shadow-[#1A2B6D]/30 border border-[#2a4099]/40 hover:scale-110 active:scale-95 transition-all cursor-pointer items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#1A2B6D]/50 ${
            hideOnMobile ? 'hidden sm:flex' : 'flex'
          }`}
          title="Retour en haut de page"
          aria-label="Retour en haut de page"
        >
          {renderIcon()}
        </button>
      )}
    </div>
  );
};
