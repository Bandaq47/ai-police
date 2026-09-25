export const SURAT_POLICE_STATIONS = [
  "ภจว.สุราษฎร์ธานี",
  "กก.สืบสวน",
  "สภ.เมืองสุราษฎร์ธานี",
  "สภ.พุนพิน",
  "สภ.กาญจนดิษฐ์",
  "สภ.เกาะสมุย",
  "สภ.ไชยา",
  "สภ.ดอนสัก",
  "สภ.ท่าฉาง",
  "สภ.บ่อผุด",
  "สภ.บ้านตาขุน",
  "สภ.บ้านนาสาร",
  "สภ.พนม",
  "สภ.พระแสง",
  "สภ.เวียงสระ",
  "สภ.เกาะพงัน",
  "สภ.ขุนทะเล",
  "สภ.คีรีรัฐนิคม",
  "สภ.เคียนซา",
  "สภ.ชัยบุรี",
  "สภ.ท่าชนะ",
  "สภ.ท่าชี",
  "สภ.บางมะเดื่อ",
  "สภ.บ้านนาเดิม",
  "สภ.วิภาวดี",
  "สภ.เสวียด",
  "สภ.เขานิพันธ์",
  "สภ.เกาะเต่า",
  "สภ.โมถ่าย",
  "สภ.บางสวรรค์",
  
] as const;

export const POLICE_RANKS = [
  "พล.ต.อ.",
  "พล.ต.ท.",
  "พล.ต.ต.",
  "พ.ต.อ.",
  "พ.ต.ท.",
  "พ.ต.ต.",
  "ร.ต.อ.",
  "ร.ต.ท.",
  "ร.ต.ต.",
  "ด.ต.",
  "ส.ต.อ.",
  "ส.ต.ท.",
  "ส.ต.ต."
] as const;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  created_at?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  urgent: boolean;
  url?: string;
  youtube_url?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  officer_id: string;
  officer_name?: string;
  officer_rank?: string;
  officer_unit?: string;
  lesson_id: string;
  lesson_title?: string;
  prompt_text: string;
  notes?: string;
  image_url?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  rank?: string;
  unit: string;
  role: 'officer' | 'admin';
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    rank?: string;
  };
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface PostWithDetails extends Post {
  profiles?: {
    full_name: string;
    rank?: string;
    unit: string;
  };
  post_likes?: PostLike[];
  post_comments?: (PostComment & {
    profiles?: {
      full_name: string;
      rank?: string;
      unit: string;
    };
  })[];
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "1. การใช้พรอมต์สร้างภาพ (AI Image Generation)",
    description: "ฝึกเขียนพรอมต์เพื่อสร้างภาพอินโฟกราฟิก ภาพจำลองเหตุการณ์ หรือสื่อประชาสัมพันธ์งานตำรวจ (Midjourney, DALL-E, Stable Diffusion)"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "2. การใช้พรอมต์ทำสไลด์นำเสนอ (AI Presentation)",
    description: "ฝึกเขียนพรอมต์เพื่อสร้างโครงร่างเนื้อหา หัวข้อสไลด์ และสคริปต์การนำเสนอผลงานตำรวจ (Gamma, ChatGPT Slide Assistant)"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "3. การใช้พรอมต์ทำรายงานสรุปผล (AI Report Summary)",
    description: "ฝึกเขียนพรอมต์วิเคราะห์ข้อมูล สรุปผลการปฏิบัติงาน และวิเคราะห์สถิติคดีประจำเดือน"
  }
];

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "AI คืออะไร? สรุปจบใน 7 นาที (ฉบับคนไม่มีพื้นฐานก็เข้าใจ)",
    body: "วิดีโอแนะนำพื้นฐานปัญญาประดิษฐ์ (AI) สำหรับการเริ่มต้นเรียนรู้ และการประยุกต์ใช้ในการทำงานราชการตำรวจ",
    urgent: false,
    youtube_url: "https://www.youtube.com/watch?v=0kE24Bq1xJ8",
    created_at: "2026-09-22T08:00:00Z"
  },
  {
    id: "news-2",
    title: "กำหนดการส่งงานฝึกปฏิบัติพรอมต์ประจำวัน",
    body: "ขอให้ผู้เข้าอบรมทุกท่านฝึกเขียนพรอมต์ตามหัวข้อที่กำหนด และแนบภาพผลลัพธ์ลงในระบบก่อนเวลา 16.30 น. เพื่อให้วิทยากรตรวจสอบ",
    urgent: true,
    youtube_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    created_at: "2026-09-21T08:00:00Z"
  },
  {
    id: "news-3",
    title: "เอกสารประกอบการสอนและคู่มือพรอมต์ตัวอย่าง",
    body: "ดาวน์โหลดสไลด์วิทยากรและตัวอย่าง Structure Prompt สำหรับงานตำรวจได้ในระบบ สามารถศึกษาได้ฟรีตลอด 24 ชั่วโมง",
    urgent: false,
    url: "https://www.google.com",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    created_at: "2026-09-20T10:00:00Z"
  }
];

export const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    officer_id: "off-1",
    officer_name: "สมชาย ใจดี",
    officer_rank: "พ.ต.ท.",
    officer_unit: "สภ.เมืองสุราษฎร์ธานี",
    lesson_id: "11111111-1111-1111-1111-111111111111",
    lesson_title: "1. การใช้พรอมต์สร้างภาพ (AI Image Generation)",
    prompt_text: "ภาพถ่ายคุณภาพสูง HD 8k ตำรวจจราจรไทยกำลังอำนวยความสะดวกให้เด็กนักเรียนข้ามถนนหน้าโรงเรียนสุราษฎร์ธานี บรรยากาศเช้าสดใส โทนสีอบอุ่น สมจริง Cinematic lighting, Photorealistic style",
    notes: "ใช้พรอมต์นี้สร้างด้วย Midjourney v6 ได้ภาพตรงตามความต้องการสำหรับงานประชาสัมพันธ์ สภ.",
    image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-09-21T09:15:00Z"
  },
  {
    id: "sub-2",
    officer_id: "off-2",
    officer_name: "วิชัย รักชาติ",
    officer_rank: "ร.ต.อ.",
    officer_unit: "สภ.เกาะสมุย",
    lesson_id: "22222222-2222-2222-2222-222222222222",
    lesson_title: "2. การใช้พรอมต์ทำสไลด์นำเสนอ (AI Presentation)",
    prompt_text: "จงสร้างสไลด์นำเสนอ 5 หน้า สำหรับรายงานสถิติการท่องเที่ยวและความปลอดภัยบนเกาะสมุย ประจำไตรมาสที่ 3 ประกอบด้วย: 1.หน้าปก 2.สรุปสถิติคดี 3.มาตรการดูแลนักท่องเที่ยว 4.ความร่วมมือชุมชน 5.ข้อเสนอแนะ",
    notes: "สร้างสไลด์ผ่าน Gamma AI ประหยัดเวลาทำสไลด์ได้กว่า 2 ชั่วโมง",
    image_url: "",
    created_at: "2026-09-21T10:30:00Z"
  },
  {
    id: "sub-3",
    officer_id: "off-3",
    officer_name: "นภา สว่างศรี",
    officer_rank: "พ.ต.ต.",
    officer_unit: "สภ.กาญจนดิษฐ์",
    lesson_id: "33333333-3333-3333-3333-333333333333",
    lesson_title: "3. การใช้พรอมต์ทำรายงานสรุปผล (AI Report Summary)",
    prompt_text: "คุณคือผู้เชี่ยวชาญการวิเคราะห์ข้อมูลตำรวจ จงสรุปรายงานประจำเดือนเกี่ยวกับมาตรการป้องกันยาเสพติดในเขต สภ.กาญจนดิษฐ์ ให้เน้น 3 หัวข้อหลัก: จุดเสี่ยง ผลการจับกุม และแผนปราบปรามเดือนถัดไป ใช้ภาษาราชการที่เป็นทางการ",
    notes: "ผลสรุปกระชับ นำไปใช้ในที่ประชุมประจำเดือนได้ทันที",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-09-21T11:45:00Z"
  },
  {
    id: "sub-4",
    officer_id: "off-4",
    officer_name: "อาทิตย์ บุญมี",
    officer_rank: "ด.ต.",
    officer_unit: "สภ.ดอนสัก",
    lesson_id: "11111111-1111-1111-1111-111111111111",
    lesson_title: "1. การใช้พรอมต์สร้างภาพ (AI Image Generation)",
    prompt_text: "Infographic poster for Thai Police Marine Division safety guidelines at Donsak Ferry Pier. Maroon background with white and gold icons, clean typography, highly readable.",
    notes: "ออกแบบโปสเตอร์คำแนะนำความปลอดภัยท่าเรือดอนสัก",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-09-21T14:10:00Z"
  },
  {
    id: "sub-5",
    officer_id: "off-5",
    officer_name: "เกียรติศักดิ์ พรหมมณี",
    officer_rank: "ร.ต.ท.",
    officer_unit: "สภ.พุนพิน",
    lesson_id: "22222222-2222-2222-2222-222222222222",
    lesson_title: "2. การใช้พรอมต์ทำสไลด์นำเสนอ (AI Presentation)",
    prompt_text: "ขอโครงร่างนำเสนอการจัดระเบียบการจราจรบริเวณสถานีรถไฟพุนพิน ในช่วงเทศกาลปีใหม่ พร้อมข้อแนะนำ 5 ข้อสำหรับประชาชน",
    notes: "",
    image_url: "",
    created_at: "2026-09-21T15:00:00Z"
  }
];
