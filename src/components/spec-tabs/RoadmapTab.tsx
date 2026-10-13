'use client';

import React, { useEffect, useRef } from 'react';
import { SprintDay } from '../../types/spec';
import { Calendar, CheckSquare, Flag, Layers, Rocket, Square } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RoadmapTabProps {
  sprintDays: SprintDay[];
  onToggleDay: (dayNumber: number) => void;
}

function cleanRoadmapText(text: string): string {
  return text
    .replace(/Directives?\s*\d+(\.\d+)?/gi, 'Design System')
    .replace(/\/\//g, '-')
    .replace(/anti-pill/gi, 'geometric UI')
    .trim();
}

export function RoadmapTab({ sprintDays, onToggleDay }: RoadmapTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const iconRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const completedCount = sprintDays.filter((d) => d.completed).length;
  const totalCount = sprintDays.length || 14;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Calculate highest completed day or overall completion ratio for the vertical timeline rail
  const railPercent = Math.min(100, Math.max(4, progressPercent));

  // Initial mount / scroll staggered reveal
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.roadmap-day-item',
        { opacity: 0, x: -14 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.045,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.roadmap-timeline-container',
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  // Animate progress bar & vertical rail when completedCount changes
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${progressPercent}%`,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
    if (railFillRef.current) {
      gsap.to(railFillRef.current, {
        height: `${railPercent}%`,
        duration: 0.55,
        ease: 'power2.out',
      });
    }
  }, [progressPercent, railPercent]);

  const handleCardToggle = (dayNumber: number) => {
    const cardEl = cardRefs.current[dayNumber];
    const iconEl = iconRefs.current[dayNumber];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      if (cardEl) {
        gsap.fromTo(
          cardEl,
          { scale: 0.985 },
          { scale: 1, duration: 0.3, ease: 'back.out(2)' }
        );
      }
      if (iconEl) {
        gsap.fromTo(
          iconEl,
          { scale: 0.65, rotate: -10 },
          { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2.5)' }
        );
      }
    }

    onToggleDay(dayNumber);
  };

  // Phase summary stats
  const phases = [
    {
      key: 'PHASE 1: FOUNDATION',
      label: 'Phase 1: Core Setup & Auth',
      daysRange: 'Days 1 - 4',
      icon: Layers,
      accent: 'text-cyan-400',
      badgeClass: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
    },
    {
      key: 'PHASE 2: CORE ENGINE',
      label: 'Phase 2: Main Features & UI',
      daysRange: 'Days 5 - 9',
      icon: Calendar,
      accent: 'text-emerald-400',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    },
    {
      key: 'PHASE 3: POLISH & HARDENING',
      label: 'Phase 3: Testing & Launch',
      daysRange: 'Days 10 - 14',
      icon: Rocket,
      accent: 'text-amber-400',
      badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800',
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6 font-mono text-xs">
      {/* Top Sprint Progress Header */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Flag className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              14-DAY BUILD ROADMAP & MILESTONE TRACKER
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            INTERACTIVE SPRINT CHECKLIST ({completedCount} OF {totalCount} DAYS COMPLETED)
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Click any day below to mark milestones complete as you or your development team ship each step.
          </p>
        </div>

        {/* Animated Progress Meter */}
        <div className="w-full lg:w-72 bg-[#000000] border border-zinc-800 p-3 rounded-none shrink-0">
          <div className="flex justify-between text-[11px] font-mono text-zinc-300 mb-1.5">
            <span>OVERALL LAUNCH READINESS</span>
            <span className="font-bold text-emerald-400 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#0b0b0e] border border-zinc-800 overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5">
            <span>DAY 01 START</span>
            <span>DAY 14 PRODUCTION</span>
          </div>
        </div>
      </div>

      {/* 3-Phase Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {phases.map((p) => {
          const phaseDays = sprintDays.filter((d) => d.phase === p.key);
          const phaseDone = phaseDays.filter((d) => d.completed).length;
          const PhaseIcon = p.icon;
          return (
            <div
              key={p.key}
              className="bg-[#0b0b0e] border border-zinc-800 p-3.5 rounded-none flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <PhaseIcon className={`w-3.5 h-3.5 ${p.accent}`} />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    {p.daysRange}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1 uppercase">{p.label}</div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white tabular-nums">
                  {phaseDone}/{phaseDays.length}
                </span>
                <span className="block text-[9px] text-zinc-500 uppercase">DONE</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical Connecting Timeline Rail + 14-Day Interactive Cards */}
      <div className="roadmap-timeline-container relative pl-7 sm:pl-10">
        {/* Background Vertical Rail */}
        <div className="absolute left-3 sm:left-4 top-3 bottom-3 w-[2px] bg-zinc-800">
          {/* Dynamic Glowing Emerald/Cyan Rail Fill */}
          <div
            ref={railFillRef}
            className="w-full bg-gradient-to-b from-emerald-400 via-cyan-400 to-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
            style={{ height: `${railPercent}%` }}
          />
        </div>

        {/* 14 Days List along the Vertical Rail */}
        <div className="space-y-3">
          {sprintDays.map((d) => {
            const isDone = d.completed;
            return (
              <div key={d.day} className="roadmap-day-item relative">
                {/* Timeline Rail Node Indicator */}
                <button
                  type="button"
                  onClick={() => handleCardToggle(d.day)}
                  aria-label={`Toggle Day ${d.day}`}
                  className={`absolute -left-7 sm:-left-10 top-4 w-6 h-6 sm:w-8 sm:h-6 flex items-center justify-center text-[10px] font-mono font-bold border transition-all cursor-pointer rounded-none z-10 ${
                    isDone
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                      : 'bg-[#000000] border-zinc-700 text-zinc-400 hover:border-cyan-400 hover:text-white'
                  }`}
                >
                  {d.day < 10 ? `0${d.day}` : d.day}
                </button>

                {/* Day Card */}
                <div
                  ref={(el) => {
                    cardRefs.current[d.day] = el;
                  }}
                  onClick={() => handleCardToggle(d.day)}
                  className={`p-4 border transition-colors cursor-pointer rounded-none select-none ${
                    isDone
                      ? 'bg-[#0b0b0e] border-emerald-500/50 hover:border-emerald-400'
                      : 'bg-[#0b0b0e] border-t-white/16 border-x-white/10 border-b-white/4 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        ref={(el) => {
                          iconRefs.current[d.day] = el;
                        }}
                        className="shrink-0"
                      >
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isDone ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        DAY {d.day}: {cleanRoadmapText(d.title)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      {isDone && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          COMPLETED
                        </span>
                      )}
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 whitespace-nowrap font-bold border ${
                          d.phase === 'PHASE 1: FOUNDATION'
                            ? 'bg-cyan-950/70 text-cyan-400 border-cyan-800'
                            : d.phase === 'PHASE 2: CORE ENGINE'
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                            : 'bg-amber-950/70 text-amber-400 border-amber-800'
                        }`}
                      >
                        {d.phase}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables Grid */}
                  <ul className="mt-3 ml-6 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-sans">
                    {d.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start space-x-2 bg-[#000000] border px-2.5 py-2 ${
                          isDone
                            ? 'border-emerald-900/40 text-zinc-400 line-through'
                            : 'border-zinc-800/90 text-zinc-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 mt-1.5 shrink-0 ${
                            isDone ? 'bg-emerald-400' : 'bg-cyan-400'
                          }`}
                        />
                        <span>{cleanRoadmapText(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
