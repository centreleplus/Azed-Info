/**
 * Helper universel d'affichage du bouton pour n'importe quelle carte/section du tableau de bord étudiant
 */
export const getActionButtonLabel = (fileFormat?: string | null, fileName?: string | null) => {
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
  else if (ext.includes('mp4') || ext.includes('video')) ext = 'mp4';
  else if (ext.includes('pdf')) ext = 'pdf';
  else if (ext.includes('py')) ext = 'py';
  else if (ext.includes('txt')) ext = 'txt';

  if (['png', 'jpg', 'jpeg'].includes(ext)) {
    return { label: `Afficher (.${ext})`, isImage: true, ext };
  }
  if (ext === 'mp4') {
    return { label: 'Visionner (.mp4)', isVideo: true, ext: 'mp4' };
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

  return { label: 'Consulter', isOther: true, ext: ext || 'doc' };
};

export const getGlobalActionButtonText = (fileType?: string | null, fileName?: string | null): string => {
  const result = getActionButtonLabel(fileType, fileName);
  return result.label;
};

export default getGlobalActionButtonText;

