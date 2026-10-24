'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const DESKTOP_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Examples', href: '/examples' },
  { label: 'Blueprint Tool', href: '/tool' },
] as const;

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Examples', href: '/examples' },
  { label: 'Use Tool', href: '/tool' },
] as const;

export function Header() {
  const pathname = usePathname();
  const isToolPage = pathname === '/tool' || pathname?.startsWith('/tool/');

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/90 backdrop-blur-md border-b border-white/10 rounded-none transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Mark */}
        <Link href="/" className="flex items-center space-x-3 group rounded-none shrink-0">
          <img src="/logo-mark.png" alt="Quzar Ship Emblem" className="w-7 h-7 object-contain" />
          <span className="font-mono text-sm font-bold tracking-wider text-white">
            QUZAR SHIP
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center h-full space-x-8 text-xs font-mono uppercase tracking-wider"
        >
          {DESKTOP_NAV_ITEMS.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`h-full inline-flex items-center px-1 rounded-none transition-colors ${
                  active
                    ? 'border-b-2 border-cyan-400 text-white font-semibold'
                    : 'border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3 shrink-0">
          {isToolPage ? (
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono text-zinc-300 bg-[#121214] border border-white/10 rounded-none hover:border-cyan-400/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO HOME</span>
            </Link>
          ) : (
            <Link
              href="/tool"
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-bold text-black bg-white border border-white rounded-none hover:bg-cyan-400 hover:border-cyan-400 transition-colors active:translate-y-[1px]"
            >
              <span className="tracking-widest uppercase">USE TOOL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Single-Tap Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden w-full border-t border-white/10 bg-[#050507]/95 px-2 sm:px-4"
      >
        <div className="grid grid-cols-4 w-full">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`py-2.5 text-center font-mono text-[11px] uppercase tracking-wider rounded-none transition-colors ${
                  active
                    ? 'border-b-2 border-cyan-400 text-white font-semibold bg-white/[0.03]'
                    : 'border-b-2 border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

