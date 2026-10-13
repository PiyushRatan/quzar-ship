'use client';

import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="w-full bg-[#09090b] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 rounded-none overflow-hidden font-mono text-xs">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121214] border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-zinc-200 tracking-wide text-xs">
            {filename}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-[#18181b] px-1.5 py-0.5 border border-zinc-800">
            {language}
          </span>
        </div>

        {/* 1-Click Copy Button with width lock & tactile press */}
        <button
          type="button"
          onClick={handleCopy}
          className="min-w-[100px] inline-flex items-center justify-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-[#18181b] border border-white/10 hover:border-white/30 hover:text-white transition-colors rounded-none active:translate-y-[1px] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-zinc-400" />
              <span>COPY CODE</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container with Line Numbers */}
      <div
        className="overflow-x-auto overflow-y-auto p-3 text-zinc-300 leading-relaxed scrollbar-thin"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="w-10 select-none pr-3 text-right text-zinc-600 text-[11px] font-mono tabular-nums align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-xs pl-2 text-zinc-200">
                  {formatSyntaxLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Lightweight syntax colorizer for keywords and comments without external heavy grammars
function formatSyntaxLine(line: string) {
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }

  // Keywords highlighting
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
        if (['String', 'Int', 'Boolean', 'DateTime', 'Json', 'Float'].includes(word.trim())) {
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
