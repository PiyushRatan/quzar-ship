"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let progressTween: gsap.core.Tween | null = null;

    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0 });
      progressTween = gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1,
        },
      });
    }

    if (prefersReducedMotion) {
      return () => {
        progressTween?.scrollTrigger?.kill();
        progressTween?.kill();
      };
    }

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.95,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      progressTween?.scrollTrigger?.kill();
      progressTween?.kill();
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={progressRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-cyan-400 origin-left pointer-events-none scale-x-0 shadow-[0_0_12px_rgba(34,211,238,0.65)]"
      />
      {children}
    </>
  );
}

export default SmoothScrollProvider;
