export interface DemoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Lien embed YouTube/Vimeo ou vidéo uploadée / URL directe
  youtubeUrl?: string;
  thumbnailUrl?: string;
  category?: string; // ex: 'Extrait Cours', 'Présentation Plateforme', 'Bac', 'Méthodologie', 'Algorithmes'
  createdAt?: string;
  duration?: string;
  order?: number;
  displayOrder?: number;
  featured?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface DemoVideo {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  isPublished: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}
