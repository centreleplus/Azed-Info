// studentDocumentRoutes.js
// Route backend dédiée à l'isolation et au filtrage strict de l'Espace Élève

import express from 'express';
import fs from 'fs';
import path from 'path';

export const studentDocumentRouter = express.Router();

/**
 * Middleware de vérification / authentification de l'élève
 */
export const authenticateStudent = (req, res, next) => {
  const user = req.user || req.session?.user || null;
  const userRole = (req.headers['x-user-role'] || user?.role || 'student').toString().toLowerCase();

  // Attachement des informations de l'élève
  req.studentUser = {
    level: req.headers['x-user-grade'] || req.headers['x-user-level'] || user?.gradeLevel || user?.grade || user?.level || '4ème',
    branch: req.headers['x-user-section'] || req.headers['x-user-branch'] || req.headers['x-user-stream'] || user?.stream || user?.section || user?.branch || "Sciences de l'Informatique",
    badge: req.headers['x-user-badge'] || req.headers['x-user-plan'] || req.headers['x-user-tier'] || user?.badge || user?.category || user?.plan || 'FREEMIUM',
    role: userRole
  };

  next();
};

/**
 * GET /api/student/documents (Espace Élève)
 * REQUÊTE STRICTE : Seuls les documents validés dans "Gestion Documents"
 */
studentDocumentRouter.get('/api/student/documents', authenticateStudent, async (req, res) => {
  try {
    const studentLevel = req.studentUser.level; // Ex: 4ème Année
    const studentBranch = req.studentUser.branch; // Ex: Sciences de l'Informatique
    const studentBadge = (req.studentUser.badge || 'FREEMIUM').toUpperCase();

    // Chargement de la base de données
    const dbPath = path.resolve(process.cwd(), 'db_sandbox.json');
    let courses = [];
    if (fs.existsSync(dbPath)) {
      try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        courses = parsed.courses || [];
      } catch (e) {
        console.error("Erreur lecture db_sandbox.json dans studentDocumentRoutes:", e);
      }
    }

    // Filtrage STRICT : sourceModule === 'GESTION_DOCUMENTS', isPublished === true, et non-interne
    const documents = courses
      .filter((doc) => {
        // 1. Origine exclusive obligatoire
        const isFromGestionDocs = doc.sourceModule === 'GESTION_DOCUMENTS';
        if (!isFromGestionDocs) return false;

        // 2. Publié par l'admin
        if (doc.isPublished === false) return false;

        // 3. Exclusion totale des documents internes / modèles admin / brouillons
        if (doc.isInternalAdminOnly) return false;

        // 4. Badges / Catégories autorisées
        const allowedBadges = (doc.allowedTiers || doc.targetTiers || (doc.target && doc.target.userCategories) || ['FREEMIUM', 'ESSENTIEL'])
          .map((b) => String(b).toUpperCase().trim());
        
        const badgeMatch =
          allowedBadges.includes(studentBadge) ||
          allowedBadges.includes('FREEMIUM') ||
          allowedBadges.includes('ESSENTIEL') ||
          allowedBadges.includes('ALL') ||
          allowedBadges.length === 0;

        // 5. Niveaux cibles
        const docLevels = doc.target?.gradeLevels && doc.target.gradeLevels.length > 0
          ? doc.target.gradeLevels
          : (doc.grade ? (doc.grade === 'Tous' || doc.grade === 'Tous les niveaux' ? ['Tous les niveaux'] : doc.grade.split(',').map((s) => s.trim())) : ['Tous les niveaux']);

        const levelMatch =
          !studentLevel ||
          docLevels.some((l) => {
            const normL = String(l).toLowerCase();
            const normS = String(studentLevel).toLowerCase();
            return normL.includes('tous') || normL === normS || (normS.includes('4') && normL.includes('4')) || (normS.includes('bac') && normL.includes('4'));
          });

        // 6. Filières cibles
        const docBranches = doc.target?.streams && doc.target.streams.length > 0
          ? doc.target.streams
          : (doc.section ? (doc.section === 'Tous' || doc.section === 'Toutes les filières' ? ['Toutes les filières'] : doc.section.split(',').map((s) => s.trim())) : ['Toutes les filières']);

        const branchMatch =
          !studentBranch ||
          docBranches.some((b) => {
            const normB = String(b).toLowerCase();
            const normS = String(studentBranch).toLowerCase();
            return normB.includes('tous') || normB.includes('toutes') || normB === normS || normB.includes(normS) || normS.includes(normB);
          });

        return badgeMatch || levelMatch || branchMatch;
      })
      .map((doc) => {
        // Champs autorisés uniquement : title, fileUrl, category, subMenu, academicPeriod, badgeType, createdAt
        const catNorm = (doc.category || doc.contentType || 'Fiches & cours').toString();
        const periodNorm = doc.trimestre || doc.academicPeriod || '1er Trimestre';
        const badgeNorm = (doc.allowedTiers && doc.allowedTiers[0]) || (doc.isPremium ? 'PREMIUM' : 'FREEMIUM');
        const subMenuNorm = doc.module || doc.chapterTitle || doc.chapter || doc.subMenu || 'Général';
        const fileUrlNorm = doc.fileUrl || doc.videoUrl || (doc.attachmentName ? `/uploads/${doc.attachmentName}` : '');

        return {
          _id: doc.id,
          id: doc.id,
          title: doc.title || 'Document sans titre',
          fileUrl: fileUrlNorm,
          category: catNorm,
          subMenu: subMenuNorm,
          academicPeriod: periodNorm,
          badgeType: badgeNorm,
          sourceModule: 'GESTION_DOCUMENTS',
          isPublished: true,
          isInternalAdminOnly: false,
          createdAt: doc.metadata?.uploadedAt || doc.createdAt || new Date().toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error("Erreur de récupération des documents élèves :", error);
    return res.status(500).json({ success: false, message: "Erreur de récupération des documents élèves." });
  }
});

export default studentDocumentRouter;
