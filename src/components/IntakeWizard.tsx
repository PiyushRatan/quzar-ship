'use client';

import React, { useState } from 'react';
import {
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../types/spec';
import { PRESETS } from '../data/presets';
import {
  Sparkles,
  Database,
  Lock,
  Cloud,
  Globe,
  Loader2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface IntakeWizardProps {
  onGenerateSpec: (values: {
    conceptName: string;
    problemStatement: string;
    referenceUrl?: string;
    targetDatabase: DatabaseOption;
    authProvider: AuthOption;
    deploymentTarget: DeploymentOption;
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

export function IntakeWizard({
  onGenerateSpec,
  onSelectPreset,
  isGenerating,
  selectedPresetId,
}: IntakeWizardProps) {
  const [conceptName, setConceptName] = useState(
    'CognitiveMesh AI Platform'
  );
  const [problemStatement, setProblemStatement] = useState(
    'High-throughput multi-tenant AI reasoning engine requiring streaming token telemetry, vectorized knowledge retrieval with pgvector, strict per-tenant token rate quotas, and sub-100ms cold starts on distributed edge runtimes.'
  );
  const [referenceUrl, setReferenceUrl] = useState(
    'https://github.com/anthropics/anthropic-sdk-typescript'
  );
  const [targetDatabase, setTargetDatabase] =
    useState<DatabaseOption>('PostgreSQL');
  const [authProvider, setAuthProvider] =
    useState<AuthOption>('NextAuth');
  const [deploymentTarget, setDeploymentTarget] =
    useState<DeploymentOption>('Vercel Edge');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptName.trim() || !problemStatement.trim()) return;

    onGenerateSpec({
      conceptName,
      problemStatement,
      referenceUrl: referenceUrl.trim() || undefined,
      targetDatabase,
      authProvider,
      deploymentTarget,
    });
  };

  return (
    <div className="w-full bg-[#121214] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 rounded-none p-5 sm:p-6 font-mono">
      {/* Kicker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
        <div>
          <div className="kicker-cyan">INTAKE PIPELINE // STEP 01</div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide mt-0.5">
            SPECIFICATION COMPILER PARAMETERS
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Configure system primitives to synthesize production blueprints, database schemas, and API contracts.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>PARSER READY</span>
        </div>
      </div>

      {/* 1-Click Preset Accelerator */}
      <div className="mt-5">
        <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-semibold flex items-center space-x-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>ONE-CLICK SPEC PRESETS</span>
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESETS.map((preset) => {
            const isCurrent =
              selectedPresetId === preset.id ||
              conceptName === preset.conceptName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 text-left border transition-all cursor-pointer rounded-none active:translate-y-[1px] ${
                  isCurrent
                    ? 'bg-[#18181b] border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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

      {/* Form Form Body */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Concept Name */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-300 mb-1.5 font-semibold">
            CONCEPT NAME / ENGINE TITLE
          </label>
          <input
            type="text"
            required
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
            placeholder="e.g. CognitiveMesh AI Platform"
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors rounded-none font-mono"
          />
        </div>

        {/* Problem Statement & Core Idea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs uppercase tracking-widest text-zinc-300 font-semibold">
              PROBLEM STATEMENT & ARCHITECTURAL INTENT
            </label>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              HIGH COGNITIVE DENSITY
            </span>
          </div>
          <textarea
            required
            rows={3}
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="Describe throughput targets, state persistence requirements, security guards, and data topology..."
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors rounded-none font-mono leading-relaxed resize-y"
          />
        </div>

        {/* Optional Competitor URL */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-300 font-semibold flex items-center space-x-1.5">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>REFERENCE OR COMPETITOR URL (OPTIONAL CRAWLER)</span>
            </label>
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
              AUTO-EXTRACT
            </span>
          </div>
          <input
            type="url"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://github.com/org/repo or https://product.domain"
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-cyan-400 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors rounded-none font-mono"
          />
        </div>

        {/* Technical Primitives Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Target Database */}
          <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-none">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-semibold flex items-center space-x-1.5">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>TARGET DATABASE</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DATABASES.map((db) => {
                const active = targetDatabase === db;
                return (
                  <button
                    key={db}
                    type="button"
                    onClick={() => setTargetDatabase(db)}
                    className={`px-2 py-1 text-[11px] font-mono tracking-wider transition-colors cursor-pointer rounded-none active:translate-y-[1px] ${
                      active
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {db}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Provider */}
          <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-none">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-semibold flex items-center space-x-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>AUTH PROVIDER</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AUTH_PROVIDERS.map((auth) => {
                const active = authProvider === auth;
                return (
                  <button
                    key={auth}
                    type="button"
                    onClick={() => setAuthProvider(auth)}
                    className={`px-2 py-1 text-[11px] font-mono tracking-wider transition-colors cursor-pointer rounded-none active:translate-y-[1px] ${
                      active
                        ? 'bg-emerald-400 text-black font-bold'
                        : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {auth}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deployment Target */}
          <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-none">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-semibold flex items-center space-x-1.5">
              <Cloud className="w-3 h-3 text-amber-400" />
              <span>DEPLOYMENT TARGET</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEPLOYMENT_TARGETS.map((deploy) => {
                const active = deploymentTarget === deploy;
                return (
                  <button
                    key={deploy}
                    type="button"
                    onClick={() => setDeploymentTarget(deploy)}
                    className={`px-2 py-1 text-[11px] font-mono tracking-wider transition-colors cursor-pointer rounded-none active:translate-y-[1px] ${
                      active
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {deploy}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80">
          <div className="text-[11px] text-zinc-500 font-mono flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>DIRECTIVES 2.0 PROTOCOL ENGINE READY</span>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center px-6 py-3 border border-white/20 bg-white text-black hover:bg-cyan-400 hover:text-black transition-colors duration-150 font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-none cursor-pointer active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                <span>COMPILING SPECIFICATION...</span>
              </>
            ) : (
              <span>COMPILE ARCHITECTURE SPEC</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
