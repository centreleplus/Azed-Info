/**
 * Script de purge globale du calendrier et des données fictives.
 * Supporte MongoDB et la base de données JSON persistante.
 */

import fs from 'fs';
import path from 'path';

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

export async function purgeAllCalendarData() {
  console.log("🧹 Début de la purge globale du calendrier et des données fictives...");
  let totalPurged = 0;

  // 1. Purge MongoDB si disponible
  if (process.env.MONGODB_URI) {
    try {
      const { default: mongoose } = await import('mongoose');
      await mongoose.connect(process.env.MONGODB_URI);
      const EventModel = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
      const CalendarModel = mongoose.models.Calendar || mongoose.model('Calendar', new mongoose.Schema({}, { strict: false }));
      const ScheduleModel = mongoose.models.Schedule || mongoose.model('Schedule', new mongoose.Schema({}, { strict: false }));

      const deletedEvents = await EventModel.deleteMany({});
      const deletedCalendars = await CalendarModel.deleteMany({});
      const deletedSchedules = await ScheduleModel.deleteMany({});

      if (mongoose.connection.models.Document) {
        await mongoose.connection.models.Document.deleteMany({ isDemo: true });
      }

      console.log(`✅ [MongoDB] ${deletedEvents.deletedCount || 0} événements supprimés.`);
      console.log(`✅ [MongoDB] ${deletedCalendars.deletedCount || 0} calendriers réinitialisés.`);
      console.log(`✅ [MongoDB] ${deletedSchedules.deletedCount || 0} plannings supprimés.`);
      totalPurged += (deletedEvents.deletedCount || 0) + (deletedCalendars.deletedCount || 0) + (deletedSchedules.deletedCount || 0);

      await mongoose.connection.close();
    } catch (err) {
      console.warn("⚠️ [MongoDB] Pas de connexion Mongo active, purge du fichier JSON...");
    }
  }

  // 2. Purge dans la base de données JSON persistante (db_sandbox.json)
  const dbFile = getDbFilePath();
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const db = JSON.parse(raw);
      const eventsCount = Array.isArray(db.events) ? db.events.length : 0;
      const todoCount = Array.isArray(db.todoEvents) ? db.todoEvents.length : 0;

      db.events = [];
      db.todoEvents = [];

      // Nettoyer aussi les notifications de type live/rappel fictif
      if (Array.isArray(db.notifications)) {
        db.notifications = db.notifications.filter((n) => {
          const type = (n.type || "").toUpperCase();
          return type !== "LIVE" && type !== "EVENT" && type !== "LIVE_SESSION";
        });
      }

      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
      console.log(`✅ [JSON DB] ${eventsCount} événements et ${todoCount} tâches de calendrier purgés dans ${dbFile}.`);
      totalPurged += eventsCount + todoCount;
    } catch (err) {
      console.error("❌ Erreur lors de la purge du fichier JSON :", err);
    }
  } else {
    console.log(`ℹ️ Aucun fichier ${dbFile} trouvé.`);
  }

  console.log(`🚀 Purge terminée avec succès ! Le calendrier est désormais 100% vierge (${totalPurged} éléments effacés).`);
  return totalPurged;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  purgeAllCalendarData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
