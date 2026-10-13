'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { IntakeWizard } from '../../components/IntakeWizard';
import { SpecViewer } from '../../components/SpecViewer';
import { PRESETS } from '../../data/presets';
import {
  ArchitectureSpec,
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../../types/spec';

export default function ToolPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ai-saas');
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(
    PRESETS[0].sampleSpec
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const scrollToResult = () => {
    const el = document.getElementById('blueprint-result');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActiveSpec(found.sampleSpec);
    }
  };

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
          concept: values.problemStatement,
          targetAudience: values.targetAudience || 'Customers & Teams',
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
                'Automated full-stack cloud architecture',
              diagramNodes: [
                {
                  id: 'edge',
                  label: 'EDGE GATEWAY',
                  role:
                    raw.architecture?.components?.edge?.responsibility ||
                    'Global Traffic & Security',
                  tier: 'Edge Network',
                  protocol: 'HTTP/3',
                },
                {
                  id: 'frontend',
                  label: 'WEB APPLICATION',
                  role:
                    raw.architecture?.components?.frontend?.responsibility ||
                    'Interactive User Interface',
                  tier: 'Client UI',
                  protocol: 'HTTPS',
                },
                {
                  id: 'backend',
                  label: 'APPLICATION SERVER',
                  role:
                    raw.architecture?.components?.backend?.responsibility ||
                    'Core Product Logic',
                  tier: 'API Layer',
                  protocol: 'REST',
                },
                {
                  id: 'queue',
                  label: 'BACKGROUND WORKER',
                  role:
                    raw.architecture?.components?.queue?.responsibility ||
                    'Automated Tasks & Emails',
                  tier: 'Worker',
                  protocol: 'Queue',
                },
                {
                  id: 'db',
                  label: 'PRIMARY DATABASE',
                  role:
                    raw.architecture?.components?.cache?.responsibility ||
                    'Secure Data Storage',
                  tier: 'Database',
                  protocol: 'TLS',
                },
              ],
              services: [
                {
                  name: 'Web Application & API',
                  type: 'Core Platform',
                  tech:
                    raw.architecture?.techStack?.framework?.name ||
                    'Next.js Full-Stack',
                  description:
                    raw.architecture?.techStack?.framework?.rationale ||
                    'Fast, SEO-friendly interface and backend routes',
                },
                {
                  name: 'Primary Data Store',
                  type: 'Database',
                  tech:
                    raw.architecture?.techStack?.database?.name ||
                    values.targetDatabase,
                  description:
                    raw.architecture?.techStack?.database?.rationale ||
                    'Reliable structured storage with automated backups',
                },
                {
                  name: 'User Accounts & Security',
                  type: 'Authentication',
                  tech:
                    raw.architecture?.techStack?.auth?.name ||
                    values.authProvider,
                  description:
                    raw.architecture?.techStack?.auth?.rationale ||
                    'Secure sign-in, session management, and access control',
                },
              ],
              telemetry: {
                ingressLatency: '18ms',
                dbQueryLatency: '4.5ms',
                edgeColdStart: '25ms',
              },
            },
            databaseSchema: {
              filename: 'schema.prisma',
              tablesCount: raw.database?.entities?.length || 6,
              relationsCount: 8,
              description: `Database schema automatically designed for ${values.conceptName}`,
              code:
                raw.database?.prismaSchemaCode ||
                `// Prisma Database Schema\ndatasource db {\n  provider = "${values.targetDatabase.toLowerCase()}"\n  url = env("DATABASE_URL")\n}`,
            },
            apiContracts: {
              endpoints: (raw.apiContract?.endpoints || []).map((ep: any) => ({
                method: ep.method,
                path: ep.path,
                summary: ep.summary,
                auth: ep.authRequired ? 'Authenticated' : 'Public',
                idempotency: ['POST', 'PUT', 'DELETE'].includes(ep.method),
                rateLimit: ep.rateLimit || '120 req/min',
              })),
              securityGuards: [
                {
                  title: 'Account & Workspace Privacy',
                  policy: 'Data Isolation',
                  enforcement:
                    'Every user and team can only access their own private records.',
                  status: 'ENFORCED',
                },
                {
                  title: 'Encrypted Credentials',
                  policy: 'Secret Protection',
                  enforcement:
                    'Passwords and API keys are encrypted and never exposed in responses.',
                  status: 'ENFORCED',
                },
                {
                  title: 'Safe Payments & Actions',
                  policy: 'Duplicate Prevention',
                  enforcement:
                    'Prevents accidental double charges or duplicate form submissions.',
                  status: 'ENFORCED',
                },
              ],
            },
            uiBlueprint: {
              componentTree: [
                {
                  category: 'Core Interface',
                  components: [
                    {
                      name: 'PrimaryAction',
                      role: 'Main user call-to-action buttons',
                      spec: 'High Contrast',
                    },
                    {
                      name: 'StatusBadge',
                      role: 'Live progress and account status indicator',
                      spec: 'Clear Feedback',
                    },
                  ],
                },
                {
                  category: 'Key Screens',
                  components: [
                    {
                      name: 'MainDashboard',
                      role: 'Central hub where users manage their activity',
                      spec: 'Clean Layout',
                    },
                  ],
                },
              ],
              designTokens: [
                {
                  token: '--surface-0',
                  value: '#000000',
                  rule: 'Main page background',
                },
                {
                  token: '--surface-1',
                  value: '#09090b',
                  rule: 'Navigation and sidebar panels',
                },
                {
                  token: '--surface-2',
                  value: '#121214',
                  rule: 'Content cards and tables',
                },
                {
                  token: '--surface-3',
                  value: '#18181b',
                  rule: 'Hover and active highlights',
                },
              ],
              accessibilityGuards: [
                {
                  guard: 'Readable Contrast & Keyboard Support',
                  level: 'WCAG AAA',
                  spec: 'Crisp typography and full keyboard navigation across all screens',
                },
              ],
            },
            sprintRoadmap: {
              totalDays: 14,
              velocityRatio: '14-Day Launch Plan',
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
                  name: 'Launch / Starter',
                  users: 'Up to 1,000 Users',
                  monthlyTotal: `$${raw.costMatrix?.totalEstimatedStarterCost || 0}.00 / mo`,
                  margin: 'Free-Tier Friendly',
                  breakdown: (raw.costMatrix?.items || []).map((ci: any) => ({
                    resource: ci.serviceName,
                    provider: ci.tier,
                    cost: `$${ci.estimatedMonthlyCostUsd}.00`,
                  })),
                },
                {
                  name: 'Growing Business',
                  users: '50,000+ Users',
                  monthlyTotal: '$190.00 / mo',
                  margin: 'High Efficiency',
                  breakdown: [
                    {
                      resource: 'Web Hosting',
                      provider: values.deploymentTarget,
                      cost: '$40.00',
                    },
                    {
                      resource: 'Managed Cloud Database',
                      provider: values.targetDatabase,
                      cost: '$100.00',
                    },
                    {
                      resource: 'Background Tasks & Cache',
                      provider: 'Managed Redis',
                      cost: '$50.00',
                    },
                  ],
                },
              ],
              projectedSavings:
                'Starts at $0/month on modern free tiers until your user base grows',
              cachingImpact:
                'Smart caching keeps your monthly server bills low even during traffic spikes',
            },
          };

          setActiveSpec(mappedSpec);
          setIsGenerating(false);
          setTimeout(scrollToResult, 100);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback to local synthesis', err);
    }

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
      };

      setActiveSpec(customSpec);
      setIsGenerating(false);
      setTimeout(scrollToResult, 100);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Step-by-step Guided Builder */}
        <section>
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Product Blueprint Builder
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Answer 3 simple questions below to generate your complete product plan, 14-day roadmap, and developer specs.
            </p>
          </div>

          <IntakeWizard
            onGenerateSpec={handleGenerateCustomSpec}
            onSelectPreset={handleSelectPreset}
            isGenerating={isGenerating}
            selectedPresetId={selectedPresetId}
          />
        </section>

        {/* Generated Result */}
        <section id="blueprint-result" className="pt-4 border-t border-zinc-800/80">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                Your Generated Blueprint
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {activeSpec.conceptName}
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              Click any tab below to explore or download files at the bottom
            </span>
          </div>

          <SpecViewer spec={activeSpec} />
        </section>
      </main>
    </div>
  );
}
