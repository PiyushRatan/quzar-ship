import { ProjectIntake, CompetitorIntelligence } from './types';

/**
 * System instruction defining the Senior Principal Software Architect persona
 * and PiyushRatan Directives 2.0 / 3.0 constraints.
 */
export function buildSystemInstruction(): string {
  return `You are a Senior Principal Software Architect, Systems Engineering Fellow, and Solo Founder's Chief Technology Officer.
Your job is to produce an ultra-rigorous, production-ready MVP Specification that engineers can immediately execute on Day 1 without ambiguity.

CRITICAL DIRECTIVES & CORE CONSTRAINTS:
1. NO MARKETING FLUFF: Zero hand-waving, zero vague aspirational statements ("unlock potential", "seamlessly empower"). Every sentence must describe concrete architecture, throughput, idempotency, data models, state transitions, or latency bounds.
2. ZERO EMOJIS: Never output emojis in code, titles, deliverables, roadmaps, or descriptions. Use clean technical language and standard ASCII separators (//, |, ->).
3. DESIGN SYSTEM (PIYUSHRATAN DIRECTIVES 2.0):
   - Void (#000000) true-black infinite canvas depth.
   - 5-Tier Surface Ladder: Void (#000000), Canvas (#09090b), Surface (#121214), Elevated (#18181b), Active (#27272a).
   - 1px Directional Key-Lighting: borders are 1px solid rgba(255,255,255,0.10) to rgba(255,255,255,0.15).
   - Micro-chamfers (rounded-xs / 2px) or sharp architectural corners (rounded-none). Rounded-full pills are strictly forbidden except for 1:1 circular avatars.
   - Monospace Kickers: Zinc-500 (#71717a) uppercase mono eyebrows for protocol tags and headers.
   - CTAs: Clean unbracketed uppercase monospace labels (e.g. "INITIALIZE CLUSTER", "EXPORT JSON"). Decorative square brackets are strictly banned.
   - Restrained single-hue accent: Cyan (#06b6d4), Amber (#eab308), or Aerospace Orange (#ff6b35).
4. PRISMA DATABASE SCHEMA:
   - Must output a complete, valid, syntactically flawless "schema.prisma" file.
   - Specify generator client and datasource db matching the intake databaseType.
   - Models must feature @id @default(cuid()), @updatedAt, explicit relations with onDelete where appropriate, and performance @@index fields.
5. 14-DAY SPRINT ROADMAP:
   - Exactly 14 sequential days (Day 1 through Day 14).
   - Phases strictly partitioned:
     * Days 1-2: FOUNDATION (Environment, DB, Auth scaffolding)
     * Days 3-6: CORE_BACKEND (Data layer, APIs, Background jobs)
     * Days 7-10: CORE_FRONTEND (Shell, Screens, State machines, In-cell UI)
     * Days 11-12: INTEGRATION (E2E data flow, Webhooks, Error envelopes)
     * Days 13-14: HARDENING (Security audit, Stress test, Deployment, DNS)
   - Every day must list concrete atomic deliverables and high-consequence technical risks.
6. JSON OUTPUT ONLY:
   - Output ONLY a valid JSON object strictly adhering to the FullMvpSpec schema.
   - Do NOT wrap the JSON in markdown code blocks if responseMimeType is application/json, or provide clean JSON that can be parsed directly with JSON.parse.`;
}

/**
 * Builds the comprehensive prompt incorporating Project Intake and Competitor Crawl Intelligence.
 */
export function buildUserPrompt(
  intake: ProjectIntake,
  competitorIntelligence?: CompetitorIntelligence | null
): string {
  const competitorContext = competitorIntelligence
    ? `
COMPETITOR CRAWL INTELLIGENCE:
- Competitor URL: ${competitorIntelligence.url || intake.competitorUrl || 'N/A'}
- Competitor Title: ${competitorIntelligence.title || 'N/A'}
- Description: ${competitorIntelligence.description || 'N/A'}
- Observed Features:
${(competitorIntelligence.features && competitorIntelligence.features.length > 0)
  ? competitorIntelligence.features.map(f => `  * ${f}`).join('\n')
  : '  * Standard incumbent baseline feature set'}
- Pricing Model: ${competitorIntelligence.pricingModel || 'Subscription / Tiered'}
- Technologies Detected: ${(competitorIntelligence.techDetected || []).join(', ') || 'Standard Web Stack'}
- Known Weaknesses / Friction:
${(competitorIntelligence.weaknesses && competitorIntelligence.weaknesses.length > 0)
  ? competitorIntelligence.weaknesses.map(w => `  * ${w}`).join('\n')
  : '  * Bloated feature sets, sluggish cold starts, high starter pricing, poor API latency'}
- Differentiators To Exploit:
${(competitorIntelligence.differentiators && competitorIntelligence.differentiators.length > 0)
  ? competitorIntelligence.differentiators.map(d => `  * ${d}`).join('\n')
  : '  * Single-tenant isolation, instant local-first or edge rendering, predictable flat pricing, high cognitive density UI'}
`
    : intake.competitorUrl
    ? `
COMPETITOR URL PROVIDED: ${intake.competitorUrl}
Analyze the likely incumbent architecture in this market, pinpoint architectural inefficiencies (monolithic bloat, high compute overhead, complex onboarding), and position the MVP spec with clear technical superiority.
`
    : `
NO DIRECT COMPETITOR CRAWL:
Perform an inherent market gap analysis for this vertical, specifying structural moats and high-efficiency operational advantages over incumbent solutions.
`;

  return `Generate a complete, production-grade MVP Specification for the following project:

PROJECT INTAKE:
- Project Name: ${intake.projectName}
- Core Concept: ${intake.concept}
- Target Audience: ${intake.targetAudience}
- Selected Database Type: ${intake.databaseType}
- Selected Auth Provider: ${intake.authType}
- Selected Deployment Target: ${intake.deployTarget}
- Tech Stack Preferences: ${intake.techStackPreference || 'Default to highest-efficiency modern production stack (Next.js 15+ App Router, TypeScript, Prisma/Drizzle, Tailwind CSS)'}

${competitorContext}

SCHEMA STRUCTURE REQUIREMENTS:
Return a JSON object containing:
{
  "id": "spec_<timestamp_or_cuid>",
  "projectName": "${intake.projectName}",
  "intake": { ...the input intake },
  "architecture": {
    "topologySummary": "string detailing edge/serverless/monolith/container distribution, caching layer, and synchronous vs asynchronous boundaries",
    "components": {
      "frontend": { "name": "...", "responsibility": "...", "tech": "..." },
      "backend": { "name": "...", "responsibility": "...", "tech": "..." },
      "edge": { "name": "...", "responsibility": "...", "tech": "..." },
      "queue": { "name": "...", "responsibility": "...", "tech": "..." },
      "cache": { "name": "...", "responsibility": "...", "tech": "..." }
    },
    "techStack": {
      "framework": { "category": "Framework", "name": "...", "rationale": "...", "tradeOffs": ["..."] },
      "database": { "category": "Database", "name": "${intake.databaseType}", "rationale": "...", "tradeOffs": ["..."] },
      "orm": { "category": "ORM", "name": "Prisma ORM", "rationale": "...", "tradeOffs": ["..."] },
      "auth": { "category": "Authentication", "name": "${intake.authType}", "rationale": "...", "tradeOffs": ["..."] },
      "ui": { "category": "UI / Design System", "name": "Tailwind CSS + PiyushRatan Directives 2.0", "rationale": "...", "tradeOffs": ["..."] },
      "hosting": { "category": "Deployment / Hosting", "name": "${intake.deployTarget}", "rationale": "...", "tradeOffs": ["..."] }
    },
    "dataFlowDiagramText": "Detailed ASCII or Mermaid flowchart showing client -> edge router -> API handlers -> DB/Cache -> third-party webhooks"
  },
  "database": {
    "dbType": "${intake.databaseType}",
    "prismaSchemaCode": "COMPLETE, VALID schema.prisma string with datasource db { provider = ... }, generator client { provider = \"prisma-client-js\" }, and at least 4-6 fully normalized models with relations and indexes",
    "entities": [
      {
        "name": "EntityName",
        "description": "...",
        "fields": [{ "name": "id", "type": "String", "isPrimary": true, "isNullable": false, "isUnique": true, "description": "CUID primary key" }],
        "indexes": ["@@index([userId])"]
      }
    ]
  },
  "apiContract": {
    "endpoints": [
      {
        "method": "GET | POST | PUT | PATCH | DELETE",
        "path": "/api/...",
        "summary": "...",
        "authRequired": true | false,
        "requestBodySchema": "...",
        "responseBodySchema": "...",
        "rateLimit": "e.g. 60 req/min per IP"
      }
    ]
  },
  "uiBlueprint": {
    "designSystemGuidance": {
      "philosophy": "High-Cognitive Density Aerospace Dark Mode with 1px directional key-lighting and zero decorative fluff",
      "colorPalette": {
        "void": "#000000",
        "canvas": "#09090b",
        "surface": "#121214",
        "elevated": "#18181b",
        "active": "#27272a",
        "accent": "#06b6d4",
        "textPrimary": "#ffffff",
        "textSecondary": "#a1a1aa",
        "textKicker": "#71717a",
        "borderKey": "rgba(255, 255, 255, 0.12)"
      },
      "typography": {
        "fontSans": "Inter, Geist, or SF Pro",
        "fontMono": "JetBrains Mono, Fira Code, or Geist Mono",
        "kickerRule": "uppercase text-xs font-mono text-zinc-500 tracking-wider",
        "buttonCtaRule": "uppercase text-xs font-mono font-medium tracking-wide no decorative brackets"
      },
      "componentRules": [
        "Rounded-full pills are strictly banned; use 2px micro-chamfers or sharp 0px corners",
        "Zero emojis across all UI, headers, and status cards",
        "1px subtle specular borders on dark surfaces",
        "In-cell feedback machines over ephemeral toasts"
      ]
    },
    "wireframeScreens": [
      {
        "screenName": "...",
        "route": "/...",
        "purpose": "...",
        "keyComponents": ["..."],
        "stateModel": ["..."]
      }
    ]
  },
  "sprintRoadmap": {
    "days": [
      {
        "dayNumber": 1,
        "title": "Day 1 Title",
        "phase": "FOUNDATION",
        "deliverables": ["..."],
        "risks": ["..."]
      }
      ... up to dayNumber 14
    ]
  },
  "costMatrix": {
    "items": [
      {
        "serviceName": "...",
        "tier": "...",
        "estimatedMonthlyCostUsd": 0,
        "scalingThreshold": "..."
      }
    ],
    "totalEstimatedStarterCost": 0
  },
  "competitorAnalysis": {
    "competitorUrl": "${intake.competitorUrl || ''}",
    "keyGapsIdentified": ["..."],
    "unfairAdvantages": ["..."],
    "defensibilityTactics": ["..."]
  },
  "generatedAt": "${new Date().toISOString()}",
  "version": "1.0.0",
  "credits": "Built with Quzar Ship by Piyush Ratan"
}

Ensure all 14 days of the sprint are explicitly included with day numbers 1 through 14.
Make the Prisma schema 100% syntactically correct and comprehensive.
Output valid JSON.`;
}
