"use client";

import { usePathname } from "next/navigation";

// Opens full-screen Live Map Mode. On the homepage it dispatches an event so the
// already-mounted MapHero opens instantly (no remount); elsewhere it navigates
// to /?map=1, which MapHero opens on mount.
export function MapLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <a
      href="/?map=1"
      className={className}
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          window.dispatchEvent(new Event("fanmap:open-map"));
        }
      }}
    >
      {children}
    </a>
  );
}
