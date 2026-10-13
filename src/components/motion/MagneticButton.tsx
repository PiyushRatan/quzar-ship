"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface MagneticButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  innerClassName?: string;
  maxDisplacement?: number;
  disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function MagneticButton({
  children,
  className = "",
  innerClassName = "",
  maxDisplacement = 12,
  disabled = false,
  ...rest
}: MagneticButtonProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const content = contentRef.current;
    if (!shell || !content || disabled) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const shellX = gsap.quickTo(shell, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const shellY = gsap.quickTo(shell, "y", {
      duration: 0.45,
      ease: "power3.out",
    });
    const contentX = gsap.quickTo(content, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const contentY = gsap.quickTo(content, "y", {
      duration: 0.45,
      ease: "power3.out",
    });

    const handlePointerMove = (e: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const sX = clamp(dx * 0.2, -maxDisplacement, maxDisplacement);
      const sY = clamp(dy * 0.2, -maxDisplacement, maxDisplacement);

      const cX = clamp(dx * 0.38, -maxDisplacement, maxDisplacement);
      const cY = clamp(dy * 0.38, -maxDisplacement, maxDisplacement);

      shellX(sX);
      shellY(sY);
      contentX(cX);
      contentY(cY);
    };

    const handlePointerLeave = () => {
      shellX(0);
      shellY(0);
      contentX(0);
      contentY(0);
    };

    shell.addEventListener("pointermove", handlePointerMove, { passive: true });
    shell.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    return () => {
      shell.removeEventListener("pointermove", handlePointerMove);
      shell.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [maxDisplacement, disabled]);

  return (
    <div
      ref={shellRef}
      className={`inline-block will-change-transform ${className}`.trim()}
      {...rest}
    >
      <div
        ref={contentRef}
        className={`will-change-transform ${innerClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}

export default MagneticButton;
