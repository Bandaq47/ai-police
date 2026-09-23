"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Lesson, NewsItem, Submission } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  lessons: Lesson[];
  news: NewsItem[];
  submissions: Submission[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { full_name: string; rank?: string; unit: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addLesson: (title: string, description: string) => Promise<boolean>;
  deleteLesson: (id: string) => Promise<boolean>;
  addNews: (title: string, body: string, urgent: boolean, url?: string, youtube_url?: string) => Promise<boolean>;
  deleteNews: (id: string) => Promise<boolean>;
  addSubmission: (submissionData: { lesson_id: string; prompt_text: string; notes?: string; image_url?: string }) => Promise<boolean>;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

  const addNews = async (title: string, body: string, urgent: boolean, url?: string, youtube_url?: string) => {
    if (!user) return false;

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
      return true;
    }

    console.warn("Supabase insert news with custom columns failed. Attempting fallback with embedded media links:", error);

    // Smart Fallback: If 'url' or 'youtube_url' columns are not added in Supabase 'news' table yet,
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
      return true;
    }

    console.error("Supabase fallback insert news error:", fbError);
    return false;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        lessons,
        news,
        submissions,
        loading,
        login,
        register,
        logout,
        addLesson,
        deleteLesson,
        addNews,
        deleteNews,
        addSubmission,
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
