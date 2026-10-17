import { normalizeBadge } from '../config/badges';

export const autoGlobalMigration = (db?: any): number => {
  try {
    console.log("🔄 [MIGRATION SYSTEME] Démarrage du nettoyage global et strict des badges...");

    let updatedCount = 0;
    if (!db) return 0;

    const OFFICIAL_BADGES = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];

    // 1. Migration de TOUS LES UTILISATEURS
    if (Array.isArray(db.users)) {
      for (let u of db.users) {
        let isUpdated = false;
        const targetBadge = u.subscriptionBadge || u.activeBadge || u.status || u.role || 'FREEMIUM';
        const cleanBadge = normalizeBadge(targetBadge);

        if (!OFFICIAL_BADGES.includes(cleanBadge)) {
             // Should not happen with current normalizeBadge, but for safety
             continue;
        }

        if (u.activeBadge !== cleanBadge || u.status !== cleanBadge || u.subscriptionBadge !== cleanBadge) {
          u.activeBadge = cleanBadge;
          u.status = cleanBadge;
          u.subscriptionBadge = cleanBadge;
          isUpdated = true;
        }
        if (isUpdated) {
          updatedCount++;
        }
      }
    }

    // 2. Migration de TOUS LES QUIZ & ÉVALUATIONS
    if (Array.isArray(db.interactiveQuizzes)) {
      for (let q of db.interactiveQuizzes) {
        let isUpdated = false;
        const fields = ['allowedBadges', 'allowedTiers', 'targetTiers'];

        fields.forEach(f => {
          if (Array.isArray(q[f])) {
            const oldArr = [...q[f]];
            q[f] = [...new Set(q[f].map((b: any) => normalizeBadge(b)))];
            if (JSON.stringify(oldArr) !== JSON.stringify(q[f])) {
              isUpdated = true;
            }
          }
        });

        if (q.requiredBadge) {
          const old = q.requiredBadge;
          q.requiredBadge = normalizeBadge(q.requiredBadge);
          if (old !== q.requiredBadge) isUpdated = true;
        }

        if (isUpdated) {
          updatedCount++;
        }
      }
    }

    // 3. Migration de TOUS LES DOCUMENTS & COURS
    if (Array.isArray(db.courses)) {
      for (let d of db.courses) {
        let isUpdated = false;
        const fields = ['allowedBadges', 'allowedTiers', 'targetTiers'];

        fields.forEach(f => {
          if (Array.isArray(d[f])) {
            const oldArr = [...d[f]];
            d[f] = [...new Set(d[f].map((b: any) => normalizeBadge(b)))];
            if (JSON.stringify(oldArr) !== JSON.stringify(d[f])) {
              isUpdated = true;
            }
          }
        });

        if (d.requiredBadge) {
          const old = d.requiredBadge;
          d.requiredBadge = normalizeBadge(d.requiredBadge);
          if (old !== d.requiredBadge) isUpdated = true;
        }

        if (isUpdated) {
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ [MIGRATION SYSTEME] BDD totalement harmonisée et à jour ! (${updatedCount} éléments nettoyés)`);
    }
    return updatedCount;
  } catch (err) {
    console.error("❌ [MIGRATION SYSTEME] Erreur lors de la migration BDD:", err);
    return 0;
  }
};

export default autoGlobalMigration;
