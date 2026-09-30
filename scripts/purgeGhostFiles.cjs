const fs = require('fs');
const path = require('path');

function getDbFilePath() {
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

async function purgeGhostData() {
  console.log("🧹 Début du nettoyage des fichiers fantômes et données de test...");
  let totalDeleted = 0;

  if (process.env.MONGODB_URI) {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI);
      const CourseModel = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
      const DocumentModel = mongoose.models.Document || mongoose.model('Document', new mongoose.Schema({}, { strict: false }));

      const deletedCourses = await CourseModel.deleteMany({
        $or: [
          { isDemo: true },
          { isMock: true },
          { title: { $regex: /Maîtriser les Structures/i } },
          { title: { $regex: /Test|Demo|Exemple/i } }
        ]
      });

      const deletedDocs = await DocumentModel.deleteMany({
        $or: [
          { isDemo: true },
          { isMock: true },
          { title: { $regex: /Test|Demo|Exemple/i } }
        ]
      });

      console.log(`✅ [MongoDB] ${deletedCourses.deletedCount || 0} cours fantômes supprimés.`);
      console.log(`✅ [MongoDB] ${deletedDocs.deletedCount || 0} documents fantômes supprimés.`);
      totalDeleted += (deletedCourses.deletedCount || 0) + (deletedDocs.deletedCount || 0);

      await mongoose.connection.close();
    } catch (err) {
      console.warn("⚠️ [MongoDB] Pas de connexion Mongo active, purge du stockage JSON...");
    }
  }

  const dbFile = getDbFilePath();
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const db = JSON.parse(raw);
      let initialCount = 0;
      let finalCount = 0;

      if (Array.isArray(db.courses)) {
        initialCount = db.courses.length;
        db.courses = db.courses.filter((course) => {
          if (!course) return false;
          if (course.isDemo === true || course.isMock === true) return false;
          const title = (course.title || "").toLowerCase();
          if (title.includes("maîtriser les structures") || title.includes("maitriser les structures")) return false;
          return true;
        });
        finalCount = db.courses.length;
        const deleted = initialCount - finalCount;
        if (deleted > 0) {
          fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
          console.log(`✅ [JSON DB] ${deleted} cours/documents fantômes supprimés dans ${dbFile}.`);
          totalDeleted += deleted;
        } else {
          console.log(`ℹ️ [JSON DB] Aucun cours fantôme détecté (catalogue propre : ${finalCount} documents).`);
        }
      }
    } catch (err) {
      console.error("❌ Erreur pendant le nettoyage JSON :", err);
    }
  } else {
    console.log(`ℹ️ Aucun fichier ${dbFile} trouvé.`);
  }

  console.log(`🏁 Fin du nettoyage : Total d'éléments purgés = ${totalDeleted}`);
  return totalDeleted;
}

if (require.main === module) {
  purgeGhostData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { purgeGhostData };
