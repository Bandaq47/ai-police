import React from "react";

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let target = url.trim();

  // If user pasted an <iframe> snippet (e.g. from YouTube Share -> Embed)
  if (target.includes("<iframe") || target.includes("src=")) {
    const srcMatch = target.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      target = srcMatch[1];
    }
  }

  // If target is already an embed URL
  if (target.includes("youtube.com/embed/") || target.includes("youtube-nocookie.com/embed/")) {
    return target;
  }

  // Regex to extract 11-character YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = target.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}`;
  }

  // Fallback for valid URLs
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }

  return null;
}

export default function YouTubeEmbed({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-black my-3">
      <iframe
        src={embedUrl}
        title="YouTube Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
      />
    </div>
  );
}
