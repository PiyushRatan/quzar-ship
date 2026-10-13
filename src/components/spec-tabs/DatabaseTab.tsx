'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { CodeBlock } from '../CodeBlock';
import { Cpu, Database, GitBranch, Key, Layers, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface DatabaseTabProps {
  spec: ArchitectureSpec;
}

interface ParsedModelSummary {
  name: string;
  fieldsCount: number;
  hasRelations: boolean;
  primaryFields: string[];
}

function extractModelsFromSchema(code: string): ParsedModelSummary[] {
  const models: ParsedModelSummary[] = [];
  const regex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    const modelName = match[1];
    const bodyLines = match[2]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//') && !l.startsWith('@@'));

    const primaryFields = bodyLines
      .slice(0, 4)
      .map((l) => l.split(/\s+/)[0])
      .filter(Boolean);

    const hasRelations = bodyLines.some((l) => l.includes('@relation'));

    models.push({
      name: modelName,
      fieldsCount: bodyLines.length,
      hasRelations,
      primaryFields,
    });
  }

  return models;
}

export function DatabaseTab({ spec }: DatabaseTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedModels = useMemo(
    () => extractModelsFromSchema(spec.databaseSchema.code),
    [spec.databaseSchema.code]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.db-step-card',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.db-model-row',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.db-models-grid',
            start: 'top 92%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [spec]);

  return (
    <div ref={containerRef} className="space-y-6 font-mono text-xs">
      {/* Top Intuitive Guide: How Developers & AI Coding Tools Use This Schema */}
      <div className="bg-[#0b0b0e] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 sm:p-5 rounded-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                PRODUCTION DATABASE SCHEMA ({spec.targetDatabase})
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
              {spec.databaseSchema.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] shrink-0">
            <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-white">
              TABLES: <strong className="text-cyan-400">{spec.databaseSchema.tablesCount}</strong>
            </span>
            <span className="bg-[#000000] border border-zinc-800 px-2.5 py-1 text-white">
              RELATIONS: <strong className="text-emerald-400">{spec.databaseSchema.relationsCount}</strong>
            </span>
          </div>
        </div>

        {/* 3-Step Practical Workflow Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
          <div className="db-step-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-[10px] uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>1. DROP INTO YOUR REPO</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Save this file as <code className="text-zinc-200 font-mono">prisma/{spec.databaseSchema.filename}</code>. It defines every table, field type, and index up front.
            </p>
          </div>

          <div className="db-step-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase">
              <GitBranch className="w-3.5 h-3.5" />
              <span>2. AUTO-CREATE TABLES</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Run <code className="text-zinc-200 font-mono">npx prisma migrate dev</code> to provision your {spec.targetDatabase} tables and foreign keys automatically.
            </p>
          </div>

          <div className="db-step-card bg-[#000000] border border-zinc-800 p-3 rounded-none">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-[10px] uppercase">
              <Cpu className="w-3.5 h-3.5" />
              <span>3. AI CODING CONTEXT</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
              Tools like Cursor and Claude Code read this schema to write type-safe queries without guessing column names.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Table Models Summary Grid (Staggered Entrance) */}
      {parsedModels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              DATA TABLES AT A GLANCE ({parsedModels.length} MODELS)
            </span>
            <span className="text-[11px] text-zinc-400 font-sans">
              Core entities and primary fields defined in the schema below
            </span>
          </div>

          <div className="db-models-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {parsedModels.map((m, idx) => (
              <div
                key={m.name}
                className="db-model-row bg-[#0b0b0e] border border-zinc-800 hover:border-cyan-500/40 transition-colors p-3 rounded-none flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Layers className="w-3 h-3 text-cyan-400 mr-1.5 shrink-0" />
                      {m.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 bg-[#000000] border border-zinc-800 px-1.5 py-0.5 tabular-nums">
                      {m.fieldsCount} FIELDS
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.primaryFields.map((field) => (
                      <span
                        key={field}
                        className="text-[10px] font-mono text-zinc-300 bg-[#000000] border border-zinc-800/80 px-1.5 py-0.5"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500">
                  <span>TABLE 0{idx + 1}</span>
                  <span className={m.hasRelations ? 'text-emerald-400' : 'text-zinc-400'}>
                    {m.hasRelations ? 'LINKED RELATIONS' : 'STANDALONE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Schema Code Viewer */}
      <CodeBlock
        filename={spec.databaseSchema.filename}
        language="PRISMA"
        code={spec.databaseSchema.code}
        maxHeight="580px"
      />
    </div>
  );
}
