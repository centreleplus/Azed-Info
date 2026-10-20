import { normalizeBadge } from '../config/badges';

let hasRunAutoGlobalMigration = false;

export const autoGlobalMigration = (db?: any): number => {
  if (hasRunAutoGlobalMigration) {
    return 0;
  }
  hasRunAutoGlobalMigration = true;

  try {
    console.log("🔄 [MIGRATION SYSTEME] Démarrage du nettoyage global et strict des badges (exécution unique)...");

    let updatedCount = 0;
    if (!db) return 0;

    const OFFICIAL_BADGES = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];

    // 1. Migration de TOUS LES UTILISATEURS
    if (Array.isArray(db.users)) {
      for (let u of db.users) {
        if (u.role === 'admin' || u.role === 'agent') {
          if (u.status !== 'disabled') u.status = 'active';
          continue;
        }
        let isUpdated = false;
        const targetBadge = u.badge || u.subscriptionBadge || u.activeBadge || u.userCategory || u.tier || 'FREEMIUM';
        const cleanBadge = normalizeBadge(targetBadge);

        if (
          u.badge !== cleanBadge ||
          u.activeBadge !== cleanBadge ||
          u.userCategory !== cleanBadge ||
          u.tier !== cleanBadge ||
          u.subscriptionTier !== cleanBadge ||
          u.subscriptionBadge !== cleanBadge
        ) {
          u.badge = cleanBadge;
          u.activeBadge = cleanBadge;
          u.statusBadge = cleanBadge;
          u.userCategory = cleanBadge;
          u.tier = cleanBadge;
          u.offer = cleanBadge;
          u.subscriptionTier = cleanBadge;
          u.subscriptionBadge = cleanBadge;
          u.activePackages = [cleanBadge];
          u.packs = [cleanBadge];
          u.accountType = cleanBadge === 'FREEMIUM' ? 'freemium' : 'premium';
          if (u.status !== 'disabled') u.status = 'active';
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

    // 3. Migration de TOUS LES DOCUMENTS & COURS (en préservant les tableaux multi-badges)
    if (Array.isArray(db.courses)) {
      for (let d of db.courses) {
        let isUpdated = false;
        const rawList: any[] =
          Array.isArray(d.allowedBadges) && d.allowedBadges.length > 0 ? d.allowedBadges :
          Array.isArray(d.allowedTiers) && d.allowedTiers.length > 0 ? d.allowedTiers :
          Array.isArray(d.targetTiers) && d.targetTiers.length > 0 ? d.targetTiers :
          Array.isArray(d.target?.userCategories) && d.target.userCategories.length > 0 ? d.target.userCategories :
          [d.badgeRequired || d.requiredBadge || d.badge || (d.isPremium ? "ESSENTIEL" : "FREEMIUM")];

        const cleanArray = Array.from(new Set(rawList.map((b: any) => normalizeBadge(String(b)))));
        const primaryBadge = cleanArray[0] || (d.isPremium ? "ESSENTIEL" : "FREEMIUM");

        if (
          JSON.stringify(d.allowedTiers) !== JSON.stringify(cleanArray) ||
          JSON.stringify(d.allowedBadges) !== JSON.stringify(cleanArray) ||
          d.badgeRequired !== primaryBadge ||
          d.requiredBadge !== primaryBadge
        ) {
          d.badgeRequired = primaryBadge;
          d.requiredBadge = primaryBadge;
          d.badge = primaryBadge;
          d.allowedTiers = cleanArray;
          d.targetTiers = cleanArray;
          d.allowedBadges = cleanArray;
          d.accessTiers = cleanArray;
          d.tiers = cleanArray;
          if (d.target && typeof d.target === "object") {
            d.target.userCategories = cleanArray;
          }
          isUpdated = true;
        }
        if (!d.section && String(d.grade || "").toLowerCase().includes("info")) {
          d.section = "Sciences de l'Informatique";
          isUpdated = true;
        }
        if (!d.sourceModule) {
          d.sourceModule = "GESTION_DOCUMENTS";
          isUpdated = true;
        }
        if (d.isPublished === undefined) {
          d.isPublished = true;
          isUpdated = true;
        }
        if (d.isInternalAdminOnly === undefined) {
          d.isInternalAdminOnly = false;
          isUpdated = true;
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
