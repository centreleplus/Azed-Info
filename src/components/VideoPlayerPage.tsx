import React from "react";
import DocumentViewerPage from "./DocumentViewerPage";
import { ExerciseItem } from "./ExerciceDetailModal";

interface VideoPlayerPageProps {
  exercise?: ExerciseItem | null;
  resourceId?: string;
  onBack: () => void;
  isPremiumUser?: boolean;
}

export const VideoPlayerPage: React.FC<VideoPlayerPageProps> = (props) => {
  return <DocumentViewerPage {...props} />;
};

export default VideoPlayerPage;
