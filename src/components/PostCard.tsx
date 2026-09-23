"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PostWithDetails } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Send, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface PostCardProps {
  post: PostWithDetails;
  onImageClick?: (url: string) => void;
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: th });
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, onImageClick }: PostCardProps) {
  const { user, likePost, unlikePost, addComment, deletePost, deleteComment } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = user?.id === post.user_id;
  const isAdmin = user?.role === "admin";
  const canDelete = isOwner || isAdmin;
  const authorName = `${post.profiles?.rank ? post.profiles.rank + " " : ""}${post.profiles?.full_name || "ไม่ทราบชื่อ"}`;

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

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    await addComment(post.id, commentText.trim());
    setCommentText("");
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    await deletePost(post.id);
    setConfirmDelete(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">
              {post.profiles?.full_name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{authorName}</p>
            <p className="text-xs text-slate-400">{post.profiles?.unit} · {timeAgo(post.created_at)}</p>
          </div>
        </div>

        {canDelete && (
          <div className="relative">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="ลบโพสต์"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs text-red-600 font-medium">ลบโพสต์?</span>
                <button onClick={handleDelete} className="text-xs font-bold text-red-600 hover:text-red-800">ใช่</button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500 hover:text-slate-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {post.content && (
        <div className="px-5 pb-3">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* ── Image ── */}
      {post.image_url && (
        <div
          className="cursor-pointer overflow-hidden mx-4 mb-3 rounded-2xl border border-slate-100"
          onClick={() => onImageClick?.(post.image_url!)}
        >
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full max-h-80 object-cover hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}

      {/* ── Stats bar ── */}
      {((post.like_count || 0) > 0 || (post.comment_count || 0) > 0) && (
        <div className="flex items-center justify-between px-5 py-2 border-t border-slate-50">
          {(post.like_count || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              <span className="text-xs text-slate-500">{post.like_count}</span>
            </div>
          )}
          {(post.comment_count || 0) > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-xs text-slate-500 hover:text-[#661D27] ml-auto transition-colors"
            >
              {post.comment_count} ความคิดเห็น
            </button>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-0 px-3 py-1 border-t border-slate-100">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                      transition-all ${post.is_liked
              ? "text-red-500 bg-red-50"
              : "text-slate-500 hover:bg-slate-50 hover:text-red-400"
            }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${post.is_liked ? "fill-red-500 scale-110" : ""}`}
          />
          ถูกใจ
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                     text-slate-500 hover:bg-slate-50 hover:text-blue-500 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          ความคิดเห็น
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Comments Section ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Existing comments */}
              {(post.post_comments || []).map((comment) => {
                const commentAuthorName = `${comment.profiles?.rank ? comment.profiles.rank + " " : ""}${comment.profiles?.full_name || "ไม่ทราบชื่อ"}`;
                const canDeleteComment = user?.id === comment.user_id || user?.role === "admin";
                return (
                  <div key={comment.id} className="flex items-start gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">
                        {comment.profiles?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-slate-100">
                        <p className="text-xs font-bold text-slate-700">{commentAuthorName}</p>
                        <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 px-1">
                        <span className="text-[10px] text-slate-400">{timeAgo(comment.created_at)}</span>
                        {canDeleteComment && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(post.post_comments || []).length === 0 && (
                <p className="text-center text-xs text-slate-400 py-2">ยังไม่มีความคิดเห็น</p>
              )}

              {/* Add comment */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[10px]">
                    {user?.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3 py-2 shadow-sm">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                    placeholder="เขียนความคิดเห็น..."
                    className="flex-1 text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="text-[#661D27] hover:text-[#4A141B] disabled:opacity-30 transition-colors"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
