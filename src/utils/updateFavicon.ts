import { useEffect } from 'react';

export const useCrispFavicon = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Force le navigateur à recharger la version HD du logo sans utiliser le cache flou
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach((link: any) => {
      const baseUrl = link.href.split('?')[0];
      link.href = `${baseUrl}?v=${Date.now()}`;
    });
  }, []);
};

export const setPlatformFavicon = () => {
  if (typeof document === 'undefined') return;
  const links = document.querySelectorAll("link[rel*='icon']");
  links.forEach((link: any) => {
    const baseUrl = link.href.split('?')[0];
    link.href = `${baseUrl}?v=${Date.now()}`;
  });
};

export default useCrispFavicon;
