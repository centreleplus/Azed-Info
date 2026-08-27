export interface DemoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Lien embed YouTube/Vimeo ou vidéo uploadée / URL directe
  thumbnailUrl?: string;
  category?: string; // ex: 'Extrait Cours', 'Présentation Plateforme', 'Bac', 'Méthodologie', 'Algorithmes'
  createdAt: string;
  duration?: string;
  order?: number;
  displayOrder?: number;
  featured?: boolean;
  isFeatured?: boolean;
}
