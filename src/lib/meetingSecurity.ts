/**
 * Utilitaire de sécurisation des liens de visioconférence (Zoom / Google Meet / Teams)
 * Contrôle d'accès temporel (15 min avant le début jusqu'à la fin de la séance)
 * Masquage complet de l'URL brute et ouverture sécurisée sans balise <a>
 */

/**
 * Vérification de la fenêtre horaire du Live
 * @param startIso Date/heure de début (ex: "2026-08-21T18:30:00" ou date "2026-08-21" + heure "18:30")
 * @param durationMinutes Durée en minutes (défaut: 90)
 * @returns boolean indiquant si l'accès est ouvert (15 min avant jusqu'à la fin)
 */
export const isLiveActive = (startIso: string, durationMinutes: number = 90): boolean => {
  try {
    const now = new Date().getTime();
    
    // Normalisation de startIso si format non-ISO (ex: "2026-08-21 18:30" ou "21/08/2026")
    let startTime: number;
    if (startIso.includes('T')) {
      startTime = new Date(startIso).getTime();
    } else if (startIso.includes(' ') || startIso.includes('à')) {
      const cleaned = startIso.replace('à', ' ').trim();
      const parts = cleaned.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '00:00';
      
      let year = 2026, month = 7, day = 21;
      if (datePart.includes('-')) {
        const [y, m, d] = datePart.split('-').map(Number);
        year = y; month = m - 1; day = d;
      } else if (datePart.includes('/')) {
        const [d, m, y] = datePart.split('/').map(Number);
        year = y; month = m - 1; day = d;
      }
      
      const [hours, minutes] = timePart.split(':').map(Number);
      startTime = new Date(year, month, day, hours || 0, minutes || 0).getTime();
    } else {
      startTime = new Date(startIso).getTime();
    }

    if (isNaN(startTime)) {
      return false;
    }

    const endTime = startTime + durationMinutes * 60 * 1000;
    const bufferStart = startTime - 15 * 60 * 1000; // 15 minutes avant le début

    return now >= bufferStart && now <= endTime;
  } catch {
    return false;
  }
};

/**
 * Bouton sécurisé sans affichage d'URL
 * Navigation par fonction (window.open avec noopener,noreferrer)
 */
export const handleJoinClick = (url?: string): void => {
  if (!url || url === '#' || url === '') return;
  const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  const win = window.open(fullUrl, '_blank', 'noopener,noreferrer');
  if (win) win.focus();
};
