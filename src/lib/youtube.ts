/**
 * Utility functions for YouTube URL parsing, video ID extraction, and embed link generation.
 */

/**
 * Extracts a 11-character YouTube Video ID from various standard YouTube URL formats.
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&feature=shared
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?t=10
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-character Video ID
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Direct 11-character Video ID check (alphanumeric, underscores, hyphens)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Comprehensive Regex pattern for standard YouTube URL variations
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

/**
 * Generates a privacy-enhanced, distraction-minimized YouTube embed iframe URL.
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string | null | undefined): string | null {
  const videoId = extractYouTubeId(videoIdOrUrl);
  if (!videoId) return null;

  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&autoplay=0`;
}

/**
 * Generates a high-quality YouTube thumbnail image URL from a Video ID or URL.
 */
export function getYouTubeThumbnailUrl(videoIdOrUrl: string | null | undefined): string | null {
  const videoId = extractYouTubeId(videoIdOrUrl);
  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
