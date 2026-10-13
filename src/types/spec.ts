export type DatabaseOption = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'MongoDB' | 'Firestore';
export type AuthOption = 'NextAuth' | 'Supabase Auth' | 'Clerk' | 'Custom JWT';
export type DeploymentOption = 'Vercel Edge' | 'Docker / VPS' | 'Cloudflare Workers' | 'AWS';

export interface TopologyNode {
  id: string;
  label: string;
  role: string;
  tier: string;
  protocol: string;
}

export interface ServiceSpec {
  name: string;
  type: string;
  tech: string;
  description: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  auth: string;
  idempotency: boolean;
  rateLimit: string;
}

export interface SecurityGuard {
  title: string;
  policy?: string;
  directive?: string;
  enforcement: string;
  status: 'ENFORCED' | 'AUDITED';
}

export interface ComponentBlueprint {
  category: string;
  components: Array<{
    name: string;
    role: string;
    spec?: string;
    policy?: string;
    directive?: string;
  }>;
}

export interface SprintDay {
  day: number;
  phase: 'PHASE 1: FOUNDATION' | 'PHASE 2: CORE ENGINE' | 'PHASE 3: POLISH & HARDENING';
  title: string;
  deliverables: string[];
  completed: boolean;
}

export interface CostResource {
  resource: string;
  provider: string;
  cost: string;
}

export interface CostTier {
  name: string;
  users: string;
  monthlyTotal: string;
  margin: string;
  breakdown: CostResource[];
}

export interface ArchitectureSpec {
  id: string;
  conceptName: string;
  problemStatement: string;
  referenceUrl?: string;
  targetDatabase: DatabaseOption;
  authProvider: AuthOption;
  deploymentTarget: DeploymentOption;
  generatedAt: string;
  topology: {
    summary: string;
    diagramNodes: TopologyNode[];
    services: ServiceSpec[];
    telemetry: {
      ingressLatency: string;
      dbQueryLatency: string;
      edgeColdStart: string;
    };
  };
  databaseSchema: {
    filename: string;
    code: string;
    tablesCount: number;
    relationsCount: number;
    description: string;
  };
  apiContracts: {
    endpoints: ApiEndpoint[];
    securityGuards: SecurityGuard[];
  };
  uiBlueprint: {
    componentTree: ComponentBlueprint[];
    designTokens: Array<{ token: string; value: string; rule: string }>;
    accessibilityGuards: Array<{ guard: string; level: string; spec: string }>;
  };
  sprintRoadmap: {
    totalDays: number;
    velocityRatio: string;
    days: SprintDay[];
  };
  costMatrix: {
    tiers: CostTier[];
    projectedSavings: string;
    cachingImpact: string;
  };
}

export interface IntakePreset {
  id: string;
  name: string;
  tagline: string;
  conceptName: string;
  problemStatement: string;
  referenceUrl?: string;
  targetDatabase: DatabaseOption;
  authProvider: AuthOption;
  deploymentTarget: DeploymentOption;
  sampleSpec: ArchitectureSpec;
}
