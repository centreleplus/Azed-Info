import { ExerciseItem } from "../components/ExerciceDetailModal";

export interface ViewableResource {
  id: string;
  title: string;
  module?: string;
  sectionCategory?: string; // ex: "Fiches & Cours", "Devoir", "Correction", "Révision"
  file_url?: string;
  fileUrl?: string;
  content?: string;
  description?: string;
  textContent?: string;
  solutionCode?: string;
  attachmentName?: string;
  filename?: string;
  fileType?: string;
  type?: string;
  isPremium?: boolean;
}

export const useDocumentViewer = () => {
  const openDocument = (resource: ViewableResource): boolean => {
    const url = resource.file_url || resource.fileUrl || "";
    const title = resource.title || resource.filename || resource.attachmentName || "";
    const fileType = resource.fileType || "";

    const isImg = 
      ["png", "jpg", "jpeg"].includes(fileType.toLowerCase()) ||
      url.toLowerCase().endsWith(".png") ||
      url.toLowerCase().endsWith(".jpg") ||
      url.toLowerCase().endsWith(".jpeg") ||
      title.toLowerCase().endsWith(".png") ||
      title.toLowerCase().endsWith(".jpg") ||
      title.toLowerCase().endsWith(".jpeg");

    const imgExt = ["png", "jpg", "jpeg"].find(e => 
      url.toLowerCase().endsWith("." + e) || 
      title.toLowerCase().endsWith("." + e) || 
      fileType.toLowerCase() === e
    ) || "png";

    const isPy = url.toLowerCase().endsWith(".py") || title.toLowerCase().endsWith(".py") || fileType === "py";
    const isTxt = url.toLowerCase().endsWith(".txt") || title.toLowerCase().endsWith(".txt") || fileType === "txt";

    if (isPy || isTxt || isImg) {
      const detail: ExerciseItem = {
        id: resource.id,
        title: resource.title || "Document Pédagogique",
        filename: resource.filename || resource.attachmentName || (isImg ? `image.${imgExt}` : isPy ? "exercice.py" : "document.txt"),
        attachmentName: resource.attachmentName || resource.filename,
        fileUrl: url,
        fileType: isImg ? imgExt : isPy ? "py" : "txt",
        textContent: resource.textContent || resource.content || resource.description || resource.solutionCode,
        solutionCode: resource.solutionCode || resource.content || resource.textContent,
        description: resource.description || resource.content,
        type: resource.type || resource.module || "Général",
        isPremium: resource.isPremium
      };

      // Dispatch event to App.tsx listeners
      window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
      if (isPy) {
        window.dispatchEvent(new CustomEvent("open-python-code-viewer", { detail }));
      } else if (isTxt) {
        window.dispatchEvent(new CustomEvent("open-txt-document-viewer", { detail }));
      }
      
      window.location.hash = `#/student/viewer/${resource.id}`;
      return true;
    }

    return false;
  };

  return { openDocument };
};

export default useDocumentViewer;
