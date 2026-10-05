import { extractYouTubeId } from "./youtube";

/**
 * Utility function for detecting media type from item/support URL
 */
export const getMediaType = (item: { 
  type?: string; 
  supportUrl?: string; 
  fileUrl?: string; 
  videoUrl?: string; 
  extension?: string; 
  fileType?: string; 
  attachmentName?: string; 
  title?: string;
  contentType?: string;
  format?: string;
}) => {
  const support = (item.supportUrl || item.fileUrl || item.videoUrl || '').trim();
  const extension = (item.extension || item.fileType || item.type || item.format || '').toLowerCase().trim();
  const attachment = (item.attachmentName || item.title || '').toLowerCase().trim();

  // 1. Détection formelle d'un fichier Python / Code (Prioritaire)
  const isCode = 
    extension === '.py' || 
    extension === 'py' || 
    support.endsWith('.py') || 
    attachment.endsWith('.py') ||
    (item.fileType && item.fileType.toLowerCase().includes('py')) ||
    (item.type && item.type.toLowerCase().includes('py'));

  // 2. Détection formelle d'une Vidéo (Ne doit être VRAI que si ce n'est PAS du code)
  const isVideo = !isCode && (
    extension === '.mp4' || 
    extension === 'mp4' || 
    support.includes('youtube.com') || 
    support.includes('youtu.be') || 
    support.endsWith('.mp4') ||
    /^[a-zA-Z0-9_-]{11}$/.test(support) ||
    (item.fileType && (item.fileType.toLowerCase().includes('mp4') || item.fileType.toLowerCase().includes('video'))) ||
    (item.type && (item.type.toLowerCase().includes('mp4') || item.type.toLowerCase().includes('video')))
  );

  return { isVideo, isCode };
};

/**
 * Helper universel d'affichage du bouton pour n'importe quelle carte/section du tableau de bord étudiant
 */
export const getActionButtonLabel = (fileFormat?: string | null, fileName?: string | null, fullItem?: any) => {
  if (fullItem) {
    const { isVideo, isCode } = getMediaType(fullItem);
    if (isVideo) {
      return { label: 'Vidéo corrigée', isVideo: true, ext: 'mp4' };
    }
    if (isCode) {
      return { label: 'Exécuter (.py)', isPy: true, ext: 'py' };
    }
  }

  let ext = (fileFormat || '').toLowerCase().trim().replace(/^\./, '');

  if (!ext && fileName) {
    ext = fileName.split('.').pop()?.toLowerCase() || '';
  }

  // Sanitize path or mime-type strings
  if (ext.includes('/')) {
    ext = ext.split('/').pop() || ext;
  }

  if (ext === 'png' || ext.includes('png')) ext = 'png';
  else if (ext === 'jpg' || ext.includes('jpg')) ext = 'jpg';
  else if (ext === 'jpeg' || ext.includes('jpeg')) ext = 'jpeg';
  else if (ext === 'webp' || ext.includes('webp')) ext = 'webp';
  else if (ext.includes('mp4') || ext.includes('video') || ext.includes('youtube')) ext = 'mp4';
  else if (ext.includes('pdf')) ext = 'pdf';
  else if (ext.includes('py')) ext = 'py';
  else if (ext.includes('txt')) ext = 'txt';

  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return { label: `Afficher (.${ext})`, isImage: true, ext };
  }
  if (ext === 'mp4') {
    return { label: 'Vidéo corrigée', isVideo: true, ext: 'mp4' };
  }
  if (ext === 'pdf') {
    return { label: 'Consulter', isPdf: true, ext: 'pdf' };
  }
  if (ext === 'py') {
    return { label: 'Exécuter (.py)', isPy: true, ext: 'py' };
  }
  if (ext === 'txt') {
    return { label: 'Lire (.txt)', isTxt: true, ext: 'txt' };
  }

  return { label: `Afficher (.${ext || 'file'})`, isOther: true, ext: ext || 'file' };
};

export const getGlobalActionButtonText = (fileType?: string | null, fileName?: string | null): string => {
  const result = getActionButtonLabel(fileType, fileName);
  return result.label;
};

export default getGlobalActionButtonText;

