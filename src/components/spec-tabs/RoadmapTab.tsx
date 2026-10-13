'use client';

import React from 'react';
import { SprintDay } from '../../types/spec';
import { CheckSquare, Square } from 'lucide-react';

interface RoadmapTabProps {
  sprintDays: SprintDay[];
  onToggleDay: (dayNumber: number) => void;
}

export function RoadmapTab({ sprintDays, onToggleDay }: RoadmapTabProps) {
  const completedCount = sprintDays.filter((d) => d.completed).length;
  const progressPercent = Math.round((completedCount / sprintDays.length) * 100);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Velocity Header */}
      <div className="bg-[#121214] border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="kicker-cyan">EXECUTION CADENCE // 14-DAY ROADMAP</div>
          <div className="text-sm font-bold text-white mt-0.5">
            INTERACTIVE SPRINT TRACKER ({completedCount} / {sprintDays.length} DAYS COMPLETED)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>VELOCITY PROGRESS</span>
            <span className="font-bold text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#18181b] border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sprintDays.map((d) => (
          <div
            key={d.day}
            onClick={() => onToggleDay(d.day)}
            className={`p-3.5 border transition-all cursor-pointer rounded-none active:translate-y-[1px] select-none ${
              d.completed
                ? 'bg-[#18181b] border-emerald-500/40'
                : 'bg-[#121214] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="text-cyan-400">
                  {d.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <span className="text-xs font-bold text-white uppercase">
                  DAY {d.day}: {d.title}
                </span>
              </div>

              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 whitespace-nowrap font-bold ${
                  d.phase === 'PHASE 1: FOUNDATION'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    : d.phase === 'PHASE 2: CORE ENGINE'
                    ? 'bg-purple-950 text-purple-400 border border-purple-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {d.phase}
              </span>
            </div>

            <ul className="mt-2.5 ml-6 space-y-1 text-xs text-zinc-400 font-sans list-disc">
              {d.deliverables.map((item, idx) => (
                <li key={idx} className={d.completed ? 'line-through text-zinc-500' : ''}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
