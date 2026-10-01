import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/safeStorage';
import { INITIAL_PACKS_DATA, PackOffer } from '../services/PacksService';

export interface CampaignPack {
  id: string;
  category: string;
  packCategory?: string;
  badgeLabel: string;
  badgeStyle?: 'green' | 'purple' | 'amber' | 'blue';
  title: string;
  description: string;
  originalPrice: number;
  finalPrice: number;
  period: string;
  isPopular?: boolean;
  isHidden?: boolean;
  autoAccessAllResources?: boolean;
  iconUrl?: string; // Logo / Icône d'offre personnalisé
  features: string[];
  bgColor?: string;
  borderColor?: string;
  buttonColor?: string;
}

export const INITIAL_CAMPAIGNS: CampaignPack[] = [
  {
    id: 'pack-essentiel',
    category: 'Essentiel',
    badgeLabel: 'ESSENTIEL',
    badgeStyle: 'blue',
    title: 'Pack Essentiel',
    description: "l'accompagnement idéal pour maîtriser son programme d'études ! Profitez de ressources ciblées entièrement corrigées.",
    originalPrice: 240,
    finalPrice: 120,
    period: 'Annuel',
    autoAccessAllResources: true,
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Série d\'exercices 100% corrigés',
      'Fiches de cours synthétiques',
      'Ensemble de quiz 100% corrigé avec évaluation',
      'Devoirs 100% corrigés'
    ]
  },
  {
    id: 'pack-premium',
    category: 'Premium',
    badgeLabel: 'PREMIUM',
    badgeStyle: 'green',
    title: 'Pack Premium',
    description: "Une solution sur mesure pensée pour vous aider à maîtriser l'intégralité de votre programme d'études grâce à :",
    originalPrice: 300,
    finalPrice: 150,
    period: 'Annuel',
    isPopular: true,
    autoAccessAllResources: false,
    bgColor: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Des cours interactifs en direct',
      'Le replay de toutes les séances disponible en illimité',
      'Un espace d\'échange entre professeurs et élèves'
    ]
  },
  {
    id: 'pack-revision',
    category: 'Révision',
    badgeLabel: 'PREMIUM PLUS',
    badgeStyle: 'purple',
    title: 'Pack Révision',
    description: "Que vous soyez dans la dernière droite avant vos examens nationaux pour viser la mention, ou que vous souhaitiez profiter de l'été pour consolider vos bases et aborder l'année prochaine avec une longueur d'avance.",
    originalPrice: 280,
    finalPrice: 140,
    period: 'Avril/Mai',
    autoAccessAllResources: false,
    bgColor: 'bg-rose-50/70',
    borderColor: 'border-rose-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Pack Essentiel (Ressources pédagogiques)',
      'Espace d\'échange direct avec les professeurs',
      'Séances interactives en direct (Live)',
      'Replays enregistrés, réviser à votre rythme'
    ]
  },
  {
    id: 'forfait-annuel',
    category: 'Annuel',
    badgeLabel: 'OFFRE SPÉCIALE',
    badgeStyle: 'amber',
    title: 'Forfait Annuel Intégral',
    description: "Pack Économique : une formule Tout-en-Un regroupant l'intégralité de nos services Que ce soit pour exceller aux examens nationaux ou pour prendre de l'avance pendant les révisions estivales. Solution la plus complète.",
    originalPrice: 820,
    finalPrice: 350,
    period: 'Annuel',
    autoAccessAllResources: true,
    bgColor: 'bg-amber-50/70',
    borderColor: 'border-amber-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Ressources 100% Corrigées (Fiches, séries, quiz & devoirs)',
      'Lives Interactifs + Replays Vidéo Illimités',
      'Espace d\'Échange Éleve-Professeur',
      'Révision Suivi (Dernière Ligne Droite) ou révisions Estivales'
    ]
  }
];

const STORAGE_KEY = 'azed_campaign_packs_v1';
const STORAGE_KEY_PUBLISHED = 'azed_packs_published_landing';

let inMemoryCampaignsCache: CampaignPack[] | null = null;

export const getStoredCampaigns = (): CampaignPack[] => {
  if (inMemoryCampaignsCache) {
    return inMemoryCampaignsCache;
  }

  // Check published packs from PacksService first
  try {
    const published = safeLocalStorageGetItem(STORAGE_KEY_PUBLISHED);
    if (published) {
      const parsed: PackOffer[] = JSON.parse(published);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped: CampaignPack[] = parsed.map(p => ({
          id: p.id,
          category: p.badge || 'Premium',
          badgeLabel: p.badge,
          badgeStyle: p.bgColor.includes('rose') ? 'purple' : (p.bgColor.includes('emerald') ? 'green' : (p.bgColor.includes('amber') ? 'amber' : 'blue')),
          title: p.title,
          description: p.description,
          originalPrice: Number(p.oldPrice.replace(/[^0-9]/g, '')) || Number(p.price.replace(/[^0-9]/g, '')),
          finalPrice: Number(p.price.replace(/[^0-9]/g, '')) || 0,
          period: p.period,
          isPopular: p.id === 'pack-premium',
          isHidden: !p.isPublished,
          autoAccessAllResources: p.id === 'pack-essentiel' || p.id === 'forfait-annuel',
          features: p.features,
          bgColor: p.bgColor,
          borderColor: p.borderColor,
          buttonColor: p.buttonColor
        }));
        inMemoryCampaignsCache = mapped;
        return mapped;
      }
    }
  } catch (e) {
    console.warn("Erreur lecture storage published:", e);
  }

  try {
    const data = safeLocalStorageGetItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCampaignsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erreur lors de la lecture des campagnes:", e);
  }

  inMemoryCampaignsCache = INITIAL_CAMPAIGNS;
  return INITIAL_CAMPAIGNS;
};

export const saveCampaigns = (packs: CampaignPack[]): void => {
  inMemoryCampaignsCache = packs;
  try {
    safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(packs));
    window.dispatchEvent(new CustomEvent('campaign-packs-updated', { detail: packs }));
  } catch (e) {
    console.warn("Erreur non-bloquante lors de la sauvegarde des campagnes:", e);
  }
};
