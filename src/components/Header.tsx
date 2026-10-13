'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const isToolPage = pathname === '/tool';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Mark */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-mono font-extrabold text-xs border border-white group-hover:bg-cyan-400 transition-colors">
            QS
          </div>
          <span className="font-mono text-sm font-bold tracking-wider text-white">
            QUZAR SHIP
          </span>
        </Link>

        {/* Navigation Links (Landing Page) */}
        {!isToolPage && (
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <a href="#story" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors">
              What You Get
            </a>
            <a href="#examples" className="hover:text-white transition-colors">
              Examples
            </a>
          </nav>
        )}

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          {isToolPage ? (
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono text-zinc-300 bg-[#121214] border border-white/10 hover:border-white/30 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO HOME</span>
            </Link>
          ) : (
            <Link
              href="/tool"
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-bold text-black bg-white hover:bg-cyan-400 transition-colors active:translate-y-[1px]"
            >
              <span className="tracking-widest uppercase">USE TOOL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
