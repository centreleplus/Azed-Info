import React, { useEffect, useState } from 'react';
import { PacksService, PackOffer, INITIAL_PACKS_DATA } from './PacksService';
import { PackCard } from './PackCard';

export interface SignUpPacksPageProps {
  onSelectPack?: (pack: PackOffer) => void;
}

export const SignUpPacksPage: React.FC<SignUpPacksPageProps> = ({ onSelectPack }) => {
  const [packs, setPacks] = useState<PackOffer[]>(INITIAL_PACKS_DATA);

  useEffect(() => {
    PacksService.getPublishedPacks().then(data => {
      if (data && data.length > 0) setPacks(data);
    });

    const handlePublished = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPacks(e.detail);
      }
    };
    window.addEventListener('packs-published', handlePublished);
    return () => window.removeEventListener('packs-published', handlePublished);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {packs.filter(p => p.isPublished).map(pack => (
        <PackCard 
          key={pack.id} 
          pack={pack} 
          onSelect={() => onSelectPack && onSelectPack(pack)} 
        />
      ))}
    </div>
  );
};

export const SignUpPacks = SignUpPacksPage;
export default SignUpPacksPage;
