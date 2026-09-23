/**
 * YouTube & Date utilities for AI POLICE News system
 */

export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  let target = url.trim();

  // If user pasted an <iframe> snippet (e.g. from YouTube Share -> Embed)
  if (target.includes("<iframe") || target.includes("src=")) {
    const srcMatch = target.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      target = srcMatch[1];
    }
  }

  // Parse standard URLs
  try {
    if (target.startsWith("http://") || target.startsWith("https://")) {
      const parsed = new URL(target);
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      // check youtu.be short link: https://youtu.be/VIDEO_ID
      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0];
        if (id && id.length === 11) return id;
      }

      // check /embed/ID, /shorts/ID, /live/ID, /v/ID
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      for (let i = 0; i < pathParts.length; i++) {
        if (["embed", "shorts", "live", "v", "e"].includes(pathParts[i]) && pathParts[i + 1]) {
          const possibleId = pathParts[i + 1].substring(0, 11);
          if (possibleId.length === 11) return possibleId;
        }
      }
    }
  } catch {
    // continue to regex
  }

  // Comprehensive Regex fallback for any YouTube link string
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = target.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(url?: string | null, autoplay = true): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  // Use official youtube.com embed with autoplay and full permissions
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`;
}

export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  // Standard HQ thumbnail that always exists for all YouTube videos
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Extracts a YouTube URL from an item by checking youtube_url, url, or body text
 */
export function extractYouTubeUrl(item?: { youtube_url?: string; url?: string; body?: string } | null): string | null {
  if (!item) return null;
  if (item.youtube_url && getYouTubeVideoId(item.youtube_url)) {
    return item.youtube_url;
  }
  if (item.url && getYouTubeVideoId(item.url)) {
    return item.url;
  }
  if (item.body) {
    const urlMatch = item.body.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatch) {
      for (const u of urlMatch) {
        if (getYouTubeVideoId(u)) return u;
      }
    }
  }
  return null;
}

/**
 * Format date to Thai short format like: "05 ก.ค. 69"
 */
export function formatThaiShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const month = thaiMonths[d.getMonth()];
    const yearShort = String((d.getFullYear() + 543) % 100).padStart(2, "0");
    return `${day} ${month} ${yearShort}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns clean body text without raw trailing URLs
 */
export function cleanBodyText(body?: string | null): string {
  if (!body) return "";
  return body
    .replace(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s]+)/gi, "")
    .replace(/(https?:\/\/[^\s]+)/gi, "")
    .trim();
}

/**
 * Returns a stable pseudo-views count based on ID string
 */
export function getViewsCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 250) + 42;
}
