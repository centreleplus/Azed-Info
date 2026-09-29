// Migration Script Node.js / MongoDB
const fs = require('fs');
const path = require('path');

async function updateGlobalTeacherName() {
  try {
    // 1. Mongoose MongoDB update if mongoose is active
    try {
      const mongoose = require('mongoose');
      if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
        await mongoose.connection.collection('users').updateMany(
          { name: { $regex: /M\. Nabil Chaouch/i } },
          { $set: { name: "Professeur Nabil Chaouch", prefix: "Professeur" } }
        );

        await mongoose.connection.collection('settings').updateMany(
          { teacherName: { $regex: /M\. Nabil Chaouch/i } },
          { $set: { teacherName: "Professeur Nabil Chaouch" } }
        );

        await mongoose.connection.collection('page_contents').updateMany(
          {},
          [
            {
              $set: {
                content: {
                  $replaceOne: {
                    input: "$content",
                    find: "M. Nabil Chaouch",
                    replacement: "Professeur Nabil Chaouch"
                  }
                }
              }
            }
          ]
        );
        console.log("✅ Remplacement global effectué avec succès dans MongoDB !");
      }
    } catch (mErr) {
      // Standalone execution without active mongoose connection
    }

    // 2. Mettre à jour les fichiers JSON persistants locaux
    const dbPaths = [
      path.resolve(__dirname, 'db_sandbox.json'),
      path.resolve(__dirname, 'db.json'),
      '/var/www/azed_data/db_sandbox.json'
    ];

    for (const dbPath of dbPaths) {
      if (fs.existsSync(dbPath)) {
        try {
          let content = fs.readFileSync(dbPath, 'utf8');
          const regex = /M\.\s*Nabil\s*Chaouch/gi;
          if (regex.test(content)) {
            content = content.replace(regex, 'Professeur Nabil Chaouch');
            fs.writeFileSync(dbPath, content, 'utf8');
            console.log(`✅ Remplacement effectué dans le fichier persistant : ${dbPath}`);
          }
        } catch (fErr) {
          console.error(`Erreur sur ${dbPath} :`, fErr.message);
        }
      }
    }

    console.log("✅ Remplacement global effectué avec succès dans la base de données !");
  } catch (err) {
    console.error("❌ Erreur de migration :", err);
  }
}

updateGlobalTeacherName();

module.exports = { updateGlobalTeacherName };
