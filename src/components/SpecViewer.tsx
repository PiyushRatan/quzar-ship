'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArchitectureSpec, SprintDay } from '../types/spec';
import { downloadFile, slugify } from '../lib/utils';
import { ArchitectureTab } from './spec-tabs/ArchitectureTab';
import { DatabaseTab } from './spec-tabs/DatabaseTab';
import { ApiContractTab } from './spec-tabs/ApiContractTab';
import { UiBlueprintTab } from './spec-tabs/UiBlueprintTab';
import { RoadmapTab } from './spec-tabs/RoadmapTab';
import { CostMatrixTab } from './spec-tabs/CostMatrixTab';
import {
  Layers,
  Database,
  ShieldCheck,
  Layout,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  Check,
} from 'lucide-react';

interface SpecViewerProps {
  spec: ArchitectureSpec;
}

type TabType = 'topology' | 'database' | 'api' | 'ui' | 'roadmap' | 'costs';

export function SpecViewer({ spec }: SpecViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('topology');
  const [sprintDays, setSprintDays] = useState<SprintDay[]>(spec.sprintRoadmap.days);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const tabContentRef = useRef<HTMLDivElement>(null);
  const roadmapFillRef = useRef<HTMLDivElement>(null);

  // Sync sprint days when spec changes
  useEffect(() => {
    setSprintDays(spec.sprintRoadmap.days);
  }, [spec]);

  const handleToggleDay = (dayNum: number) => {
    setSprintDays((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, completed: !d.completed } : d))
    );
  };

  const completedCount = sprintDays.filter((d) => d.completed).length;
  const progressPercent = sprintDays.length
    ? Math.round((completedCount / sprintDays.length) * 100)
    : 0;

  // GSAP In-Page Tab Morphing & Staggered Content Reveal
  useEffect(() => {
    if (!tabContentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tabContentRef.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );

      const childBlocks = tabContentRef.current?.querySelectorAll(':scope > div > *');
      if (childBlocks && childBlocks.length > 0) {
        gsap.fromTo(
          childBlocks,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.32,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );
      }
    }, tabContentRef);

    return () => ctx.revert();
  }, [activeTab, spec.id]);

  // Smooth GSAP animation for 14-day roadmap progress bar fill when tasks are checked/unchecked
  useEffect(() => {
    if (roadmapFillRef.current) {
      gsap.to(roadmapFillRef.current, {
        width: `${progressPercent}%`,
        duration: 0.45,
        ease: 'power3.out',
      });
    }

    if (activeTab === 'roadmap' && tabContentRef.current) {
      const innerBar = tabContentRef.current.querySelector('.h-full.bg-cyan-400');
      if (innerBar) {
        gsap.to(innerBar, {
          width: `${progressPercent}%`,
          duration: 0.45,
          ease: 'power3.out',
        });
      }
    }
  }, [progressPercent, activeTab]);

  const handleExport = (format: 'architecture' | 'prisma' | 'prd' | 'json') => {
    let content = '';
    let filename = '';
    const slug = slugify(spec.conceptName);

    if (format === 'architecture') {
      filename = `${slug}-ARCHITECTURE.md`;
      content = `# Architecture Specification: ${spec.conceptName}
## Production Architecture Blueprint
Generated: ${spec.generatedAt}
Engine: Quzar Ship Architect

### 1. Executive Summary & Problem Statement
${spec.problemStatement}

### 2. Architectural Topology
- **Summary**: ${spec.topology.summary}
- **Target Database**: ${spec.targetDatabase}
- **Authentication**: ${spec.authProvider}
- **Deployment Runtime**: ${spec.deploymentTarget}

#### Telemetry Benchmarks
- Ingress Latency: ${spec.topology.telemetry.ingressLatency}
- Database Query Latency: ${spec.topology.telemetry.dbQueryLatency}
- Edge Cold Start: ${spec.topology.telemetry.edgeColdStart}

### 3. Core Services
${spec.topology.services
  .map(
    (s) => `#### ${s.name} (${s.type})
- **Technology**: ${s.tech}
- **Description**: ${s.description}
`
  )
  .join('\n')}

### 4. API Endpoints
| Method | Path | Summary | Auth | Idempotency | Rate Limit |
|---|---|---|---|---|---|
${spec.apiContracts.endpoints
  .map(
    (e) =>
      `| ${e.method} | \`${e.path}\` | ${e.summary} | ${e.auth} | ${e.idempotency ? 'Yes' : 'No'} | ${e.rateLimit} |`
  )
  .join('\n')}

### 5. Security & Isolation Guards
${spec.apiContracts.securityGuards
  .map((g) => `- **${g.title}** (${g.status}): ${g.enforcement}`)
  .join('\n')}
`;
    } else if (format === 'prisma') {
      filename = 'schema.prisma';
      content = spec.databaseSchema.code;
    } else if (format === 'prd') {
      filename = `${slug}-PRD.md`;
      content = `# Product Requirements Document (PRD): ${spec.conceptName}
**Generated By**: Quzar Ship Architect  
**Generated Date**: ${spec.generatedAt}

## 1. Product Vision
${spec.problemStatement}

## 2. Infrastructure & Technical Stack
- Database: ${spec.targetDatabase}
- Auth: ${spec.authProvider}
- Deploy: ${spec.deploymentTarget}

## 3. 14-Day Sprint Execution Plan
${sprintDays
  .map(
    (d) =>
      `### Day ${d.day} [${d.phase}] - ${d.title} (Status: ${d.completed ? 'COMPLETED' : 'PENDING'})
${d.deliverables.map((del) => `- [${d.completed ? 'x' : ' '}] ${del}`).join('\n')}
`
  )
  .join('\n')}
`;
    } else if (format === 'json') {
      filename = `${slug}-spec.json`;
      content = JSON.stringify(spec, null, 2);
    }

    downloadFile(content, filename);
    setDownloadSuccess(format.toUpperCase());
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="w-full bg-[#121214] border border-white/10 rounded-none font-mono text-xs">
      {/* Top Banner / Concept Title & Badges */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#09090b]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              ARCHITECTURE SPECIFICATION · READY
            </span>
            <span className="text-[10px] bg-[#18181b] border border-zinc-800 text-zinc-400 px-1.5 py-0.5">
              ID: {spec.id}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1">
            {spec.conceptName}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl font-sans line-clamp-2">
            {spec.problemStatement}
          </p>
        </div>

        {/* Primitive Badges & Mini 14-Day Progress */}
        <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="px-2 py-1 bg-[#18181b] border border-white/10 text-cyan-400 text-[11px] font-semibold">
              DB: {spec.targetDatabase}
            </div>
            <div className="px-2 py-1 bg-[#18181b] border border-white/10 text-emerald-400 text-[11px] font-semibold">
              AUTH: {spec.authProvider}
            </div>
            <div className="px-2 py-1 bg-[#18181b] border border-white/10 text-amber-400 text-[11px] font-semibold">
              DEPLOY: {spec.deploymentTarget}
            </div>
          </div>

          {/* Live 14-Day Launch Checklist Progress Bar */}
          <div className="w-full md:w-56 flex items-center space-x-2">
            <span className="text-[10px] text-zinc-400 whitespace-nowrap">
              14-DAY PLAN: <strong className="text-cyan-400 tabular-nums">{progressPercent}%</strong>
            </span>
            <div className="flex-1 h-1.5 bg-[#18181b] border border-zinc-800 overflow-hidden">
              <div
                ref={roadmapFillRef}
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intuitive Tab Rail */}
      <div className="border-b border-zinc-800 bg-[#09090b] flex overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('topology')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'topology'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>1. OVERVIEW & ARCHITECTURE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ui')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'ui'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-purple-400" />
          <span>2. SCREENS & UI PLAN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'roadmap'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>3. 14-DAY LAUNCH PLAN ({progressPercent}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('costs')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'costs'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>4. HOSTING & BUDGET</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'database'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>5. DATABASE ({spec.databaseSchema.tablesCount} TABLES)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer rounded-none active:translate-y-[1px] ${
            activeTab === 'api'
              ? 'border-cyan-400 text-white bg-[#121214] font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>6. API & SECURITY</span>
        </button>
      </div>

      {/* Modular Tab Content Panes with GSAP Morphing & Staggered Reveal */}
      <div
        ref={tabContentRef}
        className="p-4 sm:p-6 bg-[#09090b]/40 min-h-[460px]"
      >
        {activeTab === 'topology' && <ArchitectureTab spec={spec} />}
        {activeTab === 'database' && <DatabaseTab spec={spec} />}
        {activeTab === 'api' && <ApiContractTab spec={spec} />}
        {activeTab === 'ui' && <UiBlueprintTab spec={spec} />}
        {activeTab === 'roadmap' && (
          <RoadmapTab sprintDays={sprintDays} onToggleDay={handleToggleDay} />
        )}
        {activeTab === 'costs' && <CostMatrixTab spec={spec} />}
      </div>

      {/* Action Bar: Exports & Ship CTA */}
      <div className="p-4 sm:p-5 bg-[#09090b] border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest mr-2 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT:</span>
          </span>

          <button
            type="button"
            onClick={() => handleExport('architecture')}
            className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
          >
            ARCHITECTURE.MD
          </button>

          <button
            type="button"
            onClick={() => handleExport('prisma')}
            className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
          >
            SCHEMA.PRISMA
          </button>

          <button
            type="button"
            onClick={() => handleExport('prd')}
            className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
          >
            PRD.MD
          </button>

          <button
            type="button"
            onClick={() => handleExport('json')}
            className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
          >
            SPEC JSON
          </button>

          {downloadSuccess && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1 ml-2">
              <Check className="w-3 h-3" />
              <span>{downloadSuccess} DOWNLOADED</span>
            </span>
          )}
        </div>

        {/* Quzar Studio CTA (Directive 20: Clean Unbracketed CTA) */}
        <a
          href="https://quzar-io.web.app"
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[220px] inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-cyan-400 text-black hover:bg-white hover:text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none active:translate-y-[1px] shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <span>SHIP WITH QUZAR STUDIO</span>
          <ExternalLink className="w-3.5 h-3.5 text-black" />
        </a>
      </div>
    </div>
  );
}
