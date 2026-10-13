'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { SpecViewer } from '../components/SpecViewer';
import { PRESETS } from '../data/presets';
import { ArchitectureSpec } from '../types/spec';
import {
  ArrowRight,
  Globe,
  Layout,
  Calendar,
  FileCode,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ai-saas');
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec>(
    PRESETS[0].sampleSpec
  );

  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActiveSpec(found.sampleSpec);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO SECTION (No top badge, reduced top margin) */}
        <section className="relative border-b border-white/10 bg-[#050507] overflow-hidden pt-8 sm:pt-12 pb-14 sm:pb-18">
          <div className="absolute inset-0 bg-grid-architectural opacity-35 pointer-events-none"></div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Turn Your App Idea into a Ready-to-Build Blueprint.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 mt-4 leading-relaxed max-w-2xl">
                Most great ideas get stuck because planning the tech feels overwhelming.
                Describe what you want to build in plain English—or paste a website you love—and
                get a complete product plan, 14-day launch roadmap, and developer specs in 60 seconds.
              </p>

              {/* Hero CTAs */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/tool"
                  className="inline-flex items-center justify-center space-x-3 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  <span>USE TOOL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#story"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#121214] text-zinc-200 hover:text-white border border-white/15 hover:border-white/40 font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors"
                >
                  <span>SEE HOW IT WORKS</span>
                </a>
              </div>

              {/* Simple Highlights Strip */}
              <div className="mt-10 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-white font-semibold">Plain English</div>
                  <div className="text-zinc-500 mt-0.5">No coding required</div>
                </div>
                <div>
                  <div className="text-white font-semibold">Website Scanner</div>
                  <div className="text-zinc-500 mt-0.5">Learn from competitors</div>
                </div>
                <div>
                  <div className="text-white font-semibold">14-Day Plan</div>
                  <div className="text-zinc-500 mt-0.5">Step-by-step daily checklist</div>
                </div>
                <div>
                  <div className="text-white font-semibold">Instant Export</div>
                  <div className="text-zinc-500 mt-0.5">Ready for any developer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SECOND SECTION: WHAT YOU GET (Simple & Intuitive) */}
        <section id="capabilities" className="py-14 border-b border-white/10 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                What You Get
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Everything Mapped Out Before You Write a Single Line of Code
              </h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                We hide all the confusing technical decisions behind the scenes and hand you a clean, organized package.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0b0b0e] border border-white/10 p-6">
                <Globe className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-white">
                  Competitor Inspiration
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Paste a link to any product you admire. We scan their pages to see what features they offer and how your idea can stand out.
                </p>
              </div>

              <div className="bg-[#0b0b0e] border border-white/10 p-6">
                <Layout className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className="text-base font-bold text-white">
                  Screen & Feature Plan
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Get a clear breakdown of every screen, button, and user flow so you know exactly what your product will look and feel like.
                </p>
              </div>

              <div className="bg-[#0b0b0e] border border-white/10 p-6">
                <Calendar className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className="text-base font-bold text-white">
                  14-Day Launch Roadmap
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Never wonder what to build first. Follow a clear, day-by-day checklist that takes your project from Day 1 to launch in two weeks.
                </p>
              </div>

              <div className="bg-[#0b0b0e] border border-white/10 p-6">
                <FileCode className="w-6 h-6 text-purple-400 mb-4" />
                <h3 className="text-base font-bold text-white">
                  Developer-Ready Specs
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Database tables, API connections, and hosting estimates are generated automatically—ready to hand to your developer or AI coding tool.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. STORYTELLING SECTION: HOW IT WORKS */}
        <section id="story" className="py-16 border-b border-white/10 bg-[#050507]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                The Journey
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                From a Rough Thought to a Clear Plan in Three Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[#0b0b0e] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    Step 01
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Share Your Idea Simply
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Tell us what you want to create in a couple of sentences—just like explaining it to a friend over coffee. Pick whether it is a web app, mobile platform, or team tool.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  Takes less than 30 seconds
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#0b0b0e] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    Step 02
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    We Handle the Complexity
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    You don&apos;t have to worry about servers, databases, or security rules. Quzar Ship researches the market and chooses the best, most affordable setup for you automatically.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  100% automated behind the scenes
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#0b0b0e] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    Step 03
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Download & Start Building
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Explore your interactive blueprint, check off daily tasks on your 14-day roadmap, and download your files with one click—or let Quzar Studio build it for you.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                  Ready for immediate execution
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center sm:justify-start">
              <Link
                href="/tool"
                className="inline-flex items-center space-x-3 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <span>START YOUR BLUEPRINT NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. SAMPLE BLUEPRINTS PREVIEW */}
        <section id="examples" className="py-16 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  Live Examples
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  See What a Finished Blueprint Looks Like
                </h2>
              </div>

              {/* Sample Switcher */}
              <div className="flex flex-wrap items-center gap-2">
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

        {/* 5. BOTTOM CALL TO ACTION */}
        <section className="py-14 border-t border-white/10 bg-[#08080b]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#111115] border border-white/10 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Ready to Turn Your Idea into Reality?
                </h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Launch the interactive tool to create your own custom product blueprint in under a minute, or work directly with Quzar Studio to build and launch your MVP.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link
                  href="/tool"
                  className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <span>USE TOOL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <Link href="/tool" className="hover:text-zinc-300 uppercase tracking-wider">
              Use Tool
            </Link>
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
