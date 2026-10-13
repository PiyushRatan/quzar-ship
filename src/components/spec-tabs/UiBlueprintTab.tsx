'use client';

import React from 'react';
import { ArchitectureSpec } from '../../types/spec';

interface UiBlueprintTabProps {
  spec: ArchitectureSpec;
}

export function UiBlueprintTab({ spec }: UiBlueprintTabProps) {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Component Tree */}
      <div>
        <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest block mb-2">
          ATOMIC COMPONENT SPECIFICATION
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {spec.uiBlueprint.componentTree.map((cat, i) => (
            <div key={i} className="bg-[#121214] border border-zinc-800 p-4">
              <div className="text-xs font-bold text-white uppercase pb-2 border-b border-zinc-800">
                {cat.category}
              </div>
              <div className="mt-3 space-y-3">
                {cat.components.map((c) => (
                  <div key={c.name} className="border-l-2 border-cyan-400 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{c.name}</span>
                      <span className="text-[9px] text-cyan-400">{c.spec || c.policy || c.directive}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      {c.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Tokens & Optical Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#121214] border border-zinc-800 p-4">
          <span className="text-xs font-bold text-white uppercase block mb-3 pb-2 border-b border-zinc-800">
            5-TIER AEROSPACE SURFACE TOKENS
          </span>
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-zinc-800">
              {spec.uiBlueprint.designTokens.map((t, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-mono text-cyan-400 font-semibold">{t.token}</td>
                  <td className="py-2 font-mono text-white">{t.value}</td>
                  <td className="py-2 text-[11px] text-zinc-400 font-sans">{t.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-4">
          <span className="text-xs font-bold text-white uppercase block mb-3 pb-2 border-b border-zinc-800">
            ACCESSIBILITY & WCAG 2.2 GUARDS
          </span>
          <div className="space-y-3">
            {spec.uiBlueprint.accessibilityGuards.map((g, idx) => (
              <div key={idx} className="bg-[#18181b] p-3 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{g.guard}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5">
                    {g.level}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-1">{g.spec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
