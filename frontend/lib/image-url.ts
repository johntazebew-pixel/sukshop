/**
 * Convert any image URL to a fully-qualified URL for display.
 * Handles:
 * - /uploads/... → http://localhost:3000/uploads/...
 * - http URLs → unchanged
 * - Empty → empty
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Get backend base URL (without /api)
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

  // Ensure single slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  return `${BACKEND_URL}${cleanPath}`;
}