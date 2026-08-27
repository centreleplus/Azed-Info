import React, { useState, useEffect } from 'react';
import { CampaignPack, getStoredCampaigns } from './campaignsStore';
import { SignUpStep3Card } from './SignUpStep3Card';
import { CircleBackButton } from './CircleBackButton';
import { calculateDiscountedAmount, isEligibleFor20Discount } from '../utils/pricingDiscount';

export const SignUpStep3Grid = ({ 
  onSelectPack, 
  onBack,
  grade = '',
  section = ''
}: { 
  onSelectPack: (p: CampaignPack) => void; 
  onBack: () => void;
  grade?: string;
  section?: string;
}) => {
  const [packs, setPacks] = useState<CampaignPack[]>([]);

  useEffect(() => {
    // Récupère les données synchronisées de l'Admin
    const loadedPacks = getStoredCampaigns();
    setPacks(loadedPacks.filter(p => !p.isHidden));

    // Écoute les mises à jour en direct depuis l'admin
    const handleUpdate = (e: any) => {
      const updatedPacks: CampaignPack[] = e.detail || getStoredCampaigns();
      setPacks(updatedPacks.filter(p => !p.isHidden));
    };

    window.addEventListener('campaign-packs-updated', handleUpdate);
    return () => window.removeEventListener('campaign-packs-updated', handleUpdate);
  }, []);

  const isEligible = isEligibleFor20Discount(grade, section);

  const displayPacks = packs.map(pack => {
    const rawPrice = pack.finalPrice !== undefined && pack.finalPrice > 0 
      ? Number(pack.finalPrice) 
      : (pack.price !== undefined ? Number(pack.price) : 0);

    if (isEligible && rawPrice > 0) {
      const discountedNet = calculateDiscountedAmount(rawPrice, grade, section);
      const originalPrice = pack.originalPrice && Number(pack.originalPrice) > rawPrice
        ? Number(pack.originalPrice)
        : rawPrice;

      return {
        ...pack,
        price: discountedNet,
        finalPrice: discountedNet,
        originalPrice: originalPrice
      };
    }
    return pack;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
            Étape 3 sur 3
          </span>
          <h2 className="text-2xl font-black text-slate-800">Choisissez votre formule d'abonnement</h2>
          <p className="text-xs text-slate-400">Sélectionnez le niveau d'accompagnement adapté pour l'année 2026 / 2027.</p>
        </div>
        <CircleBackButton onClick={onBack} label="Retour" />
      </div>

      {/* Grille Synchronisée 2x2 avec Cartes Agrandies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {displayPacks.map((pack) => (
          <SignUpStep3Card 
            key={pack.id} 
            pack={pack} 
            onSelect={() => onSelectPack(pack)} 
          />
        ))}
      </div>

      <div className="pt-4 flex justify-center">
        <CircleBackButton 
          onClick={onBack} 
          label="Revenir au choix Freemium / Premium" 
        />
      </div>
    </div>
  );
};

export default SignUpStep3Grid;

