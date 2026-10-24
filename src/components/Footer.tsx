"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Blueprint Examples", href: "/examples" },
  { label: "Use Tool", href: "/tool" },
] as const;

const EXTERNAL_LINKS = [
  {
    label: "Quzar Studio",
    href: "https://quzar-io.web.app",
  },
  {
    label: "GitHub Repository",
    href: "https://github.com/quzar-io/quzar-ship",
  },
  {
    label: "Piyush Ratan",
    href: "https://piyushratan.in",
  },
] as const;

export function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footerEl = footerRef.current;
    const innerEl = innerRef.current;
    if (!footerEl || !innerEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(innerEl, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerEl,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: footerEl,
            start: "top 96%",
            toggleActions: "play none none none",
          },
        }
      );
    }, footerEl);

    return () => {
      ctx.revert();
    };
  }, [pathname]);

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[#050507] border-t border-white/10 rounded-none mt-auto"
    >
      <div
        ref={innerRef}
        className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center space-x-3 group rounded-none"
              >
                <img src="/logo-mark.png" alt="Quzar Ship Emblem" className="w-7 h-7 object-contain" />
                <span className="font-mono text-sm font-bold tracking-wider text-white">
                  QUZAR SHIP
                </span>
              </Link>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                Turn your app idea into a ready-to-build product blueprint in 60
                seconds.
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/tool"
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-black bg-white border border-white rounded-none hover:bg-cyan-400 hover:border-cyan-400 transition-colors"
              >
                <span>Open Blueprint Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 lg:col-span-3 space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Navigation
            </h2>
            <ul className="space-y-2.5">
              {NAVIGATION_LINKS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      Boolean(pathname?.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex items-center text-sm font-mono rounded-none transition-colors ${
                        isActive
                          ? "text-cyan-400 font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* External Links Column */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-300">
              External Links
            </h2>
            <ul className="space-y-2.5">
              {EXTERNAL_LINKS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-sm font-mono text-zinc-400 hover:text-cyan-400 rounded-none transition-colors group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Architectural Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center space-x-2.5">
            <span
              aria-hidden="true"
              className="w-2 h-2 bg-cyan-400 inline-block rounded-none"
            />
            <span>QUZAR SHIP — PRODUCT BLUEPRINT ENGINE</span>
          </div>
          <div>
            <span>CRAFTED BY PIYUSH RATAN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
