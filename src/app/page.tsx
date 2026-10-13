'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { IntakeWizard } from '../components/IntakeWizard';
import { SpecViewer } from '../components/SpecViewer';
import { PRESETS } from '../data/presets';
import {
  ArchitectureSpec,
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../types/spec';
import {
  Layers,
  Compass,
  ArrowRight,
  Database,
  Globe,
  ShieldCheck,
  Calendar,
  FileCode,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ai-saas');
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(
    PRESETS[0].sampleSpec
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Switch preset instantly
  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActiveSpec(found.sampleSpec);
    }
  };

  // Custom spec compilation handler
  const handleGenerateCustomSpec = async (values: {
    conceptName: string;
    problemStatement: string;
    targetAudience: string;
    referenceUrl?: string;
    targetDatabase: DatabaseOption;
    authProvider: AuthOption;
    deploymentTarget: DeploymentOption;
    selectedModules: string[];
    scaleTarget: string;
  }) => {
    setIsGenerating(true);

    try {
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
          concept: `${values.problemStatement} [Enabled Modules: ${values.selectedModules.join(', ')}] [Scale Target: ${values.scaleTarget}]`,
          targetAudience:
            values.targetAudience || 'Global Operators & Engineering Teams',
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
              summary:
                raw.architecture?.topologySummary ||
                'High-performance distributed system topology',
              diagramNodes: [
                {
                  id: 'edge',
                  label: 'EDGE GATEWAY',
                  role:
                    raw.architecture?.components?.edge?.responsibility ||
                    'Ingress WAF & Routing',
                  tier: 'Edge Network',
                  protocol: 'HTTP/3',
                },
                {
                  id: 'frontend',
                  label: 'CLIENT FRONTEND',
                  role:
                    raw.architecture?.components?.frontend?.responsibility ||
                    'UI & Client State',
                  tier: 'Application UI',
                  protocol: 'HTTPS',
                },
                {
                  id: 'backend',
                  label: 'CORE BACKEND',
                  role:
                    raw.architecture?.components?.backend?.responsibility ||
                    'Business Logic Engine',
                  tier: 'API Runtime',
                  protocol: 'REST / RPC',
                },
                {
                  id: 'queue',
                  label: 'MESSAGE QUEUE',
                  role:
                    raw.architecture?.components?.queue?.responsibility ||
                    'Async Job Worker',
                  tier: 'Worker Broker',
                  protocol: 'Redis / AMQP',
                },
                {
                  id: 'db',
                  label: 'PRIMARY DATABASE',
                  role:
                    raw.architecture?.components?.cache?.responsibility ||
                    'Relational Persistence',
                  tier: 'Primary Store',
                  protocol: 'TCP / TLS',
                },
              ],
              services: [
                {
                  name: 'Core Application Service',
                  type: 'Ingress Controller',
                  tech:
                    raw.architecture?.techStack?.framework?.name ||
                    'Next.js App Router',
                  description:
                    raw.architecture?.techStack?.framework?.rationale ||
                    'High-throughput server and edge runtime',
                },
                {
                  name: 'Database Persistence Gateway',
                  type: 'Database Engine',
                  tech:
                    raw.architecture?.techStack?.database?.name ||
                    values.targetDatabase,
                  description:
                    raw.architecture?.techStack?.database?.rationale ||
                    'Transactional data store with automated indexing',
                },
                {
                  name: 'Identity & Access Perimeter',
                  type: 'Security Perimeter',
                  tech:
                    raw.architecture?.techStack?.auth?.name ||
                    values.authProvider,
                  description:
                    raw.architecture?.techStack?.auth?.rationale ||
                    'Session validation and role-based access control',
                },
              ],
              telemetry: {
                ingressLatency: '18ms (p95)',
                dbQueryLatency: '4.5ms (p95)',
                edgeColdStart: '25ms',
              },
            },
            databaseSchema: {
              filename: 'schema.prisma',
              tablesCount: raw.database?.entities?.length || 6,
              relationsCount: 8,
              description: `${values.targetDatabase} relational schema generated for ${values.conceptName}`,
              code:
                raw.database?.prismaSchemaCode ||
                `// Production Prisma Schema\ndatasource db {\n  provider = "${values.targetDatabase.toLowerCase()}"\n  url = env("DATABASE_URL")\n}`,
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
                  title: 'Multi-Tenant Data Isolation',
                  policy: 'Strict Workspace Partitioning',
                  enforcement:
                    'Mandatory tenant scoping enforced on all database reads and writes.',
                  status: 'ENFORCED',
                },
                {
                  title: 'Zero Secret Reflection',
                  policy: 'Credential Scrubbing',
                  enforcement:
                    'API keys, hashes, and internal tokens are stripped at serializer boundaries.',
                  status: 'ENFORCED',
                },
                {
                  title: 'Idempotent Mutation Ledger',
                  policy: 'Atomic State Transitions',
                  enforcement:
                    'State-mutating POST/PUT endpoints enforce idempotency keys.',
                  status: 'ENFORCED',
                },
              ],
            },
            uiBlueprint: {
              componentTree: [
                {
                  category: 'Core Primitives',
                  components: [
                    {
                      name: 'ActionTrigger',
                      role: 'Primary interactive button control',
                      spec: 'Width-Locked Control',
                    },
                    {
                      name: 'StatusBadge',
                      role: 'Live state and health indicator',
                      spec: 'High-Contrast Semantic',
                    },
                  ],
                },
                {
                  category: 'Application Views',
                  components: [
                    {
                      name: 'WorkspaceShell',
                      role: 'Multi-pane navigation and data viewport',
                      spec: 'Responsive Grid',
                    },
                  ],
                },
              ],
              designTokens: [
                {
                  token: '--surface-0',
                  value: '#000000',
                  rule: 'Root canvas background',
                },
                {
                  token: '--surface-1',
                  value: '#09090b',
                  rule: 'Primary navigation and sidebar surface',
                },
                {
                  token: '--surface-2',
                  value: '#121214',
                  rule: 'Card and module container',
                },
                {
                  token: '--surface-3',
                  value: '#18181b',
                  rule: 'Interactive hover and active state',
                },
              ],
              accessibilityGuards: [
                {
                  guard: 'High Optical Contrast',
                  level: 'WCAG 2.2 AAA',
                  spec: '21:1 contrast on primary headings; keyboard navigable focus rings',
                },
              ],
            },
            sprintRoadmap: {
              totalDays: 14,
              velocityRatio: '14-Day Production Delivery',
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
                    {
                      resource: 'Compute Fleet',
                      provider: values.deploymentTarget,
                      cost: '$60.00',
                    },
                    {
                      resource: 'Managed High-Availability Database',
                      provider: values.targetDatabase,
                      cost: '$120.00',
                    },
                    {
                      resource: 'Distributed Cache & Queue',
                      provider: 'Redis Cloud',
                      cost: '$60.00',
                    },
                  ],
                },
              ],
              projectedSavings:
                '70% infrastructure cost reduction through edge caching and connection pooling',
              cachingImpact:
                'Minimizes redundant compute cycles and database read amplification',
            },
          };

          setActiveSpec(mappedSpec);
          setIsGenerating(false);
          scrollTo('preview');
          return;
        }
      }
    } catch (err) {
      console.warn('API call fallback to local synthesis', err);
    }

    // Fallback synthesis
    setTimeout(() => {
      const basePreset =
        PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
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
          summary: `Custom ${values.deploymentTarget} architecture with ${values.targetDatabase} persistence and ${values.authProvider} authentication.`,
        },
      };

      setActiveSpec(customSpec);
      setIsGenerating(false);
      scrollTo('preview');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative border-b border-white/10 bg-[#050507] overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 bg-grid-architectural opacity-40 pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#121214] border border-white/10 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
                <span>Product Architecture & Specification Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] font-mono">
                Turn Product Concepts into Production Architecture.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 mt-5 leading-relaxed max-w-2xl">
                Transform raw startup ideas or competitor URLs into complete system topologies,
                production-ready Prisma database schemas, REST API contracts, and 14-day execution
                roadmaps in seconds.
              </p>

              {/* Hero CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollTo('studio')}
                  className="inline-flex items-center justify-center space-x-3 px-7 py-4 bg-white text-black hover:bg-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <span>USE TOOL — LAUNCH ARCHITECT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo('preview')}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-4 bg-[#121214] text-zinc-200 hover:text-white border border-white/15 hover:border-white/40 font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>EXPLORE SAMPLE SPECS</span>
                </button>
              </div>

              {/* Trust / Capability Strip */}
              <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-white font-bold">SCHEMA.PRISMA</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Normalized & Indexed
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold">API CONTRACTS</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    REST, RPC & Auth Guards
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold">WEB CRAWLER</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Competitor Tech Extraction
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold">14-DAY ROADMAP</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Daily Engineering Tasks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE FEATURES SECTION */}
        <section id="features" className="py-16 border-b border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                CORE CAPABILITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                Everything Needed to Ship Production Software
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0e0e11] border border-white/10 p-6">
                <Globe className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Competitor URL Analysis
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Supply any reference or competitor website. Our multi-page crawler extracts tech stack signals, navigation flows, and feature gaps automatically.
                </p>
              </div>

              <div className="bg-[#0e0e11] border border-white/10 p-6">
                <Database className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Database Schema Compiler
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Generates syntactically valid Prisma schemas complete with relations, foreign key cascades, and indexes tailored to PostgreSQL, MySQL, MongoDB, or Firestore.
                </p>
              </div>

              <div className="bg-[#0e0e11] border border-white/10 p-6">
                <ShieldCheck className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  API & Security Contracts
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Defines structured REST and streaming routes with authentication policies, rate limits, idempotency keys, and multi-tenant isolation rules.
                </p>
              </div>

              <div className="bg-[#0e0e11] border border-white/10 p-6">
                <Calendar className="w-6 h-6 text-purple-400 mb-4" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  14-Day Execution Plan
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Breaks your entire MVP build into concrete daily deliverables across foundation, backend, frontend, and production hardening phases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GUIDED ARCHITECTURE STUDIO (THE TOOL) */}
        <section id="studio" className="py-16 border-b border-white/10 bg-[#050507]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <IntakeWizard
              onGenerateSpec={handleGenerateCustomSpec}
              onSelectPreset={handleSelectPreset}
              isGenerating={isGenerating}
              selectedPresetId={selectedPresetId}
            />
          </div>
        </section>

        {/* 4. INTERACTIVE SPECIFICATION WORKBENCH */}
        <section id="preview" className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  INTERACTIVE SPECIFICATION WORKBENCH
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                  Inspect & Export Production Blueprints
                </h2>
              </div>

              {/* Sample Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 uppercase mr-1">
                  Sample Specs:
                </span>
                {PRESETS.map((p) => {
                  const isActive = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
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
              </div>
            </div>

            <SpecViewer spec={activeSpec} />
          </div>
        </section>

        {/* 5. 14-DAY DELIVERY & STUDIO CTA */}
        <section id="roadmap" className="py-16 border-t border-white/10 bg-[#09090b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#121214] border border-white/10 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  FROM SPECIFICATION TO DEPLOYMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2">
                  Ready to Build Your Architecture?
                </h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Export your generated <code className="text-zinc-200">ARCHITECTURE.md</code>,{' '}
                  <code className="text-zinc-200">schema.prisma</code>, and{' '}
                  <code className="text-zinc-200">PRD.md</code> directly into your repository, or
                  partner with Quzar Studio for end-to-end engineering delivery.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => scrollTo('studio')}
                  className="px-6 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  BUILD NEW SPECIFICATION
                </button>
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

      {/* Global Footer */}
      <footer className="w-full border-t border-zinc-800 bg-black text-xs font-mono text-zinc-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold tracking-wider">QUZAR SHIP</span>
            <span>·</span>
            <span>Built by</span>
            <a
              href="https://piyushratan.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              Piyush Ratan
            </a>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a
              href="https://quzar-io.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              Quzar Studio
            </a>
            <a
              href="https://github.com/PiyushRatan/quzar-ship"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
