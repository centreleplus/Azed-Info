import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/safeStorage';

export interface CampaignPack {
  id: string;
  category: string;
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
}

export const INITIAL_CAMPAIGNS: CampaignPack[] = [
  {
    id: 'pack-1',
    category: 'Premium Standard',
    badgeLabel: 'ABONNEMENT PREMIUM ★',
    badgeStyle: 'green',
    title: 'Intégrale A-Zed Info',
    description: 'Zéro limite. Débloquez tous les supports d’examens nationaux tunisiens et rejoignez nos sessions lives interactives.',
    originalPrice: 240,
    finalPrice: 120,
    period: 'TND / Annuel',
    autoAccessAllResources: false,
    features: ['100% des E-Books & Cours', 'Sandbox Python Illimité & IA', 'Tous les webinaires de groupe BAC']
  },
  {
    id: 'pack-2',
    category: 'Python Premium',
    badgeLabel: '-20% SOLDE',
    badgeStyle: 'green',
    title: 'Pack Python Premium Trimester',
    description: 'Accès complet aux fiches de cours détaillées, vidéos de révisions interactives et exercices types pour le trimestre.',
    originalPrice: 150,
    finalPrice: 120,
    period: 'TND / Trimestre',
    isPopular: true,
    autoAccessAllResources: false,
    features: ['Cours & E-Books complets', 'Sandbox Python Illimité', 'Correction d’Examens Blancs']
  },
  {
    id: 'pack-3',
    category: 'Annuel Intégral',
    badgeLabel: 'OFFRE SPÉCIALE',
    badgeStyle: 'purple',
    title: 'Forfait Annuel Intégral',
    description: 'La totalité des cours indispensables, le Sandbox illimité, et l’invitation à tous les séminaires live de l’année.',
    originalPrice: 380,
    finalPrice: 290,
    period: 'TND / An',
    autoAccessAllResources: false,
    features: ['Tous les E-Books Premium', 'Sandbox Python Prioritaire', 'Accès prioritaire Centre Le Plus']
  },
  {
    id: 'pack-4',
    category: 'Essentiel',
    badgeLabel: '👑 ESSENTIEL',
    badgeStyle: 'amber',
    title: 'Pack Pass Essentiel',
    description: 'Accès VIP automatique à TOUTES les ressources (devoirs, exercices, corrigés, quiz) et TOUS les services (lives, support BAC).',
    originalPrice: 450,
    finalPrice: 320,
    period: 'TND / An',
    autoAccessAllResources: true,
    features: ['Accès automatique 100% Débloqué', 'Tous les Devoirs, Exercices & Corrigés', 'Support BAC & Lives Prioritaires']
  }
];

const STORAGE_KEY = 'azed_campaign_packs_v1';

let inMemoryCampaignsCache: CampaignPack[] | null = null;

export const getStoredCampaigns = (): CampaignPack[] => {
  if (inMemoryCampaignsCache) {
    return inMemoryCampaignsCache;
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
