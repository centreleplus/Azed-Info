import React from "react";
import { Edit, Trash2, FileText, Download, ExternalLink } from "lucide-react";
import { PublicationDocument } from "../types";
import { UniversalBadge } from "./UniversalBadge";

export interface DocumentManagementCardProps {
  doc: PublicationDocument;
  onEdit?: (doc: PublicationDocument) => void;
  onDelete?: (id: string) => void;
  onDownload?: (doc: PublicationDocument) => void;
}

export const getCategoryStyle = (category: string) => {
  const norm = (category || "").toLowerCase().trim();
  switch (norm) {
    case 'devoirs & exercices':
    case 'devoir':
    case 'exercice':
    case 'exercise':
    case 'devoirs_exercices_fiches_cours':
      return 'bg-emerald-700 text-white';
    case 'zone correction':
    case 'correction':
    case 'exercise_corrected':
      return 'bg-rose-700 text-white';
    case 'révision (live énoncé / replay)':
    case 'révision':
    case 'revision':
    case 'révision & examens':
      return 'bg-amber-600 text-white';
    case 'quiz interactifs':
    case 'quiz':
      return 'bg-purple-700 text-white';
    case 'fiches & cours':
    case 'course':
    default:
      if (norm.includes('correction')) return 'bg-rose-700 text-white';
      if (norm.includes('devoir') || norm.includes('exercice')) return 'bg-emerald-700 text-white';
      if (norm.includes('revision') || norm.includes('live')) return 'bg-amber-600 text-white';
      if (norm.includes('quiz')) return 'bg-purple-700 text-white';
      return 'bg-indigo-900 text-white';
  }
};

export const getCategoryDisplayName = (category: string) => {
  const norm = (category || "").toLowerCase().trim();
  if (norm === 'zone correction' || norm === 'exercise_corrected' || norm.includes('correction')) {
    return 'ZONE CORRECTION';
  }
  if (norm === 'devoirs & exercices' || norm === 'exercise' || norm.includes('devoir') || norm.includes('exercice') || norm === 'devoirs_exercices_fiches_cours') {
    return 'DEVOIRS & EXERCICES';
  }
  if (norm.includes('revision') || norm.includes('live') || norm.includes('examen')) {
    return 'RÉVISION (LIVE ÉNONCÉ / REPLAY)';
  }
  if (norm.includes('quiz')) {
    return 'QUIZ INTERACTIFS';
  }
  return 'FICHES & COURS';
};

export const DocumentManagementCard: React.FC<DocumentManagementCardProps> = ({
  doc,
  onEdit,
  onDelete,
  onDownload
}) => {
  const formattedDate = doc.metadata?.uploadedAt 
    ? new Date(doc.metadata.uploadedAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const gradeLevels = doc.target?.gradeLevels && doc.target.gradeLevels.length > 0
    ? doc.target.gradeLevels
    : [doc.grade || "Tous les niveaux"];

  const streams = doc.target?.streams && doc.target.streams.length > 0
    ? doc.target.streams
    : [doc.section || "Toutes les filières"];

  const rawCat = doc.category || (doc.contentType === 'course' ? 'Fiches & cours' : doc.contentType === 'exercise' ? 'Devoirs & Exercices' : doc.contentType === 'exercise_corrected' ? 'Zone Correction' : doc.contentType === 'revision' ? 'Révision' : 'Fiches & cours');
  const formatLabel = doc.fileFormat || (doc.fileType ? doc.fileType.toUpperCase() : 'PDF');
  const trimesterLabel = doc.trimester || (doc.trimestre === 'revision' ? 'Période Révision' : doc.trimestre === '2eme trimestre' ? '2ème Trimestre' : doc.trimestre === '3eme trimestre' ? '3ème Trimestre' : '1er Trimestre');
  const accessLabel = doc.accessType || (doc.isPremium ? 'Premium' : 'Gratuit');
  const fileNameDisplay = doc.fileName || doc.attachmentName || (doc.fileUrl ? doc.fileUrl.split('/').pop() : '') || `${doc.title}.${formatLabel.toLowerCase()}`;
  const sectionPathDisplay = doc.metadata?.studentSectionPath || (
    rawCat.toLowerCase().includes('cours') || rawCat.toLowerCase().includes('fiche')
      ? "Espace Élève ➔ Apprentissage & Révisions ➔ Fiches & cours"
      : rawCat.toLowerCase().includes('correction')
      ? "Espace Élève ➔ Zone Correction"
      : rawCat.toLowerCase().includes('devoir') || rawCat.toLowerCase().includes('exercice')
      ? "Espace Élève ➔ Apprentissage & Révisions ➔ Devoirs & Exercices"
      : rawCat.toLowerCase().includes('quiz')
      ? "Espace Élève ➔ Quiz Interactifs"
      : "Espace Élève ➔ Apprentissage & Révisions"
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4 hover:shadow-md transition-all text-left">
      {/* En-tête : Ensemble complet des badges dynamiques */}
      <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* 1. Badge Catégorie Réelle */}
          <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${getCategoryStyle(doc.category || rawCat)} shadow-2xs`}>
            {getCategoryDisplayName(doc.category || rawCat)}
          </span>

          {/* 2. Badge Format de Fichier */}
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">
            .{doc.fileFormat?.toLowerCase() || (formatLabel.startsWith('.') ? formatLabel.slice(1).toLowerCase() : formatLabel.toLowerCase())}
          </span>

          {/* 3. Badges Niveaux ciblés */}
          {gradeLevels.map((grade: string, i: number) => (
            <span key={`grade-${i}`} className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
              {grade}
            </span>
          ))}

          {/* 4. Badges Filières ciblées */}
          {streams.map((stream: string, i: number) => (
            <span key={`stream-${i}`} className="px-2 py-1 text-xs font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stream}
            </span>
          ))}

          {/* 5. Trimestre & Accès */}
          {trimesterLabel && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-sky-100 text-sky-800">
              {doc.trimester || trimesterLabel}
            </span>
          )}

          {/* 🔴 RENDU DES BADGES DE TARIFS MULTIPLES CÔTE À CÔTE */}
          {(() => {
            const badgesToRender: string[] = Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0
              ? doc.allowedBadges
              : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
              ? doc.allowedTiers
              : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
              ? doc.accessTiers
              : Array.isArray((doc as any).tiers) && (doc as any).tiers.length > 0
              ? (doc as any).tiers
              : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
              ? doc.targetTiers
              : ['FREEMIUM'];

            return (
              <div className="flex flex-wrap items-center gap-1.5 my-2">
                {badgesToRender.map((tier: string) => {
                  const normalized = (tier || '').toUpperCase().trim();
                  return (
                    <span
                      key={tier}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                        normalized === 'FREEMIUM'
                          ? 'bg-gray-200 text-gray-800 border border-gray-300'
                          : normalized === 'ESSENTIEL'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : normalized === 'LIVE +' || normalized === 'LIVE+'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : normalized === 'RÉVISION +' || normalized === 'REVISION +' || normalized === 'REVISION+'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200' // INTÉGRALE
                      }`}
                    >
                      {tier}
                    </span>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('zed_editing_doc', JSON.stringify(doc));
                } catch (e) {}
                onEdit(doc);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition cursor-pointer"
              title="Modifier ce document"
            >
              <span>✏️ Modifier</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(doc.id)}
              className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Supprimer ce document"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Corps de la carte */}
      <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">
        {doc.title || doc.chapterTitle}
      </h3>
      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
        <span>Support :</span>
        <span className="font-mono text-gray-700 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
          {fileNameDisplay}
        </span>
        {doc.fileUrl && (
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-0.5 ml-1"
            title="Consulter le fichier"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </p>

      {/* Pied de carte : Horodatage et Emplacement de destination */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            📅 Mis en ligne le : <strong className="text-gray-700 font-semibold">{formattedDate}</strong>
          </span>
          <span className="flex items-center gap-1">
            📍 Section Élève : <strong className="text-indigo-600 font-bold">{sectionPathDisplay}</strong>
          </span>
        </div>
        {doc.metadata?.downloadsCount !== undefined && (
          <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium border border-gray-200 text-xs">
            📥 {doc.metadata.downloadsCount} téléchargements
          </span>
        )}
      </div>
    </div>
  );
};

export const DocumentCard = DocumentManagementCard;
export default DocumentManagementCard;
