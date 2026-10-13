"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollRevealMode =
  | "fade-up"
  | "clip-aperture"
  | "stagger-children";

export interface ScrollRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  mode?: ScrollRevealMode;
  delay?: number;
  duration?: number;
  stagger?: number;
  yOffset?: number;
  start?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  mode = "fade-up",
  delay = 0,
  duration = 0.85,
  stagger = 0.09,
  yOffset = 28,
  start = "top 86%",
  once = true,
  className = "",
  ...rest
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      if (mode === "clip-aperture") {
        gsap.fromTo(
          el,
          {
            clipPath: "inset(12% 12% 12% 12%)",
            opacity: 0.25,
            scale: 0.98,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            scale: 1,
            duration: duration * 1.1,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: once
                ? "play none none none"
                : "play none none reverse",
            },
          }
        );
      } else if (mode === "stagger-children") {
        const targets = Array.from(el.children);
        if (targets.length === 0) return;

        gsap.fromTo(
          targets,
          {
            y: yOffset,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            stagger,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: once
                ? "play none none none"
                : "play none none reverse",
            },
          }
        );
      } else {
        // Default: 'fade-up'
        gsap.fromTo(
          el,
          {
            y: yOffset,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: once
                ? "play none none none"
                : "play none none reverse",
            },
          }
        );
      }
    }, el);

    return () => {
      ctx.revert();
    };
  }, [mode, delay, duration, stagger, yOffset, start, once]);

  return (
    <div ref={containerRef} className={className} {...rest}>
      {children}
    </div>
  );
}

export default ScrollReveal;
