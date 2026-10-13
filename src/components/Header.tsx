'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/80 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Mark */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-mono font-extrabold text-sm border border-white">
            QS
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-white">
              QUZAR SHIP
            </span>
            <span className="text-[11px] text-zinc-400 font-sans tracking-wide">
              Product Architecture Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-wider text-zinc-400">
          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollTo('preview')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Architecture Preview
          </button>
          <button
            type="button"
            onClick={() => scrollTo('roadmap')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            14-Day Delivery
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          <a
            href="https://github.com/PiyushRatan/quzar-ship"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-mono text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="tracking-wider uppercase">GitHub</span>
          </a>

          <button
            type="button"
            onClick={() => scrollTo('studio')}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-bold text-black bg-white hover:bg-cyan-400 transition-colors cursor-pointer active:translate-y-[1px]"
          >
            <span className="tracking-widest uppercase">USE TOOL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
