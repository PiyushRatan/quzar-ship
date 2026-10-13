'use client';

import React, { useState } from 'react';
import {
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../types/spec';
import { PRESETS } from '../data/presets';
import {
  Database,
  Lock,
  Cloud,
  Globe,
  Loader2,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Layers,
  Shield,
  Radio,
  Server,
  DollarSign,
  FileCode,
} from 'lucide-react';

interface IntakeWizardProps {
  onGenerateSpec: (values: {
    conceptName: string;
    problemStatement: string;
    targetAudience: string;
    referenceUrl?: string;
    targetDatabase: DatabaseOption;
    authProvider: AuthOption;
    deploymentTarget: DeploymentOption;
    selectedModules: string[];
    scaleTarget: string;
  }) => void;
  onSelectPreset: (presetId: string) => void;
  isGenerating: boolean;
  selectedPresetId?: string;
}

const DATABASES: DatabaseOption[] = [
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'MongoDB',
  'Firestore',
];

const AUTH_PROVIDERS: AuthOption[] = [
  'NextAuth',
  'Supabase Auth',
  'Clerk',
  'Custom JWT',
];

const DEPLOYMENT_TARGETS: DeploymentOption[] = [
  'Vercel Edge',
  'Docker / VPS',
  'Cloudflare Workers',
  'AWS',
];

const ARCHITECTURAL_MODULES = [
  { id: 'multitenancy', label: 'Multi-Tenant Isolation', desc: 'Row-level and tenant workspace boundary enforcement' },
  { id: 'streaming', label: 'Real-Time SSE & Streaming', desc: 'Low-latency server-sent events and token streaming' },
  { id: 'async-queue', label: 'Async Job Worker Queues', desc: 'Background task scheduling with Redis / BullMQ' },
  { id: 'vector-rag', label: 'Vector Knowledge Retrieval', desc: 'pgvector semantic search and similarity matching' },
  { id: 'billing', label: 'Stripe Billing & Ledger', desc: 'Subscription webhooks and idempotent transactions' },
  { id: 'audit-log', label: 'Cryptographic Audit Trail', desc: 'Immutable security event and access logging' },
];

const SCALE_TARGETS = [
  { id: 'starter', label: 'Starter MVP', desc: 'Optimized for zero-cost starter tiers & rapid launch' },
  { id: 'production', label: 'High-Throughput Production', desc: 'Clustered persistence with connection pooling' },
  { id: 'distributed', label: 'Distributed Edge Mesh', desc: 'Sub-50ms global response times across regional nodes' },
];

export function IntakeWizard({
  onGenerateSpec,
  onSelectPreset,
  isGenerating,
  selectedPresetId,
}: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [conceptName, setConceptName] = useState('CognitiveMesh AI Platform');
  const [problemStatement, setProblemStatement] = useState(
    'High-throughput multi-tenant AI reasoning engine requiring streaming token telemetry, vectorized knowledge retrieval with pgvector, strict per-tenant token rate quotas, and sub-100ms cold starts on distributed edge runtimes.'
  );
  const [targetAudience, setTargetAudience] = useState('Software Engineers & Product Operators');
  const [referenceUrl, setReferenceUrl] = useState('https://github.com/anthropics/anthropic-sdk-typescript');

  const [targetDatabase, setTargetDatabase] = useState<DatabaseOption>('PostgreSQL');
  const [authProvider, setAuthProvider] = useState<AuthOption>('NextAuth');
  const [deploymentTarget, setDeploymentTarget] = useState<DeploymentOption>('Vercel Edge');

  const [selectedModules, setSelectedModules] = useState<string[]>([
    'multitenancy',
    'streaming',
    'vector-rag',
    'billing',
  ]);
  const [scaleTarget, setScaleTarget] = useState('starter');

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setConceptName(found.conceptName);
      setProblemStatement(found.problemStatement);
      setReferenceUrl(found.referenceUrl || '');
      setTargetDatabase(found.targetDatabase);
      setAuthProvider(found.authProvider);
      setDeploymentTarget(found.deploymentTarget);
      onSelectPreset(presetId);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!conceptName.trim() || !problemStatement.trim()) return;

    onGenerateSpec({
      conceptName,
      problemStatement,
      targetAudience,
      referenceUrl: referenceUrl.trim() || undefined,
      targetDatabase,
      authProvider,
      deploymentTarget,
      selectedModules,
      scaleTarget,
    });
  };

  return (
    <div className="w-full bg-[#0e0e11] border border-white/10 rounded-none p-6 sm:p-8 font-mono">
      {/* Studio Header & Step Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            GUIDED ARCHITECTURE STUDIO
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1">
            Configure Your Product Specifications
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Follow the 3-step pipeline to customize database schemas, security guards, API contracts, and roadmap parameters.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center space-x-2">
          {[
            { step: 1, title: 'Concept & Scope' },
            { step: 2, title: 'Stack Primitives' },
            { step: 3, title: 'Modules & Scale' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold border-white'
                    : isDone
                    ? 'bg-[#18181b] text-cyan-400 border-cyan-400/40'
                    : 'bg-[#121214] text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                <span>{s.step}.</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Accelerators */}
      <div className="mt-5 pt-1">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>QUICK-START PRESETS</span>
          </label>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
            1-Click Blueprint Autofill
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESETS.map((preset) => {
            const isCurrent =
              selectedPresetId === preset.id || conceptName === preset.conceptName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 text-left border transition-all cursor-pointer rounded-none active:translate-y-[1px] ${
                  isCurrent
                    ? 'bg-[#18181b] border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {preset.name}
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-1 font-sans">
                  {preset.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Panels */}
      <form onSubmit={handleSubmit} className="mt-6">
        {/* STEP 1: Concept & Scope */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#121214] border border-zinc-800 p-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                Step 1: Product Concept & Core Problem
              </span>
              <p className="text-xs text-zinc-400 font-sans">
                Define the core problem your system solves, its target users, and an optional reference URL.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-1.5 font-semibold">
                Project Title / System Name
              </label>
              <input
                type="text"
                required
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
                placeholder="e.g. CognitiveMesh AI Platform"
                className="w-full bg-[#121214] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-1.5 font-semibold">
                Problem Statement & Architecture Scope
              </label>
              <textarea
                required
                rows={3}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe throughput targets, state persistence requirements, security guards, and data topology..."
                className="w-full bg-[#121214] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono leading-relaxed resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-1.5 font-semibold">
                  Target Audience / End Users
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Enterprise Engineers, SMB Teams"
                  className="w-full bg-[#121214] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-300 mb-1.5 font-semibold flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Competitor or Reference URL (Optional Crawler)</span>
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://github.com/org/repo or https://competitor.com"
                  className="w-full bg-[#121214] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Continue to Stack Primitives</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Stack Primitives */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#121214] border border-zinc-800 p-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                Step 2: Core Engineering Stack & Infrastructure
              </span>
              <p className="text-xs text-zinc-400 font-sans">
                Select your database engine, identity provider, and deployment runtime environment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Target Database */}
              <div className="bg-[#121214] border border-zinc-800 p-4">
                <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-3 font-semibold flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary Database</span>
                </label>
                <div className="space-y-1.5">
                  {DATABASES.map((db) => {
                    const active = targetDatabase === db;
                    return (
                      <button
                        key={db}
                        type="button"
                        onClick={() => setTargetDatabase(db)}
                        className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors cursor-pointer border ${
                          active
                            ? 'bg-cyan-400 text-black font-bold border-cyan-400'
                            : 'bg-[#18181b] text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        {db}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auth Provider */}
              <div className="bg-[#121214] border border-zinc-800 p-4">
                <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-3 font-semibold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authentication System</span>
                </label>
                <div className="space-y-1.5">
                  {AUTH_PROVIDERS.map((auth) => {
                    const active = authProvider === auth;
                    return (
                      <button
                        key={auth}
                        type="button"
                        onClick={() => setAuthProvider(auth)}
                        className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors cursor-pointer border ${
                          active
                            ? 'bg-emerald-400 text-black font-bold border-emerald-400'
                            : 'bg-[#18181b] text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        {auth}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deployment Target */}
              <div className="bg-[#121214] border border-zinc-800 p-4">
                <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-3 font-semibold flex items-center space-x-1.5">
                  <Cloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hosting & Runtime</span>
                </label>
                <div className="space-y-1.5">
                  {DEPLOYMENT_TARGETS.map((deploy) => {
                    const active = deploymentTarget === deploy;
                    return (
                      <button
                        key={deploy}
                        type="button"
                        onClick={() => setDeploymentTarget(deploy)}
                        className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors cursor-pointer border ${
                          active
                            ? 'bg-amber-400 text-black font-bold border-amber-400'
                            : 'bg-[#18181b] text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        {deploy}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs uppercase cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Continue to Modules & Scale</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Modules & Scale (Giving user granular control) */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#121214] border border-zinc-800 p-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                Step 3: Granular Architectural Controls & Feature Modules
              </span>
              <p className="text-xs text-zinc-400 font-sans">
                Fine-tune the exact subsystem capabilities to synthesize into your database schema and API contracts.
              </p>
            </div>

            {/* Feature Modules Toggle Grid */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold">
                Architecture Modules (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ARCHITECTURAL_MODULES.map((mod) => {
                  const isChecked = selectedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3 text-left border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#18181b] border-cyan-400 text-white'
                          : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase">{mod.label}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-sans mt-1">
                        {mod.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Scale */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold">
                Infrastructure Scaling Baseline
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SCALE_TARGETS.map((st) => {
                  const isCurrent = scaleTarget === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setScaleTarget(st.id)}
                      className={`p-3 text-left border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#18181b] border-amber-400 text-white'
                          : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase">{st.label}</div>
                      <p className="text-[11px] text-zinc-500 font-sans mt-1">
                        {st.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs uppercase cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isGenerating}
                className="min-w-[280px] inline-flex items-center justify-center px-6 py-3 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                    <span>SYNTHESIZING SPECIFICATION...</span>
                  </>
                ) : (
                  <span>GENERATE SPECIFICATION</span>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
