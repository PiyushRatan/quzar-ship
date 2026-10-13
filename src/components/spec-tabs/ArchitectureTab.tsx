'use client';

import React from 'react';
import { ArchitectureSpec } from '../../types/spec';

interface ArchitectureTabProps {
  spec: ArchitectureSpec;
}

export function ArchitectureTab({ spec }: ArchitectureTabProps) {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121214] border border-white/10 p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
            INGRESS P95 LATENCY
          </div>
          <div className="text-base font-bold text-white mt-1 tabular-nums">
            {spec.topology.telemetry.ingressLatency}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            OPTIMAL ANYCAST ROUTING
          </div>
        </div>

        <div className="bg-[#121214] border border-white/10 p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
            DATABASE QUERY P95
          </div>
          <div className="text-base font-bold text-cyan-400 mt-1 tabular-nums">
            {spec.topology.telemetry.dbQueryLatency}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            CONNECTION POOLING ACTIVE
          </div>
        </div>

        <div className="bg-[#121214] border border-white/10 p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
            EDGE COLD START TIME
          </div>
          <div className="text-base font-bold text-amber-400 mt-1 tabular-nums">
            {spec.topology.telemetry.edgeColdStart}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            ISOLATE INSTANT WAKEUP
          </div>
        </div>
      </div>

      {/* Visual Ingress & Subsystem Topology */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">
            PHYSICAL INGRESS & SUBSYSTEM TOPOLOGY
          </span>
          <span className="text-[10px] text-zinc-500">
            DETERMINISTIC NODE PIPELINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 bg-[#121214] border border-zinc-800 p-4">
          {spec.topology.diagramNodes.map((node, index) => (
            <div
              key={node.id}
              className="relative bg-[#18181b] border-t border-t-white/16 border-x border-x-white/10 border-b border-b-white/4 p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-cyan-400 font-bold">
                    STAGE 0{index + 1}
                  </span>
                  <span className="text-[9px] text-zinc-500">{node.protocol}</span>
                </div>
                <div className="text-xs font-bold text-white mt-1 uppercase">
                  {node.label}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 font-sans">
                  {node.role}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 uppercase">
                {node.tier}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Services Breakdown */}
      <div>
        <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest block mb-2">
          SUBSYSTEM SPECIFICATIONS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spec.topology.services.map((svc) => (
            <div
              key={svc.name}
              className="bg-[#121214] border border-zinc-800 p-3.5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">
                  {svc.name}
                </span>
                <span className="text-[10px] bg-[#18181b] text-cyan-400 border border-zinc-800 px-1.5 py-0.5">
                  {svc.type}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                {svc.tech}
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                {svc.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
