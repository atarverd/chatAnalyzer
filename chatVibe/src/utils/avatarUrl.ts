/**
 * Processes avatar URL from API response
 * - If URL is full (starts with http:// or https://), returns as-is
 * - If URL is relative (starts with /), prepends base URL
 */
export function processAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) return undefined;
  
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  if (avatarUrl.startsWith('/')) {
    return `https://chatvibe.dategram.io${avatarUrl}`;
  }
  
  return avatarUrl;
}

