import fs from 'fs';
import path from 'path';

export const MAPPING_BADGES: Record<string, string> = {
  'GRATUIT': 'FREEMIUM',
  'Gratuit': 'FREEMIUM',
  'gratuit': 'FREEMIUM',
  'Free': 'FREEMIUM',
  'free': 'FREEMIUM',
  'STUDENT': 'FREEMIUM',
  'student': 'FREEMIUM',
  'PREMIUM': 'ESSENTIEL',
  'Premium': 'ESSENTIEL',
  'premium': 'ESSENTIEL',
  'PREMIUM+': 'LIVE +',
  'Premium+': 'LIVE +',
  'premium+': 'LIVE +',
  'PREMIUM_PLUS': 'LIVE +',
  'PREMIUM++': 'INTÉGRALE',
  'Premium++': 'INTÉGRALE',
  'premium++': 'INTÉGRALE',
  'PREMIUM_PLUS_PLUS': 'INTÉGRALE'
};

export const normalizeQuizBadge = (badge: string): string => {
  if (!badge) return 'FREEMIUM';
  const trimmed = String(badge).trim();
  if (MAPPING_BADGES[trimmed]) return MAPPING_BADGES[trimmed];
  const upper = trimmed.toUpperCase();
  if (MAPPING_BADGES[upper]) return MAPPING_BADGES[upper];
  if (upper === 'FREEMIUM') return 'FREEMIUM';
  if (upper === 'ESSENTIEL') return 'ESSENTIEL';
  if (upper === 'LIVE +' || upper === 'LIVE+') return 'LIVE +';
  if (upper === 'RÉVISION +' || upper === 'REVISION +' || upper === 'REVISION+') return 'RÉVISION +';
  if (upper === 'INTÉGRALE' || upper === 'INTEGRALE') return 'INTÉGRALE';
  return upper;
};

export const migrateQuizBadges = async (dbInstance?: any): Promise<number> => {
  try {
    console.log("🔄 [MIGRATION QUIZ] Analyse et mise à jour des badges de Quiz...");

    let modifiedCount = 0;
    const dbPath = process.env.DATA_PATH || path.join(process.cwd(), 'db_sandbox.json');
    let db = dbInstance;

    if (!db && fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      } catch (e) {
        console.error("Impossible de charger db_sandbox.json pour la migration quiz:", e);
      }
    }

    if (!db) {
      console.log("⚠️ [MIGRATION QUIZ] Aucune instance DB fournie.");
      return 0;
    }

    // Récupérer la collection des quiz interactifs
    const quizCollections = ['interactiveQuizzes', 'quizzes', 'evaluations'];

    for (const collectionKey of quizCollections) {
      if (Array.isArray(db[collectionKey])) {
        for (const quiz of db[collectionKey]) {
          let updated = false;

          // 1. Migration requiredBadge / badge / badgeType
          if (quiz.requiredBadge && (MAPPING_BADGES[quiz.requiredBadge] || MAPPING_BADGES[quiz.requiredBadge.toUpperCase()])) {
            const old = quiz.requiredBadge;
            quiz.requiredBadge = normalizeQuizBadge(quiz.requiredBadge);
            console.log(`  -> Quiz "${quiz.title || quiz.id}" migré de requiredBadge '${old}' vers '${quiz.requiredBadge}'`);
            updated = true;
          } else if (quiz.requiredBadge) {
            quiz.requiredBadge = normalizeQuizBadge(quiz.requiredBadge);
          }

          if (quiz.badge && (MAPPING_BADGES[quiz.badge] || MAPPING_BADGES[quiz.badge.toUpperCase()])) {
            quiz.badge = normalizeQuizBadge(quiz.badge);
            updated = true;
          }

          if (quiz.badgeType && (MAPPING_BADGES[quiz.badgeType] || MAPPING_BADGES[quiz.badgeType.toUpperCase()])) {
            quiz.badgeType = normalizeQuizBadge(quiz.badgeType);
            updated = true;
          }

          // 2. Migration des tableaux allowedBadges, allowedTiers, targetTiers, categoriesAllowed
          if (Array.isArray(quiz.allowedBadges)) {
            const oldList = [...quiz.allowedBadges];
            quiz.allowedBadges = Array.from(new Set(quiz.allowedBadges.map((b: string) => normalizeQuizBadge(b))));
            if (JSON.stringify(oldList) !== JSON.stringify(quiz.allowedBadges)) {
              updated = true;
            }
          } else {
            quiz.allowedBadges = quiz.requiredBadge ? [normalizeQuizBadge(quiz.requiredBadge)] : (quiz.isPremium ? ['ESSENTIEL', 'LIVE +', 'RÉVISION +', 'INTÉGRALE'] : ['FREEMIUM']);
            updated = true;
          }

          if (Array.isArray(quiz.allowedTiers)) {
            quiz.allowedTiers = Array.from(new Set(quiz.allowedTiers.map((b: string) => normalizeQuizBadge(b))));
          } else {
            quiz.allowedTiers = [...quiz.allowedBadges];
          }

          if (Array.isArray(quiz.targetTiers)) {
            quiz.targetTiers = Array.from(new Set(quiz.targetTiers.map((b: string) => normalizeQuizBadge(b))));
          } else {
            quiz.targetTiers = [...quiz.allowedBadges];
          }

          if (Array.isArray(quiz.categoriesAllowed)) {
            quiz.categoriesAllowed = Array.from(new Set(quiz.categoriesAllowed.map((b: string) => normalizeQuizBadge(b))));
          }

          // 3. Harmonisation target.userCategories
          if (quiz.target && Array.isArray(quiz.target.userCategories)) {
            quiz.target.userCategories = Array.from(new Set(quiz.target.userCategories.map((b: string) => normalizeQuizBadge(b))));
          }

          if (updated) {
            modifiedCount++;
          }
        }
      }
    }

    // Sauvegarder dans db_sandbox.json si nécessaire
    if (!dbInstance && fs.existsSync(dbPath)) {
      try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      } catch (e) {
        console.error("Erreur lors de la sauvegarde post-migration quiz:", e);
      }
    }

    console.log(`✅ [MIGRATION QUIZ] Nettoyage BDD terminé avec succès ! (${modifiedCount} quiz mis à jour)`);
    return modifiedCount;
  } catch (error) {
    console.error("❌ Erreur lors de la migration des Quiz:", error);
    return 0;
  }
};

export default migrateQuizBadges;
