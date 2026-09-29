import React from 'react';

export interface AboutUsSectionProps {
  config?: {
    aboutUsYoutubeUrl?: string;
    aboutYoutubeUrl?: string;
    title?: string;
    description?: string;
  };
}

function toYoutubeEmbedUrl(inputUrl?: string): string {
  if (!inputUrl) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
  const trimmed = inputUrl.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return trimmed;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ config }) => {
  const rawUrl = config?.aboutUsYoutubeUrl || config?.aboutYoutubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  const videoSrc = toYoutubeEmbedUrl(rawUrl);

  return (
    <section id="about-us-section" className="py-12 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black border border-slate-200">
          <iframe 
            src={videoSrc}
            title="A-Zed Info - Qui sommes-nous"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="text-left space-y-4">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pourquoi réviser avec nous ?</span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{config?.title || "Qui sommes-nous ?"}</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {config?.description || "A-Zed Info est la première plateforme dédiée à la préparation complète de l'épreuve pratique et théorique d'informatique au baccalauréat tunisien..."}
          </p>

          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <img 
              src="/images/nabil-chaouch.png" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400";
              }}
              alt="Professeur Nabil Chaouch" 
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/20"
            />
            <div>
              <h4 className="font-bold text-slate-900 text-base">Professeur Nabil Chaouch</h4>
              <p className="text-xs font-medium text-slate-500">Fondateur de la plateforme</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
