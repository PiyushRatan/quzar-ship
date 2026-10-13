"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      ScrollTrigger.refresh();
      return;
    }

    gsap.killTweensOf(el);

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: "power2.out",
        clearProps: "transform",
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex-1 flex flex-col rounded-none ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default PageTransition;
