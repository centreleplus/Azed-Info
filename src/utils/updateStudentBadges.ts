import { OfferPack } from '../types/offers';

export const updateExistingStudentsBadges = async (studentsList: any[], activePacks: (OfferPack | any)[]) => {
  return studentsList.map(student => {
    // Association automatique avec l'offre active par ID, catégorie ou type de souscription
    const matchingPack = activePacks.find(p => p.id === (student.packId || student.pack_id))
      || activePacks.find(p => p.category === (student.subscriptionCategory || student.category || student.packCategory))
      || activePacks.find(p => {
        if (student.accountType === 'freemium') return p.category === 'FREEMIUM' || p.category === 'Freemium';
        if (student.accountType === 'premium') return p.category === 'PREMIUM' || p.category === 'Premium';
        return false;
      })
      || activePacks.find(p => p.category === 'FREEMIUM' || p.category === 'Freemium');

    return {
      ...student,
      badgeLabel: matchingPack ? (matchingPack.badgeLabel || matchingPack.badge) : (student.badgeLabel || student.subscriptionCategory || 'Option Gratuit'),
      packCategory: matchingPack ? matchingPack.category : (student.accountType === 'premium' ? 'Premium' : 'Freemium'),
      badgeType: matchingPack ? (matchingPack.badgeType || matchingPack.badge_type) : student.badgeType,
      updatedAt: new Date().toISOString()
    };
  });
};

export default updateExistingStudentsBadges;
