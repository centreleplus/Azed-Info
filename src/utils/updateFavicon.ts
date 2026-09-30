// src/utils/updateFavicon.ts
export const setPlatformFavicon = () => {
  if (typeof document === 'undefined') return;
  
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/png';
  link.rel = 'shortcut icon';
  link.href = '/logo-az.png?v=' + new Date().getTime(); // Évite la mise en cache navigateur
};

export default setPlatformFavicon;
