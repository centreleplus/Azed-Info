import React, { useEffect } from "react";
import ExerciceDetailModal, { ExerciseItem } from "./ExerciceDetailModal";

interface DocumentViewerModalProps {
  document: ExerciseItem;
  onClose: () => void;
  isPremiumUser?: boolean;
  userRole?: string;
  onGoToShop?: () => void;
}

export default function DocumentViewerModal({
  document,
  onClose,
  isPremiumUser = false,
  userRole = "student",
  onGoToShop
}: DocumentViewerModalProps) {
  const fileName = document.filename || document.attachmentName || "";
  const fileUrl = document.fileUrl || document.videoUrl || "";
  const fileType = document.fileType || "";

  const isPythonFile =
    fileName.toLowerCase().endsWith(".py") ||
    fileUrl.toLowerCase().endsWith(".py") ||
    fileType === "py";

  const isTxtFile =
    fileName.toLowerCase().endsWith(".txt") ||
    fileUrl.toLowerCase().endsWith(".txt") ||
    fileType === "txt";

  const isImageFile =
    fileName.toLowerCase().endsWith(".png") ||
    fileName.toLowerCase().endsWith(".jpg") ||
    fileName.toLowerCase().endsWith(".jpeg") ||
    fileUrl.toLowerCase().endsWith(".png") ||
    fileUrl.toLowerCase().endsWith(".jpg") ||
    fileUrl.toLowerCase().endsWith(".jpeg") ||
    ["png", "jpg", "jpeg"].includes(fileType.toLowerCase());

  const imageExt = ["png", "jpg", "jpeg"].find(ext => 
    fileName.toLowerCase().endsWith("." + ext) || 
    fileUrl.toLowerCase().endsWith("." + ext) || 
    fileType.toLowerCase() === ext
  ) || "png";

  const isUnlocked = !document.isPremium || isPremiumUser || userRole !== "student";

  useEffect(() => {
    if ((isPythonFile || isTxtFile || isImageFile) && isUnlocked) {
      window.dispatchEvent(new CustomEvent("open-document-viewer", { detail: { ...document, fileType: isImageFile ? imageExt : isPythonFile ? "py" : "txt" } }));
      if (isPythonFile) {
        window.dispatchEvent(new CustomEvent("open-python-code-viewer", { detail: document }));
      } else if (isTxtFile) {
        window.dispatchEvent(new CustomEvent("open-txt-document-viewer", { detail: document }));
      }
      window.location.hash = `#/student/viewer/${document.id}`;
      onClose();
    }
  }, [isPythonFile, isTxtFile, isImageFile, imageExt, isUnlocked, document, onClose]);

  if ((isPythonFile || isTxtFile || isImageFile) && isUnlocked) {
    return null;
  }

  return (
    <ExerciceDetailModal
      exercise={document}
      onClose={onClose}
      isPremiumUser={isPremiumUser}
      userRole={userRole}
      onGoToShop={onGoToShop}
    />
  );
}
