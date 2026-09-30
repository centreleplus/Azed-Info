/**
 * Script de migration unique : Ajout du badge 'ESSENTIEL' à tous les documents existants.
 * Supporte à la fois MongoDB / Mongoose et la base de données persistante JSON du serveur.
 */

import fs from 'fs';
import path from 'path';

export function getDbFilePath() {
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH.endsWith(".json")
      ? process.env.DATA_PATH
      : path.join(process.env.DATA_PATH, "db_sandbox.json");
  }
  if (process.env.NODE_ENV === "production") {
    return "/var/www/azed_data/db_sandbox.json";
  }
  return path.resolve(process.cwd(), "db_sandbox.json");
}

export async function migrateAllDocumentsToEssentiel() {
  console.log("🔄 Début de la mise à jour globale des autorisations de documents...");
  let modifiedCount = 0;

  // 1. Essai de migration MongoDB si configuré
  if (process.env.MONGODB_URI) {
    try {
      const { default: mongoose } = await import('mongoose');
      await mongoose.connect(process.env.MONGODB_URI);
      const DocumentModel = mongoose.models.Document || mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
      const result = await DocumentModel.updateMany(
        { allowedBadges: { $ne: "ESSENTIEL" } },
        { $addToSet: { allowedBadges: "ESSENTIEL", allowedTiers: "ESSENTIEL", targetTiers: "ESSENTIEL" } }
      );
      console.log(`✅ [MongoDB] Migration réussie ! ${result.modifiedCount || 0} documents mis à jour.`);
      modifiedCount += (result.modifiedCount || 0);
      await mongoose.connection.close();
    } catch (mongoErr) {
      console.warn("⚠️ [MongoDB] Pas de connexion Mongo active, mise à jour du stockage local...");
    }
  }

  // 2. Migration sur la base de données persistante JSON (db_sandbox.json)
  const dbFile = getDbFilePath();
  if (fs.existsSync(dbFile)) {
    try {
      const data = fs.readFileSync(dbFile, 'utf-8');
      const db = JSON.parse(data);
      if (Array.isArray(db.courses)) {
        let jsonModified = 0;
        db.courses.forEach((doc) => {
          let updated = false;

          // Normalisation allowedBadges
          if (!Array.isArray(doc.allowedBadges)) {
            doc.allowedBadges = doc.allowedBadges ? [doc.allowedBadges] : ["FREEMIUM"];
          }
          if (!doc.allowedBadges.includes("ESSENTIEL")) {
            doc.allowedBadges.push("ESSENTIEL");
            updated = true;
          }

          // Normalisation allowedTiers
          if (!Array.isArray(doc.allowedTiers)) {
            doc.allowedTiers = doc.allowedTiers ? [doc.allowedTiers] : ["FREEMIUM"];
          }
          if (!doc.allowedTiers.includes("ESSENTIEL")) {
            doc.allowedTiers.push("ESSENTIEL");
            updated = true;
          }

          // Normalisation targetTiers
          if (!Array.isArray(doc.targetTiers)) {
            doc.targetTiers = doc.targetTiers ? [doc.targetTiers] : ["FREEMIUM"];
          }
          if (!doc.targetTiers.includes("ESSENTIEL")) {
            doc.targetTiers.push("ESSENTIEL");
            updated = true;
          }

          // Normalisation target.userCategories
          if (!doc.target) doc.target = {};
          if (!Array.isArray(doc.target.userCategories)) {
            doc.target.userCategories = ["FREEMIUM"];
          }
          if (!doc.target.userCategories.includes("ESSENTIEL")) {
            doc.target.userCategories.push("ESSENTIEL");
            updated = true;
          }

          if (updated) jsonModified++;
        });

        if (jsonModified > 0) {
          fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
          console.log(`✅ [JSON DB] Migration réussie ! ${jsonModified} documents mis à jour avec le badge 'ESSENTIEL' dans ${dbFile}.`);
          modifiedCount += jsonModified;
        } else {
          console.log(`ℹ️ [JSON DB] Tous les documents (${db.courses.length}) possèdent déjà le badge 'ESSENTIEL'.`);
        }
      }
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour du fichier JSON :", err);
    }
  } else {
    console.log(`ℹ️ Aucun fichier ${dbFile} trouvé. La mise à jour sera appliquée automatiquement au démarrage.`);
  }

  console.log(`🏁 Fin de la migration : Total de documents mis à jour = ${modifiedCount}`);
  return modifiedCount;
}

// Auto-run if run directly via `node scripts/addEssentielToAllDocs.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllDocumentsToEssentiel()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
