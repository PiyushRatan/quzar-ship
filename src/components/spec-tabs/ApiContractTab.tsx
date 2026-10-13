'use client';

import React from 'react';
import { ArchitectureSpec } from '../../types/spec';

interface ApiContractTabProps {
  spec: ArchitectureSpec;
}

export function ApiContractTab({ spec }: ApiContractTabProps) {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Endpoints Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">
            REST & STREAMING ENDPOINT CONTRACTS
          </span>
          <span className="text-[10px] text-zinc-500">
            IDEMPOTENT & RATE-LIMITED
          </span>
        </div>

        <div className="overflow-x-auto border border-zinc-800 bg-[#121214]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#18181b] border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                <th className="py-2.5 px-3">METHOD</th>
                <th className="py-2.5 px-3">ENDPOINT ROUTE</th>
                <th className="py-2.5 px-3">PURPOSE / CONTRACT</th>
                <th className="py-2.5 px-3">AUTHORIZATION</th>
                <th className="py-2.5 px-3">IDEMPOTENCY</th>
                <th className="py-2.5 px-3">RATE LIMIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {spec.apiContracts.endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 ${
                        ep.method === 'GET'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ep.method === 'DELETE'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-white whitespace-nowrap">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-sans">
                    {ep.summary}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-zinc-400 font-mono">
                    {ep.auth}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {ep.idempotency ? (
                      <span className="text-emerald-400">ENFORCED</span>
                    ) : (
                      <span className="text-zinc-500">NONE</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {ep.rateLimit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Guards */}
      <div>
        <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest block mb-2">
          ACTIVE SECURITY GUARDS & DIRECTIVE COMPLIANCE
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spec.apiContracts.securityGuards.map((guard, i) => (
            <div
              key={i}
              className="bg-[#121214] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">
                  {guard.title}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 uppercase tracking-widest font-bold">
                  {guard.status}
                </span>
              </div>
              <div className="text-[11px] text-cyan-400 font-mono mt-1">
                {guard.policy || guard.directive}
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                {guard.enforcement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
