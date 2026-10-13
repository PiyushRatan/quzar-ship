'use client';

import React, { useEffect, useRef } from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { BarChart3, DollarSign, Layers, ShieldCheck, TrendingDown, Users, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CostMatrixTabProps {
  spec: ArchitectureSpec;
}

function parseMonthlyAmount(monthlyTotal: string): number {
  const cleaned = monthlyTotal.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return Number.isFinite(val) ? val : 0;
}

export function CostMatrixTab({ spec }: CostMatrixTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Animate horizontal comparison bars
      gsap.fromTo(
        '.cost-bar-fill',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cost-comparison-panel',
            start: 'top 90%',
            once: true,
          },
        }
      );

      // Animate tier cards
      gsap.fromTo(
        '.cost-tier-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cost-tiers-grid',
            start: 'top 90%',
            once: true,
          },
        }
      );

      // Animate savings callouts
      gsap.fromTo(
        '.cost-savings-callout',
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cost-savings-section',
            start: 'top 92%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [spec]);

  const tiers = spec.costMatrix.tiers;
  const maxCost = Math.max(
    ...tiers.map((t) => parseMonthlyAmount(t.monthlyTotal)),
    500
  );

  return (
    <div ref={containerRef} className="space-y-7 font-mono text-xs">
      {/* Top Founder Guide Banner */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              CLOUD HOSTING COSTS & SCALING FORECAST
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
            Start building and testing for <strong className="text-emerald-400">$0/month</strong> on
            free developer tiers, then scale smoothly to <strong className="text-white">50,000+ users</strong>{' '}
            while keeping your gross software margins above 80%.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="bg-[#000000] border border-emerald-800/80 px-2.5 py-1 text-[10px] text-emerald-400 uppercase tracking-wider rounded-none font-bold">
            STARTER SETUP: $0 / MO
          </span>
          <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-[10px] text-cyan-400 uppercase tracking-wider rounded-none">
            PAY ONLY AS YOU GROW
          </span>
        </div>
      </div>

      {/* Visual Horizontal Cost-Comparison Bars ($0 Starter -> 50,000+ Users) */}
      <div className="cost-comparison-panel bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 sm:p-5 rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              VISUAL MONTHLY COST COMPARISON AS YOUR USER BASE GROWS
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-sans">
            Serverless auto-scaling vs. traditional fixed cloud servers
          </span>
        </div>

        <div className="space-y-4">
          {tiers.map((tier, idx) => {
            const amount = parseMonthlyAmount(tier.monthlyTotal);
            // Visual bar width: minimum 4% for $0 starter so the emerald badge is clearly visible, scaled logarithmically/proportionally for visual clarity
            const barWidthPercent =
              amount === 0
                ? 5
                : Math.min(96, Math.max(14, Math.round((Math.sqrt(amount) / Math.sqrt(maxCost)) * 92)));

            const barColor =
              idx === 0
                ? 'bg-emerald-400'
                : idx === 1
                ? 'bg-cyan-400'
                : idx === 2
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                : 'bg-amber-400';

            return (
              <div key={tier.name} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-zinc-500">0{idx + 1}</span>
                    <span className="font-bold text-white uppercase">{tier.name}</span>
                    <span className="text-[10px] bg-[#000000] border border-zinc-800 px-2 py-0.5 text-zinc-300">
                      {tier.users}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-cyan-400 uppercase">{tier.margin}</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {tier.monthlyTotal}
                    </span>
                  </div>
                </div>

                {/* Horizontal Bar Track */}
                <div className="w-full h-3 bg-[#000000] border border-zinc-800 p-0.5 overflow-hidden">
                  <div
                    className={`cost-bar-fill h-full ${barColor}`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Baseline Comparison Bar: Traditional Legacy Cloud Setup */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-zinc-600">REF</span>
                <span className="font-semibold text-zinc-400 uppercase">
                  TRADITIONAL ALWAYS-ON DEDICATED SERVERS (WITHOUT SERVERLESS SCALING)
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-400 line-through tabular-nums">
                $1,450.00 / mo fixed
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#000000] border border-zinc-800 p-0.5 overflow-hidden">
              <div className="cost-bar-fill h-full bg-zinc-700 w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Detailed Tier Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
            SERVICE-BY-SERVICE MONTHLY COST BREAKDOWN
          </span>
          <span className="text-[11px] text-zinc-400 font-sans">
            Exact monthly bill across compute, database, caching, and AI/API usage
          </span>
        </div>

        <div className="cost-tiers-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              onMouseMove={handleMouseMove}
              className={`cost-tier-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 flex flex-col justify-between rounded-none transition-colors ${
                i === 0
                  ? 'hover:border-emerald-500/50'
                  : 'hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 text-[10px] text-zinc-400 uppercase tracking-widest">
                    <Users className="w-3 h-3 text-cyan-400 mr-1" />
                    {tier.users}
                  </span>
                  {i === 0 && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 font-bold">
                      START HERE
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white uppercase mt-1.5">
                  {tier.name}
                </div>

                <div className="mt-2.5 bg-[#000000] border border-zinc-800 p-2.5">
                  <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                    {tier.monthlyTotal}
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5 font-semibold uppercase">
                    ESTIMATED {tier.margin}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-zinc-800 space-y-2.5">
                  {tier.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 text-[11px] bg-[#000000]/60 p-1.5 border border-zinc-900"
                    >
                      <div>
                        <div className="text-zinc-200 font-sans font-medium leading-tight">
                          {item.resource}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {item.provider}
                        </div>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold tabular-nums shrink-0">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                <span>STAGE 0{i + 1}</span>
                <span className="text-zinc-400">AUTO-SCALING</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Savings & Caching Callout Cards */}
      <div className="cost-savings-section grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onMouseMove={handleMouseMove}
          className="cost-savings-callout cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SMART CACHING & FAST REUSE
              </span>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 font-bold uppercase">
              LATENCY & COST SHIELD
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-2">
            {spec.costMatrix.cachingImpact}
          </p>
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-cyan-400">
            <span>REDUCES REPEATED DATABASE & API CALLS</span>
            <span className="font-bold">AUTOMATIC</span>
          </div>
        </div>

        <div
          onMouseMove={handleMouseMove}
          className="cost-savings-callout cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 rounded-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                PROJECTED ANNUAL CLOUD SAVINGS
              </span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 font-bold uppercase">
              HIGH MARGIN ARCHITECTURE
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-2">
            {spec.costMatrix.projectedSavings}
          </p>
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-emerald-400">
            <span>ZERO IDLE SERVER OVERHEAD</span>
            <span className="font-bold">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
