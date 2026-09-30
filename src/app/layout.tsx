import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PWAInstallButton from "@/components/PWAInstallButton";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI POLICE — ระบบส่งงานและตรวจผลการฝึกเขียนพรอมต์",
  description:
    "ระบบสนับสนุนการอบรม AI ภาคปฏิบัติสำหรับข้าราชการตำรวจ ตำรวจภูธรจังหวัดสุราษฎร์ธานี",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI POLICE",
  },
  icons: {
    icon: "/icon-512x512.jpg",
    apple: "/icon-512x512.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <head>
        {/* PWA iOS meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="AI POLICE" />
        <link rel="apple-touch-icon" href="/icon-512x512.jpg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${prompt.className} min-h-full flex flex-col bg-white text-slate-800`}
      >
        <AuthProvider>
          {children}
          <PWAInstallButton />
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
