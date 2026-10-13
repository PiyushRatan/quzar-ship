'use client';

import React from 'react';
import { ArchitectureSpec } from '../../types/spec';
import { CodeBlock } from '../CodeBlock';

interface DatabaseTabProps {
  spec: ArchitectureSpec;
}

export function DatabaseTab({ spec }: DatabaseTabProps) {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-800 gap-2">
        <div>
          <span className="text-xs font-bold text-white uppercase">
            {spec.databaseSchema.filename}
          </span>
          <span className="text-xs text-zinc-400 ml-2 font-sans">
            {spec.databaseSchema.description}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
          <span className="bg-[#18181b] border border-zinc-800 px-2 py-0.5">
            MODELS: {spec.databaseSchema.tablesCount}
          </span>
          <span className="bg-[#18181b] border border-zinc-800 px-2 py-0.5">
            RELATIONS: {spec.databaseSchema.relationsCount}
          </span>
        </div>
      </div>

      <CodeBlock
        filename={spec.databaseSchema.filename}
        language="PRISMA"
        code={spec.databaseSchema.code}
        maxHeight="580px"
      />
    </div>
  );
}
