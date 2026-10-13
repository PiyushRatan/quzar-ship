'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Loader2, Sparkles, Layers, Layout, Database, Rocket } from 'lucide-react';

interface BlueprintLoaderProps {
  conceptName?: string;
}

const STAGES = [
  {
    id: 1,
    text: 'Understanding your product idea & user flows...',
    sub: 'Structuring core value proposition and user journeys',
    icon: Sparkles,
  },
  {
    id: 2,
    text: 'Scanning reference patterns & market features...',
    sub: 'Identifying best-in-class interface and workflow patterns',
    icon: Layers,
  },
  {
    id: 3,
    text: 'Mapping screens & 14-day launch checklist...',
    sub: 'Organizing daily milestones and interactive UI components',
    icon: Layout,
  },
  {
    id: 4,
    text: 'Preparing database tables & developer files...',
    sub: 'Generating Prisma schema, API security rules, and cost plan',
    icon: Database,
  },
];

export function BlueprintLoader({ conceptName }: BlueprintLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [percent, setPercent] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animation for the loader panel
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }
        );
      }

      // Animate progress counter & bar smoothly from 0% to 100% over 1.5s
      const counter = { val: 0 };
      gsap.to(counter, {
        val: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          const current = Math.round(counter.val);
          setPercent(current);
          if (current < 26) {
            setActiveStage(0);
          } else if (current < 52) {
            setActiveStage(1);
          } else if (current < 78) {
            setActiveStage(2);
          } else {
            setActiveStage(3);
          }
        },
      });

      if (progressFillRef.current) {
        gsap.fromTo(
          progressFillRef.current,
          { width: '0%' },
          { width: '100%', duration: 1.5, ease: 'power2.inOut' }
        );
      }

      // Animate SVG blueprint paths drawing in
      if (svgRef.current) {
        const paths = svgRef.current.querySelectorAll('.bp-line');
        paths.forEach((path) => {
          const el = path as SVGGeometryElement;
          const length = el.getTotalLength ? el.getTotalLength() : 200;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
          gsap.to(el, {
            strokeDashoffset: 0,
            duration: 1.25,
            ease: 'power2.out',
            stagger: 0.12,
          });
        });

        const nodes = svgRef.current.querySelectorAll('.bp-node');
        gsap.fromTo(
          nodes,
          { scale: 0.8, opacity: 0, transformOrigin: 'center center' },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.18,
            ease: 'back.out(1.6)',
          }
        );

        const pulses = svgRef.current.querySelectorAll('.bp-pulse');
        gsap.to(pulses, {
          scale: 1.35,
          opacity: 0.15,
          duration: 0.85,
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
          transformOrigin: 'center center',
          ease: 'sine.inOut',
        });

        const scanLine = svgRef.current.querySelector('.bp-scanline');
        if (scanLine) {
          gsap.fromTo(
            scanLine,
            { attr: { x1: 20, x2: 20 } },
            {
              attr: { x1: 380, x2: 380 },
              duration: 1.45,
              repeat: -1,
              ease: 'power1.inOut',
            }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0b0b0e] border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.08)]"
      role="status"
      aria-live="polite"
    >
      {/* Top Header & Tabular Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 animate-ping" />
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block">
              Generating Custom Product Blueprint
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {conceptName ? `Designing "${conceptName}"` : 'Assembling Your Product Plan'}
            </h3>
          </div>
        </div>

        <div className="flex items-baseline space-x-2 self-start sm:self-auto">
          <span className="text-xs font-mono uppercase text-zinc-400">Progress</span>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 tabular-nums">
            {percent}%
          </span>
        </div>
      </div>

      {/* Smooth Animated Progress Bar */}
      <div className="w-full h-2 bg-[#141418] border border-zinc-800 overflow-hidden mt-4">
        <div
          ref={progressFillRef}
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400"
          style={{ width: '0%' }}
        />
      </div>

      {/* Main Content Grid: Animated SVG Schematic + 4-Stage Live Checklist */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Animated Architectural Blueprint Schematic */}
        <div className="lg:col-span-5 bg-[#08080a] border border-zinc-800/90 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
            <span>LIVE SYSTEM SCHEMATIC</span>
            <span className="text-cyan-400">AUTO-LAYOUT</span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 400 220"
            className="w-full h-auto block"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Grid Lines */}
            <g stroke="#18181b" strokeWidth="1">
              <line x1="0" y1="40" x2="400" y2="40" />
              <line x1="0" y1="110" x2="400" y2="110" />
              <line x1="0" y1="180" x2="400" y2="180" />
              <line x1="80" y1="0" x2="80" y2="220" />
              <line x1="200" y1="0" x2="200" y2="220" />
              <line x1="320" y1="0" x2="320" y2="220" />
            </g>

            {/* Connecting Schematic Paths */}
            <path
              className="bp-line"
              d="M 85 110 L 165 55"
              stroke="#06b6d4"
              strokeWidth="1.75"
            />
            <path
              className="bp-line"
              d="M 85 110 L 165 165"
              stroke="#06b6d4"
              strokeWidth="1.75"
            />
            <path
              className="bp-line"
              d="M 235 55 L 315 110"
              stroke="#10b981"
              strokeWidth="1.75"
            />
            <path
              className="bp-line"
              d="M 235 165 L 315 110"
              stroke="#10b981"
              strokeWidth="1.75"
            />
            <path
              className="bp-line"
              d="M 200 75 L 200 145"
              stroke="#a855f7"
              strokeWidth="1.25"
              strokeDasharray="4 4"
            />

            {/* Scanning Laser Line */}
            <line
              className="bp-scanline"
              x1="20"
              y1="10"
              x2="20"
              y2="210"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeOpacity="0.45"
            />

            {/* Node 1: Product Idea & UI */}
            <g className="bp-node">
              <circle
                className="bp-pulse"
                cx="60"
                cy="110"
                r="22"
                stroke="#06b6d4"
                strokeWidth="1"
              />
              <rect
                x="22"
                y="90"
                width="76"
                height="40"
                fill="#0d1117"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              <text
                x="60"
                y="107"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                USER FLOWS
              </text>
              <text
                x="60"
                y="119"
                textAnchor="middle"
                fill="#22d3ee"
                fontSize="7"
                fontFamily="monospace"
              >
                UI SCREENS
              </text>
            </g>

            {/* Node 2: App Logic & Roadmap */}
            <g className="bp-node">
              <rect
                x="155"
                y="35"
                width="90"
                height="40"
                fill="#0d1117"
                stroke="#a855f7"
                strokeWidth="1.5"
              />
              <text
                x="200"
                y="52"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                CORE LOGIC
              </text>
              <text
                x="200"
                y="64"
                textAnchor="middle"
                fill="#c084fc"
                fontSize="7"
                fontFamily="monospace"
              >
                14-DAY PLAN
              </text>
            </g>

            {/* Node 3: Database & Auth */}
            <g className="bp-node">
              <rect
                x="155"
                y="145"
                width="90"
                height="40"
                fill="#0d1117"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              <text
                x="200"
                y="162"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                DATA & AUTH
              </text>
              <text
                x="200"
                y="174"
                textAnchor="middle"
                fill="#22d3ee"
                fontSize="7"
                fontFamily="monospace"
              >
                TABLES READY
              </text>
            </g>

            {/* Node 4: Cloud Launch Ready */}
            <g className="bp-node">
              <circle
                className="bp-pulse"
                cx="340"
                cy="110"
                r="22"
                stroke="#10b981"
                strokeWidth="1"
              />
              <rect
                x="300"
                y="90"
                width="80"
                height="40"
                fill="#0d1117"
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <text
                x="340"
                y="107"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                BLUEPRINT
              </text>
              <text
                x="340"
                y="119"
                textAnchor="middle"
                fill="#34d399"
                fontSize="7"
                fontFamily="monospace"
              >
                SHIP READY
              </text>
            </g>
          </svg>
        </div>

        {/* Right: 4-Stage Live Progress Sequence */}
        <div className="lg:col-span-7 space-y-2.5">
          {STAGES.map((stage, index) => {
            const isCompleted = index < activeStage || percent === 100;
            const isCurrent = index === activeStage && percent < 100;

            return (
              <div
                key={stage.id}
                className={`p-3.5 border transition-all duration-300 flex items-start space-x-3.5 ${
                  isCurrent
                    ? 'bg-[#131318] border-cyan-400/80 text-white'
                    : isCompleted
                    ? 'bg-[#0f0f13] border-emerald-500/30 text-zinc-200'
                    : 'bg-[#0c0c0f] border-zinc-800/70 text-zinc-500 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-500">
                      {stage.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-zinc-200'
                          : 'text-zinc-400'
                      }`}
                    >
                      {stage.text}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider shrink-0">
                      {isCompleted ? (
                        <span className="text-emerald-400">DONE</span>
                      ) : isCurrent ? (
                        <span className="text-cyan-400">ACTIVE</span>
                      ) : (
                        <span className="text-zinc-600">QUEUED</span>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{stage.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
