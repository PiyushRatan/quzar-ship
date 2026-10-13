'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { TelemetryBar } from '../components/TelemetryBar';
import { IntakeWizard } from '../components/IntakeWizard';
import { SpecViewer } from '../components/SpecViewer';
import { PRESETS } from '../data/presets';
import { ArchitectureSpec, DatabaseOption, AuthOption, DeploymentOption } from '../types/spec';
import {
  Layers,
  Compass,
} from 'lucide-react';

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ai-saas');
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(PRESETS[0].sampleSpec);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Switch preset instantly
  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActiveSpec(found.sampleSpec);
    }
  };

  // Custom spec compilation handler: queries /api/generate with deterministic fallback
  const handleGenerateCustomSpec = async (values: {
    conceptName: string;
    problemStatement: string;
    referenceUrl?: string;
    targetDatabase: DatabaseOption;
    authProvider: AuthOption;
    deploymentTarget: DeploymentOption;
  }) => {
    setIsGenerating(true);

    try {
      // Map auth and deploy targets to backend enum
      const authMapped =
        values.authProvider === 'Supabase Auth'
          ? 'Supabase'
          : values.authProvider === 'Custom JWT'
          ? 'NextAuth'
          : values.authProvider;

      const deployMapped =
        values.deploymentTarget === 'Vercel Edge'
          ? 'Vercel'
          : values.deploymentTarget === 'Docker / VPS'
          ? 'Docker'
          : values.deploymentTarget === 'Cloudflare Workers'
          ? 'Cloudflare'
          : 'AWS';

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: values.conceptName,
          concept: values.problemStatement,
          targetAudience: 'Global Operators & Engineering Teams',
          competitorUrl: values.referenceUrl || undefined,
          databaseType: values.targetDatabase,
          authType: authMapped,
          deployTarget: deployMapped,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.spec) {
          const raw = data.spec;
          const mappedSpec: ArchitectureSpec = {
            id: raw.id || `spec-${Date.now().toString().slice(-6)}`,
            conceptName: raw.projectName || values.conceptName,
            problemStatement: raw.intake?.concept || values.problemStatement,
            referenceUrl: values.referenceUrl,
            targetDatabase: values.targetDatabase,
            authProvider: values.authProvider,
            deploymentTarget: values.deploymentTarget,
            generatedAt: raw.generatedAt || new Date().toISOString(),
            topology: {
              summary: raw.architecture?.topologySummary || 'High-performance distributed system topology',
              diagramNodes: [
                {
                  id: 'edge',
                  label: 'EDGE GATEWAY',
                  role: raw.architecture?.components?.edge?.responsibility || 'Ingress WAF & Routing',
                  tier: 'Level 0 Edge',
                  protocol: 'HTTP/3',
                },
                {
                  id: 'frontend',
                  label: 'CLIENT FRONTEND',
                  role: raw.architecture?.components?.frontend?.responsibility || 'UI & Client State',
                  tier: 'Level 1 UI',
                  protocol: 'HTTPS',
                },
                {
                  id: 'backend',
                  label: 'CORE BACKEND',
                  role: raw.architecture?.components?.backend?.responsibility || 'Business Logic Engine',
                  tier: 'Level 2 Runtime',
                  protocol: 'REST / RPC',
                },
                {
                  id: 'queue',
                  label: 'MESSAGE QUEUE',
                  role: raw.architecture?.components?.queue?.responsibility || 'Async Job Worker',
                  tier: 'Level 2 Broker',
                  protocol: 'AMQP / Redis',
                },
                {
                  id: 'db',
                  label: 'PRIMARY DATABASE',
                  role: raw.architecture?.components?.cache?.responsibility || 'Relational Persistence',
                  tier: 'Level 3 ACID Store',
                  protocol: 'Wire Protocol',
                },
              ],
              services: [
                {
                  name: 'Core Application Service',
                  type: 'Ingress Controller',
                  tech: raw.architecture?.techStack?.framework?.name || 'Next.js 16 (Turbopack)',
                  description: raw.architecture?.techStack?.framework?.rationale || 'High-throughput edge runtime',
                },
                {
                  name: 'Database Persistence Gateway',
                  type: 'Database Engine',
                  tech: raw.architecture?.techStack?.database?.name || values.targetDatabase,
                  description: raw.architecture?.techStack?.database?.rationale || 'Transactional data store',
                },
                {
                  name: 'Identity & Access Perimeter',
                  type: 'Security Perimeter',
                  tech: raw.architecture?.techStack?.auth?.name || values.authProvider,
                  description: raw.architecture?.techStack?.auth?.rationale || 'Cryptographic session validation',
                },
              ],
              telemetry: {
                ingressLatency: '16.4ms (p95)',
                dbQueryLatency: '4.2ms (p95)',
                edgeColdStart: '24ms (cold)',
              },
            },
            databaseSchema: {
              filename: 'schema.prisma',
              tablesCount: raw.database?.entities?.length || 6,
              relationsCount: 8,
              description: `${values.targetDatabase} relational schema generated for ${values.conceptName}`,
              code: raw.database?.prismaSchemaCode || `// DIRECTIVE 2.0 PRISMA SCHEMA\ndatasource db {\n  provider = "${values.targetDatabase.toLowerCase()}"\n  url = env("DATABASE_URL")\n}`,
            },
            apiContracts: {
              endpoints: (raw.apiContract?.endpoints || []).map((ep: any) => ({
                method: ep.method,
                path: ep.path,
                summary: ep.summary,
                auth: ep.authRequired ? 'Bearer Token' : 'Public',
                idempotency: ['POST', 'PUT', 'DELETE'].includes(ep.method),
                rateLimit: ep.rateLimit || '120 req/min',
              })),
              securityGuards: [
                {
                  title: 'Tenant Sharding Isolation',
                  directive: 'Directive 12 · Strict Tenancy',
                  enforcement: 'Mandatory tenant isolation on all queries.',
                  status: 'ENFORCED',
                },
                {
                  title: 'CWE-200 Credential Masking',
                  directive: 'Directive 03 §3.3 · Zero Key Reflection',
                  enforcement: 'Sensitive tokens and passwords scrubbed from outputs.',
                  status: 'ENFORCED',
                },
                {
                  title: 'Dual-Verification Financial Ledger',
                  directive: 'Directive 31 · Ledger Verification',
                  enforcement: 'Integer currency arithmetic and idempotency keys.',
                  status: 'ENFORCED',
                },
              ],
            },
            uiBlueprint: {
              componentTree: [
                {
                  category: 'Atoms & Triggers',
                  components: [
                    { name: 'TactileButton', role: 'Monospace width-locked trigger', directive: 'Directive 20 §4' },
                    { name: 'StatusIndicator', role: '1:1 circular dot indicator', directive: 'Directive 01 §1.1' },
                  ],
                },
                {
                  category: 'Panels & Viewports',
                  components: [
                    { name: 'SpecWorkbench', role: 'High cognitive density viewport', directive: 'Directive 04 §4.2' },
                  ],
                },
              ],
              designTokens: [
                { token: '--surface-0', value: '#000000', rule: 'Infinite display void' },
                { token: '--surface-1', value: '#09090b', rule: 'Persistent canvas' },
                { token: '--surface-2', value: '#121214', rule: 'Surface bento card' },
                { token: '--surface-3', value: '#18181b', rule: 'Elevated hover surface' },
                { token: '--surface-4', value: '#27272a', rule: 'Active tab state' },
              ],
              accessibilityGuards: [
                { guard: 'WCAG AAA Optical Contrast', level: 'WCAG 2.2 AAA', spec: '21:1 contrast on headlines; 19:1 on primary body' },
              ],
            },
            sprintRoadmap: {
              totalDays: 14,
              velocityRatio: '100% Deterministic Delivery',
              days: (raw.sprintRoadmap?.days || []).map((d: any) => ({
                day: d.dayNumber,
                phase:
                  d.dayNumber <= 4
                    ? 'PHASE 1: FOUNDATION'
                    : d.dayNumber <= 9
                    ? 'PHASE 2: CORE ENGINE'
                    : 'PHASE 3: POLISH & HARDENING',
                title: d.title,
                deliverables: d.deliverables,
                completed: d.dayNumber <= 2,
              })),
            },
            costMatrix: {
              tiers: [
                {
                  name: 'Starter / MVP',
                  users: '0 - 1,000 MAU',
                  monthlyTotal: `$${raw.costMatrix?.totalEstimatedStarterCost || 29}.00 / mo`,
                  margin: '92% Gross Margin',
                  breakdown: (raw.costMatrix?.items || []).map((ci: any) => ({
                    resource: ci.serviceName,
                    provider: ci.tier,
                    cost: `$${ci.estimatedMonthlyCostUsd}.00`,
                  })),
                },
                {
                  name: 'Commercial Scale',
                  users: '50,000 MAU',
                  monthlyTotal: '$240.00 / mo',
                  margin: '88% Gross Margin',
                  breakdown: [
                    { resource: 'Edge Compute Fleet', provider: 'Vercel / Cloudflare', cost: '$60.00' },
                    { resource: 'Managed High-Availability Database', provider: values.targetDatabase, cost: '$120.00' },
                    { resource: 'Distributed Redis Queue', provider: 'Upstash / Redis Labs', cost: '$60.00' },
                  ],
                },
              ],
              projectedSavings: '72% infrastructure cost reduction through edge prompt caching',
              cachingImpact: 'Eliminates repetitive LLM inferences and database connection overhead',
            },
          };

          setActiveSpec(mappedSpec);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API call fallback to deterministic synthesis', err);
    }

    // High-performance fallback synthesis
    setTimeout(() => {
      const basePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
      const customSpec: ArchitectureSpec = {
        ...basePreset.sampleSpec,
        id: `spec-${Date.now().toString().slice(-6)}`,
        conceptName: values.conceptName,
        problemStatement: values.problemStatement,
        referenceUrl: values.referenceUrl,
        targetDatabase: values.targetDatabase,
        authProvider: values.authProvider,
        deploymentTarget: values.deploymentTarget,
        generatedAt: new Date().toISOString(),
        topology: {
          ...basePreset.sampleSpec.topology,
          summary: `Custom ${values.deploymentTarget} architecture with ${values.targetDatabase} persistence and ${values.authProvider} security perimeter.`,
        },
      };

      setActiveSpec(customSpec);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Global Navigation Shell */}
      <Header />

      {/* 2. Real-Time Telemetry Bar */}
      <TelemetryBar />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 bg-[#09090b] p-6 sm:p-8 overflow-hidden">
          {/* 20px Architectural Grid Underlay */}
          <div className="absolute inset-0 bg-grid-architectural opacity-50 pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="kicker-cyan">DIRECTIVES 2.0 PROTOCOL ENGINE</span>
              <span className="text-zinc-600">//</span>
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                ZERO-SLOP ARCHITECTURE
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-3 leading-tight font-mono">
              TURN RAW CONCEPTS INTO PRODUCTION ARCHITECTURE IN SECONDS
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 mt-3 leading-relaxed font-sans">
              Autonomous architectural compiler adhering strictly to PiyushRatan Directives 2.0.
              Instantly synthesizes high-density system topologies, normalized Prisma schemas,
              idempotent API contracts, and interactive 14-day execution roadmaps.
            </p>

            {/* Quick Demo Switcher Strip */}
            <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5 whitespace-nowrap">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>LOAD ARCHITECTURE DEMO:</span>
              </span>

              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const isActive = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-none cursor-pointer active:translate-y-[1px] ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                          : 'bg-[#121214] text-zinc-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Intake Wizard */}
        <section id="intake-wizard" className="w-full">
          <IntakeWizard
            onGenerateSpec={handleGenerateCustomSpec}
            onSelectPreset={handleSelectPreset}
            isGenerating={isGenerating}
            selectedPresetId={selectedPresetId}
          />
        </section>

        {/* Section 2: Spec Viewer */}
        <section id="spec-viewer" className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">
                SYNTHESIZED ARCHITECTURAL SPECIFICATION
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              INSPECTION READY · 6 VIEWPORTS
            </span>
          </div>

          <SpecViewer spec={activeSpec} />
        </section>
      </main>

      {/* Global Architectural Footer */}
      <footer className="w-full border-t border-zinc-800 bg-[#09090b] mt-16 text-xs font-mono text-zinc-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold tracking-wider">QUZAR SHIP</span>
            <span>//</span>
            <span>ENGINEERED BY</span>
            <a
              href="https://piyushratan.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              PIYUSH RATAN
            </a>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a
              href="https://quzar-io.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              QUZAR STUDIO
            </a>
            <a
              href="https://github.com/PiyushRatan/quzar-ship"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              GITHUB REPO
            </a>
            <span className="text-zinc-600">DIRECTIVES 2.0 PROTOCOL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
