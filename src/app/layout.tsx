import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI POLICE — ระบบส่งงานและตรวจผลการฝึกเขียนพรอมต์",
  description: "ระบบสนับสนุนการอบรม AI ภาคปฏิบัติสำหรับข้าราชการตำรวจ ตำรวจภูธรจังหวัดสุราษฎร์ธานี",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className={`${prompt.className} min-h-full flex flex-col bg-white text-slate-800`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
