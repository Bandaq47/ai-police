"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Lesson, NewsItem, Submission, PostWithDetails } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  lessons: Lesson[];
  news: NewsItem[];
  submissions: Submission[];
  posts: PostWithDetails[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { full_name: string; rank?: string; unit: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addLesson: (title: string, description: string) => Promise<boolean>;
  deleteLesson: (id: string) => Promise<boolean>;
  addNews: (title: string, body: string, urgent: boolean, url?: string, youtube_url?: string) => Promise<{ success: boolean; errorMessage?: string }>;
  deleteNews: (id: string) => Promise<boolean>;
  addSubmission: (submissionData: { lesson_id: string; prompt_text: string; notes?: string; image_url?: string }) => Promise<boolean>;
  addPost: (content: string, imageFile?: File) => Promise<{ success: boolean; errorMessage?: string }>;
  deletePost: (id: string) => Promise<boolean>;
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  fetchPosts: () => Promise<void>;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchUserAndProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser(profile as UserProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      // First attempt: include profiles for post_likes if relation exists
      let postsData: any = null;
      let error: any = null;

      // Attempt 1: Full join with fkey relations
      const fullQuery = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(full_name, rank, unit),
          post_likes(id, user_id, profiles(full_name, rank)),
          post_comments(id, user_id, content, created_at, profiles!post_comments_user_id_fkey(full_name, rank, unit))
        `)
        .order('created_at', { ascending: false });

      if (!fullQuery.error) {
        postsData = fullQuery.data;
      } else {
        // Attempt 2: Fallback query without explicit fkey names
        const fallbackQuery = await supabase
          .from('posts')
          .select(`
            *,
            profiles(full_name, rank, unit),
            post_likes(id, user_id),
            post_comments(id, user_id, content, created_at)
          `)
          .order('created_at', { ascending: false });

        if (!fallbackQuery.error && fallbackQuery.data) {
          postsData = fallbackQuery.data;
        } else {
          // Attempt 3: Direct decoupled query (works regardless of schema relationships/caching)
          const basicQuery = await supabase
            .from('posts')
            .select(`
              *,
              post_likes(id, user_id),
              post_comments(id, user_id, content, created_at)
            `)
            .order('created_at', { ascending: false });

          if (!basicQuery.error && basicQuery.data) {
            const userIds = new Set<string>();
            basicQuery.data.forEach((p: any) => {
              if (p.user_id) userIds.add(p.user_id);
              p.post_likes?.forEach((l: any) => { if (l.user_id) userIds.add(l.user_id); });
              p.post_comments?.forEach((c: any) => { if (c.user_id) userIds.add(c.user_id); });
            });

            let profileMap: Record<string, any> = {};
            if (userIds.size > 0) {
              const { data: profs } = await supabase
                .from('profiles')
                .select('id, full_name, rank, unit')
                .in('id', Array.from(userIds));
              if (profs) {
                profs.forEach((pr: any) => { profileMap[pr.id] = pr; });
              }
            }

            postsData = basicQuery.data.map((p: any) => ({
              ...p,
              profiles: profileMap[p.user_id] || null,
              post_likes: (p.post_likes || []).map((l: any) => ({
                ...l,
                profiles: profileMap[l.user_id] || null,
              })),
              post_comments: (p.post_comments || []).map((c: any) => ({
                ...c,
                profiles: profileMap[c.user_id] || null,
              })),
            }));
            error = null;
          } else {
            error = basicQuery.error;
          }
        }
      }

      if (error) {
        console.warn("Notice while fetching posts (table may need setup):", error.message);
        setPosts([]);
        return;
      }

      if (postsData) {
        const enriched = postsData.map((p: any) => ({
          ...p,
          like_count: p.post_likes?.length || 0,
          comment_count: p.post_comments?.length || 0,
          is_liked: user ? p.post_likes?.some((l: any) => l.user_id === user.id) : false,
          post_comments: (p.post_comments || []).sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
        }));
        setPosts(enriched);
      }
    } catch (error) {
      console.warn("Error fetching posts:", error);
      setPosts([]);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });
      if (lessonsData) setLessons(lessonsData);

      // Fetch news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      if (newsData) setNews(newsData);

      // Fetch submissions (RLS will handle filtering)
      const { data: subsData } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles!inner(full_name, rank, unit),
          lessons!inner(title)
        `)
        .order('created_at', { ascending: false });
        
      if (subsData) {
        // Map to expected format
        const mappedSubs = subsData.map((s: any) => ({
          ...s,
          officer_name: s.profiles?.full_name || 'Unknown',
          officer_rank: s.profiles?.rank || '',
          officer_unit: s.profiles?.unit || '',
          lesson_title: s.lessons?.title || 'Unknown Lesson'
        }));
        setSubmissions(mappedSubs);
      }

      // Fetch posts
      await fetchPosts();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserAndProfile();
      setLoading(false);
    };
    
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchUserAndProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSubmissions([]);
        setPosts([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await fetchUserAndProfile();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async (data: { full_name: string; rank?: string; unit: string; email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            rank: data.rank,
            unit: data.unit,
            role: 'officer' // Default role
          }
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addLesson = async (title: string, description: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('lessons')
      .insert([{ title, description, created_by: user.id }]);
    if (!error) {
      refreshData();
      return true;
    }
    return false;
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (!error) {
      refreshData();
      return true;
    }
    return false;
  };

  const addNews = async (title: string, body: string, urgent: boolean, url?: string, youtube_url?: string): Promise<{ success: boolean; errorMessage?: string }> => {
    if (!user) return { success: false, errorMessage: 'Not logged in' };

    const cleanUrl = url && url.trim() ? url.trim() : undefined;
    const cleanYoutubeUrl = youtube_url && youtube_url.trim() ? youtube_url.trim() : undefined;

    const payload: any = {
      title,
      body,
      urgent,
      created_by: user.id
    };
    if (cleanUrl) payload.url = cleanUrl;
    if (cleanYoutubeUrl) payload.youtube_url = cleanYoutubeUrl;

    const { error } = await supabase
      .from('news')
      .insert([payload]);

    if (!error) {
      refreshData();
      return { success: true };
    }

    console.error("[addNews] Primary insert FAILED:", JSON.stringify(error, null, 2));
    console.warn("[addNews] Attempting fallback without url/youtube_url columns...");

    // Smart Fallback: If 'url' or 'youtube_url' columns are not added yet,
    // embed the link inside body so our extractor can still detect and play it!
    let fallbackBody = body;
    if (cleanYoutubeUrl && !fallbackBody.includes(cleanYoutubeUrl)) {
      fallbackBody = `${fallbackBody}\n\n${cleanYoutubeUrl}`;
    }
    if (cleanUrl && !fallbackBody.includes(cleanUrl)) {
      fallbackBody = `${fallbackBody}\n\n${cleanUrl}`;
    }

    const fallbackPayload = {
      title,
      body: fallbackBody,
      urgent,
      created_by: user.id
    };

    const { error: fbError } = await supabase
      .from('news')
      .insert([fallbackPayload]);

    if (!fbError) {
      refreshData();
      return { success: true };
    }

    console.error("[addNews] Fallback insert FAILED:", JSON.stringify(fbError, null, 2));
    return { success: false, errorMessage: fbError.message || fbError.code || JSON.stringify(fbError) };
  };

  const deleteNews = async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (!error) {
      refreshData();
      return true;
    }
    return false;
  };

  const addSubmission = async (submissionData: { lesson_id: string; prompt_text: string; notes?: string; image_url?: string }) => {
    if (!user) return false;
    const { error } = await supabase
      .from('submissions')
      .insert([{
        officer_id: user.id,
        lesson_id: submissionData.lesson_id,
        prompt_text: submissionData.prompt_text,
        notes: submissionData.notes,
        image_url: submissionData.image_url
      }]);
    if (!error) {
      refreshData();
      return true;
    }
    return false;
  };

  // ─── Community Post Functions ───

  const addPost = async (content: string, imageFile?: File): Promise<{ success: boolean; errorMessage?: string }> => {
    if (!user) return { success: false, errorMessage: "กรุณาเข้าสู่ระบบก่อนสร้างโพสต์" };

    let image_url: string | undefined;

    // Upload image to Supabase Storage if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Try bucket 'post-images' first
      let uploadRes = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

      // If 'post-images' fails (e.g. bucket doesn't exist or RLS), try existing 'submissions' bucket
      if (uploadRes.error) {
        console.warn("Upload to 'post-images' failed, trying fallback bucket 'submissions':", uploadRes.error);
        uploadRes = await supabase.storage
          .from('submissions')
          .upload(`posts/${fileName}`, imageFile, { cacheControl: '3600', upsert: false });
      }

      if (uploadRes.error) {
        console.error("Image upload failed completely:", uploadRes.error);
        const isRls = uploadRes.error.message?.toLowerCase().includes("row-level security") || uploadRes.error.message?.toLowerCase().includes("policy");
        return { 
          success: false, 
          errorMessage: isRls 
            ? "ติดสิทธิ์ Storage (RLS): กรุณารันคำสั่ง SQL ใน Supabase เพื่อเปิดสิทธิ์อัปโหลดรูปภาพ" 
            : `อัปโหลดรูปภาพไม่สำเร็จ: ${uploadRes.error.message}` 
        };
      } else {
        const bucketUsed = uploadRes.data?.path?.startsWith('posts/') ? 'submissions' : 'post-images';
        const { data: urlData } = supabase.storage
          .from(bucketUsed)
          .getPublicUrl(uploadRes.data?.path || fileName);
        image_url = urlData.publicUrl;
      }
    }

    const payload: any = {
      user_id: user.id,
      content,
    };
    if (image_url) payload.image_url = image_url;

    const { error } = await supabase
      .from('posts')
      .insert([payload]);

    if (!error) {
      await fetchPosts();
      return { success: true };
    }

    console.error("Error creating post:", error);
    const isRls = error.message?.toLowerCase().includes("row-level security") || error.message?.toLowerCase().includes("policy");
    return {
      success: false,
      errorMessage: isRls
        ? "ติดสิทธิ์ความปลอดภัยตาราง (RLS): กรุณารันคำสั่ง SQL ใน Supabase เพื่อเปิดสิทธิ์ตาราง posts"
        : `ไม่สามารถบันทึกโพสต์ได้: ${error.message}`
    };
  };

  const deletePost = async (id: string) => {
    if (!user) return false;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      await fetchPosts();
      return true;
    }
    console.error("Error deleting post:", error);
    return false;
  };

  const likePost = async (postId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: user.id }]);
    if (!error) {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: true,
            like_count: (p.like_count || 0) + 1,
            post_likes: [
              ...(p.post_likes || []),
              {
                id: 'temp-' + Date.now(),
                post_id: postId,
                user_id: user.id,
                created_at: new Date().toISOString(),
                profiles: {
                  full_name: user.full_name,
                  rank: user.rank,
                }
              }
            ],
          };
        }
        return p;
      }));
      return true;
    }
    return false;
  };

  const unlikePost = async (postId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (!error) {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: false,
            like_count: Math.max(0, (p.like_count || 0) - 1),
            post_likes: (p.post_likes || []).filter(l => l.user_id !== user.id),
          };
        }
        return p;
      }));
      return true;
    }
    return false;
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('post_comments')
      .insert([{ post_id: postId, user_id: user.id, content }]);
    if (!error) {
      await fetchPosts();
      return true;
    }
    console.error("Error adding comment:", error);
    return false;
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);
    if (!error) {
      await fetchPosts();
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lessons,
        news,
        submissions,
        posts,
        loading,
        login,
        register,
        logout,
        addLesson,
        deleteLesson,
        addNews,
        deleteNews,
        addSubmission,
        addPost,
        deletePost,
        likePost,
        unlikePost,
        addComment,
        deleteComment,
        fetchPosts,
        refreshData
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
