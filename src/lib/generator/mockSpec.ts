import {
  FullMvpSpec,
  FullMvpSpecSchema,
  ProjectIntake,
  CompetitorIntelligence,
  SprintDay,
  ApiEndpoint,
  SchemaEntity,
  CostItem,
  WireframeScreen
} from './types';

/**
 * Generates a complete, highly realistic fallback MVP specification.
 * Fully compliant with PiyushRatan Directives 2.0 / 3.0 and strictly validated by Zod.
 */
export function generateMockSpec(
  intake: ProjectIntake,
  competitorIntelligence?: CompetitorIntelligence | null
): FullMvpSpec {
  const sanitizedName = intake.projectName.replace(/[^a-zA-Z0-9]/g, '');
  const slug = intake.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Map database type to Prisma datasource provider
  let prismaProvider = 'postgresql';
  if (intake.databaseType === 'MySQL') prismaProvider = 'mysql';
  else if (intake.databaseType === 'MongoDB') prismaProvider = 'mongodb';
  else if (intake.databaseType === 'Firestore') prismaProvider = 'postgresql'; // Mirroring relational cache or PostgreSQL primary

  // Prisma Schema Generator
  const prismaSchemaCode = `// Generated Prisma Schema for ${intake.projectName}
// Quzar Ship Architecture Engine by Piyush Ratan

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${prismaProvider}"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
  MAINTAINER
}

enum Status {
  PENDING
  ACTIVE
  ARCHIVED
  FAILED
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  workspaces    WorkspaceMember[]
  auditLogs     AuditLog[]
  resources     Resource[]

  @@index([email])
}

model Workspace {
  id            String            @id @default(cuid())
  slug          String            @unique
  name          String
  planTier      String            @default("STARTER")
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  members       WorkspaceMember[]
  resources     Resource[]
  apiKeys       ApiKey[]

  @@index([slug])
}

model WorkspaceMember {
  id          String     @id @default(cuid())
  userId      String
  workspaceId String
  role        String     @default("MEMBER")
  createdAt   DateTime   @default(now())
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([workspaceId])
}

model Resource {
  id            String     @id @default(cuid())
  workspaceId   String
  ownerId       String
  title         String
  description   String?
  status        Status     @default(ACTIVE)
  metadata      Json?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  workspace     Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  owner         User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([workspaceId, status])
  @@index([ownerId])
}

model ApiKey {
  id          String     @id @default(cuid())
  workspaceId String
  keyHash     String     @unique
  prefix      String
  lastUsedAt  DateTime?
  createdAt   DateTime   @default(now())
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
  @@index([keyHash])
}

model AuditLog {
  id          String     @id @default(cuid())
  userId      String?
  action      String
  entityType  String
  entityId    String
  metadata    Json?
  ipAddress   String?
  createdAt   DateTime   @default(now())
  user        User?      @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([action])
  @@index([createdAt])
}
`.trim();

  // Database Entities Metadata
  const entities: SchemaEntity[] = [
    {
      name: 'User',
      description: 'System identity holding credentials, access tiers, and global system roles',
      fields: [
        { name: 'id', type: 'String', isPrimary: true, isNullable: false, isUnique: true, description: 'CUID alphanumeric identifier' },
        { name: 'email', type: 'String', isNullable: false, isUnique: true, description: 'Verified primary contact' },
        { name: 'name', type: 'String', isNullable: true, isUnique: false, description: 'Display moniker' },
        { name: 'role', type: 'Role', isNullable: false, isUnique: false, description: 'Authorization scope: USER | ADMIN | MAINTAINER' },
        { name: 'createdAt', type: 'DateTime', isNullable: false, description: 'ISO 8601 registration epoch' },
        { name: 'updatedAt', type: 'DateTime', isNullable: false, description: 'Atomic mutation epoch' }
      ],
      indexes: ['@@index([email])']
    },
    {
      name: 'Workspace',
      description: 'Multi-tenant organizational boundary isolating resources, billing, and API tokens',
      fields: [
        { name: 'id', type: 'String', isPrimary: true, isNullable: false, isUnique: true, description: 'CUID workspace key' },
        { name: 'slug', type: 'String', isNullable: false, isUnique: true, description: 'URL-friendly organization identifier' },
        { name: 'name', type: 'String', isNullable: false, description: 'Human-readable organization title' },
        { name: 'planTier', type: 'String', isNullable: false, description: 'Billing plan identifier (STARTER | PRO | ENTERPRISE)' }
      ],
      indexes: ['@@index([slug])']
    },
    {
      name: 'Resource',
      description: `Domain entities governed by ${intake.projectName} with state lifecycle tracking`,
      fields: [
        { name: 'id', type: 'String', isPrimary: true, isNullable: false, isUnique: true, description: 'Resource primary CUID' },
        { name: 'workspaceId', type: 'String', isNullable: false, description: 'Foreign key to parent Workspace' },
        { name: 'ownerId', type: 'String', isNullable: false, description: 'Foreign key to creator User' },
        { name: 'title', type: 'String', isNullable: false, description: 'Descriptive title' },
        { name: 'status', type: 'Status', isNullable: false, description: 'State machine enum: PENDING | ACTIVE | ARCHIVED | FAILED' },
        { name: 'metadata', type: 'Json', isNullable: true, description: 'Dynamic schemaless payload properties' }
      ],
      indexes: ['@@index([workspaceId, status])', '@@index([ownerId])']
    },
    {
      name: 'ApiKey',
      description: 'Hashed programmatic tokens for high-throughput headless automation',
      fields: [
        { name: 'id', type: 'String', isPrimary: true, isNullable: false, isUnique: true, description: 'Token record ID' },
        { name: 'workspaceId', type: 'String', isNullable: false, description: 'Foreign key to owning Workspace' },
        { name: 'keyHash', type: 'String', isNullable: false, isUnique: true, description: 'SHA-256 digested token secret' },
        { name: 'prefix', type: 'String', isNullable: false, description: 'First 8 characters for token identification' },
        { name: 'lastUsedAt', type: 'DateTime', isNullable: true, description: 'Last invocation timestamp' }
      ],
      indexes: ['@@index([workspaceId])', '@@index([keyHash])']
    },
    {
      name: 'AuditLog',
      description: 'Immutable append-only chronological ledger tracking all administrative mutations',
      fields: [
        { name: 'id', type: 'String', isPrimary: true, isNullable: false, isUnique: true, description: 'Log entry identifier' },
        { name: 'userId', type: 'String', isNullable: true, description: 'Mutating actor identifier' },
        { name: 'action', type: 'String', isNullable: false, description: 'Normalized verb identifier (e.g. RESOURCE_MUTATE)' },
        { name: 'entityType', type: 'String', isNullable: false, description: 'Target entity classification' },
        { name: 'entityId', type: 'String', isNullable: false, description: 'Target record CUID' },
        { name: 'createdAt', type: 'DateTime', isNullable: false, description: 'Atomic insertion timestamp' }
      ],
      indexes: ['@@index([action])', '@@index([createdAt])']
    }
  ];

  // API Endpoints
  const endpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/v1/auth/session',
      summary: `Exchange ${intake.authType} token for active workspace context session`,
      authRequired: true,
      requestBodySchema: '{ "token": "string", "workspaceSlug": "string?" }',
      responseBodySchema: '{ "user": { "id": "string", "email": "string" }, "activeWorkspace": { "id": "string" } }',
      rateLimit: '30 req/min per IP'
    },
    {
      method: 'GET',
      path: '/api/v1/workspaces',
      summary: 'List authorized tenant workspaces for authenticated identity',
      authRequired: true,
      responseBodySchema: '{ "workspaces": [{ "id": "string", "slug": "string", "name": "string", "role": "string" }] }',
      rateLimit: '120 req/min per user'
    },
    {
      method: 'POST',
      path: '/api/v1/resources',
      summary: `Create new ${intake.projectName} entity with idempotent validation`,
      authRequired: true,
      requestBodySchema: '{ "workspaceId": "string", "title": "string", "metadata": "Record<string, unknown>?" }',
      responseBodySchema: '{ "id": "string", "status": "ACTIVE", "createdAt": "string" }',
      rateLimit: '60 req/min per workspace'
    },
    {
      method: 'GET',
      path: '/api/v1/resources',
      summary: 'Cursor-paginated query of domain records with status filtering',
      authRequired: true,
      responseBodySchema: '{ "items": [{ "id": "string", "title": "string", "status": "string" }], "nextCursor": "string?" }',
      rateLimit: '300 req/min per workspace'
    },
    {
      method: 'PATCH',
      path: '/api/v1/resources/:id',
      summary: 'Atomic partial update of resource metadata and lifecycle status',
      authRequired: true,
      requestBodySchema: '{ "title": "string?", "status": "ACTIVE | ARCHIVED", "metadata": "Record<string, unknown>?" }',
      responseBodySchema: '{ "id": "string", "updatedAt": "string", "status": "string" }',
      rateLimit: '120 req/min per workspace'
    },
    {
      method: 'POST',
      path: '/api/v1/tokens/keys',
      summary: 'Generate scoped programmatic API key with immediate hash ingestion',
      authRequired: true,
      requestBodySchema: '{ "workspaceId": "string", "label": "string", "scopes": "string[]" }',
      responseBodySchema: '{ "rawKey": "sk_live_...", "prefix": "sk_live_...", "createdAt": "string" }',
      rateLimit: '10 req/min per workspace'
    },
    {
      method: 'GET',
      path: '/api/health',
      summary: 'Liveness and database connectivity diagnostic endpoint',
      authRequired: false,
      responseBodySchema: '{ "status": "UP", "timestamp": "string", "latencyMs": 12 }',
      rateLimit: '600 req/min'
    }
  ];

  // Wireframe Screens
  const wireframeScreens: WireframeScreen[] = [
    {
      screenName: 'Access Gateway',
      route: '/auth/signin',
      purpose: `Zero-friction passwordless or single sign-on authentication via ${intake.authType}`,
      keyComponents: [
        'True-black 1px bordered auth card (#121214)',
        'Monospace protocol status kicker: SYSTEM // AUTH_GATEWAY',
        'Direct OAuth providers and email magic link trigger',
        'Clean unbracketed uppercase CTA: SIGN IN WITH PROVIDER'
      ],
      stateModel: ['Idle', 'Submitting', 'Awaiting Verification Link', 'Authenticated', 'Auth Error']
    },
    {
      screenName: 'Command Deck Dashboard',
      route: '/app/[workspaceSlug]',
      purpose: 'High-cognitive density metric overview and primary action console',
      keyComponents: [
        'Top bar with workspace selector and live latency ping (12ms)',
        'Metric bento grid (Surface #121214 with 1px directional specular lighting)',
        'Recent operational activity table with in-cell status flags',
        'Primary action button: INITIALIZE NEW WORKFLOW'
      ],
      stateModel: ['Loading Skeleton', 'Live Telemetry Active', 'Empty Workspace State', 'Action Modal Open']
    },
    {
      screenName: 'Resource Creation Workspace',
      route: '/app/[workspaceSlug]/resources/new',
      purpose: `Configuring and committing new ${intake.projectName} instances with validation guards`,
      keyComponents: [
        'Two-column split view: Parameter input vs Live deterministic preview',
        'Monospace kicker tags for input fields',
        'Zero-toast in-cell validation banner',
        'Primary trigger: COMMIT SPECIFICATION'
      ],
      stateModel: ['Pristine', 'Validating Inputs', 'Committing to Database', 'Commit Successful']
    },
    {
      screenName: 'Data Ledger & Explorer',
      route: '/app/[workspaceSlug]/resources',
      purpose: 'Virtual-scrolling high-density tabular ledger of all resources',
      keyComponents: [
        'Filter bar with status toggles (ALL | ACTIVE | PENDING | ARCHIVED)',
        'Monospace data table with zebra striping and 1px cell borders',
        'In-cell inline actions machine (no intrusive floating toasts)',
        'Export trigger: EXPORT JSON SPEC'
      ],
      stateModel: ['Fetching Page', 'Filtering Applied', 'Row Selected', 'Mutating Row In-Place']
    },
    {
      screenName: 'Security & API Tokens Console',
      route: '/app/[workspaceSlug]/settings/tokens',
      purpose: 'Programmatic API credential issuance and cryptographic revocation',
      keyComponents: [
        'Active tokens table showing prefix, last used date, and scope',
        'Generate modal with one-time copy reveal',
        'Clean unbracketed uppercase CTA: GENERATE LIVE KEY'
      ],
      stateModel: ['Viewing Tokens', 'Key Generation Modal Active', 'One-Time Secret Revealed', 'Key Revoked']
    }
  ];

  // Sprint Roadmap (14 Days)
  const days: SprintDay[] = [
    {
      dayNumber: 1,
      title: 'Repository Genesis & Toolchain Scaffolding',
      phase: 'FOUNDATION',
      deliverables: [
        'Initialize Next.js 15+ App Router workspace with strict TypeScript configuration',
        'Configure Tailwind CSS 4 with PiyushRatan 5-tier dark mode color ladder',
        'Setup ESLint, Prettier, and path aliases (@/*)'
      ],
      risks: [
        'Toolchain version discrepancies between Next.js and Tailwind plugins'
      ]
    },
    {
      dayNumber: 2,
      title: 'Database Provisioning & Prisma Connection Pool',
      phase: 'FOUNDATION',
      deliverables: [
        `Provision ${intake.databaseType} instance and establish connection URL pool`,
        'Write baseline schema.prisma with User, Workspace, and AuditLog models',
        'Execute initial migration and verify connection latency under 25ms'
      ],
      risks: [
        'Connection pooling limits under serverless cold start scaling'
      ]
    },
    {
      dayNumber: 3,
      title: 'Authentication Infrastructure & Session Guardrails',
      phase: 'CORE_BACKEND',
      deliverables: [
        `Configure ${intake.authType} client and server credentials`,
        'Implement auth middleware for /app route protection with tenant slug extraction',
        'Test session token refresh lifecycle and permission boundaries'
      ],
      risks: [
        'Edge middleware latency when verifying JWT signatures on cold invokes'
      ]
    },
    {
      dayNumber: 4,
      title: 'Domain Entity Modeling & Relational Seeds',
      phase: 'CORE_BACKEND',
      deliverables: [
        'Finalize domain models (Resource, ApiKey) in schema.prisma with indexes',
        'Generate TypeScript client definitions via prisma generate',
        'Create deterministic seed script with 50 synthetic test records'
      ],
      risks: [
        'Cascade delete locks during bulk entity removal'
      ]
    },
    {
      dayNumber: 5,
      title: 'REST API Endpoint Suite & Zod Validation',
      phase: 'CORE_BACKEND',
      deliverables: [
        'Implement /api/v1/resources CRUD routes with strict Zod parsing',
        'Standardize JSON response envelope: { success: boolean, data?: T, error?: string }',
        'Enforce HTTP 400 bad request error diagnostics with field-level clarity'
      ],
      risks: [
        'Unsanitized JSON payload payloads causing unhandled 500 exceptions'
      ]
    },
    {
      dayNumber: 6,
      title: 'Rate Limiting & Telemetry Audit Engine',
      phase: 'CORE_BACKEND',
      deliverables: [
        'Integrate sliding-window rate limiting on public and sensitive routes',
        'Implement automated AuditLog insertion trigger on every mutating endpoint',
        'Add /api/health endpoint with deep database probe'
      ],
      risks: [
        'Redis connection timeouts blocking synchronous request pipelines'
      ]
    },
    {
      dayNumber: 7,
      title: 'Design System Master Shell & Aerospace Dark Layout',
      phase: 'CORE_FRONTEND',
      deliverables: [
        'Build base layout shell with #000000 Void canvas and #09090b navigation bars',
        'Create Aerospace Card component with 1px directional specular lighting',
        'Implement clean unbracketed uppercase monospace Button components'
      ],
      risks: [
        'Halation glare caused by continuous pure-white text on OLED black backgrounds'
      ]
    },
    {
      dayNumber: 8,
      title: 'Command Deck Dashboard & Bento Metric Grid',
      phase: 'CORE_FRONTEND',
      deliverables: [
        'Build /app/[workspaceSlug] dashboard view with live telemetry cards',
        'Implement zero-emoji SVG icon pipeline with lucide-react',
        'Add monospace kicker tags (text-zinc-500 font-mono text-xs uppercase)'
      ],
      risks: [
        'Layout shift during asynchronous telemetry data fetching'
      ]
    },
    {
      dayNumber: 9,
      title: 'Resource Workspace & In-Cell Form Machines',
      phase: 'CORE_FRONTEND',
      deliverables: [
        'Build resource configuration and creation view with real-time field validation',
        'Implement in-cell inline feedback machines superseding ephemeral toast cascades',
        'Add optimistic UI mutation state handling'
      ],
      risks: [
        'Form state desynchronization upon network dropouts'
      ]
    },
    {
      dayNumber: 10,
      title: 'High-Density Tabular Explorer & Filtering Engine',
      phase: 'CORE_FRONTEND',
      deliverables: [
        'Build /app/[workspaceSlug]/resources virtualized data table',
        'Implement search query params synchronization via URL state',
        'Add quick action triggers for status mutation and JSON export'
      ],
      risks: [
        'Performance degradation rendering large lists without virtualization'
      ]
    },
    {
      dayNumber: 11,
      title: 'End-to-End Pipeline & Webhook Ingestion',
      phase: 'INTEGRATION',
      deliverables: [
        'Wire frontend client actions directly to backend API routes',
        'Implement cryptographic webhook receiver with HMAC signature verification',
        'Verify zero-loss data ingestion across async boundaries'
      ],
      risks: [
        'Replay attacks on unverified webhook payloads'
      ]
    },
    {
      dayNumber: 12,
      title: 'Security Hardening, Quota Guards & Token Machine',
      phase: 'INTEGRATION',
      deliverables: [
        'Build /settings/tokens UI for developer API key generation and revocation',
        'Hash tokens via SHA-256 before storage; display raw key exactly once',
        'Implement tenant-level quota guards preventing run-away resource allocation'
      ],
      risks: [
        'Exposing raw API secret keys in client-side state bundles'
      ]
    },
    {
      dayNumber: 13,
      title: 'Performance Profiling, Stress Test & Error Envelopes',
      phase: 'HARDENING',
      deliverables: [
        'Run Lighthouse & Core Web Vitals audit; ensure LCP < 1.2s and CLS = 0',
        'Execute stress load tests simulating 100 concurrent requests',
        'Verify zero unhandled promise rejections and complete error envelopes'
      ],
      risks: [
        'Serverless compute duration spikes under sudden concurrent traffic bursts'
      ]
    },
    {
      dayNumber: 14,
      title: 'Production Deployment & DNS Cutover',
      phase: 'HARDENING',
      deliverables: [
        `Deploy production artifacts to ${intake.deployTarget}`,
        'Configure custom domain SSL certificates, CAA records, and HTTP security headers',
        'Perform zero-downtime smoke test and publish MVP launch release notes'
      ],
      risks: [
        'DNS propagation delay and SSL handshake caching mismatch'
      ]
    }
  ];

  // Cost Matrix
  const costItems: CostItem[] = [
    {
      serviceName: `Frontend & API Edge (${intake.deployTarget})`,
      tier: 'Starter / Hobby Tier (Free -> Pro)',
      estimatedMonthlyCostUsd: 0,
      scalingThreshold: '100 GB bandwidth or >1M function invocations/mo'
    },
    {
      serviceName: `Database Engine (${intake.databaseType})`,
      tier: 'Managed Serverless Compute (Neon / Supabase / PlanetScale)',
      estimatedMonthlyCostUsd: 0,
      scalingThreshold: '0.5 GB storage or >100 active connection slots'
    },
    {
      serviceName: `Authentication (${intake.authType})`,
      tier: 'Developer Free Tier',
      estimatedMonthlyCostUsd: 0,
      scalingThreshold: '>50,000 monthly active users (MAU)'
    },
    {
      serviceName: 'Distributed Cache & Rate Limiter (Upstash Redis)',
      tier: 'Serverless Free Tier',
      estimatedMonthlyCostUsd: 0,
      scalingThreshold: '>10,000 daily commands'
    },
    {
      serviceName: 'Custom Domain & Edge DNS (Cloudflare)',
      tier: 'Free Plan with Universal SSL',
      estimatedMonthlyCostUsd: 0,
      scalingThreshold: 'Unlimited DNS queries'
    }
  ];

  const totalCost = costItems.reduce((acc, item) => acc + item.estimatedMonthlyCostUsd, 0);

  // Competitor Analysis Synthesis
  const competitorAnalysis = competitorIntelligence
    ? {
        competitorUrl: competitorIntelligence.url || intake.competitorUrl,
        keyGapsIdentified: [
          competitorIntelligence.description ? `Incumbent weakness: ${competitorIntelligence.description}` : 'Incumbent suffering from legacy multi-second cold boots and bloated configuration overhead',
          'Heavy client bundle sizes exceeding 1.8MB causing sluggish interaction to next paint (INP)',
          'Complex enterprise pricing barriers locking small and high-velocity engineering teams out'
        ],
        unfairAdvantages: [
          'Edge-first lightweight SSR delivering sub-150ms time to first byte globally',
          'High-cognitive density aerospace UI eliminating multi-page wizard navigation fatigue',
          'Direct Prisma schema integration offering instantaneous zero-drift migrations'
        ],
        defensibilityTactics: [
          'Zero-latency programmatic API access with cryptographic token hashing',
          'Idempotent mutation pipelines preventing data corruption during network drops',
          'Transparent, predictable flat cost structure with zero tier lock-in'
        ]
      }
    : {
        competitorUrl: intake.competitorUrl || undefined,
        keyGapsIdentified: [
          'Competitors rely on bloated legacy frameworks with slow rendering and complex onboarding',
          'Excessive client bundle sizes and multi-tier pricing plans with high churn',
          'Lack of rigorous developer-first architectural contracts and clean data models'
        ],
        unfairAdvantages: [
          'Direct compile-to-edge architecture with sub-100ms response targets',
          'PiyushRatan Directives 2.0 aerospace design system maximizing information density',
          'Complete type safety from database models through API contracts to UI components'
        ],
        defensibilityTactics: [
          'High switching costs created by deep developer integration and API ergonomics',
          'Zero mystery bugs through strict audit logs and deterministic state models',
          'Ultra-lean operating cost structure (~$0/mo starter COGS) ensuring survivability'
        ]
      };

  const rawSpec: FullMvpSpec = {
    id: `spec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    projectName: intake.projectName,
    intake,
    architecture: {
      topologySummary: `Distributed Edge-First Architecture for ${intake.projectName}. Client requests hit Edge DNS and CDN caches, routing dynamic Next.js App Router API queries to regional serverless execution containers connected to ${intake.databaseType} via connection pooling, with distributed Redis for rate-limiting and session verification.`,
      components: {
        frontend: {
          name: 'Next.js 15+ App Router Viewport',
          responsibility: 'High-density aerospace interface rendering, optimistic mutations, and zero-layout-shift UI',
          tech: 'Next.js 15, React 19, Tailwind CSS 4, Lucide Icons'
        },
        backend: {
          name: 'Serverless Edge & Regional Route Handlers',
          responsibility: 'Input validation via Zod, authentication session enforcement, transactional mutations',
          tech: 'TypeScript, Next.js Route Handlers, Prisma ORM'
        },
        edge: {
          name: 'Global Edge Router & Middleware',
          responsibility: 'SSL termination, bot mitigation, tenant routing, and session token verification',
          tech: intake.deployTarget === 'Cloudflare' ? 'Cloudflare Workers' : 'Vercel Edge Network'
        },
        queue: {
          name: 'Asynchronous Event Dispatcher',
          responsibility: 'Decoupled background processing, audit log flushing, and third-party webhook relays',
          tech: 'In-process batch queue with Upstash QStash / Redis pub-sub fallback'
        },
        cache: {
          name: 'Distributed KV & Rate Limiting Cache',
          responsibility: 'Sub-millisecond sliding-window rate limit counters and transient tenant session store',
          tech: 'Upstash Redis / Edge KV'
        }
      },
      techStack: {
        framework: {
          category: 'Framework',
          name: 'Next.js 15+ App Router',
          rationale: 'Combines server-rendered edge speed with deterministic client hydration and built-in API routing.',
          tradeOffs: ['Server components require mental model discipline regarding client boundary placement.']
        },
        database: {
          category: 'Database',
          name: intake.databaseType,
          rationale: `Selected ${intake.databaseType} provides optimal ACID transactions, structured indexing, and rock-solid relational integrity.`,
          tradeOffs: ['Requires dedicated connection pooling under high serverless concurrency spikes.']
        },
        orm: {
          category: 'ORM',
          name: 'Prisma ORM',
          rationale: 'End-to-end type safety, automated migrations, readable declarative schema syntax, and IDE autocompletion.',
          tradeOffs: ['Slightly larger runtime engine overhead compared to raw SQL or lightweight query builders.']
        },
        auth: {
          category: 'Authentication',
          name: intake.authType,
          rationale: `Provides production-ready identity management, session token rotation, and battle-tested security.`,
          tradeOffs: ['Requires careful synchronization between external auth identity and internal User table.']
        },
        ui: {
          category: 'UI / Design System',
          name: 'Tailwind CSS 4 + PiyushRatan Directives 2.0',
          rationale: 'True black (#000000) 5-tier surface ladder, 1px specular borders, zero emojis, high-density aerospace precision.',
          tradeOffs: ['Strict compliance bans decorative pills, gradients, and generic web bloat.']
        },
        hosting: {
          category: 'Deployment / Hosting',
          name: intake.deployTarget,
          rationale: `Native CI/CD preview builds, instant rollbacks, global edge CDN distribution on ${intake.deployTarget}.`,
          tradeOffs: ['Vendor-specific serverless duration caps require long tasks to be offloaded to queues.']
        }
      },
      dataFlowDiagramText: `[ CLIENT BROWSER ]
       |
       |-- HTTPS (TLS 1.3) --> [ GLOBAL EDGE CDN / ROUTER ]
                                     |
                                     +-- Static Assets (Cached at Edge)
                                     |
                                     v
                       [ NEXT.JS APP ROUTER API ]
                                     |
                   +-----------------+-----------------+
                   |                                   |
                   v                                   v
          [ AUTH VERIFICATION ]              [ RATE LIMIT ENGINE ]
          (${intake.authType})                 (Upstash Redis KV)
                   |                                   |
                   +-----------------+-----------------+
                                     |
                                     v
                       [ PRISMA ORM DATA ACCESS ]
                                     |
                   +-----------------+-----------------+
                   |                                   |
                   v                                   v
         [ PRIMARY DATABASE ]               [ ASYNC AUDIT DISPATCH ]
         (${intake.databaseType})               (Append-Only Ledger)`
    },
    database: {
      dbType: intake.databaseType,
      prismaSchemaCode,
      entities
    },
    apiContract: {
      endpoints
    },
    uiBlueprint: {
      designSystemGuidance: {
        philosophy: 'High-Cognitive Density Aerospace Dark Mode with 1px directional key-lighting and zero decorative fluff',
        colorPalette: {
          void: '#000000',
          canvas: '#09090b',
          surface: '#121214',
          elevated: '#18181b',
          active: '#27272a',
          accent: '#06b6d4',
          textPrimary: '#ffffff',
          textSecondary: '#a1a1aa',
          textKicker: '#71717a',
          borderKey: 'rgba(255, 255, 255, 0.12)'
        },
        typography: {
          fontSans: 'Inter, Geist Sans, system-ui',
          fontMono: 'JetBrains Mono, Geist Mono, monospace',
          kickerRule: 'uppercase text-xs font-mono text-zinc-500 tracking-wider',
          buttonCtaRule: 'uppercase text-xs font-mono font-medium tracking-wide no decorative brackets'
        },
        componentRules: [
          'Strictly banned: rounded-full pills on buttons and cards; use 2px micro-chamfers or sharp corners',
          'Strictly banned: decorative brackets around button text like [ SIGN IN ]',
          'Strictly banned: unicode emojis across UI, marketing headers, and cards',
          'Mandatory: 1px subtle directional key-lighting on dark surfaces',
          'Mandatory: In-cell mutations and action feedback over ephemeral toast cascades'
        ]
      },
      wireframeScreens
    },
    sprintRoadmap: {
      days
    },
    costMatrix: {
      items: costItems,
      totalEstimatedStarterCost: totalCost
    },
    competitorAnalysis,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    credits: 'Built with Quzar Ship by Piyush Ratan'
  };

  // Validate output through Zod to guarantee schema integrity
  return FullMvpSpecSchema.parse(rawSpec);
}
