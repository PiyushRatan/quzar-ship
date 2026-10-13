'use client';

import React from 'react';
import { ArchitectureSpec } from '../../types/spec';

interface CostMatrixTabProps {
  spec: ArchitectureSpec;
}

export function CostMatrixTab({ spec }: CostMatrixTabProps) {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">
            INFRASTRUCTURE RUNWAY & TIER PROJECTIONS
          </span>
          <span className="text-[10px] text-emerald-400">
            HIGH MARGIN EFFICIENCY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {spec.costMatrix.tiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-[#121214] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {tier.users}
                </div>
                <div className="text-sm font-bold text-white uppercase mt-0.5">
                  {tier.name}
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-2 font-mono">
                  {tier.monthlyTotal}
                </div>
                <div className="text-[10px] text-cyan-400 mt-0.5 font-semibold">
                  EST. {tier.margin}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                  {tier.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-zinc-400 font-sans">{item.resource}</span>
                      <span className="text-zinc-200 font-mono font-semibold">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings & Caching Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#121214] border border-zinc-800 p-4">
        <div>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest block">
            EDGE PROMPT CACHING IMPACT
          </span>
          <p className="text-xs text-zinc-300 font-sans mt-1">
            {spec.costMatrix.cachingImpact}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest block">
            PROJECTED EFFICIENCY SAVINGS
          </span>
          <p className="text-xs text-zinc-300 font-sans mt-1">
            {spec.costMatrix.projectedSavings}
          </p>
        </div>
      </div>
    </div>
  );
}
