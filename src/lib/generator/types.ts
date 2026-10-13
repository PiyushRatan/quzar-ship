import { z } from 'zod';

export const DatabaseTypeEnum = z.enum([
  'PostgreSQL',
  'MySQL',
  'Firestore',
  'MongoDB'
]);
export type DatabaseType = z.infer<typeof DatabaseTypeEnum>;

export const AuthTypeEnum = z.enum([
  'NextAuth',
  'Supabase',
  'Clerk',
  'Firebase Auth'
]);
export type AuthType = z.infer<typeof AuthTypeEnum>;

export const DeployTargetEnum = z.enum([
  'Vercel',
  'Cloudflare',
  'Docker',
  'AWS'
]);
export type DeployTarget = z.infer<typeof DeployTargetEnum>;

export const SprintPhaseEnum = z.enum([
  'FOUNDATION',
  'CORE_BACKEND',
  'CORE_FRONTEND',
  'INTEGRATION',
  'HARDENING'
]);
export type SprintPhase = z.infer<typeof SprintPhaseEnum>;

export const HttpMethodEnum = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
]);
export type HttpMethod = z.infer<typeof HttpMethodEnum>;

// ==========================================
// 1. Project Intake
// ==========================================

export const ProjectIntakeSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  concept: z.string().min(5, 'Concept must be at least 5 characters'),
  targetAudience: z.string().min(3, 'Target audience description is required'),
  competitorUrl: z.string().optional(),
  techStackPreference: z.string().optional(),
  databaseType: DatabaseTypeEnum,
  authType: AuthTypeEnum,
  deployTarget: DeployTargetEnum
});

export type ProjectIntake = z.infer<typeof ProjectIntakeSchema>;

// ==========================================
// 2. Competitor Intelligence
// ==========================================

export const CompetitorIntelligenceSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  pricingModel: z.string().optional(),
  techDetected: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  differentiators: z.array(z.string()).default([]),
  rawTextSummary: z.string().optional()
});

export type CompetitorIntelligence = z.infer<typeof CompetitorIntelligenceSchema>;

// ==========================================
// 3. System Architecture
// ==========================================

export const ArchitectureComponentDetailSchema = z.object({
  name: z.string(),
  responsibility: z.string(),
  tech: z.string()
});
export type ArchitectureComponentDetail = z.infer<typeof ArchitectureComponentDetailSchema>;

export const ArchitectureComponentsSchema = z.object({
  frontend: ArchitectureComponentDetailSchema,
  backend: ArchitectureComponentDetailSchema,
  edge: ArchitectureComponentDetailSchema,
  queue: ArchitectureComponentDetailSchema,
  cache: ArchitectureComponentDetailSchema
});
export type ArchitectureComponents = z.infer<typeof ArchitectureComponentsSchema>;

export const TechStackItemSchema = z.object({
  category: z.string(),
  name: z.string(),
  rationale: z.string(),
  tradeOffs: z.array(z.string())
});
export type TechStackItem = z.infer<typeof TechStackItemSchema>;

export const SystemArchitectureSchema = z.object({
  topologySummary: z.string(),
  components: ArchitectureComponentsSchema,
  techStack: z.object({
    framework: TechStackItemSchema,
    database: TechStackItemSchema,
    orm: TechStackItemSchema,
    auth: TechStackItemSchema,
    ui: TechStackItemSchema,
    hosting: TechStackItemSchema
  }),
  dataFlowDiagramText: z.string()
});
export type SystemArchitecture = z.infer<typeof SystemArchitectureSchema>;

// ==========================================
// 4. Database Schema
// ==========================================

export const SchemaEntityFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  isPrimary: z.boolean().optional(),
  isNullable: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  description: z.string().optional()
});
export type SchemaEntityField = z.infer<typeof SchemaEntityFieldSchema>;

export const SchemaEntitySchema = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(SchemaEntityFieldSchema),
  indexes: z.array(z.string()).default([])
});
export type SchemaEntity = z.infer<typeof SchemaEntitySchema>;

export const DatabaseSchemaSchema = z.object({
  dbType: DatabaseTypeEnum,
  prismaSchemaCode: z.string(),
  entities: z.array(SchemaEntitySchema)
});
export type DatabaseSchema = z.infer<typeof DatabaseSchemaSchema>;

// ==========================================
// 5. API Contract
// ==========================================

export const ApiEndpointSchema = z.object({
  method: HttpMethodEnum,
  path: z.string(),
  summary: z.string(),
  authRequired: z.boolean(),
  requestBodySchema: z.string().optional(),
  responseBodySchema: z.string(),
  rateLimit: z.string().optional()
});
export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>;

export const ApiContractSchema = z.object({
  endpoints: z.array(ApiEndpointSchema)
});
export type ApiContract = z.infer<typeof ApiContractSchema>;

// ==========================================
// 6. UI Blueprint (PiyushRatan Directives 2.0)
// ==========================================

export const DesignSystemGuidanceSchema = z.object({
  philosophy: z.string(),
  colorPalette: z.object({
    void: z.string(),
    canvas: z.string(),
    surface: z.string(),
    elevated: z.string(),
    active: z.string(),
    accent: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    textKicker: z.string(),
    borderKey: z.string()
  }),
  typography: z.object({
    fontSans: z.string(),
    fontMono: z.string(),
    kickerRule: z.string(),
    buttonCtaRule: z.string()
  }),
  componentRules: z.array(z.string())
});
export type DesignSystemGuidance = z.infer<typeof DesignSystemGuidanceSchema>;

export const WireframeScreenSchema = z.object({
  screenName: z.string(),
  route: z.string(),
  purpose: z.string(),
  keyComponents: z.array(z.string()),
  stateModel: z.array(z.string())
});
export type WireframeScreen = z.infer<typeof WireframeScreenSchema>;

export const UiBlueprintSchema = z.object({
  designSystemGuidance: DesignSystemGuidanceSchema,
  wireframeScreens: z.array(WireframeScreenSchema)
});
export type UiBlueprint = z.infer<typeof UiBlueprintSchema>;

// ==========================================
// 7. Sprint Roadmap (14 Days)
// ==========================================

export const SprintDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(14),
  title: z.string(),
  phase: SprintPhaseEnum,
  deliverables: z.array(z.string()),
  risks: z.array(z.string())
});
export type SprintDay = z.infer<typeof SprintDaySchema>;

export const SprintRoadmapSchema = z.object({
  days: z.array(SprintDaySchema).length(14, 'Roadmap must contain exactly 14 sprint days')
});
export type SprintRoadmap = z.infer<typeof SprintRoadmapSchema>;

// ==========================================
// 8. Cost Matrix
// ==========================================

export const CostItemSchema = z.object({
  serviceName: z.string(),
  tier: z.string(),
  estimatedMonthlyCostUsd: z.number(),
  scalingThreshold: z.string()
});
export type CostItem = z.infer<typeof CostItemSchema>;

export const CostMatrixSchema = z.object({
  items: z.array(CostItemSchema),
  totalEstimatedStarterCost: z.number()
});
export type CostMatrix = z.infer<typeof CostMatrixSchema>;

// ==========================================
// 9. Competitor Advantage Synthesis
// ==========================================

export const CompetitorAnalysisSchema = z.object({
  competitorUrl: z.string().optional(),
  keyGapsIdentified: z.array(z.string()),
  unfairAdvantages: z.array(z.string()),
  defensibilityTactics: z.array(z.string())
});
export type CompetitorAnalysis = z.infer<typeof CompetitorAnalysisSchema>;

// ==========================================
// 10. Complete MVP Specification
// ==========================================

export const FullMvpSpecSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  intake: ProjectIntakeSchema,
  architecture: SystemArchitectureSchema,
  database: DatabaseSchemaSchema,
  apiContract: ApiContractSchema,
  uiBlueprint: UiBlueprintSchema,
  sprintRoadmap: SprintRoadmapSchema,
  costMatrix: CostMatrixSchema,
  competitorAnalysis: CompetitorAnalysisSchema.optional(),
  generatedAt: z.string(),
  version: z.string(),
  credits: z.literal('Built with Quzar Ship by Piyush Ratan').default('Built with Quzar Ship by Piyush Ratan')
});
export type FullMvpSpec = z.infer<typeof FullMvpSpecSchema>;
