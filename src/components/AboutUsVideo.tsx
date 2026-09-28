import React, { useEffect, useState } from 'react';

export const AboutUsVideoPlayer: React.FC<{ initialUrl?: string }> = ({ initialUrl }) => {
  const [embedUrl, setEmbedUrl] = useState<string>(initialUrl || '');
  const [loading, setLoading] = useState<boolean>(!initialUrl);

  const fetchLiveVideoUrl = () => {
    // Appel API avec un paramètre d'horodatage pour contourner le cache navigateur
    fetch(`/api/public/branding?t=${Date.now()}`, { 
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const url = data?.aboutUsYoutubeUrl || data?.aboutYoutubeUrl || data?.config?.aboutUsYoutubeUrl || '';
        if (url) {
          setEmbedUrl(url);
        }
      })
      .catch((err) => console.error("Erreur de chargement de la vidéo landing page:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLiveVideoUrl();

    // Écouter les événements de mise à jour en direct s'il y a lieu
    const handleBrandingUpdate = (e: any) => {
      if (e?.detail?.aboutUsYoutubeUrl) {
        setEmbedUrl(e.detail.aboutUsYoutubeUrl);
      } else {
        fetchLiveVideoUrl();
      }
    };

    window.addEventListener('branding_updated', handleBrandingUpdate);
    return () => {
      window.removeEventListener('branding_updated', handleBrandingUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full aspect-video rounded-3xl bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 text-xs">
        Chargement du lecteur vidéo...
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
      {embedUrl ? (
        <iframe
          key={embedUrl} // La clé force React à détruire et re-créer l'iframe si l'URL change
          src={embedUrl.includes('?') ? (embedUrl.includes('autoplay') ? embedUrl : `${embedUrl}&autoplay=1&enablejsapi=1`) : `${embedUrl}?autoplay=1&enablejsapi=1`}
          title="Présentation A-Zed Info"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
          Aucune vidéo configurée.
        </div>
      )}
    </div>
  );
};

export const AboutUsVideo = AboutUsVideoPlayer;
export default AboutUsVideoPlayer;
