'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../../components/Header';
import { SpecViewer } from '../../components/SpecViewer';
import { PRESETS } from '../../data/presets';
import { ArchitectureSpec, IntakePreset } from '../../types/spec';
import {
  ArrowRight,
  ArrowDown,
  Layers,
  Database,
  ShieldCheck,
  Calendar,
  Server,
  CheckCircle2,
  FileCode,
  Sparkles,
  Download,
  ExternalLink,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FOUNDER_PLAIN_ENGLISH: Record<
  string,
  {
    categoryLabel: string;
    plainSummary: string;
    idealFor: string;
    keyHighlights: string[];
  }
> = {
  'ai-saas': {
    categoryLabel: 'AI SAAS PLATFORM',
    plainSummary:
      'A multi-workspace AI subscription product where teams upload documents, run custom AI assistants with live streaming responses, and track monthly usage limits automatically.',
    idealFor: 'Founders building AI copilots, document chat apps, or vertical AI SaaS tools',
    keyHighlights: [
      'Real-time streaming AI responses with workspace token limits',
      'Built-in vector search (pgvector) for customer document knowledge bases',
      'Team workspaces, role permissions, and subscription usage tracking',
    ],
  },
  'b2b-workflow': {
    categoryLabel: 'B2B WORKFLOW AUTOMATION',
    plainSummary:
      'A reliable business automation platform that runs multi-step company workflows, connects to external tools via webhooks, retries failed tasks automatically, and keeps a tamper-proof activity log.',
    idealFor: 'Teams building internal ops tools, financial pipelines, or B2B SaaS integrations',
    keyHighlights: [
      'Multi-step background job queues with automatic failure rollback',
      'Signed webhook delivery for connecting CRMs, ERPs, and payment systems',
      'Tamper-evident audit history for enterprise compliance and security reviews',
    ],
  },
  'e-commerce': {
    categoryLabel: 'E-COMMERCE ENGINE',
    plainSummary:
      'A high-speed online store engine with instant product filtering, real-time shopping carts, inventory reservation that prevents overselling during flash sales, and verified Stripe checkout.',
    idealFor: 'Brands launching custom storefronts, marketplaces, or high-volume product drops',
    keyHighlights: [
      'Sub-50ms global product catalog caching at the edge',
      'Atomic inventory locking so two buyers never claim the last item simultaneously',
      'Exact cent-based order ledger with Stripe webhook payment verification',
    ],
  },
  'dev-tool-cli': {
    categoryLabel: 'DEVELOPER TOOL CLI',
    plainSummary:
      'A fast command-line tool and background sync engine that watches local code files, caches changes offline in SQLite, and syncs builds to cloud staging servers in milliseconds.',
    idealFor: 'Developer tool startups, CLI utilities, local-first apps, and build infrastructure',
    keyHighlights: [
      'Instant local file watcher with sub-millisecond SQLite caching',
      'Works completely offline and syncs deltas when connected',
      'Cross-platform binary packaging for macOS, Linux, and Windows',
    ],
  },
};

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

function ScrollIlluminatedCard({
  children,
  className = '',
  isActive = false,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !glowRef.current) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    glowRef.current.style.opacity = '1';
    glowRef.current.style.background = `radial-gradient(460px circle at ${relX}px ${relY}px, rgba(34, 211, 238, 0.12), transparent 70%)`;
  };

  const handleMouseLeave = () => {
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-blueprint-card="true"
      className={`relative overflow-hidden rounded-none transition-colors duration-300 ${
        isActive
          ? 'bg-[#121214] border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.12)]'
          : 'bg-[#09090b] border border-white/10 border-t-white/15 hover:border-white/25'
      } ${className}`}
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

export default function ExamplesPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(
    PRESETS[0].sampleSpec
  );

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const bottomCtaRef = useRef<HTMLElement>(null);

  const selectedPreset: IntakePreset =
    PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleInspectBlueprint = (preset: IntakePreset, scrollToInspector = true) => {
    setSelectedPresetId(preset.id);
    setActiveSpec(preset.sampleSpec);

    if (scrollToInspector) {
      const target =
        inspectorRef.current || document.getElementById('blueprint-inspector');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const prefersReduced = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        if (!prefersReduced) {
          gsap.fromTo(
            target,
            { y: 18, opacity: 0.85 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: 'power3.out',
              clearProps: 'transform',
            }
          );
        }
      }
    }
  };

  // Natural scroll-reactive animations (GSAP + ScrollTrigger) without scroll-trapping
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // 1. Page Header entrance
      const headerItems = headerRef.current?.querySelectorAll('[data-header-reveal]');
      if (headerItems && headerItems.length > 0) {
        gsap.fromTo(
          headerItems,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
          }
        );
      }

      // 2. Blueprint Cards scroll-illuminated stagger reveal
      const cards = gridRef.current?.querySelectorAll('[data-blueprint-card]');
      if (cards && cards.length > 0) {
        cards.forEach((card, idx) => {
          gsap.fromTo(
            card,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              delay: (idx % 2) * 0.08,
              ease: 'power3.out',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }

      // 3. Full Interactive Inspector reveal on scroll
      if (inspectorRef.current) {
        gsap.fromTo(
          inspectorRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: inspectorRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Bottom CTA reveal on scroll
      if (bottomCtaRef.current) {
        gsap.fromTo(
          bottomCtaRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: bottomCtaRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-black"
    >
      <Header />

      <main className="flex-1 w-full">
        {/* 1. PAGE HEADER */}
        <section
          ref={headerRef}
          className="w-full px-4 sm:px-6 lg:px-8 pt-10 pb-10 border-b border-white/10 bg-[#000000]"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-4xl space-y-4">
              <div
                data-header-reveal
                className="inline-flex items-center space-x-2.5 px-3 py-1.5 bg-[#121214] border border-white/10 rounded-none"
              >
                <span className="w-2 h-2 bg-cyan-400 rounded-none" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                  BLUEPRINT GALLERY &amp; LIVE INSPECTOR · 4 REAL PRODUCT SPECS
                </span>
              </div>

              <h1
                data-header-reveal
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]"
              >
                Explore Real Product Blueprints
              </h1>

              <p
                data-header-reveal
                className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl"
              >
                Browse complete, ready-to-build specifications generated by Quzar Ship.
                Every blueprint below includes system architecture, screen layouts, a
                14-day launch plan, monthly hosting budgets, database tables, and API
                routes—ready to inspect or customize in 60 seconds.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div
              data-header-reveal
              className="flex flex-wrap items-center gap-3 self-start lg:self-end"
            >
              <a
                href="#blueprint-inspector"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-[#121214] border border-white/15 hover:border-cyan-400 text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 hover:text-white transition-colors rounded-none active:translate-y-[1px]"
              >
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>JUMP TO FULL INSPECTOR</span>
              </a>

              <Link
                href="/tool"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-cyan-400 text-black hover:bg-white font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors rounded-none active:translate-y-[1px]"
              >
                <span>BUILD YOUR OWN BLUEPRINT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Summary Value Strip */}
          <div
            data-header-reveal
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div className="p-4 bg-[#09090b] border border-white/10 rounded-none">
              <div className="font-mono text-[11px] uppercase tracking-widest text-cyan-400 font-semibold">
                4 COMPLETE TEMPLATES
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                AI SaaS, B2B Automation, E-Commerce, and Developer CLI blueprints.
              </p>
            </div>
            <div className="p-4 bg-[#09090b] border border-white/10 rounded-none">
              <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-400 font-semibold">
                6 INTERACTIVE TABS
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Inspect architecture, UI screens, 14-day plan, costs, database, and APIs.
              </p>
            </div>
            <div className="p-4 bg-[#09090b] border border-white/10 rounded-none">
              <div className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                1-CLICK FILE DOWNLOADS
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Download ARCHITECTURE.md, schema.prisma, PRD.md, and SPEC JSON directly.
              </p>
            </div>
            <div className="p-4 bg-[#09090b] border border-white/10 rounded-none">
              <div className="font-mono text-[11px] uppercase tracking-widest text-purple-400 font-semibold">
                INSTANT CUSTOMIZATION
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Open any example directly in the builder to adapt it to your product idea.
              </p>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE BLUEPRINT CARDS GRID (4 PRESETS) */}
        <section
          ref={gridRef}
          aria-labelledby="gallery-grid-heading"
          className="w-full px-4 sm:px-6 lg:px-8 py-12 border-b border-white/10 bg-[#000000]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                STEP 1 · SELECT A PRODUCT BLUEPRINT
              </span>
              <h2
                id="gallery-grid-heading"
                className="text-2xl sm:text-3xl font-bold text-white mt-1"
              >
                Production-Ready Example Specifications
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              Currently inspecting:{' '}
              <span className="text-cyan-400 font-bold">
                {selectedPreset.name} ({selectedPreset.conceptName})
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PRESETS.map((preset, index) => {
              const isSelected = preset.id === selectedPresetId;
              const meta = FOUNDER_PLAIN_ENGLISH[preset.id] || {
                categoryLabel: preset.name.toUpperCase(),
                plainSummary: preset.problemStatement,
                idealFor: 'Founders and product engineering teams',
                keyHighlights: [],
              };
              const spec = preset.sampleSpec;
              const starterCost =
                spec.costMatrix.tiers[0]?.monthlyTotal || '$0.00 / mo';

              return (
                <ScrollIlluminatedCard
                  key={preset.id}
                  isActive={isSelected}
                  className="p-6 sm:p-7"
                >
                  {/* Top Section: Header, Tagline, Problem Statement */}
                  <div>
                    {/* Card Top Metadata Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-800/90">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 bg-[#18181b] border border-white/15 font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          BLUEPRINT 0{index + 1}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                          {meta.categoryLabel}
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-cyan-400/15 border border-cyan-400 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>ACTIVE IN INSPECTOR</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                          ID: {spec.id}
                        </span>
                      )}
                    </div>

                    {/* Project Title & Tagline */}
                    <div className="mb-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {preset.name}
                        </h3>
                        <span className="font-mono text-xs text-cyan-400 font-semibold">
                          {preset.conceptName}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-300 mt-1">
                        {preset.tagline}
                      </p>
                    </div>

                    {/* Plain-English Problem Statement Box */}
                    <div className="p-4 bg-[#121214] border border-white/10 rounded-none mb-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                          WHAT THIS PRODUCT SOLVES (PLAIN ENGLISH)
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          STARTS AT {starterCost}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                        {meta.plainSummary}
                      </p>
                      <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                        <strong className="text-zinc-300 font-mono uppercase">
                          Technical Scope:
                        </strong>{' '}
                        {preset.problemStatement}
                      </p>
                    </div>

                    {/* Key Stack Badges (Database, Auth, Hosting) */}
                    <div className="mb-5">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                        RECOMMENDED TECH STACK
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="px-3 py-2 bg-[#121214] border border-white/10 flex items-center space-x-2">
                          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-[10px] font-mono uppercase text-zinc-400">
                              DATABASE
                            </div>
                            <div className="text-xs font-mono font-bold text-white truncate">
                              {preset.targetDatabase}
                            </div>
                          </div>
                        </div>

                        <div className="px-3 py-2 bg-[#121214] border border-white/10 flex items-center space-x-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-[10px] font-mono uppercase text-zinc-400">
                              USER AUTH
                            </div>
                            <div className="text-xs font-mono font-bold text-white truncate">
                              {preset.authProvider}
                            </div>
                          </div>
                        </div>

                        <div className="px-3 py-2 bg-[#121214] border border-white/10 flex items-center space-x-2">
                          <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-[10px] font-mono uppercase text-zinc-400">
                              HOSTING
                            </div>
                            <div className="text-xs font-mono font-bold text-white truncate">
                              {preset.deploymentTarget}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Included Deliverables Count */}
                    <div className="mb-6">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                        INCLUDED BLUEPRINT DELIVERABLES
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                        <div className="p-2.5 bg-[#121214]/90 border border-zinc-800">
                          <div className="text-base font-bold text-white tabular-nums">
                            {spec.databaseSchema.tablesCount} Tables
                          </div>
                          <div className="text-[10px] text-zinc-400 uppercase">
                            {spec.databaseSchema.relationsCount} DB Relations
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#121214]/90 border border-zinc-800">
                          <div className="text-base font-bold text-white tabular-nums">
                            {spec.apiContracts.endpoints.length} Routes
                          </div>
                          <div className="text-[10px] text-zinc-400 uppercase">
                            {spec.apiContracts.securityGuards.length} Security Guards
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#121214]/90 border border-zinc-800">
                          <div className="text-base font-bold text-cyan-400 tabular-nums">
                            {spec.sprintRoadmap.totalDays}-Day Plan
                          </div>
                          <div className="text-[10px] text-zinc-400 uppercase">
                            Step-by-Step Build
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#121214]/90 border border-zinc-800">
                          <div className="text-base font-bold text-emerald-400 tabular-nums">
                            4 Files
                          </div>
                          <div className="text-[10px] text-zinc-400 uppercase">
                            Ready to Export
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTAs: Inspect Full Blueprint + Use as Template in Tool */}
                  <div className="pt-4 border-t border-zinc-800/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInspectBlueprint(preset, true)}
                      className={`flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer active:translate-y-[1px] ${
                        isSelected
                          ? 'bg-cyan-400 text-black hover:bg-white'
                          : 'bg-white text-black hover:bg-cyan-400'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>
                        {isSelected
                          ? 'INSPECTING BELOW · SCROLL TO VIEW'
                          : 'INSPECT FULL BLUEPRINT'}
                      </span>
                    </button>

                    <Link
                      href={`/tool?template=${preset.id}`}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#121214] border border-white/15 hover:border-cyan-400 text-zinc-200 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors rounded-none active:translate-y-[1px]"
                    >
                      <span>USE AS TEMPLATE IN TOOL</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </Link>
                  </div>
                </ScrollIlluminatedCard>
              );
            })}
          </div>
        </section>

        {/* 3. FULL INTERACTIVE BLUEPRINT INSPECTOR */}
        <section
          id="blueprint-inspector"
          ref={inspectorRef}
          aria-labelledby="inspector-heading"
          className="w-full px-4 sm:px-6 lg:px-8 py-12 border-b border-white/10 bg-[#000000] scroll-mt-16"
        >
          {/* Inspector Header & Instant Blueprint Switcher Bar */}
          <div className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-none" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                  STEP 2 · FULL INTERACTIVE BLUEPRINT INSPECTOR
                </span>
              </div>
              <h2
                id="inspector-heading"
                className="text-2xl sm:text-3xl font-bold text-white mt-1"
              >
                Inspecting: {activeSpec.conceptName}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Explore all 6 specification tabs below, check off days in the 14-day
                launch plan, or test 1-click file downloads at the bottom of the
                inspector.
              </p>
            </div>

            {/* Quick Switcher Buttons so users don't have to scroll back up */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mr-1">
                SWITCH BLUEPRINT:
              </span>
              {PRESETS.map((preset) => {
                const active = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleInspectBlueprint(preset, false)}
                    className={`px-3 py-2 font-mono text-xs uppercase tracking-wider border transition-colors rounded-none cursor-pointer active:translate-y-[1px] ${
                      active
                        ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                        : 'bg-[#121214] text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}

              <Link
                href={`/tool?template=${selectedPresetId}`}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#18181b] border border-cyan-400/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
              >
                <span>CUSTOMIZE IN TOOL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive SpecViewer Component (all 6 tabs + 4 file exports) */}
          <SpecViewer spec={activeSpec} />
        </section>

        {/* 4. BOTTOM CTA: DIRECT LINK TO /TOOL */}
        <section
          ref={bottomCtaRef}
          aria-labelledby="bottom-cta-heading"
          className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-[#000000]"
        >
          <div className="w-full p-8 sm:p-12 bg-[#09090b] border border-white/15 border-t-white/25 rounded-none flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-[#121214] border border-white/10 font-mono text-[11px] uppercase tracking-widest text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>READY IN 60 SECONDS · ZERO JARGON</span>
              </div>
              <h2
                id="bottom-cta-heading"
                className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
              >
                Have Your Own Product Idea? Build Your Blueprint Now.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Describe what you want to build in plain English, pick your preferred
                stack, and generate a complete architecture blueprint, database schema,
                14-day launch roadmap, and exportable developer handoff package.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
              <Link
                href="/tool"
                className="inline-flex items-center justify-center space-x-3 px-7 py-4 bg-cyan-400 text-black hover:bg-white font-mono text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] transition-colors rounded-none active:translate-y-[1px] shadow-[0_0_25px_rgba(34,211,238,0.25)]"
              >
                <span>BUILD YOUR OWN BLUEPRINT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/tool?template=${selectedPresetId}`}
                className="inline-flex items-center justify-center space-x-2 px-5 py-4 bg-[#121214] border border-white/15 hover:border-white/40 text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none active:translate-y-[1px]"
              >
                <span>USE {selectedPreset.name.toUpperCase()} TEMPLATE</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
