import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // ดึง profile เพื่อเช็คว่า onboarding หรือยัง และเช็ค role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_onboarded, unit, full_name')
        .eq('id', data.session.user.id)
        .maybeSingle();

      // ถ้ายังไม่มีโปรไฟล์ หรือยังไม่เคยกรอกข้อมูลหน่วยงาน/ยศ/ชื่อ
      const isOnboarded = profile?.is_onboarded || (Boolean(profile?.unit) && Boolean(profile?.full_name));

      if (!profile || !isOnboarded) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (profile.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }
      return NextResponse.redirect(`${origin}/lessons`);
    }
  }

  // ถ้ามี error หรือไม่มี code ให้กลับไปหน้า login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
