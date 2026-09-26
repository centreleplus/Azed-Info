import React from "react";
import { Edit, Trash2, FileText, Download, ExternalLink } from "lucide-react";
import { PublicationDocument } from "../types";

export interface DocumentManagementCardProps {
  doc: PublicationDocument;
  onEdit?: (doc: PublicationDocument) => void;
  onDelete?: (id: string) => void;
  onDownload?: (doc: PublicationDocument) => void;
}

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

  const categoryLabel = doc.category || (doc.contentType === 'course' ? 'Fiches & cours' : doc.contentType === 'exercise' ? 'Devoirs & Exercices' : doc.contentType === 'exercise_corrected' ? 'Zone Correction' : doc.contentType === 'revision' ? 'Révision' : 'Fiches & cours');
  const formatLabel = doc.fileFormat || (doc.fileType ? doc.fileType.toUpperCase() : 'PDF');
  const trimesterLabel = doc.trimester || (doc.trimestre === 'revision' ? 'Période Révision' : doc.trimestre === '2eme trimestre' ? '2ème Trimestre' : doc.trimestre === '3eme trimestre' ? '3ème Trimestre' : '1er Trimestre');
  const accessLabel = doc.accessType || (doc.isPremium ? 'Premium' : 'Gratuit');
  const fileNameDisplay = doc.fileName || doc.attachmentName || (doc.fileUrl ? doc.fileUrl.split('/').pop() : '') || `${doc.title}.${formatLabel.toLowerCase()}`;
  const sectionPathDisplay = doc.metadata?.studentSectionPath || (
    categoryLabel.toLowerCase().includes('cours') || categoryLabel.toLowerCase().includes('fiche')
      ? "Espace Élève ➔ Apprentissage & Révisions ➔ Fiches & cours"
      : categoryLabel.toLowerCase().includes('correction')
      ? "Espace Élève ➔ Zone Correction"
      : categoryLabel.toLowerCase().includes('devoir') || categoryLabel.toLowerCase().includes('exercice')
      ? "Espace Élève ➔ Apprentissage & Révisions ➔ Devoirs & Exercices"
      : categoryLabel.toLowerCase().includes('quiz')
      ? "Espace Élève ➔ Quiz Interactifs"
      : "Espace Élève ➔ Apprentissage & Révisions"
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4 hover:shadow-md transition-all text-left">
      {/* En-tête : Badges dynamiques */}
      <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Badges Catégorie & Format */}
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded bg-indigo-900 text-white shadow-2xs">
            {categoryLabel}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700 border border-purple-200">
            {formatLabel.startsWith('.') ? formatLabel : `.${formatLabel.toLowerCase()}`}
          </span>

          {/* Badges Niveaux ciblés */}
          {gradeLevels.map((grade, idx) => (
            <span key={idx} className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
              {grade}
            </span>
          ))}

          {/* Badges Filières ciblées */}
          {streams.map((stream, idx) => (
            <span key={idx} className="px-2 py-1 text-xs font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stream}
            </span>
          ))}

          {/* Trimestre & Accès */}
          <span className="px-2 py-1 text-xs font-medium rounded bg-sky-100 text-sky-800 border border-sky-200">
            {trimesterLabel}
          </span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            accessLabel.toLowerCase().includes('prem')
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {accessLabel}
          </span>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(doc)}
              className="px-2.5 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Modifier ce document"
            >
              <Edit size={13} />
              <span>Modifier</span>
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
