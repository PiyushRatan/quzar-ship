'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { Eye, Layout, Monitor, Palette, Sliders, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UiBlueprintTabProps {
  spec: ArchitectureSpec;
}

function cleanUiText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/Â§[\d.]+/g, '')
    .replace(/§[\d.]+/g, '')
    .replace(/\(Level[^)]*\)/gi, '')
    .replace(/Directives?\s*\d+(\.\d+)?/gi, '')
    .replace(/\/\//g, '-')
    .trim();
}

function friendlyCategoryName(rawCategory: string, idx: number): string {
  const cleaned = cleanUiText(rawCategory);
  if (cleaned.toLowerCase().includes('atom')) return 'Core Interface Elements';
  if (cleaned.toLowerCase().includes('molecule')) return 'Interactive Panels & Controls';
  if (cleaned.toLowerCase().includes('organism')) return 'Page Shells & Navigation';
  const fallbacks = [
    'Core Interface Elements',
    'Interactive Panels & Controls',
    'Page Shells & Navigation',
  ];
  return cleaned || fallbacks[idx % fallbacks.length];
}

export function UiBlueprintTab({ spec }: UiBlueprintTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--cursor-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--cursor-y', `${e.clientY - rect.top}px`);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ui-wireframe-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.ui-wireframe-grid',
            start: 'top 90%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.ui-component-card',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.ui-component-grid',
            start: 'top 90%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.ui-token-panel',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.ui-tokens-section',
            start: 'top 92%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [spec]);

  const allComponents = spec.uiBlueprint.componentTree.flatMap((c) => c.components);
  const compNames = allComponents.map((c) => c.name);

  return (
    <div ref={containerRef} className="space-y-7 font-mono text-xs">
      {/* Top Intuitive Guide Banner */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layout className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              INTERFACE BLUEPRINT & VISUAL SCREEN WIREFRAMES
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
            Preview the core screens of <strong className="text-white">{spec.conceptName}</strong>,
            along with the reusable React components, dark-mode color palette, and accessibility rules
            needed to build a clean, high-contrast product interface.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-emerald-400 uppercase tracking-wider rounded-none">
            {allComponents.length} REUSABLE COMPONENTS
          </span>
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-cyan-400 uppercase tracking-wider rounded-none">
            3 CORE SCREENS
          </span>
        </div>
      </div>

      {/* Visual Screen Wireframe Preview Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center space-x-2">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              VISUAL SCREEN WIREFRAME PREVIEW GRID
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">
            Click any screen wireframe to highlight its matching component group below
          </span>
        </div>

        <div className="ui-wireframe-grid grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SCREEN 1: MAIN DASHBOARD */}
          <div
            onClick={() => setSelectedScreen(selectedScreen === 0 ? null : 0)}
            onMouseMove={handleMouseMove}
            className={`ui-wireframe-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none cursor-pointer transition-all ${
              selectedScreen === 0 ? 'border-cyan-400 bg-[#111116]' : 'hover:border-zinc-600'
            }`}
          >
            {/* Screen Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  SCREEN 01
                </span>
                <span className="text-xs font-bold text-white uppercase">
                  MAIN DASHBOARD
                </span>
              </div>
              <span className="text-[10px] bg-[#000000] border border-zinc-800 px-2 py-0.5 text-zinc-400">
                /dashboard
              </span>
            </div>

            {/* Miniature Architectural Wireframe Mockup */}
            <div className="bg-[#000000] border border-zinc-800 p-2.5 space-y-2 select-none">
              {/* Top Nav Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/90 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-cyan-400 inline-block" />
                  <span className="w-14 h-1.5 bg-zinc-700 inline-block" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-8 h-2 bg-emerald-950 border border-emerald-700/60 inline-block" />
                  <span className="w-3 h-2 bg-zinc-800 inline-block" />
                </div>
              </div>

              {/* Body Layout: Sidebar + Main Content */}
              <div className="grid grid-cols-12 gap-2 pt-0.5">
                {/* Sidebar */}
                <div className="col-span-3 border-r border-zinc-800/80 pr-1.5 space-y-1.5">
                  <div className="h-2 w-full bg-cyan-950/60 border-l-2 border-cyan-400" />
                  <div className="h-1.5 w-4/5 bg-zinc-800" />
                  <div className="h-1.5 w-3/4 bg-zinc-800" />
                  <div className="h-1.5 w-5/6 bg-zinc-800" />
                  <div className="pt-3">
                    <div className="h-6 w-full bg-[#0b0b0e] border border-zinc-800 p-1">
                      <div className="h-1 w-2/3 bg-emerald-400/80" />
                    </div>
                  </div>
                </div>

                {/* Main KPI + Chart Area */}
                <div className="col-span-9 space-y-2">
                  {/* 3 KPI Mini Cards */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-[#0b0b0e] border border-zinc-800 p-1.5">
                      <div className="h-1 w-8 bg-zinc-600 mb-1" />
                      <div className="text-[9px] font-bold text-white">99.98%</div>
                      <div className="h-0.5 w-full bg-emerald-400/70 mt-1" />
                    </div>
                    <div className="bg-[#0b0b0e] border border-zinc-800 p-1.5">
                      <div className="h-1 w-8 bg-zinc-600 mb-1" />
                      <div className="text-[9px] font-bold text-cyan-400">14.2ms</div>
                      <div className="h-0.5 w-4/5 bg-cyan-400/70 mt-1" />
                    </div>
                    <div className="bg-[#0b0b0e] border border-zinc-800 p-1.5">
                      <div className="h-1 w-8 bg-zinc-600 mb-1" />
                      <div className="text-[9px] font-bold text-amber-400">2.4k/s</div>
                      <div className="h-0.5 w-3/4 bg-amber-400/70 mt-1" />
                    </div>
                  </div>

                  {/* Mini SVG Telemetry Sparkline Box */}
                  <div className="bg-[#0b0b0e] border border-zinc-800 p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] text-zinc-500 uppercase">LIVE ACTIVITY STREAM</span>
                      <span className="text-[8px] text-cyan-400">REAL-TIME</span>
                    </div>
                    <svg viewBox="0 0 180 32" className="w-full h-7 overflow-visible">
                      <path
                        d="M 0 26 L 25 20 L 50 23 L 75 11 L 105 15 L 135 6 L 160 10 L 180 3"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1.75"
                      />
                      <path
                        d="M 0 29 L 30 27 L 65 25 L 95 22 L 130 19 L 180 16"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.2"
                        strokeDasharray="3 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans mt-3 leading-relaxed">
              Gives users an immediate overview of live activity, system health, and key performance metrics.
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
              {(compNames.slice(0, 3).length ? compNames.slice(0, 3) : ['TelemetryNavbar', 'StatusIndicator', 'DataField']).map(
                (name) => (
                  <span
                    key={name}
                    className="text-[9px] bg-[#000000] border border-zinc-800 px-1.5 py-0.5 text-cyan-400"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>

          {/* SCREEN 2: INTERACTIVE WORKSPACE */}
          <div
            onClick={() => setSelectedScreen(selectedScreen === 1 ? null : 1)}
            onMouseMove={handleMouseMove}
            className={`ui-wireframe-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none cursor-pointer transition-all ${
              selectedScreen === 1 ? 'border-cyan-400 bg-[#111116]' : 'hover:border-zinc-600'
            }`}
          >
            {/* Screen Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  SCREEN 02
                </span>
                <span className="text-xs font-bold text-white uppercase">
                  INTERACTIVE WORKSPACE
                </span>
              </div>
              <span className="text-[10px] bg-[#000000] border border-zinc-800 px-2 py-0.5 text-zinc-400">
                /workspace
              </span>
            </div>

            {/* Miniature Architectural Wireframe Mockup */}
            <div className="bg-[#000000] border border-zinc-800 p-2.5 space-y-2 select-none">
              {/* Segmented Filter Toolbar */}
              <div className="flex items-center justify-between border-b border-zinc-800/90 pb-1.5">
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-700/60 text-[8px]">
                    STREAM
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#0b0b0e] text-zinc-500 border border-zinc-800 text-[8px]">
                    LOGS
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#0b0b0e] text-zinc-500 border border-zinc-800 text-[8px]">
                    DATA
                  </span>
                </div>
                <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[8px]">
                  RUN TASK
                </span>
              </div>

              {/* Split Pane Workbench */}
              <div className="grid grid-cols-12 gap-2 pt-0.5">
                {/* Left Input / Control Pane */}
                <div className="col-span-5 bg-[#0b0b0e] border border-zinc-800 p-2 space-y-1.5">
                  <div className="text-[8px] text-zinc-400 uppercase">INPUT PARAMETERS</div>
                  <div className="h-3 w-full bg-[#000000] border border-zinc-800" />
                  <div className="h-3 w-full bg-[#000000] border border-zinc-800" />
                  <div className="h-5 w-full bg-cyan-950/50 border border-cyan-500/50 flex items-center justify-center">
                    <span className="text-[8px] text-cyan-300 font-bold">EXECUTE</span>
                  </div>
                </div>

                {/* Right Live Output Terminal */}
                <div className="col-span-7 bg-[#0b0b0e] border border-zinc-800 p-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-emerald-400 uppercase">LIVE STREAM OUTPUT</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 inline-block" />
                  </div>
                  <div className="space-y-1 font-mono text-[8px] text-zinc-400">
                    <div className="flex items-center space-x-1">
                      <span className="text-zinc-600">01</span>
                      <span className="text-cyan-400">init_session()</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-zinc-600">02</span>
                      <span className="text-zinc-300">streaming chunks...</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-zinc-600">03</span>
                      <span className="text-emerald-400">status: 200 OK</span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-[#000000] overflow-hidden">
                    <div className="h-full w-4/5 bg-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans mt-3 leading-relaxed">
              Split-screen workspace where users configure inputs on the left and watch real-time results stream on the right.
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
              {(compNames.slice(3, 6).length ? compNames.slice(3, 6) : ['StreamingTerminal', 'FilterToolbar', 'TactileButton']).map(
                (name) => (
                  <span
                    key={name}
                    className="text-[9px] bg-[#000000] border border-zinc-800 px-1.5 py-0.5 text-emerald-400"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>

          {/* SCREEN 3: SETTINGS & BILLING */}
          <div
            onClick={() => setSelectedScreen(selectedScreen === 2 ? null : 2)}
            onMouseMove={handleMouseMove}
            className={`ui-wireframe-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none cursor-pointer transition-all ${
              selectedScreen === 2 ? 'border-cyan-400 bg-[#111116]' : 'hover:border-zinc-600'
            }`}
          >
            {/* Screen Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  SCREEN 03
                </span>
                <span className="text-xs font-bold text-white uppercase">
                  SETTINGS & BILLING
                </span>
              </div>
              <span className="text-[10px] bg-[#000000] border border-zinc-800 px-2 py-0.5 text-zinc-400">
                /settings
              </span>
            </div>

            {/* Miniature Architectural Wireframe Mockup */}
            <div className="bg-[#000000] border border-zinc-800 p-2.5 space-y-2 select-none">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/90 pb-1.5">
                <span className="text-[8px] text-zinc-300 font-bold uppercase">
                  WORKSPACE QUOTA & ACCESS
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800">
                  PRO PLAN
                </span>
              </div>

              {/* Usage Gauge Box */}
              <div className="bg-[#0b0b0e] border border-zinc-800 p-2 space-y-1">
                <div className="flex justify-between text-[8px]">
                  <span className="text-zinc-400">MONTHLY CAPACITY USED</span>
                  <span className="text-cyan-400 font-bold">74%</span>
                </div>
                <div className="w-full h-1.5 bg-[#000000] border border-zinc-800">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-[74%]" />
                </div>
              </div>

              {/* Team / API Key Rows */}
              <div className="space-y-1">
                <div className="flex items-center justify-between bg-[#0b0b0e] border border-zinc-800 px-2 py-1">
                  <span className="text-[8px] text-zinc-300">API_KEY_LIVE_992A</span>
                  <span className="text-[8px] text-emerald-400">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between bg-[#0b0b0e] border border-zinc-800 px-2 py-1">
                  <span className="text-[8px] text-zinc-300">TEAM RBAC GUARD</span>
                  <span className="text-[8px] text-cyan-400">OWNER</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans mt-3 leading-relaxed">
              Self-serve account management for team permissions, API keys, usage limits, and subscription billing.
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
              {(compNames.slice(5).length ? compNames.slice(5) : ['QuotaGauge', 'ModalWorkbench', 'TactileButton']).map(
                (name) => (
                  <span
                    key={name}
                    className="text-[9px] bg-[#000000] border border-zinc-800 px-1.5 py-0.5 text-amber-400"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Component Tree Breakdown */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              REUSABLE UI COMPONENT LIBRARY
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">
            Organized from basic buttons and badges up to full page shells
          </span>
        </div>

        <div className="ui-component-grid grid grid-cols-1 md:grid-cols-3 gap-3">
          {spec.uiBlueprint.componentTree.map((cat, i) => {
            const isHighlighted = selectedScreen === i;
            return (
              <div
                key={i}
                onMouseMove={handleMouseMove}
                className={`ui-component-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none transition-colors ${
                  isHighlighted ? 'border-cyan-400 bg-[#121216]' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white uppercase">
                    {friendlyCategoryName(cat.category, i)}
                  </span>
                  <span className="text-[10px] text-cyan-400 bg-[#000000] border border-zinc-800 px-1.5 py-0.5">
                    {cat.components.length} ITEMS
                  </span>
                </div>

                <div className="mt-3.5 space-y-3.5">
                  {cat.components.map((c) => {
                    const badgeText = cleanUiText(c.spec || c.policy || c.directive);
                    return (
                      <div
                        key={c.name}
                        className="border-l-2 border-cyan-400 pl-3 py-0.5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs">{c.name}</span>
                          <span className="text-[9px] text-emerald-400 bg-[#000000] border border-zinc-800 px-1.5 py-0.5 uppercase">
                            {badgeText || 'REUSABLE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-300 font-sans mt-1 leading-relaxed">
                          {cleanUiText(c.role)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Design Tokens & Readability Standards */}
      <div className="ui-tokens-section grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Surface & Color Tokens with Visual Swatches */}
        <div className="ui-token-panel bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">
                DARK-MODE COLOR & SURFACE PALETTE
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">TRUE-BLACK OLED HIERARCHY</span>
          </div>

          <div className="space-y-2.5">
            {spec.uiBlueprint.designTokens.map((t, idx) => {
              const isHex = t.value.trim().startsWith('#');
              return (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 bg-[#000000] border border-zinc-800/90 p-2.5 rounded-none"
                >
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span
                      className="w-4 h-4 border border-white/25 inline-block shrink-0"
                      style={{
                        backgroundColor: isHex ? t.value.trim() : '#18181b',
                      }}
                    />
                    <div>
                      <div className="font-mono text-cyan-400 font-semibold text-xs">
                        {cleanUiText(t.token)}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400">
                        {cleanUiText(t.value)}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans text-right max-w-xs">
                    {cleanUiText(t.rule)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessibility & Visual Quality Guards */}
        <div className="ui-token-panel bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase">
                ACCESSIBILITY & READABILITY STANDARDS
              </span>
            </div>
            <span className="text-[10px] text-emerald-400">WCAG 2.2 VERIFIED</span>
          </div>

          <div className="space-y-3">
            {spec.uiBlueprint.accessibilityGuards.map((g, idx) => (
              <div
                key={idx}
                className="bg-[#000000] p-3.5 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase">
                      {cleanUiText(g.guard)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-none uppercase font-bold">
                    {cleanUiText(g.level) || 'STANDARD'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans mt-2 leading-relaxed">
                  {cleanUiText(g.spec)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
