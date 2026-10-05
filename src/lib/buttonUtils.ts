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
  contentType?: string;
  format?: string;
}) => {
  const url = (
    item.supportUrl || 
    item.videoUrl || 
    item.fileUrl || 
    item.extension || 
    item.attachmentName || 
    ''
  ).toLowerCase();
  const typeField = (item.type || item.fileType || item.contentType || item.format || '').toLowerCase();

  const videoField = (item.videoUrl || item.supportUrl || item.fileUrl || '').trim();
  const hasYouTubeId = !!extractYouTubeId(videoField);

  // Détection Vidéo (extension .mp4/webm, liens YouTube, vimeo, ou ID de vidéo 11 caractères)
  const isVideo = 
    typeField.includes('mp4') || 
    typeField.includes('video') || 
    typeField.includes('youtube') ||
    url.includes('youtube.com') || 
    url.includes('youtu.be') || 
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    hasYouTubeId ||
    /^[a-zA-Z0-9_-]{11}$/.test(videoField);

  // Détection Code / Python
  const isCode = 
    ((typeField.includes('py') || typeField.includes('code')) && !isVideo) || 
    (url.endsWith('.py') && !isVideo);

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

