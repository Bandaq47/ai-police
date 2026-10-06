import React from "react";

/**
 * PageContent - wraps main page content with correct padding
 * for the fixed top Navbar (56px) and mobile Bottom Tab Bar (72px+safe area)
 */
interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  /** Use full bleed (no max-width) — default false */
  fullBleed?: boolean;
  /** Background color class — default bg-[#F5F4F2] */
  bg?: string;
}

export default function PageContent({
  children,
  className = "",
  fullBleed = false,
  bg = "bg-[#F5F4F2]",
}: PageContentProps) {
  return (
    <div
      className={`min-h-dvh ${bg}`}
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <main
        className={`
          w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6
          ${fullBleed ? "" : "max-w-7xl"}
          ${className}
        `}
        style={{
          paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>
    </div>
  );
}
