"use client";

import { usePathname, useRouter } from "next/navigation";

// "Choose your nation" CTA. On the homepage it opens the nation picker first
// (dispatches an event the mounted MapHero listens for) instead of jumping
// straight to the poster/join form. Elsewhere it navigates to /join, which
// itself starts with nation selection (step 1), never the poster directly.
export function ChooseNationLink({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <a
      href="/join"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (pathname === "/") {
          window.dispatchEvent(new Event("fanmap:choose-nation"));
        } else {
          router.push("/join");
        }
      }}
    >
      {children}
    </a>
  );
}
