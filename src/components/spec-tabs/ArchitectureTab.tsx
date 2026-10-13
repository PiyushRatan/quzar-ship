'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { Activity, Cpu, Database, Globe, Layers, Server, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ArchitectureTabProps {
  spec: ArchitectureSpec;
}

const DEFAULT_STAGE_META = [
  {
    friendlyTitle: 'Edge Gateway',
    friendlySubtitle: 'Global Routing & Firewall',
    icon: Globe,
    accent: 'text-cyan-400',
    borderAccent: 'border-cyan-500/40',
  },
  {
    friendlyTitle: 'Web Application',
    friendlySubtitle: 'User Interface & Streaming',
    icon: Layers,
    accent: 'text-cyan-400',
    borderAccent: 'border-cyan-500/40',
  },
  {
    friendlyTitle: 'Application Server',
    friendlySubtitle: 'Core Business Logic & APIs',
    icon: Server,
    accent: 'text-emerald-400',
    borderAccent: 'border-emerald-500/40',
  },
  {
    friendlyTitle: 'Background Worker',
    friendlySubtitle: 'Async Jobs & Queue Processing',
    icon: Cpu,
    accent: 'text-amber-400',
    borderAccent: 'border-amber-500/40',
  },
  {
    friendlyTitle: 'Primary Database',
    friendlySubtitle: 'Persistent Storage & Backups',
    icon: Database,
    accent: 'text-emerald-400',
    borderAccent: 'border-emerald-500/40',
  },
];

function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/Â·/g, '•')
    .replace(/Â§[\d.]+/g, '')
    .replace(/\(Directives?[^)]*\)/gi, '')
    .replace(/Level \d+ Void\s*\/?\s*/gi, '')
    .replace(/Level \d+\s*/gi, '')
    .replace(/\/\//g, '-')
    .trim();
}

export function ArchitectureTab({ spec }: ArchitectureTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beamPathRef = useRef<SVGPathElement>(null);
  const pulsePathRef = useRef<SVGPathElement>(null);
  const mobileBeamRef = useRef<SVGLineElement>(null);
  const [activeStage, setActiveStage] = useState<number | null>(null);

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
      // 1. Speed benchmark cards staggered reveal
      gsap.fromTo(
        '.arch-benchmark-card',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );

      // 2. 5 Architecture pipeline nodes staggered reveal
      gsap.fromTo(
        '.arch-node-card',
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.arch-pipeline-section',
            start: 'top 88%',
            once: true,
          },
        }
      );

      // 3. Animated SVG connection beam across the 5 nodes (Desktop)
      if (beamPathRef.current) {
        const length = beamPathRef.current.getTotalLength?.() || 1000;
        gsap.set(beamPathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(beamPathRef.current, {
          strokeDashoffset: 0,
          duration: 1.35,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.arch-pipeline-section',
            start: 'top 88%',
            once: true,
          },
        });
      }

      // Continuous data packet pulse along the beam
      if (pulsePathRef.current) {
        gsap.fromTo(
          pulsePathRef.current,
          { strokeDashoffset: 240 },
          {
            strokeDashoffset: -760,
            duration: 3.2,
            repeat: -1,
            ease: 'none',
          }
        );
      }

      // Mobile vertical SVG beam trace
      if (mobileBeamRef.current) {
        gsap.fromTo(
          mobileBeamRef.current,
          { strokeDasharray: 600, strokeDashoffset: 600 },
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.arch-pipeline-section',
              start: 'top 88%',
              once: true,
            },
          }
        );
      }

      // 4. Service cards staggered reveal
      gsap.fromTo(
        '.arch-service-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.arch-services-section',
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [spec]);

  const nodes = spec.topology.diagramNodes.slice(0, 5);

  return (
    <div ref={containerRef} className="space-y-7 font-mono text-xs">
      {/* Friendly Overview Banner */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              SYSTEM ARCHITECTURE & DATA FLOW
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
            {cleanText(spec.topology.summary) ||
              'How user requests travel from the browser through your application server, background workers, and database with fast response times.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-zinc-300 uppercase tracking-wider rounded-none">
            DB: <strong className="text-white">{spec.targetDatabase}</strong>
          </span>
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-zinc-300 uppercase tracking-wider rounded-none">
            AUTH: <strong className="text-white">{spec.authProvider}</strong>
          </span>
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-cyan-400 uppercase tracking-wider rounded-none">
            HOST: <strong>{spec.deploymentTarget}</strong>
          </span>
        </div>
      </div>

      {/* Speed Benchmarks Strip */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
            TARGET SPEED BENCHMARKS
          </span>
          <span className="text-[10px] text-zinc-400 font-sans">
            Real-world response targets for a snappy user experience
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onMouseMove={handleMouseMove}
            className="arch-benchmark-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 hover:border-cyan-500/40 transition-colors p-4 rounded-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                GLOBAL NETWORK RESPONSE
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1.5 tabular-nums">
              {cleanText(spec.topology.telemetry.ingressLatency)}
            </div>
            <div className="w-full h-1 bg-[#000000] border border-zinc-800 mt-2.5 overflow-hidden">
              <div className="h-full bg-emerald-400 w-[88%]" />
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 font-sans">
              Fast edge routing close to your users
            </div>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="arch-benchmark-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 hover:border-cyan-500/40 transition-colors p-4 rounded-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                DATABASE QUERY SPEED
              </span>
              <Database className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-cyan-400 mt-1.5 tabular-nums">
              {cleanText(spec.topology.telemetry.dbQueryLatency)}
            </div>
            <div className="w-full h-1 bg-[#000000] border border-zinc-800 mt-2.5 overflow-hidden">
              <div className="h-full bg-cyan-400 w-[94%]" />
            </div>
            <div className="text-[11px] text-zinc-400 mt-2 font-sans">
              Indexed lookups with active connection pooling
            </div>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="arch-benchmark-card cursor-glow-card cursor-glow-amber bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 hover:border-amber-500/40 transition-colors p-4 rounded-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                SERVERLESS STARTUP TIME
              </span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1.5 tabular-nums">
              {cleanText(spec.topology.telemetry.edgeColdStart)}
            </div>
            <div className="w-full h-1 bg-[#000000] border border-zinc-800 mt-2.5 overflow-hidden">
              <div className="h-full bg-amber-400 w-[82%]" />
            </div>
            <div className="text-[11px] text-zinc-400 mt-2 font-sans">
              Instant worker wake-up on traffic spikes
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Visual Request Pipeline with Animated SVG Connection Beam */}
      <div className="arch-pipeline-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
            LIVE REQUEST PIPELINE (5 CORE STAGES)
          </span>
          <span className="text-[11px] text-zinc-400 font-sans">
            Click any stage to inspect how data flows end-to-end
          </span>
        </div>

        <div className="relative bg-[#000000] border border-zinc-800 p-4 sm:p-5 rounded-none overflow-hidden">
          {/* Desktop Animated SVG Connection Beam Track */}
          <div className="hidden lg:block relative h-10 mb-2 select-none pointer-events-none">
            <svg
              viewBox="0 0 1000 40"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="archBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="archPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Base subtle rail */}
              <path
                d="M 100 20 L 900 20"
                stroke="#27272a"
                strokeWidth="2"
                fill="none"
              />

              {/* Scroll/Mount Animated Connection Beam */}
              <path
                ref={beamPathRef}
                d="M 100 20 L 900 20"
                stroke="url(#archBeamGrad)"
                strokeWidth="2.5"
                fill="none"
              />

              {/* Travelling Photonic Data Packet */}
              <path
                ref={pulsePathRef}
                d="M 100 20 L 900 20"
                stroke="url(#archPulseGrad)"
                strokeWidth="3.5"
                strokeDasharray="90 910"
                fill="none"
              />

              {/* 5 Stage Terminal Nodes at 10%, 30%, 50%, 70%, 90% */}
              {[100, 300, 500, 700, 900].map((cx, idx) => (
                <g key={cx}>
                  <circle
                    cx={cx}
                    cy={20}
                    r={7}
                    fill="#000000"
                    stroke={idx % 2 === 0 ? '#22d3ee' : '#10b981'}
                    strokeWidth="2"
                  />
                  <circle
                    cx={cx}
                    cy={20}
                    r={2.5}
                    fill={idx % 2 === 0 ? '#22d3ee' : '#10b981'}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Mobile/Tablet Vertical SVG Beam Indicator */}
          <svg
            className="lg:hidden absolute left-6 top-8 bottom-8 w-1 h-[calc(100%-4rem)] pointer-events-none z-0"
            viewBox="0 0 4 600"
            preserveAspectRatio="none"
          >
            <line x1="2" y1="0" x2="2" y2="600" stroke="#27272a" strokeWidth="2" />
            <line
              ref={mobileBeamRef}
              x1="2"
              y1="0"
              x2="2"
              y2="600"
              stroke="#22d3ee"
              strokeWidth="2.5"
            />
          </svg>

          {/* 5 Architecture Node Cards */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-3">
            {nodes.map((node, index) => {
              const stageMeta = DEFAULT_STAGE_META[index] || DEFAULT_STAGE_META[0];
              const StageIcon = stageMeta.icon;
              const isSelected = activeStage === index;

              return (
                <div
                  key={node.id || index}
                  onClick={() => setActiveStage(isSelected ? null : index)}
                  onMouseMove={handleMouseMove}
                  className={`arch-node-card cursor-glow-card relative bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-3.5 flex flex-col justify-between rounded-none cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-[#121216]'
                      : 'hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-cyan-400 font-bold tracking-wider">
                        STEP 0{index + 1}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-[#000000] border border-zinc-800 px-1.5 py-0.5 rounded-none">
                        {cleanText(node.protocol)}
                      </span>
                    </div>

                    {/* Friendly Primary Stage Title */}
                    <div className="flex items-center space-x-2 mt-2.5">
                      <StageIcon className={`w-4 h-4 shrink-0 ${stageMeta.accent}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {stageMeta.friendlyTitle}
                      </span>
                    </div>

                    {/* Specific Spec Node Role & Label */}
                    <div className="mt-2 pt-2 border-t border-zinc-800/80">
                      <div className="text-[11px] font-semibold text-zinc-200 uppercase">
                        {cleanText(node.label)}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 font-sans leading-snug">
                        {cleanText(node.role) || stageMeta.friendlySubtitle}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="uppercase">{cleanText(node.tier)}</span>
                    <span className="text-cyan-400 font-semibold">
                      {isSelected ? 'ACTIVE' : 'INSPECT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Stage Detail Drawer when a node is clicked */}
          {activeStage !== null && nodes[activeStage] && (
            <div className="mt-3 bg-[#0b0b0e] border border-cyan-500/40 p-3.5 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                  STAGE 0{activeStage + 1} INSPECTION: {DEFAULT_STAGE_META[activeStage]?.friendlyTitle}
                </div>
                <p className="text-xs text-zinc-200 font-sans mt-1">
                  <strong>{cleanText(nodes[activeStage].label)}</strong> handles{' '}
                  {cleanText(nodes[activeStage].role).toLowerCase()} over{' '}
                  <span className="text-cyan-400 font-mono">{cleanText(nodes[activeStage].protocol)}</span>{' '}
                  at the <span className="text-emerald-400 font-mono">{cleanText(nodes[activeStage].tier)}</span> layer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveStage(null)}
                className="self-start sm:self-center px-2.5 py-1 bg-[#000000] border border-zinc-700 text-[10px] text-zinc-300 hover:text-white uppercase tracking-wider rounded-none cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Core Services Breakdown */}
      <div className="arch-services-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
            CORE APPLICATION SERVICES & TECH STACK
          </span>
          <span className="text-[11px] text-zinc-400 font-sans">
            Modular building blocks your engineering team or AI coding agent will scaffold
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spec.topology.services.map((svc, idx) => (
            <div
              key={svc.name}
              onMouseMove={handleMouseMove}
              className="arch-service-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 hover:border-cyan-500/40 transition-colors rounded-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {cleanText(svc.name)}
                  </span>
                </div>
                <span className="text-[10px] bg-[#000000] text-cyan-400 border border-cyan-900/60 px-2 py-0.5 uppercase tracking-wider rounded-none shrink-0">
                  {cleanText(svc.type)}
                </span>
              </div>

              <div className="mt-2 inline-block text-[11px] text-emerald-400 font-mono bg-[#000000] border border-zinc-800/90 px-2 py-0.5 rounded-none">
                {cleanText(svc.tech)}
              </div>

              <p className="text-xs text-zinc-300 mt-2.5 font-sans leading-relaxed">
                {cleanText(svc.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
