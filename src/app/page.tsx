'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SpecViewer } from '../components/SpecViewer';
import { PRESETS } from '../data/presets';
import { ArchitectureSpec } from '../types/spec';
import {
  ArrowRight,
  Globe,
  Layout,
  Calendar,
  FileCode,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Cpu,
  Download,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  activeBorderColor?: string;
  maxTilt?: number;
  dataAttr?: string;
  scrollSpotlight?: boolean;
}

function TiltSpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(34, 211, 238, 0.15)',
  activeBorderColor = 'rgba(34, 211, 238, 0.45)',
  maxTilt = 5,
  dataAttr,
  scrollSpotlight = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rotateXTo = useRef<gsap.QuickToFunc | null>(null);
  const rotateYTo = useRef<gsap.QuickToFunc | null>(null);
  const isHoveringRef = useRef<boolean>(false);

  useEffect(() => {
    const el = cardRef.current;
    const glowEl = glowRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });

    rotateXTo.current = gsap.quickTo(el, 'rotationX', {
      duration: 0.4,
      ease: 'power3.out',
    });
    rotateYTo.current = gsap.quickTo(el, 'rotationY', {
      duration: 0.4,
      ease: 'power3.out',
    });

    if (!scrollSpotlight || !glowEl) return;

    // Natural scroll-linked spotlight sweep so mobile & desktop users see card illumination on scroll
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      end: 'bottom 22%',
      onUpdate: (self) => {
        if (isHoveringRef.current) return;
        const p = self.progress;
        const intensity = Math.sin(p * Math.PI);
        const sweepX = Math.round(15 + p * 70);
        const sweepY = Math.round(25 + p * 50);
        glowEl.style.opacity = String((intensity * 0.95).toFixed(2));
        glowEl.style.background = `radial-gradient(320px circle at ${sweepX}% ${sweepY}%, ${glowColor}, transparent 72%)`;
        el.style.borderColor =
          intensity > 0.35 ? activeBorderColor : 'rgba(255, 255, 255, 0.1)';
      },
      onLeave: () => {
        if (!isHoveringRef.current) {
          glowEl.style.opacity = '0';
          el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      },
      onLeaveBack: () => {
        if (!isHoveringRef.current) {
          glowEl.style.opacity = '0';
          el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [glowColor, activeBorderColor, scrollSpotlight]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !rotateXTo.current || !rotateYTo.current) return;
    isHoveringRef.current = true;

    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const normX = relX / rect.width - 0.5;
    const normY = relY / rect.height - 0.5;

    rotateXTo.current(-normY * maxTilt * 2);
    rotateYTo.current(normX * maxTilt * 2);

    el.style.borderColor = activeBorderColor;

    if (glowRef.current) {
      glowRef.current.style.opacity = '1';
      glowRef.current.style.background = `radial-gradient(360px circle at ${relX}px ${relY}px, ${glowColor}, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (rotateXTo.current && rotateYTo.current) {
      rotateXTo.current(0);
      rotateYTo.current(0);
    }
    if (cardRef.current) {
      cardRef.current.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(dataAttr ? { [dataAttr]: 'true' } : {})}
      className={`relative overflow-hidden will-change-transform transition-colors duration-300 ${className}`}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 z-0"
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

const SCROLL_STATEMENT_WORDS = [
  { text: 'Stop', accent: false },
  { text: 'losing', accent: false },
  { text: 'weeks', accent: false },
  { text: 'to', accent: false },
  { text: 'scattered', accent: false },
  { text: 'docs', accent: false },
  { text: 'and', accent: false },
  { text: 'technical', accent: false },
  { text: 'guesswork.', accent: false },
  { text: 'Scroll', accent: true },
  { text: 'through', accent: false },
  { text: 'how', accent: false },
  { text: 'Quzar', accent: true },
  { text: 'Ship', accent: true },
  { text: 'turns', accent: false },
  { text: 'plain', accent: false },
  { text: 'English', accent: false },
  { text: 'into', accent: false },
  { text: 'screens,', accent: true },
  { text: 'competitor', accent: true },
  { text: 'insights,', accent: true },
  { text: 'and', accent: false },
  { text: 'a', accent: false },
  { text: '14-day', accent: true },
  { text: 'launch', accent: true },
  { text: 'plan.', accent: true },
];

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ai-saas');
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(
    PRESETS[0].sampleSpec
  );
  const [activeStoryStep, setActiveStoryStep] = useState<number>(0);

  const userClickedPresetRef = useRef<boolean>(false);
  const userClickedStoryStepRef = useRef<boolean>(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const storyCtaRef = useRef<HTMLAnchorElement>(null);
  const bottomCtaRef = useRef<HTMLAnchorElement>(null);

  const capabilitiesSectionRef = useRef<HTMLElement>(null);
  const storySectionRef = useRef<HTMLElement>(null);
  const workflowPathRef = useRef<SVGPathElement>(null);
  const examplesSectionRef = useRef<HTMLElement>(null);
  const examplesApertureRef = useRef<HTMLDivElement>(null);

  const handleSelectPreset = (presetId: string, isManual = true) => {
    if (isManual) {
      userClickedPresetRef.current = true;
    }
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActiveSpec(found.sampleSpec);
    }
  };

  // Magnetic button pull on desktop pointer devices
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const buttons = [
      primaryCtaRef.current,
      storyCtaRef.current,
      bottomCtaRef.current,
    ].filter(Boolean) as HTMLElement[];

    const cleanups: Array<() => void> = [];

    buttons.forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', {
        duration: 0.35,
        ease: 'power3.out',
      });
      const yTo = gsap.quickTo(btn, 'y', {
        duration: 0.35,
        ease: 'power3.out',
      });

      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
        xTo(dx);
        yTo(dy);
      };

      const onLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: 'elastic.out(1, 0.4)',
        });
      };

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  // Natural Scroll-Linked GSAP Choreography (Zero Scroll Hijacking / Zero Pin Trapping)
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // 1. HERO ENTRANCE CHOREOGRAPHY
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .fromTo(
          '[data-hero-word]',
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.04,
            clearProps: 'transform',
          }
        )
        .fromTo(
          '[data-hero-sub]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          '-=0.35'
        )
        .fromTo(
          '[data-hero-ctas]',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.38'
        )
        .fromTo(
          '[data-hero-card]',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          '[data-hero-check-item]',
          { x: 16, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.48,
            stagger: 0.08,
          },
          '-=0.38'
        );

      // 2. SECTION 2 ("WHAT YOU GET" — #capabilities): NATURAL SCROLL ILLUMINATION & CARD REVEAL
      const statementWords = gsap.utils.toArray<HTMLElement>(
        '[data-scroll-word]'
      );
      if (statementWords.length > 0) {
        gsap.fromTo(
          statementWords,
          { color: 'rgba(255, 255, 255, 0.2)' },
          {
            color: (i, target: HTMLElement) =>
              target.getAttribute('data-accent') === 'true'
                ? '#22d3ee'
                : '#ffffff',
            stagger: 0.04,
            ease: 'none',
            scrollTrigger: {
              trigger: capabilitiesSectionRef.current,
              start: 'top 85%',
              end: 'top 30%',
              scrub: 0.35,
            },
          }
        );
      }

      gsap.fromTo(
        '[data-cap-card]',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: capabilitiesSectionRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );

      // 3. SECTION 3 ("THE JOURNEY" — #story): NATURAL SCROLL-SCRUBBED SVG BEAM & AUTO STEP PROGRESSION
      const pathEl = workflowPathRef.current;
      const totalLength = pathEl ? pathEl.getTotalLength() : 1200;

      if (pathEl) {
        gsap.set(pathEl, {
          strokeDasharray: totalLength,
          strokeDashoffset: totalLength,
        });

        gsap.to(pathEl, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: storySectionRef.current,
            start: 'top 75%',
            end: 'bottom 35%',
            scrub: 0.4,
            onUpdate: (self) => {
              if (userClickedStoryStepRef.current) return;
              const p = self.progress;
              if (p < 0.34) {
                setActiveStoryStep(0);
              } else if (p < 0.68) {
                setActiveStoryStep(1);
              } else {
                setActiveStoryStep(2);
              }
            },
          },
        });
      }

      // Individual scroll-linked card activation for mobile & desktop
      const storyCards = gsap.utils.toArray<HTMLElement>('[data-story-card]');
      storyCards.forEach((card, idx) => {
        gsap.fromTo(
          card,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: idx * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 86%',
              once: true,
            },
          }
        );

        ScrollTrigger.create({
          trigger: card,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => {
            if (!userClickedStoryStepRef.current) {
              setActiveStoryStep(idx);
            }
          },
          onEnterBack: () => {
            if (!userClickedStoryStepRef.current) {
              setActiveStoryStep(idx);
            }
          },
        });
      });

      // 4. SECTION 4 ("LIVE EXAMPLES" — #examples): SMOOTH APERTURE REVEAL + SCROLL-LINKED PRESET CYCLING
      if (examplesApertureRef.current) {
        gsap.fromTo(
          examplesApertureRef.current,
          {
            clipPath: 'inset(6% 3% 6% 3%)',
            y: 22,
            opacity: 0.78,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: examplesSectionRef.current,
              start: 'top 85%',
              end: 'top 35%',
              scrub: 0.4,
            },
          }
        );
      }

      // Natural scroll-driven sample preset preview for users scrolling through #examples
      ScrollTrigger.create({
        trigger: examplesSectionRef.current,
        start: 'top 55%',
        end: 'bottom 35%',
        onUpdate: (self) => {
          if (userClickedPresetRef.current || PRESETS.length === 0) return;
          const idx = Math.min(
            PRESETS.length - 1,
            Math.floor(self.progress * PRESETS.length)
          );
          const targetPreset = PRESETS[idx];
          if (targetPreset) {
            setSelectedPresetId((prev) => {
              if (prev !== targetPreset.id) {
                setActiveSpec(targetPreset.sampleSpec);
                return targetPreset.id;
              }
              return prev;
            });
          }
        },
      });
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const heroHeadlineWords =
    'Turn Your App Idea into a Ready-to-Build Blueprint.'.split(' ');

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section
          ref={heroSectionRef}
          className="relative border-b border-white/10 bg-[#050507] overflow-hidden pt-8 sm:pt-10 pb-12 sm:pb-14"
        >
          <div className="absolute inset-0 bg-grid-architectural opacity-35 pointer-events-none"></div>

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headline & CTAs */}
              <div className="lg:col-span-7">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                  {heroHeadlineWords.map((word, idx) => (
                    <span
                      key={idx}
                      data-hero-word
                      className="inline-block mr-[0.26em] last:mr-0 will-change-transform"
                    >
                      {word}
                    </span>
                  ))}
                </h1>

                <p
                  data-hero-sub
                  className="text-base sm:text-lg text-zinc-400 mt-4 leading-relaxed max-w-3xl"
                >
                  Most great ideas get stuck because planning the tech feels overwhelming.
                  Describe what you want to build in plain English—or paste a website you love—and
                  get a complete product plan, 14-day launch roadmap, and developer specs in 60 seconds.
                </p>

                {/* Hero CTAs */}
                <div
                  data-hero-ctas
                  className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
                >
                  <Link
                    ref={primaryCtaRef}
                    href="/tool"
                    className="inline-flex items-center justify-center space-x-3 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors will-change-transform"
                  >
                    <span>USE TOOL</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#story"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#121214] text-zinc-200 hover:text-white border border-white/15 hover:border-white/40 font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>SEE HOW IT WORKS</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Instant Summary Card with Scroll & Hover Spotlight */}
              <div className="lg:col-span-5" data-hero-card>
                <TiltSpotlightCard
                  maxTilt={4}
                  glowColor="rgba(34, 211, 238, 0.13)"
                  activeBorderColor="rgba(34, 211, 238, 0.35)"
                  className="bg-[#0b0b0e] border border-white/10 p-6"
                >
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
                    Included in Every Blueprint
                  </div>
                  <div className="space-y-3 text-sm">
                    <div
                      data-hero-check-item
                      className="flex items-start space-x-3 p-3 bg-[#111115] border border-zinc-800/80 hover:border-cyan-500/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white text-xs">Plain-English Product Plan</div>
                        <div className="text-zinc-400 text-xs mt-0.5">Clear screens, user flows, and feature priorities</div>
                      </div>
                    </div>
                    <div
                      data-hero-check-item
                      className="flex items-start space-x-3 p-3 bg-[#111115] border border-zinc-800/80 hover:border-emerald-500/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white text-xs">Competitor Website Scanner</div>
                        <div className="text-zinc-400 text-xs mt-0.5">Paste any link to extract features that work</div>
                      </div>
                    </div>
                    <div
                      data-hero-check-item
                      className="flex items-start space-x-3 p-3 bg-[#111115] border border-zinc-800/80 hover:border-amber-500/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white text-xs">14-Day Launch Checklist</div>
                        <div className="text-zinc-400 text-xs mt-0.5">Step-by-step daily tasks from Day 1 to launch</div>
                      </div>
                    </div>
                    <div
                      data-hero-check-item
                      className="flex items-start space-x-3 p-3 bg-[#111115] border border-zinc-800/80 hover:border-purple-500/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white text-xs">One-Click Developer Export</div>
                        <div className="text-zinc-400 text-xs mt-0.5">Downloadable PRD, architecture, and database files</div>
                      </div>
                    </div>
                  </div>
                </TiltSpotlightCard>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SECOND SECTION: WHAT YOU GET (Scroll-Scrubbed Illumination + Scroll-Activated Cards) */}
        <section
          id="capabilities"
          ref={capabilitiesSectionRef}
          className="py-12 border-b border-white/10 bg-black"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {/* Scroll-Scrubbed Word Illumination Lead-In */}
            <div className="mb-8 pb-6 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                What You Get
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-2 leading-[1.2]">
                {SCROLL_STATEMENT_WORDS.map((item, idx) => (
                  <span
                    key={idx}
                    data-scroll-word
                    data-accent={item.accent ? 'true' : 'false'}
                    style={{ color: 'rgba(255, 255, 255, 0.22)' }}
                    className="inline-block mr-[0.26em]"
                  >
                    {item.text}
                  </span>
                ))}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                We hide all the confusing technical decisions behind the scenes and hand you a clean, organized package.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TiltSpotlightCard
                dataAttr="data-cap-card"
                glowColor="rgba(34, 211, 238, 0.16)"
                activeBorderColor="rgba(34, 211, 238, 0.45)"
                className="bg-[#0b0b0e] border border-white/10 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80">
                      01 / 04
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Competitor Inspiration
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Paste a link to any product you admire. We scan their pages to see what features they offer and how your idea can stand out.
                  </p>
                </div>
              </TiltSpotlightCard>

              <TiltSpotlightCard
                dataAttr="data-cap-card"
                glowColor="rgba(52, 211, 153, 0.16)"
                activeBorderColor="rgba(52, 211, 153, 0.45)"
                className="bg-[#0b0b0e] border border-white/10 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Layout className="w-6 h-6 text-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80">
                      02 / 04
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Screen & Feature Plan
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Get a clear breakdown of every screen, button, and user flow so you know exactly what your product will look and feel like.
                  </p>
                </div>
              </TiltSpotlightCard>

              <TiltSpotlightCard
                dataAttr="data-cap-card"
                glowColor="rgba(251, 191, 36, 0.16)"
                activeBorderColor="rgba(251, 191, 36, 0.45)"
                className="bg-[#0b0b0e] border border-white/10 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-6 h-6 text-amber-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80">
                      03 / 04
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    14-Day Launch Roadmap
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Never wonder what to build first. Follow a clear, day-by-day checklist that takes your project from Day 1 to launch in two weeks.
                  </p>
                </div>
              </TiltSpotlightCard>

              <TiltSpotlightCard
                dataAttr="data-cap-card"
                glowColor="rgba(192, 132, 252, 0.16)"
                activeBorderColor="rgba(192, 132, 252, 0.45)"
                className="bg-[#0b0b0e] border border-white/10 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <FileCode className="w-6 h-6 text-purple-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400/80">
                      04 / 04
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Developer-Ready Specs
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Database tables, API connections, and hosting estimates are generated automatically—ready to hand to your developer or AI coding tool.
                  </p>
                </div>
              </TiltSpotlightCard>
            </div>
          </div>
        </section>

        {/* 3. STORYTELLING SECTION: HOW IT WORKS (Natural Scroll-Scrubbed SVG Conduit + Auto Stage Preview) */}
        <section
          id="story"
          ref={storySectionRef}
          className="py-12 border-b border-white/10 bg-[#050507] relative overflow-hidden"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  The Journey
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  From a Rough Thought to a Clear Plan in Three Steps
                </h2>
              </div>

              {/* Scroll-Synchronized Active Stage Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#0b0b0e] border border-white/10 font-mono text-[11px] text-zinc-400 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  SCROLL-ACTIVE STAGE: STEP 0{activeStoryStep + 1} / 03
                </span>
              </div>
            </div>

            {/* Dynamic SVG Pipeline Conduit & Milestone Nodes */}
            <div className="relative mb-6">
              <svg
                className="w-full h-9 overflow-visible"
                viewBox="0 0 1200 36"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="pipelineBeamGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <filter
                    id="cyanBeamGlow"
                    x="-10%"
                    y="-200%"
                    width="120%"
                    height="500%"
                  >
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Base Unlit Conduit Track */}
                <line
                  x1="0"
                  y1="18"
                  x2="1200"
                  y2="18"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />

                {/* Scrubbed Glowing SVG Pipeline Path */}
                <path
                  ref={workflowPathRef}
                  data-workflow-path
                  d="M 0 18 L 1200 18"
                  fill="none"
                  stroke="url(#pipelineBeamGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#cyanBeamGlow)"
                />
              </svg>

              {/* Milestone Nodes Aligned Over the 3 Step Columns */}
              <div className="grid grid-cols-3 gap-4 -mt-7 pointer-events-none">
                <div className="flex items-center">
                  <div
                    data-story-node="0"
                    className={`w-7 h-7 flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${
                      activeStoryStep >= 0
                        ? 'bg-cyan-400 text-black border-cyan-300 scale-110 shadow-[0_0_16px_rgba(34,211,238,0.6)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/20'
                    }`}
                  >
                    01
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    data-story-node="1"
                    className={`w-7 h-7 flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${
                      activeStoryStep >= 1
                        ? 'bg-emerald-400 text-black border-emerald-300 scale-110 shadow-[0_0_16px_rgba(52,211,153,0.6)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/20'
                    }`}
                  >
                    02
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    data-story-node="2"
                    className={`w-7 h-7 flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${
                      activeStoryStep >= 2
                        ? 'bg-amber-400 text-black border-amber-300 scale-110 shadow-[0_0_16px_rgba(251,191,36,0.6)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/20'
                    }`}
                  >
                    03
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div
                data-story-card="0"
                onClick={() => {
                  userClickedStoryStepRef.current = true;
                  setActiveStoryStep(0);
                }}
                className={`bg-[#0b0b0e] border p-6 flex flex-col justify-between will-change-transform transition-all duration-300 cursor-pointer ${
                  activeStoryStep === 0
                    ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.12)]'
                    : 'border-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    Step 01
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Share Your Idea Simply
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Tell us what you want to create in a couple of sentences—just like explaining it to a friend over coffee. Pick whether it is a web app, mobile platform, or team tool.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  Takes less than 30 seconds
                </div>
              </div>

              {/* Step 2 */}
              <div
                data-story-card="1"
                onClick={() => {
                  userClickedStoryStepRef.current = true;
                  setActiveStoryStep(1);
                }}
                className={`bg-[#0b0b0e] border p-6 flex flex-col justify-between will-change-transform transition-all duration-300 cursor-pointer ${
                  activeStoryStep === 1
                    ? 'border-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.12)]'
                    : 'border-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    Step 02
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    We Handle the Complexity
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    You don&apos;t have to worry about servers, databases, or security rules. Quzar Ship researches the market and chooses the best, most affordable setup for you automatically.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  100% automated behind the scenes
                </div>
              </div>

              {/* Step 3 */}
              <div
                data-story-card="2"
                onClick={() => {
                  userClickedStoryStepRef.current = true;
                  setActiveStoryStep(2);
                }}
                className={`bg-[#0b0b0e] border p-6 flex flex-col justify-between will-change-transform transition-all duration-300 cursor-pointer ${
                  activeStoryStep === 2
                    ? 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.12)]'
                    : 'border-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    Step 03
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Download & Start Building
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Explore your interactive blueprint, check off daily tasks on your 14-day roadmap, and download your files with one click—or let Quzar Studio build it for you.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  Ready for immediate execution
                </div>
              </div>
            </div>

            {/* Scroll-Reactive Live Stage Preview (Automatically Morphs as User Scrolls Step 01 -> 02 -> 03) */}
            <div className="mt-6 bg-[#0b0b0e] border border-white/10 p-5 sm:p-6">
              {activeStoryStep === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>STEP 01 LIVE PREVIEW · PLAIN-ENGLISH IDEA INPUT</span>
                    </span>
                    <span className="text-zinc-500">30 SECONDS</span>
                  </div>
                  <div className="p-3.5 bg-black border border-cyan-500/30 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    &ldquo;I want to build a client portal for freelance designers where clients can approve mockups, leave pinned feedback, and pay invoices in one click.&rdquo;
                  </div>
                </div>
              )}

              {activeStoryStep === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>STEP 02 LIVE PREVIEW · AUTO-SELECTED ARCHITECTURE & MARKET SCAN</span>
                    </span>
                    <span className="text-emerald-400">AUTOMATED</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-black border border-emerald-500/30">
                      <div className="text-[10px] font-mono text-emerald-400">FRONTEND & UI</div>
                      <div className="font-bold text-white mt-0.5">Next.js + Tailwind</div>
                      <div className="text-[11px] text-zinc-400">Fast, mobile-ready client portal</div>
                    </div>
                    <div className="p-3 bg-black border border-emerald-500/30">
                      <div className="text-[10px] font-mono text-emerald-400">DATABASE & LOGIN</div>
                      <div className="font-bold text-white mt-0.5">Supabase Postgres</div>
                      <div className="text-[11px] text-zinc-400">Magic link login & file storage</div>
                    </div>
                    <div className="p-3 bg-black border border-emerald-500/30">
                      <div className="text-[10px] font-mono text-emerald-400">ESTIMATED HOSTING</div>
                      <div className="font-bold text-white mt-0.5">$0 – $20 / month</div>
                      <div className="text-[11px] text-zinc-400">Scales to first 1,000 users</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStoryStep === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" />
                      <span>STEP 03 LIVE PREVIEW · 14-DAY CHECKLIST & DEVELOPER KIT READY</span>
                    </span>
                    <span className="text-amber-400">READY TO SHIP</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono pt-1">
                    <span className="px-3 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ✓ 14-Day Daily Launch Checklist
                    </span>
                    <span className="px-3 py-1.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      ✓ Product Plan (PRD.md)
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ✓ Database SQL (SCHEMA.sql)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                ref={storyCtaRef}
                href="/tool"
                className="inline-flex items-center space-x-3 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors will-change-transform"
              >
                <span>START YOUR BLUEPRINT NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#121216] text-white hover:bg-zinc-800 border border-white/15 font-mono text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <span>DEEP DIVE: HOW IT WORKS</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. SAMPLE BLUEPRINTS PREVIEW (Smooth Clip-Path Aperture Reveal + Scroll-Linked Preset Preview) */}
        <section
          id="examples"
          ref={examplesSectionRef}
          className="py-12 bg-black"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  Live Examples
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  See What a Finished Blueprint Looks Like
                </h2>
              </div>

              {/* Sample Switcher + Full Gallery Link */}
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => {
                  const isActive = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id, true)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#121214] text-zinc-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
                <Link
                  href="/examples"
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  VIEW FULL GALLERY →
                </Link>
              </div>
            </div>

            <div
              ref={examplesApertureRef}
              data-examples-aperture
              className="will-change-[clip-path,transform,opacity]"
            >
              <SpecViewer spec={activeSpec} />
            </div>
          </div>
        </section>

        {/* 5. BOTTOM CALL TO ACTION */}
        <section className="py-12 border-t border-white/10 bg-[#08080b]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-[#111115] border border-white/10 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Ready to Turn Your Idea into Reality?
                </h2>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Launch the interactive tool to create your own custom product blueprint in under a minute, or work directly with Quzar Studio to build and launch your MVP.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link
                  ref={bottomCtaRef}
                  href="/tool"
                  className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors will-change-transform"
                >
                  <span>USE TOOL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://quzar-io.web.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#18181b] text-white hover:bg-zinc-800 border border-white/15 font-mono text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <span>QUZAR STUDIO</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
