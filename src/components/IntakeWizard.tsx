'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  DatabaseOption,
  AuthOption,
  DeploymentOption,
} from '../types/spec';
import { PRESETS } from '../data/presets';
import {
  Globe,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowDown,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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
  const [activeStep, setActiveStep] = useState<number>(1);

  const wizardContainerRef = useRef<HTMLFormElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const verticalFillRef = useRef<HTMLDivElement>(null);
  const topProgressBarRef = useRef<HTMLDivElement>(null);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const conceptInputRef = useRef<HTMLInputElement>(null);
  const problemInputRef = useRef<HTMLTextAreaElement>(null);

  const [conceptName, setConceptName] = useState('Nova AI Assistant');
  const [problemStatement, setProblemStatement] = useState(
    'A smart customer support assistant that learns from a company website, answers visitor questions instantly 24/7, and captures qualified leads for the sales team.'
  );
  const [referenceUrl, setReferenceUrl] = useState('');
  const [productType, setProductType] = useState('webapp');
  const [launchStyleId, setLaunchStyleId] = useState('growth');
  const [autofillFeedback, setAutofillFeedback] = useState<string | null>(null);

  // Scroll-guided vertical storytelling flow (zero scroll hijacking/pinning)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smoothly fill the left vertical connecting line as the user scrolls down through the 3 steps
      if (timelineContainerRef.current && verticalFillRef.current) {
        gsap.fromTo(
          verticalFillRef.current,
          { height: '15%' },
          {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: timelineContainerRef.current,
              start: 'top 65%',
              end: 'bottom 75%',
              scrub: 0.3,
            },
          }
        );
      }

      // Reveal each step card on scroll & update active step indicator automatically
      const steps = [
        { num: 1, el: step1Ref.current },
        { num: 2, el: step2Ref.current },
        { num: 3, el: step3Ref.current },
      ];

      steps.forEach(({ num, el }) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );

        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setActiveStep(num),
          onEnterBack: () => setActiveStep(num),
        });
      });
    }, wizardContainerRef);

    return () => ctx.revert();
  }, []);

  // Animate top progress bar whenever activeStep updates on scroll or pill click
  useEffect(() => {
    const targetWidth =
      activeStep === 1 ? '33.333%' : activeStep === 2 ? '66.666%' : '100%';
    if (topProgressBarRef.current) {
      gsap.to(topProgressBarRef.current, {
        width: targetWidth,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  }, [activeStep]);

  const scrollToStepCard = (stepNum: number) => {
    setActiveStep(stepNum);
    const targetEl =
      stepNum === 1
        ? step1Ref.current
        : stepNum === 2
        ? step2Ref.current
        : step3Ref.current;

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setConceptName(found.conceptName);
      setProblemStatement(found.problemStatement);
      setReferenceUrl(found.referenceUrl || '');
      onSelectPreset(presetId);
      setAutofillFeedback(found.name);

      // Subtle visual pulse/highlight confirmation on autofilled inputs
      const targets = [conceptInputRef.current, problemInputRef.current].filter(
        Boolean
      );
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          {
            borderColor: '#22d3ee',
            boxShadow:
              '0 0 0 1px rgba(34,211,238,0.55), 0 0 18px rgba(34,211,238,0.18)',
            backgroundColor: '#161b20',
          },
          {
            borderColor: '#27272a',
            boxShadow:
              '0 0 0 0px rgba(34,211,238,0), 0 0 0px rgba(34,211,238,0)',
            backgroundColor: '#121215',
            duration: 0.75,
            ease: 'power2.out',
            clearProps: 'borderColor,boxShadow,backgroundColor',
          }
        );
      }

      setTimeout(() => {
        setAutofillFeedback((prev) => (prev === found.name ? null : prev));
      }, 2200);
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
    <form
      ref={wizardContainerRef}
      onSubmit={handleSubmit}
      className="w-full bg-[#0b0b0e] border border-white/10"
    >
      {/* Top Animated 3-Step Progress Bar (33% -> 66% -> 100%) */}
      <div className="w-full h-1.5 bg-[#141418] overflow-hidden">
        <div
          ref={topProgressBarRef}
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400"
          style={{ width: '33.333%' }}
        />
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Sticky-friendly Progress Header with Scroll-Synced Step Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                Scroll-Guided Setup · Step {activeStep} of 3 Active
              </span>
              <span className="hidden sm:inline-flex items-center text-[11px] text-zinc-500 font-mono">
                <ArrowDown className="w-3 h-3 mr-1 text-cyan-400" />
                Scroll down to complete & generate
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {activeStep === 1 && 'Tell us about your idea'}
              {activeStep === 2 && 'Add a reference website (optional)'}
              {activeStep === 3 && 'Choose how you want to launch'}
            </h2>
          </div>

          {/* Step Pills: Click to smooth-scroll, or simply scroll naturally */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { num: 1, label: '1. Your Idea' },
              { num: 2, label: '2. Inspiration' },
              { num: 3, label: '3. Launch Style' },
            ].map((item) => (
              <button
                key={item.num}
                type="button"
                onClick={() => scrollToStepCard(item.num)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer border ${
                  activeStep === item.num
                    ? 'bg-white text-black font-bold border-white'
                    : activeStep > item.num
                    ? 'bg-[#141418] text-cyan-400 border-cyan-400/30'
                    : 'bg-[#121214] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Scroll-Guided Vertical Storytelling Flow (Step 01 -> Step 02 -> Step 03) */}
        <div
          ref={timelineContainerRef}
          className="relative mt-6 pl-7 sm:pl-10 space-y-8"
        >
          {/* Left Connecting Vertical Progress Rail */}
          <div
            className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-[2px] bg-zinc-800/90 overflow-hidden"
            aria-hidden="true"
          >
            <div
              ref={verticalFillRef}
              className="w-full bg-gradient-to-b from-cyan-400 via-cyan-300 to-emerald-400"
              style={{ height: '15%' }}
            />
          </div>

          {/* ================= STEP 01: YOUR IDEA ================= */}
          <div
            id="wizard-step-1"
            ref={step1Ref}
            onFocusCapture={() => setActiveStep(1)}
            className={`relative bg-[#0f0f13] border p-5 sm:p-6 transition-colors duration-300 ${
              activeStep === 1
                ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.06)]'
                : 'border-zinc-800/90'
            }`}
          >
            {/* Step 01 Node Badge on Vertical Rail */}
            <div
              className={`absolute -left-7 sm:-left-10 top-5 w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold border transition-all duration-300 ${
                activeStep >= 1
                  ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                  : 'bg-[#121215] text-zinc-500 border-zinc-700'
              }`}
            >
              01
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                  Step 01 · Product Concept
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  1. Your Idea
                </h3>
              </div>
              {autofillFeedback && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-cyan-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Loaded {autofillFeedback}</span>
                </span>
              )}
            </div>

            <div className="mt-5 space-y-5">
              {/* Starter Templates */}
              <div>
                <span className="block text-xs text-zinc-400 mb-2.5">
                  Need inspiration? Tap a starter template to autofill:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {PRESETS.map((preset) => {
                    const isSelected =
                      selectedPresetId === preset.id ||
                      conceptName === preset.conceptName;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`p-3 text-left border transition-all cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[#16161a] border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                            : 'bg-[#111114] border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{preset.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {preset.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Name & Plain-English Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    What is your project or product called?
                  </label>
                  <input
                    ref={conceptInputRef}
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
                    ref={problemInputRef}
                    required
                    rows={3}
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
            </div>
          </div>

          {/* ================= STEP 02: INSPIRATION LINK ================= */}
          <div
            id="wizard-step-2"
            ref={step2Ref}
            onFocusCapture={() => setActiveStep(2)}
            className={`relative bg-[#0f0f13] border p-5 sm:p-6 transition-colors duration-300 ${
              activeStep === 2
                ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.06)]'
                : 'border-zinc-800/90'
            }`}
          >
            {/* Step 02 Node Badge on Vertical Rail */}
            <div
              className={`absolute -left-7 sm:-left-10 top-5 w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold border transition-all duration-300 ${
                activeStep >= 2
                  ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                  : 'bg-[#121215] text-zinc-500 border-zinc-700'
              }`}
            >
              02
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                  Step 02 · Optional Reference
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  2. Inspiration & Reference Website
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase">
                Optional — Leave blank to build from scratch
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-start space-x-3 mb-3">
                <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have a competitor or reference website you like? Paste any URL below and our research engine will scan their pages for feature inspiration.
                </p>
              </div>

              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com (optional)"
                className="w-full bg-[#121215] border border-zinc-800 focus:border-cyan-400 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* ================= STEP 03: LAUNCH STYLE & GENERATE ================= */}
          <div
            id="wizard-step-3"
            ref={step3Ref}
            onFocusCapture={() => setActiveStep(3)}
            className={`relative bg-[#0f0f13] border p-5 sm:p-6 transition-colors duration-300 ${
              activeStep === 3
                ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.06)]'
                : 'border-zinc-800/90'
            }`}
          >
            {/* Step 03 Node Badge on Vertical Rail */}
            <div
              className={`absolute -left-7 sm:-left-10 top-5 w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold border transition-all duration-300 ${
                activeStep >= 3
                  ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                  : 'bg-[#121215] text-zinc-500 border-zinc-700'
              }`}
            >
              03
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                  Step 03 · Experience & Scope
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  3. Launch Style & Generate
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Auto-configures database, auth & cloud hosting
              </span>
            </div>

            <div className="mt-5 space-y-6">
              {/* Product Format */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2.5">
                  What kind of experience are you building?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRODUCT_TYPES.map((pt) => {
                    const active = productType === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => {
                          setActiveStep(3);
                          setProductType(pt.id);
                        }}
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
                  How should we scope your 14-day roadmap?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {LAUNCH_STYLES.map((ls) => {
                    const active = launchStyleId === ls.id;
                    return (
                      <button
                        key={ls.id}
                        type="button"
                        onClick={() => {
                          setActiveStep(3);
                          setLaunchStyleId(ls.id);
                        }}
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
              </div>

              {/* Primary Generate Action right at the bottom of Step 3 */}
              <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-zinc-400">
                  Ready? Click to generate your custom screens, 14-day plan, budget, and database schema below.
                </p>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto min-w-[270px] inline-flex items-center justify-center px-7 py-4 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
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
          </div>
        </div>
      </div>
    </form>
  );
}
