import { TargetAudience } from '../types';
import { StudentTier } from '../types/access';

export interface IDocumentTarget {
  gradeLevels: string[];
  streams: string[];
  userCategories?: string[];
}

export interface IDocument {
  id: string;
  title: string;
  chapter?: string;
  module?: string;
  category?: string;
  contentType?: string;
  fileUrl?: string;
  fileFormat?: string;
  fileType?: string;
  target: IDocumentTarget;
  isPremium?: boolean;
  targetAudience?: string[];
  targetTiers?: StudentTier[] | string[];
  allowedTiers?: StudentTier[] | string[];
  attachmentName?: string;
  videoUrl?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
  duration?: string;
  grade?: string;
  section?: string;
  createdAt: string | Date;
}

/**
 * Standard Document model helper providing creation, normalization, and validation.
 */
export const DocumentModel = {
  create: async (data: Partial<IDocument> & { target?: any; gradeLevels?: any; streams?: any; gradeLevel?: any; stream?: any; section?: any; grade?: any; [key: string]: any }): Promise<IDocument> => {
    const rawGrades = data.target?.gradeLevels || data.selectedGrades || data.gradeLevels || data.grades || (data.gradeLevel ? [data.gradeLevel] : (data.grade ? [data.grade] : ["Tous les niveaux"]));
    const rawStreams = data.target?.streams || data.selectedStreams || data.streams || data.sections || (data.stream ? [data.stream] : (data.section ? [data.section] : ["Toutes les filières"]));

    const gradeLevels = Array.isArray(rawGrades)
      ? (rawGrades.includes("Tous") || rawGrades.includes("Tous les niveaux") ? ["Tous les niveaux"] : rawGrades)
      : [String(rawGrades || "Tous les niveaux")];

    const streams = Array.isArray(rawStreams)
      ? (rawStreams.includes("Tous") || rawStreams.includes("Toutes les filières") || rawStreams.includes("Toutes les sections") ? ["Toutes les filières"] : rawStreams)
      : [String(rawStreams || "Toutes les filières")];

    const userCategories = data.target?.userCategories || data.userCategories || data.allowedTiers || data.targetAudience || [];

    const target: IDocumentTarget = {
      gradeLevels,
      streams,
      userCategories
    };

    const doc: IDocument = {
      id: data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || "Nouveau Document",
      chapter: data.chapter || data.module || "Général",
      module: data.chapter || data.module || "Général",
      category: data.category || data.contentType || "course",
      contentType: data.category || data.contentType || "course",
      fileUrl: data.fileUrl || data.videoUrl || "",
      videoUrl: data.fileUrl || data.videoUrl || "",
      fileFormat: data.fileFormat || data.fileType || "pdf",
      fileType: data.fileFormat || data.fileType || "pdf",
      target,
      grade: gradeLevels.join(", "),
      section: streams.join(", "),
      isPremium: typeof data.isPremium === "boolean" ? data.isPremium : !userCategories.includes("FREEMIUM"),
      targetAudience: data.targetAudience || userCategories,
      targetTiers: data.targetTiers || userCategories,
      allowedTiers: data.allowedTiers || userCategories,
      attachmentName: data.attachmentName || data.filename || "",
      textContent: data.textContent || "",
      solutionCode: data.solutionCode || "",
      trimestre: data.trimestre || "1ere trimestre",
      duration: data.duration || "45 min",
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };

    return doc;
  }
};
