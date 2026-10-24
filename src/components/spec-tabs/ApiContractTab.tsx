'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { Check, Copy, Lock, Network, Shield, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ApiContractTabProps {
  spec: ArchitectureSpec;
}

function cleanApiText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/Â·/g, '•')
    .replace(/Â§[\d.]+/g, '')
    .replace(/§[\d.]+/g, '')
    .replace(/\(Directives?[^)]*\)/gi, '')
    .replace(/Directives?\s*\d+(\.\d+)?/gi, '')
    .replace(/^[•·\s-]+/, '')
    .replace(/\/\//g, '-')
    .trim();
}

export function ApiContractTab({ spec }: ApiContractTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--cursor-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--cursor-y', `${e.clientY - rect.top}px`);
  };

  const handleCopyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for top guide cards
      gsap.fromTo(
        '.api-guide-card',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );

      // Staggered row entrance animations for API endpoints
      gsap.fromTo(
        '.api-endpoint-row',
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.38,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.api-endpoints-table',
            start: 'top 90%',
            once: true,
          },
        }
      );

      // Staggered entrance for security guard cards
      gsap.fromTo(
        '.api-guard-card',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.api-guards-grid',
            start: 'top 92%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [spec]);

  return (
    <div ref={containerRef} className="space-y-7 font-mono text-xs">
      {/* Top Intuitive Guide: How Developers & AI Coding Tools Use These API Contracts */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 sm:p-5 rounded-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                BACKEND API ROUTES & SECURITY RULES
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
              This contract defines every backend route your frontend screens call, who is allowed to
              access each route, and the rate limits that protect your app from abuse or accidental double-clicks.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] shrink-0">
            <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-white">
              ENDPOINTS: <strong className="text-cyan-400">{spec.apiContracts.endpoints.length}</strong>
            </span>
            <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-white">
              AUTH: <strong className="text-emerald-400">{spec.authProvider}</strong>
            </span>
          </div>
        </div>

        {/* 3-Pillar Explanation Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
          <div className="api-guide-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-[10px] uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>1. READY FOR ROUTE HANDLERS</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Your developer or AI coding assistant scaffolds each route directly in <code className="text-zinc-200 font-mono">src/app/api/</code> with matching request & response types.
            </p>
          </div>

          <div className="api-guide-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. SAFE RETRY PROTECTION</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Routes marked <strong className="text-emerald-400">SAFE RETRY</strong> prevent duplicate orders, double billing, or repeated writes if a user clicks twice.
            </p>
          </div>

          <div className="api-guide-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-[10px] uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>3. PER-USER RATE LIMITS</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Built-in request quotas stop bots and runaway scripts from draining your database or AI budget.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div>
            <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest block">
              API ENDPOINT SPECIFICATIONS (CLICK ANY ROUTE TO COPY)
            </span>
            <span className="sm:hidden text-[10px] text-cyan-400 font-mono mt-0.5 block">
              ← Swipe horizontally to view all columns →
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">
            REST & real-time streaming routes with role permissions
          </span>
        </div>

        <div className="api-endpoints-table overflow-x-auto scrollbar-thin border border-zinc-800 bg-[#0b0b0e] rounded-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#000000] border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                <th className="py-3 px-3.5">METHOD</th>
                <th className="py-3 px-3.5">ENDPOINT ROUTE</th>
                <th className="py-3 px-3.5">WHAT IT DOES</th>
                <th className="py-3 px-3.5">ACCESS LEVEL</th>
                <th className="py-3 px-3.5">DUPLICATE GUARD</th>
                <th className="py-3 px-3.5">SPEED LIMIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {spec.apiContracts.endpoints.map((ep, i) => {
                const isCopied = copiedPath === ep.path;
                return (
                  <tr
                    key={i}
                    onClick={() => handleCopyPath(ep.path)}
                    className="api-endpoint-row hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    title="Click to copy endpoint route"
                  >
                    <td className="py-3 px-3.5">
                      <span
                        className={`font-mono font-bold text-[10px] px-2 py-0.5 inline-block ${
                          ep.method === 'GET'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : ep.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ep.method === 'DELETE'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span>{ep.path}</span>
                        {isCopied ? (
                          <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5">
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                            COPIED
                          </span>
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-zinc-200 font-sans leading-relaxed">
                      {cleanApiText(ep.summary)}
                    </td>
                    <td className="py-3 px-3.5 text-[11px] text-zinc-300 font-mono whitespace-nowrap">
                      {cleanApiText(ep.auth)}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[10px] whitespace-nowrap">
                      {ep.idempotency ? (
                        <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5">
                          SAFE RETRY
                        </span>
                      ) : (
                        <span className="text-zinc-400 bg-[#000000] border border-zinc-800 px-2 py-0.5">
                          READ ONLY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-cyan-400 whitespace-nowrap">
                      {cleanApiText(ep.rateLimit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Guards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              BUILT-IN SECURITY & DATA PROTECTION RULES
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">
            Automatic safeguards protecting customer data, sessions, and API credentials
          </span>
        </div>

        <div className="api-guards-grid grid grid-cols-1 md:grid-cols-2 gap-3">
          {spec.apiContracts.securityGuards.map((guard, i) => {
            const cleanPolicy = cleanApiText(guard.policy || guard.directive);
            return (
              <div
                key={i}
                onMouseMove={handleMouseMove}
                className="api-guard-card cursor-glow-card bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 hover:border-emerald-500/40 transition-colors p-4 rounded-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {cleanApiText(guard.title)}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase tracking-widest font-bold shrink-0">
                    {guard.status}
                  </span>
                </div>

                {cleanPolicy && (
                  <div className="mt-2 inline-block text-[10px] text-cyan-400 font-mono bg-[#000000] border border-zinc-800 px-2 py-0.5 uppercase">
                    {cleanPolicy}
                  </div>
                )}

                <p className="text-xs text-zinc-300 mt-2.5 font-sans leading-relaxed">
                  {cleanApiText(guard.enforcement)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
