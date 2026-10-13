'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldCheck, Clock, Layers } from 'lucide-react';

export function TelemetryBar() {
  const [latency, setLatency] = useState(24);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    // Live tabular UTC clock
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Subtle realistic latency jitter
    const latencyInterval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setLatency(prev => Math.min(36, Math.max(16, Math.round(prev + delta))));
    }, 2500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  return (
    <div className="w-full bg-[#09090b] border-b border-zinc-800 text-xs font-mono select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none flex items-center justify-between gap-6 whitespace-nowrap">
        {/* Metric 1: Engine */}
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-500 uppercase tracking-widest text-[11px]">ENGINE:</span>
          <span className="text-zinc-200 font-semibold tracking-wider">GEMINI 2.5 FLASH</span>
        </div>

        {/* Metric 2: Spec Version */}
        <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 uppercase tracking-widest text-[11px]">SPEC VERSION:</span>
          <span className="text-cyan-400 font-medium">v1.0.4 COMPILER</span>
        </div>

        {/* Metric 3: Tabular Latency */}
        <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-500 uppercase tracking-widest text-[11px]">INFERENCE LATENCY:</span>
          <span className="tabular-nums font-semibold text-zinc-200">
            {latency}ms
          </span>
          <span className="text-[10px] text-zinc-500">(P95 STREAM)</span>
        </div>

        {/* Metric 4: Directives 2.0 Compliance */}
        <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-500 uppercase tracking-widest text-[11px]">DIRECTIVES:</span>
          <span className="text-emerald-400 font-semibold tracking-wider uppercase">
            2.0 COMPLIANT (STRICT)
          </span>
        </div>

        {/* Metric 5: Live UTC Clock */}
        <div className="hidden lg:flex items-center space-x-2 border-l border-zinc-800 pl-4 text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span className="tabular-nums text-[11px] text-zinc-400">{utcTime || '2026-10-13 04:30:00 UTC'}</span>
        </div>
      </div>
    </div>
  );
}
