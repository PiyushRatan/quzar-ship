'use client';

import React, { useState } from 'react';
import {
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../types/spec';
import { PRESETS } from '../data/presets';
import {
  Globe,
  Loader2,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Compass,
  Rocket,
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

const PRODUCT_TYPES = [
  {
    id: 'webapp',
    label: 'Web App & Dashboard',
    desc: 'Interactive workspace with user accounts and live data',
  },
  {
    id: 'mobile-web',
    label: 'Mobile-First Platform',
    desc: 'Fast, responsive experience designed for phones and tablets',
  },
  {
    id: 'marketplace',
    label: 'Storefront or Portal',
    desc: 'Customer-facing catalog, bookings, or checkout flow',
  },
  {
    id: 'internal',
    label: 'Internal Team Tool',
    desc: 'Operations dashboard to automate your daily workflow',
  },
];

const LAUNCH_STYLES = [
  {
    id: 'starter',
    label: '14-Day Fast MVP',
    desc: 'Essential core features, $0 starter hosting, fastest path to launch',
    db: 'PostgreSQL' as DatabaseOption,
    auth: 'NextAuth' as AuthOption,
    deploy: 'Vercel Edge' as DeploymentOption,
    modules: ['multitenancy'],
  },
  {
    id: 'growth',
    label: 'Growth-Ready Product',
    desc: 'Includes payments, real-time updates, and scalable cloud storage',
    db: 'PostgreSQL' as DatabaseOption,
    auth: 'Supabase Auth' as AuthOption,
    deploy: 'Vercel Edge' as DeploymentOption,
    modules: ['multitenancy', 'streaming', 'billing'],
  },
  {
    id: 'scale',
    label: 'Complete Business Suite',
    desc: 'Full automation, team permissions, AI search, and security logs',
    db: 'PostgreSQL' as DatabaseOption,
    auth: 'Clerk' as AuthOption,
    deploy: 'AWS' as DeploymentOption,
    modules: ['multitenancy', 'streaming', 'async-queue', 'vector-rag', 'billing', 'audit-log'],
  },
];

export function IntakeWizard({
  onGenerateSpec,
  onSelectPreset,
  isGenerating,
  selectedPresetId,
}: IntakeWizardProps) {
  const [step, setStep] = useState<number>(1);

  const [conceptName, setConceptName] = useState('Nova AI Assistant');
  const [problemStatement, setProblemStatement] = useState(
    'A smart customer support assistant that learns from a company website, answers visitor questions instantly 24/7, and captures qualified leads for the sales team.'
  );
  const [referenceUrl, setReferenceUrl] = useState('');
  const [productType, setProductType] = useState('webapp');
  const [launchStyleId, setLaunchStyleId] = useState('growth');

  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setConceptName(found.conceptName);
      setProblemStatement(found.problemStatement);
      setReferenceUrl(found.referenceUrl || '');
      onSelectPreset(presetId);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!conceptName.trim() || !problemStatement.trim()) return;

    const chosenStyle =
      LAUNCH_STYLES.find((s) => s.id === launchStyleId) || LAUNCH_STYLES[1];
    const chosenProduct =
      PRODUCT_TYPES.find((p) => p.id === productType) || PRODUCT_TYPES[0];

    onGenerateSpec({
      conceptName,
      problemStatement: `${problemStatement} (Format: ${chosenProduct.label})`,
      targetAudience: 'Customers & Business Teams',
      referenceUrl: referenceUrl.trim() || undefined,
      targetDatabase: chosenStyle.db,
      authProvider: chosenStyle.auth,
      deploymentTarget: chosenStyle.deploy,
      selectedModules: chosenStyle.modules,
      scaleTarget: chosenStyle.id,
    });
  };

  return (
    <div className="w-full bg-[#0b0b0e] border border-white/10 p-6 sm:p-8">
      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Step {step} of 3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {step === 1 && 'Tell us about your idea'}
            {step === 2 && 'Add a reference website (optional)'}
            {step === 3 && 'Choose how you want to launch'}
          </h2>
        </div>

        {/* Simple Step Dots */}
        <div className="flex items-center space-x-2">
          {[
            { num: 1, label: '1. Your Idea' },
            { num: 2, label: '2. Inspiration' },
            { num: 3, label: '3. Launch Style' },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer border ${
                step === item.num
                  ? 'bg-white text-black font-bold border-white'
                  : step > item.num
                  ? 'bg-[#141418] text-cyan-400 border-cyan-400/30'
                  : 'bg-[#121214] text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: The Idea */}
      {step === 1 && (
        <div className="mt-6 space-y-6">
          {/* Quick Templates */}
          <div>
            <span className="block text-xs text-zinc-400 mb-2.5">
              Need inspiration? Pick a starter template to autofill:
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected =
                  selectedPresetId === preset.id ||
                  conceptName === preset.conceptName;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`p-3 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#16161a] border-cyan-400 text-white'
                        : 'bg-[#111114] border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {preset.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                What is your project or product called?
              </label>
              <input
                type="text"
                required
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
                placeholder="e.g. Nova AI, Pulse CRM, SwiftBook..."
                className="w-full bg-[#121215] border border-zinc-800 focus:border-cyan-400 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Describe what it does in plain English
              </label>
              <textarea
                required
                rows={4}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Explain it simply: Who uses it, what problem does it solve, and what is the main action users take?"
                className="w-full bg-[#121215] border border-zinc-800 focus:border-cyan-400 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed resize-y"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                No technical terms needed. We automatically translate your idea into a full system plan.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <span>Next: Add Inspiration</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Inspiration Link */}
      {step === 2 && (
        <div className="mt-6 space-y-6">
          <div className="bg-[#121215] border border-zinc-800 p-5">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Have a competitor or reference website you like?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Paste any website URL below. Our built-in research engine will scan their pages to understand their features and structure—or leave it blank to build from scratch.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com (optional)"
                className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-cyan-400 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs uppercase cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3">
              {!referenceUrl && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-white uppercase cursor-pointer"
                >
                  Skip this step
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Next: Launch Style</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Simple Preferences & Generate */}
      {step === 3 && (
        <div className="mt-6 space-y-6">
          {/* Product Format */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2.5">
              1. What kind of experience are you building?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCT_TYPES.map((pt) => {
                const active = productType === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setProductType(pt.id)}
                    className={`p-4 text-left border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#16161b] border-cyan-400 text-white'
                        : 'bg-[#111114] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {pt.label}
                      </span>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{pt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Scale */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2.5">
              2. How should we scope your roadmap?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LAUNCH_STYLES.map((ls) => {
                const active = launchStyleId === ls.id;
                return (
                  <button
                    key={ls.id}
                    type="button"
                    onClick={() => setLaunchStyleId(ls.id)}
                    className={`p-4 text-left border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#16161b] border-cyan-400 text-white'
                        : 'bg-[#111114] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {ls.label}
                      </span>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {ls.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Database schemas, authentication, cloud hosting, and API security are automatically selected and configured for you.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs uppercase cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isGenerating}
              className="min-w-[260px] inline-flex items-center justify-center px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                  <span>BUILDING YOUR BLUEPRINT...</span>
                </>
              ) : (
                <span>CREATE MY PRODUCT BLUEPRINT</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
