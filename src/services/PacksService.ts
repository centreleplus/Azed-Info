export interface PackOffer {
  id: string;
  badge: string;
  title: string;
  price: string;
  oldPrice: string;
  period: string;
  description: string;
  features: string[];
  bgColor: string; // Classes Tailwind pastel
  borderColor: string;
  buttonColor: string;
  isPublished: boolean;
}

export const INITIAL_PACKS_DATA: PackOffer[] = [
  {
    id: 'pack-essentiel',
    badge: 'Essentiel',
    title: 'Pack Essentiel',
    price: '120 DT',
    oldPrice: '240 DT',
    period: 'Annuel',
    description: "l'accompagnement idéal pour maîtriser son programme d'études ! Profitez de ressources ciblées entièrement corrigées.",
    features: [
      'Série d\'exercices 100% corrigés',
      'Fiches de cours synthétiques',
      'Ensemble de quiz 100% corrigé avec évaluation',
      'Devoirs 100% corrigés'
    ],
    bgColor: 'bg-blue-50/70',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    isPublished: true
  },
  {
    id: 'pack-live-plus',
    badge: 'Live +',
    title: 'Pack Live +',
    price: '150 DT',
    oldPrice: '300 DT',
    period: 'Annuel',
    description: "Une solution sur mesure pensée pour vous aider à maîtriser l'intégralité de votre programme d'études grâce à :",
    features: [
      'Des cours interactifs en direct',
      'Le replay de toutes les séances disponible en illimité',
      'Un espace d\'échange entre professeurs et élèves'
    ],
    bgColor: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    isPublished: true
  },
  {
    id: 'pack-revision-plus',
    badge: 'Révision +',
    title: 'Pack Révision +',
    price: '140 DT',
    oldPrice: '280 DT',
    period: 'Avril/Mai',
    description: "Que vous soyez dans la dernière droite avant vos examens nationaux pour viser la mention, ou que vous souhaitiez profiter de l'été pour consolider vos bases et aborder l'année prochaine avec une longueur d'avance.",
    features: [
      'Pack Essentiel (Ressources pédagogiques)',
      'Espace d\'échange direct avec les professeurs',
      'Séances interactives en direct (Live)',
      'Replays enregistrés, réviser à votre rythme'
    ],
    bgColor: 'bg-indigo-50/70',
    borderColor: 'border-indigo-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    isPublished: true
  },
  {
    id: 'pack-integrale',
    badge: 'Intégrale',
    title: 'Formule Intégrale',
    price: '350 DT',
    oldPrice: '820 DT',
    period: 'Annuel',
    description: "Pack Économique : une formule Tout-en-Un regroupant l'intégralité de nos services. Que ce soit pour exceller aux examens nationaux ou pour prendre de l'avance pendant les révisions estivales. Solution la plus complète.",
    features: [
      'Ressources 100% Corrigées (Fiches, séries, quiz & devoirs)',
      'Lives Interactifs + Replays Vidéo Illimités',
      'Espace d\'Échange Éleve-Professeur',
      'Révision Suivi (Dernière Ligne Droite) ou révisions Estivales'
    ],
    bgColor: 'bg-purple-50/70',
    borderColor: 'border-purple-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    isPublished: true
  }
];

const STORAGE_KEY_SAVED = 'azed_packs_saved_db';
const STORAGE_KEY_PUBLISHED = 'azed_packs_published_landing';
const API_URL = '/api/admin/offres'; // Route backend du VPS

export const PacksService = {
  // Charger les cartes pour la page publique (landing / signup / cours)
  async getPublishedPacks(): Promise<PackOffer[]> {
    try {
      const res = await fetch(`${API_URL}/published`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEY_PUBLISHED, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn("VPS API indisponible, fallback sur localStorage/defaults", e);
    }
    // Fallback LocalStorage public
    try {
      const local = localStorage.getItem(STORAGE_KEY_PUBLISHED);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn("Erreur lecture storage published:", err);
    }
    return INITIAL_PACKS_DATA;
  },

  // Charger les cartes pour le panneau d'administration
  async getAdminPacks(): Promise<PackOffer[]> {
    try {
      const res = await fetch(`${API_URL}/published`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn("VPS API indisponible pour l'admin, fallback sur localStorage", e);
    }
    try {
      const local = localStorage.getItem(STORAGE_KEY_SAVED);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn("Erreur lecture storage saved:", err);
    }
    return INITIAL_PACKS_DATA;
  },

  // Enregistrer TOUT en BDD / VPS (Bouton "Enregistrer tout")
  async saveAllToDB(packs: PackOffer[]): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(packs)); // Sauvegarde locale immédiate
      window.dispatchEvent(new CustomEvent('packs-updated', { detail: packs }));
    } catch (e) {
      console.warn("Erreur écriture storage saved:", e);
    }

    try {
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packs }),
      });
      return res.ok;
    } catch (e) {
      console.error("Erreur de sauvegarde VPS API:", e);
      return true; // Garantit la prise en compte locale même si l'API est temporairement offline
    }
  },

  // Publier vers la Landing Page (Bouton "Mettre à jour")
  async publishToLanding(packs: PackOffer[]): Promise<boolean> {
    const published = packs.map(p => ({ ...p, isPublished: true }));
    try {
      localStorage.setItem(STORAGE_KEY_PUBLISHED, JSON.stringify(published)); // Synchronisation publique
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(published));
      window.dispatchEvent(new CustomEvent('packs-published', { detail: published }));
      window.dispatchEvent(new CustomEvent('campaign-packs-updated', { detail: published }));
    } catch (e) {
      console.warn("Erreur écriture storage published:", e);
    }

    try {
      const res = await fetch(`${API_URL}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packs: published }),
      });
      return res.ok;
    } catch (e) {
      console.error("Erreur de publication VPS API:", e);
      return true;
    }
  }
};
