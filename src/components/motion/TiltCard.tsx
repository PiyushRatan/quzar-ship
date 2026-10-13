"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  disableTilt?: boolean;
  glowVariant?: "cyan" | "amber" | "subtle";
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  disableTilt = false,
  glowVariant = "cyan",
  ...rest
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isFinePointer) return;

    const canTilt = !disableTilt && !prefersReducedMotion;

    if (canTilt) {
      gsap.set(el, {
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      });
    }

    const rotateXTo = canTilt
      ? gsap.quickTo(el, "rotationX", {
          duration: 0.45,
          ease: "power3.out",
        })
      : null;

    const rotateYTo = canTilt
      ? gsap.quickTo(el, "rotationY", {
          duration: 0.45,
          ease: "power3.out",
        })
      : null;

    let latestClientX = 0;
    let latestClientY = 0;

    const updateFrame = () => {
      rafRef.current = null;
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = latestClientX - rect.left;
      const y = latestClientY - rect.top;

      cardRef.current.style.setProperty("--cursor-x", `${x.toFixed(1)}px`);
      cardRef.current.style.setProperty("--cursor-y", `${y.toFixed(1)}px`);

      if (canTilt && rotateXTo && rotateYTo && rect.width > 0 && rect.height > 0) {
        const nx = x / rect.width - 0.5;
        const ny = y / rect.height - 0.5;
        const rotX = -ny * 2 * maxTilt;
        const rotY = nx * 2 * maxTilt;
        rotateXTo(rotX);
        rotateYTo(rotY);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      latestClientX = e.clientX;
      latestClientY = e.clientY;
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(updateFrame);
      }
    };

    const handlePointerLeave = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (canTilt && rotateXTo && rotateYTo) {
        rotateXTo(0);
        rotateYTo(0);
      }
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [maxTilt, disableTilt]);

  const glowClass =
    glowVariant === "amber"
      ? "cursor-glow-card cursor-glow-amber"
      : glowVariant === "subtle"
      ? "cursor-glow-card cursor-glow-subtle"
      : "cursor-glow-card";

  return (
    <div
      ref={cardRef}
      className={`${glowClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export default TiltCard;
