import { extractYouTubeId } from "./youtube";

/**
 * Détection stricte et isolée du type de support par document
 */
export const isPythonFile = (doc: any): boolean => {
  if (!doc) return false;
  
  const fileTypeStr = String(doc.fileType || doc.fileFormat || doc.format || doc.type || '').toLowerCase().trim();
  const extension = String(doc.extension || doc.attachmentName?.split('.').pop() || doc.filename?.split('.').pop() || fileTypeStr).toLowerCase().trim();
  const fileUrl = String(doc.fileUrl || doc.supportUrl || doc.support || doc.videoUrl || doc.url || doc.title || '').toLowerCase().trim();
  const attachmentName = String(doc.attachmentName || doc.filename || '').toLowerCase().trim();

  // Condition 1: Badge explicite .py
  if (fileTypeStr === 'py' || fileTypeStr === '.py' || fileTypeStr === 'python' || fileTypeStr === 'code') return true;

  // Condition 2: Fichier ou URL se terminant par .py
  if (fileUrl.endsWith('.py') || extension === 'py' || extension === '.py' || attachmentName.endsWith('.py')) return true;

  return false;
};

export const isVideoSupport = (doc: any): boolean => {
  if (!doc) return false;

  // Si c'est explicitement un fichier .py, ce N'EST PAS une vidéo
  if (isPythonFile(doc)) return false;

  const fileTypeStr = String(doc.fileType || doc.fileFormat || doc.format || doc.type || '').toLowerCase().trim();
  const extension = String(doc.extension || doc.attachmentName?.split('.').pop() || doc.filename?.split('.').pop() || fileTypeStr).toLowerCase().trim();
  const videoUrl = String(doc.videoUrl || doc.fileUrl || doc.supportUrl || doc.support || doc.url || '').toLowerCase().trim();
  const videoFieldRaw = String(doc.videoUrl || doc.supportUrl || doc.fileUrl || doc.support || doc.url || '').trim();
  const attachmentName = String(doc.attachmentName || doc.filename || '').toLowerCase().trim();

  // Détection Vidéo (.mp4, lien YouTube, ou ID YouTube pure de 11 caractères)
  if (fileTypeStr === 'mp4' || fileTypeStr === '.mp4' || fileTypeStr === 'video' || fileTypeStr === 'youtube') return true;
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.endsWith('.mp4') || extension === 'mp4' || extension === 'webm' || attachmentName.endsWith('.mp4')) return true;
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoFieldRaw)) return true;

  return false;
};

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
  const isPy = isPythonFile(item);
  if (isPy) {
    return { isVideo: false, isCode: true };
  }
  const isVid = isVideoSupport(item);
  return { isVideo: isVid, isCode: false };
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

