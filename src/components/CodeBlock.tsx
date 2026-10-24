'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, FileCode, Download, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CodeBlockProps {
  filename?: string;
  language?: string;
  code: string;
  maxHeight?: string;
}

export function CodeBlock({
  filename = 'code.txt',
  language = 'PLAINTEXT',
  code,
  maxHeight = '520px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean any legacy internal jargon from code comments for human-friendly clarity
  const cleanedCode = code
    .replace(/QUZAR SHIP ARCHITECTURAL SPECIFICATION/gi, 'Database Schema Specification')
    .replace(/COMPLIANT PRISMA SCHEMA/gi, 'Production-Ready Prisma Schema')
    .replace(/Directives?\s*\d+(\.\d+)?/gi, 'Production Standard')
    .trim();

  const lines = cleanedCode.split('\n');
  const modelCount = lines.filter((l) => l.trim().startsWith('model ')).length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
        }
      );

      const visibleRows = el.querySelectorAll('.code-line-row');
      if (visibleRows.length > 0) {
        gsap.fromTo(
          Array.from(visibleRows).slice(0, 35),
          { opacity: 0, x: -6 },
          {
            opacity: 1,
            x: 0,
            duration: 0.25,
            stagger: 0.012,
            ease: 'power2.out',
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [cleanedCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownload = () => {
    const blob = new Blob([cleanedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#000000] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 rounded-none overflow-hidden font-mono text-xs"
    >
      {/* Top Bar / Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#0b0b0e] border-b border-zinc-800/90">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white tracking-wide text-xs">
              {filename}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 bg-[#000000] px-2 py-0.5 border border-cyan-900/60 rounded-none">
            {language}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 bg-[#000000] px-2 py-0.5 border border-zinc-800 rounded-none tabular-nums">
            {lines.length} LINES
          </span>
          {modelCount > 0 && (
            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/30 px-2 py-0.5 border border-emerald-900/50 rounded-none tabular-nums">
              <Terminal className="w-2.5 h-2.5 mr-1" />
              {modelCount} DATA TABLES
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center space-x-1.5 px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-[#000000] border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
            title={`Download ${filename}`}
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">DOWNLOAD</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-w-[108px] inline-flex items-center justify-center space-x-1.5 px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-zinc-200 bg-[#000000] border border-white/15 hover:border-cyan-400/60 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-cyan-400" />
                <span>COPY CODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container with Interactive Line Numbers */}
      <div
        className="overflow-x-auto overflow-y-auto py-3 bg-[#000000] text-zinc-300 leading-relaxed scrollbar-thin"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const isModelStart = line.trim().startsWith('model ') || line.trim().startsWith('enum ');
              const isSelected = activeLine === idx;
              return (
                <tr
                  key={idx}
                  onClick={() => setActiveLine(isSelected ? null : idx)}
                  className={`code-line-row border-l-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/25 border-l-cyan-400'
                      : isModelStart
                      ? 'bg-white/[0.015] border-l-cyan-500/40 hover:bg-white/[0.04]'
                      : 'border-l-transparent hover:bg-white/[0.025] hover:border-l-zinc-700'
                  }`}
                >
                  <td className="w-12 select-none pr-3 pl-3 text-right text-zinc-600 text-[11px] font-mono tabular-nums align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono text-xs pl-2 pr-4 text-zinc-200">
                    {formatSyntaxLine(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Status Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3.5 py-1.5 bg-[#0b0b0e] border-t border-zinc-900 text-[10px] text-zinc-500">
        <span className="truncate">CLICK ANY LINE TO HIGHLIGHT OR COPY DIRECTLY INTO CURSOR / CLAUDE CODE</span>
        <span className="text-emerald-400 uppercase tracking-wider shrink-0">UTF-8 READY</span>
      </div>
    </div>
  );
}

// Lightweight syntax colorizer for keywords and comments without external heavy grammars
function formatSyntaxLine(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    const cleanComment = line.replace(/^(\s*)\/\/\s*/, '$1# ');
    return <span className="text-zinc-500 italic">{cleanComment}</span>;
  }

  const keywords = [
    'model',
    'enum',
    'datasource',
    'generator',
    'export',
    'import',
    'interface',
    'type',
    'const',
    'function',
    'return',
    'async',
    'await',
  ];

  const words = line.split(/(\s+|[(){}[\]:,;])/);

  return (
    <>
      {words.map((word, i) => {
        if (keywords.includes(word.trim())) {
          return (
            <span key={i} className="text-cyan-400 font-semibold">
              {word}
            </span>
          );
        }
        if (word.startsWith('@')) {
          return (
            <span key={i} className="text-amber-400">
              {word}
            </span>
          );
        }
        if (
          ['String', 'Int', 'Boolean', 'DateTime', 'Json', 'Float', 'Decimal', 'BigInt'].includes(
            word.trim().replace('?', '').replace('[]', '')
          )
        ) {
          return (
            <span key={i} className="text-emerald-400 font-medium">
              {word}
            </span>
          );
        }
        if (word.startsWith('"') && word.endsWith('"')) {
          return (
            <span key={i} className="text-amber-200">
              {word}
            </span>
          );
        }
        return <span key={i}>{word}</span>;
      })}
    </>
  );
}
