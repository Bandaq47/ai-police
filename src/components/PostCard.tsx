"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { PostWithDetails } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
  Send,
  Loader2,
  X,
  ShieldCheck,
  Check,
  MoreHorizontal
} from "lucide-react";

interface PostCardProps {
  post: PostWithDetails;
  onImageClick?: (url: string) => void;
}

// Format time in Instagram style (e.g., "19 ชม.", "5 นาที", "2 วัน")
function formatIgTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "เมื่อสักครู่";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาที`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ชม.`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays} วัน`;
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, onImageClick }: PostCardProps) {
  const { user, likePost, unlikePost, addComment, deletePost, deleteComment } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const isOwner = user?.id === post.user_id;
  const isAdmin = user?.role === "admin";
  const canDelete = isOwner || isAdmin;
  const authorName = `${post.profiles?.rank ? post.profiles.rank + " " : ""}${post.profiles?.full_name || "ตำรวจผู้เข้าอบรม"}`;
  const authorInitial = post.profiles?.full_name?.charAt(0) || "ต";

  // Double-tap image handler (Instagram signature interaction)
  const lastTapRef = useRef<number>(0);
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected!
      if (!post.is_liked) {
        handleLike();
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      lastTapRef.current = now;
      // Single tap -> open lightbox after short delay if not double tapped
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 290) {
          if (post.image_url) onImageClick?.(post.image_url);
        }
      }, 300);
    }
  };

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    if (post.is_liked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
    setLikeLoading(false);
  };

  const handleComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    const ok = await addComment(post.id, commentText.trim());
    if (ok) {
      setCommentText("");
      setShowAllComments(true);
    }
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    await deletePost(post.id);
    setConfirmDelete(false);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Likes text calculation matching Instagram screenshot
  const renderLikedByText = () => {
    const count = post.like_count || 0;
    if (count === 0) return null;

    const likesList = post.post_likes || [];
    const likedByMe = post.is_liked;

    if (likedByMe) {
      if (count === 1) {
        return (
          <span>
            ถูกใจโดย <strong className="font-semibold text-slate-800">คุณ</strong>
          </span>
        );
      }
      return (
        <span>
          ถูกใจโดย <strong className="font-semibold text-slate-800">คุณ</strong> และคนอื่นๆ อีก{" "}
          <strong className="font-semibold text-slate-800">{count - 1} คน</strong>
        </span>
      );
    }

    // Try finding someone from likes list
    const firstOther = likesList.find((l) => l.user_id !== user?.id && l.profiles?.full_name);
    if (firstOther && firstOther.profiles?.full_name) {
      const name = `${firstOther.profiles.rank ? firstOther.profiles.rank + " " : ""}${firstOther.profiles.full_name}`;
      if (count === 1) {
        return (
          <span>
            ถูกใจโดย <strong className="font-semibold text-slate-800">{name}</strong>
          </span>
        );
      }
      return (
        <span>
          ถูกใจโดย <strong className="font-semibold text-slate-800">{name}</strong> และคนอื่นๆ อีก{" "}
          <strong className="font-semibold text-slate-800">{count - 1} คน</strong>
        </span>
      );
    }

    return (
      <span>
        ถูกใจ <strong className="font-semibold text-slate-800">{count.toLocaleString()} คน</strong>
      </span>
    );
  };

  const comments = post.post_comments || [];
  const visibleComments = showAllComments ? comments : comments.slice(-2);

  // Content clamp check
  const isLongText = (post.content || "").length > 180;
  const displayContent = isLongText && !isTextExpanded
    ? post.content.slice(0, 180) + "..."
    : post.content;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* ── 1. Header (Instagram Style) ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with IG-like ring */}
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#661D27] via-rose-600 to-amber-500 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {authorInitial}
              </div>
            </div>
          </div>

          {/* User metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900 truncate tracking-tight">
                {authorName}
              </span>
              <span title="ข้าราชการตำรวจ">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </span>
              <span className="text-xs text-slate-400 font-normal">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {formatIgTime(post.created_at)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {post.profiles?.unit || "ตำรวจภูธรจังหวัดสุราษฎร์ธานี"}
            </p>
          </div>
        </div>

        {/* Action / Delete Menu */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {canDelete && (
            <div>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="ลบโพสต์"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1 text-xs">
                  <span className="text-red-600 font-medium">ลบ?</span>
                  <button
                    onClick={handleDelete}
                    className="font-bold text-red-600 hover:underline"
                  >
                    ยืนยัน
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-400 hover:text-slate-600 ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Post Media (Image) ── */}
      {post.image_url && (
        <div className="relative w-full bg-slate-950 overflow-hidden select-none group cursor-pointer">
          <div
            className="w-full flex items-center justify-center max-h-[540px] bg-slate-900/50"
            onClick={handleImageTap}
          >
            <img
              src={post.image_url}
              alt="Post media"
              className="w-full h-auto max-h-[540px] object-contain group-hover:brightness-[0.98] transition-all"
              loading="lazy"
            />
          </div>

          {/* Double-tap Floating Heart Animation */}
          <AnimatePresence>
            {showHeartBurst && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 0] }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl"
              >
                <Heart className="w-24 h-24 text-white fill-red-500 stroke-white stroke-[1.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── 3. Action Toolbar (Like, Comment, Share, Bookmark) ── */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center gap-1.5 text-slate-700 hover:text-red-500 transition-colors group focus:outline-none"
            aria-label="ถูกใจ"
          >
            <motion.div
              whileTap={{ scale: 1.35 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  post.is_liked
                    ? "text-red-500 fill-red-500 scale-105"
                    : "text-slate-700 group-hover:text-red-500 group-hover:scale-110"
                }`}
              />
            </motion.div>
            {(post.like_count || 0) > 0 && (
              <span className={`text-xs font-semibold ${post.is_liked ? "text-red-500" : "text-slate-700"}`}>
                {post.like_count}
              </span>
            )}
          </button>

          {/* Comment Button */}
          <button
            onClick={() => commentInputRef.current?.focus()}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-500 transition-colors group focus:outline-none"
            aria-label="ความคิดเห็น"
          >
            <MessageCircle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
            {comments.length > 0 && (
              <span className="text-xs font-semibold text-slate-700">
                {comments.length}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="text-slate-700 hover:text-[#661D27] transition-colors group focus:outline-none relative"
            title="แชร์ / คัดลอกลิงก์"
            aria-label="แชร์"
          >
            {copied ? (
              <Check className="w-5.5 h-5.5 text-emerald-600" />
            ) : (
              <Share2 className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
            )}
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                คัดลอกลิงก์แล้ว
              </span>
            )}
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="text-slate-700 hover:text-amber-500 transition-colors focus:outline-none"
          title="บันทึกโพสต์"
        >
          <Bookmark
            className={`w-6 h-6 transition-all ${
              isBookmarked ? "text-amber-500 fill-amber-500" : "hover:scale-110"
            }`}
          />
        </button>
      </div>

      {/* ── 4. Liked By Section (Instagram Style) ── */}
      {(post.like_count || 0) > 0 && (
        <div className="px-4 py-0.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <div className="leading-tight">{renderLikedByText()}</div>
          </div>
        </div>
      )}

      {/* ── 5. Caption / Content (Instagram Style) ── */}
      {post.content && (
        <div className="px-4 pt-1.5 pb-2 text-sm text-slate-800 leading-relaxed">
          <span className="font-bold text-slate-900 mr-2">{authorName}</span>
          <span className="whitespace-pre-wrap">{displayContent}</span>
          {isLongText && (
            <button
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="ml-1 text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
            >
              {isTextExpanded ? "ซ่อน" : "ดูเพิ่มเติม"}
            </button>
          )}
        </div>
      )}

      {/* ── 6. Comments Section ── */}
      <div className="px-4 pb-2 space-y-2">
        {/* Toggle all comments button if more than 2 */}
        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors pt-0.5 block"
          >
            {showAllComments
              ? "ซ่อนความคิดเห็นบางส่วน"
              : `ดูความคิดเห็นทั้งหมด ${comments.length} รายการ`}
          </button>
        )}

        {/* Visible comments list */}
        {visibleComments.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            {visibleComments.map((c) => {
              const commenterName = `${c.profiles?.rank ? c.profiles.rank + " " : ""}${c.profiles?.full_name || "เพื่อนตำรวจ"}`;
              const commenterInitial = c.profiles?.full_name?.charAt(0) || "ต";
              const canDeleteComment = user?.id === c.user_id || user?.role === "admin";

              return (
                <div key={c.id} className="flex items-start justify-between gap-2 group text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      {commenterInitial}
                    </div>
                    <div className="leading-snug">
                      <span className="font-bold text-slate-900 mr-1.5">{commenterName}</span>
                      <span className="text-slate-700 whitespace-pre-wrap">{c.content}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {formatIgTime(c.created_at)}
                      </span>
                    </div>
                  </div>

                  {canDeleteComment && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 shrink-0"
                      title="ลบคอมเมนต์"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 7. Instant Comment Input (Instagram Style Fixed at Bottom) ── */}
      <form
        onSubmit={handleComment}
        className="flex items-center gap-2.5 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
          {user?.full_name?.charAt(0) || "ต"}
        </div>
        <input
          ref={commentInputRef}
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`แสดงความคิดเห็นในชื่อ ${user?.full_name || ""}...`}
          className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || submittingComment}
          className="text-xs font-bold text-[#661D27] hover:text-[#4A141B] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity px-1 py-0.5 flex items-center gap-1"
        >
          {submittingComment ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              โพสต์
              <Send className="w-3 h-3 ml-0.5" />
            </>
          )}
        </button>
      </form>
    </motion.article>
  );
}
