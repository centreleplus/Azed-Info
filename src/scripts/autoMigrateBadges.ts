import { MAPPING_OLD_TO_NEW_BADGES, normalizeBadgeName } from '../config/badges';

export interface DatabaseSchema {
  users?: any[];
  courses?: any[];
  interactiveQuizzes?: any[];
  ebooks?: any[];
  todoEvents?: any[];
  signUpOffers?: any[];
  products?: any[];
  [key: string]: any;
}

export const autoMigrateBadges = (db: DatabaseSchema): boolean => {
  let dirty = false;
  try {
    console.log("🔄 [MIGRATION BDD] Vérification et nettoyage des anciens badges...");

    const migrateBadgeArray = (arr: any[]): any[] => {
      if (!Array.isArray(arr)) return arr;
      return arr.map((item) => {
        const str = String(item).trim();
        if (MAPPING_OLD_TO_NEW_BADGES[str]) {
          dirty = true;
          return MAPPING_OLD_TO_NEW_BADGES[str];
        }
        return normalizeBadgeName(str);
      });
    };

    // 1. Mettre à jour les Documents / Cours
    if (Array.isArray(db.courses)) {
      for (const doc of db.courses) {
        if (doc.requiredBadge) {
          const norm = normalizeBadgeName(doc.requiredBadge);
          if (norm !== doc.requiredBadge) {
            doc.requiredBadge = norm;
            dirty = true;
          }
        }
        if (doc.badgeType && MAPPING_OLD_TO_NEW_BADGES[doc.badgeType]) {
          doc.badgeType = MAPPING_OLD_TO_NEW_BADGES[doc.badgeType];
          dirty = true;
        }
        if (Array.isArray(doc.allowedBadges)) {
          const updated = migrateBadgeArray(doc.allowedBadges);
          if (JSON.stringify(updated) !== JSON.stringify(doc.allowedBadges)) {
            doc.allowedBadges = updated;
            dirty = true;
          }
        }
        if (Array.isArray(doc.allowedTiers)) {
          const updated = migrateBadgeArray(doc.allowedTiers);
          if (JSON.stringify(updated) !== JSON.stringify(doc.allowedTiers)) {
            doc.allowedTiers = updated;
            dirty = true;
          }
        }
        if (Array.isArray(doc.targetTiers)) {
          const updated = migrateBadgeArray(doc.targetTiers);
          if (JSON.stringify(updated) !== JSON.stringify(doc.targetTiers)) {
            doc.targetTiers = updated;
            dirty = true;
          }
        }
        if (doc.target && Array.isArray(doc.target.userCategories)) {
          const updated = migrateBadgeArray(doc.target.userCategories);
          if (JSON.stringify(updated) !== JSON.stringify(doc.target.userCategories)) {
            doc.target.userCategories = updated;
            dirty = true;
          }
        }
      }
    }

    // 2. Mettre à jour les Utilisateurs
    if (Array.isArray(db.users)) {
      for (const user of db.users) {
        // activeBadge
        const curBadge = user.activeBadge || user.badge || user.statusBadge || user.userCategory || user.tier || 'Freemium';
        const normBadge = normalizeBadgeName(curBadge);

        if (user.activeBadge && user.activeBadge !== normBadge) {
          user.activeBadge = normBadge;
          dirty = true;
        } else if (!user.activeBadge) {
          user.activeBadge = normBadge;
          dirty = true;
        }

        if (user.badge && user.badge !== normBadge) {
          user.badge = normBadge;
          dirty = true;
        }

        if (user.statusBadge && user.statusBadge !== normBadge) {
          user.statusBadge = normBadge;
          dirty = true;
        }

        if (user.userCategory && (MAPPING_OLD_TO_NEW_BADGES[user.userCategory] || user.userCategory === 'Premium')) {
          user.userCategory = normBadge;
          dirty = true;
        }

        if (user.tier && (MAPPING_OLD_TO_NEW_BADGES[user.tier] || user.tier.includes('PREMIUM'))) {
          user.tier = normBadge.toUpperCase();
          dirty = true;
        }

        if (user.tierCategory && (MAPPING_OLD_TO_NEW_BADGES[user.tierCategory] || user.tierCategory.includes('PREMIUM'))) {
          user.tierCategory = normBadge.toUpperCase();
          dirty = true;
        }

        if (user.tierBadge && (MAPPING_OLD_TO_NEW_BADGES[user.tierBadge] || user.tierBadge.includes('PREMIUM') || user.tierBadge.includes('Premium'))) {
          user.tierBadge = normBadge.toUpperCase();
          dirty = true;
        }

        if (user.badgeLabel && (MAPPING_OLD_TO_NEW_BADGES[user.badgeLabel] || user.badgeLabel.includes('PREMIUM') || user.badgeLabel.includes('Premium'))) {
          user.badgeLabel = normBadge.toUpperCase();
          dirty = true;
        }

        if (Array.isArray(user.packs)) {
          const updated = migrateBadgeArray(user.packs);
          if (JSON.stringify(updated) !== JSON.stringify(user.packs)) {
            user.packs = updated;
            dirty = true;
          }
        }

        if (Array.isArray(user.activePackages)) {
          const updated = migrateBadgeArray(user.activePackages);
          if (JSON.stringify(updated) !== JSON.stringify(user.activePackages)) {
            user.activePackages = updated;
            dirty = true;
          }
        }
      }
    }

    // 3. Mettre à jour les Quiz
    if (Array.isArray(db.interactiveQuizzes)) {
      for (const quiz of db.interactiveQuizzes) {
        if (quiz.requiredBadge) {
          const norm = normalizeBadgeName(quiz.requiredBadge);
          if (norm !== quiz.requiredBadge) {
            quiz.requiredBadge = norm;
            dirty = true;
          }
        }
        if (Array.isArray(quiz.allowedBadges)) {
          const updated = migrateBadgeArray(quiz.allowedBadges);
          if (JSON.stringify(updated) !== JSON.stringify(quiz.allowedBadges)) {
            quiz.allowedBadges = updated;
            dirty = true;
          }
        }
        if (Array.isArray(quiz.allowedTiers)) {
          const updated = migrateBadgeArray(quiz.allowedTiers);
          if (JSON.stringify(updated) !== JSON.stringify(quiz.allowedTiers)) {
            quiz.allowedTiers = updated;
            dirty = true;
          }
        }
        if (Array.isArray(quiz.targetTiers)) {
          const updated = migrateBadgeArray(quiz.targetTiers);
          if (JSON.stringify(updated) !== JSON.stringify(quiz.targetTiers)) {
            quiz.targetTiers = updated;
            dirty = true;
          }
        }
        if (quiz.target && Array.isArray(quiz.target.userCategories)) {
          const updated = migrateBadgeArray(quiz.target.userCategories);
          if (JSON.stringify(updated) !== JSON.stringify(quiz.target.userCategories)) {
            quiz.target.userCategories = updated;
            dirty = true;
          }
        }
      }
    }

    console.log("✅ [MIGRATION BDD] Nettoyage BDD terminé avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de la migration automatique des badges:", err);
  }
  return dirty;
};

export default autoMigrateBadges;
