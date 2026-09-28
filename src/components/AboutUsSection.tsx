import React from 'react';

export interface AboutUsSectionProps {
  config?: {
    aboutYoutubeUrl?: string;
    title?: string;
    description?: string;
  };
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ config }) => {
  const rawUrl = config?.aboutYoutubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  let videoSrc = rawUrl;
  if (rawUrl.includes("watch?v=")) {
    const videoId = rawUrl.split("v=")[1].split("&")[0];
    videoSrc = `https://www.youtube.com/embed/${videoId}`;
  } else if (rawUrl.includes("youtu.be/")) {
    const videoId = rawUrl.split("youtu.be/")[1].split("?")[0];
    videoSrc = `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <section id="about-us-section" className="py-12 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
          <iframe 
            src={videoSrc}
            title="A-Zed Info - Qui sommes-nous"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="text-left space-y-3">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pourquoi réviser avec nous ?</span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{config?.title || "Qui sommes-nous ?"}</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {config?.description || "A-Zed Info est la première plateforme dédiée à la préparation complète de l'épreuve pratique et théorique d'informatique au baccalauréat tunisien..."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
