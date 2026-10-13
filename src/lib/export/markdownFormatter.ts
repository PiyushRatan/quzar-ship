/**
 * markdownFormatter.ts
 * Generates ARCHITECTURE.md: complete executive summary, tech stack, data flow, API contract, and 14-day roadmap.
 */

export function formatArchitectureMarkdown(spec: any): string {
  const projectName = spec?.projectName || spec?.conceptName || 'Application';
  const generatedAt = spec?.generatedAt || new Date().toISOString();
  const version = spec?.version || '1.0.0';
  const credits = spec?.credits || 'Built with Quzar Ship by Piyush Ratan';

  // Executive details
  const concept = spec?.intake?.concept || spec?.problemStatement || 'Enterprise architecture specification.';
  const audience = spec?.intake?.targetAudience || 'Modern technical teams & software developers';
  const dbType = spec?.intake?.databaseType || spec?.database?.dbType || spec?.targetDatabase || 'PostgreSQL';
  const authType = spec?.intake?.authType || spec?.authProvider || 'NextAuth';
  const deployTarget = spec?.intake?.deployTarget || spec?.deploymentTarget || 'Vercel';

  // Topology & Components
  const topologySummary =
    spec?.architecture?.topologySummary ||
    spec?.topology?.summary ||
    'High-throughput distributed cloud-native architecture optimized for sub-50ms p95 latencies.';

  let componentsSection = '';
  if (spec?.architecture?.components) {
    const c = spec.architecture.components;
    componentsSection = `### Layer Topology Breakdown
- **Frontend Layer:** ${c.frontend?.name || 'Client Application'} (${c.frontend?.tech || 'Next.js App Router'})
  - *Responsibility:* ${c.frontend?.responsibility || 'UI, streaming SSR, and client state orchestration'}
- **Backend / API Layer:** ${c.backend?.name || 'Core API'} (${c.backend?.tech || 'Node.js / Route Handlers'})
  - *Responsibility:* ${c.backend?.responsibility || 'Business logic, database persistence, and authorization'}
- **Edge Layer:** ${c.edge?.name || 'Edge Runtime'} (${c.edge?.tech || 'Cloudflare / Vercel Edge'})
  - *Responsibility:* ${c.edge?.responsibility || 'Global TLS termination, edge caching, and geo-routing'}
- **Queue Layer:** ${c.queue?.name || 'Background Queue'} (${c.queue?.tech || 'BullMQ / Redis / SQS'})
  - *Responsibility:* ${c.queue?.responsibility || 'Asynchronous job dispatch, retries, and rate throttling'}
- **Cache Layer:** ${c.cache?.name || 'Distributed Cache'} (${c.cache?.tech || 'Redis / Upstash'})
  - *Responsibility:* ${c.cache?.responsibility || 'Session caching and hot data invalidation'}`;
  } else if (spec?.topology?.services && Array.isArray(spec.topology.services)) {
    componentsSection = `### Core Services
${spec.topology.services
  .map(
    (s: any) => `- **${s.name}** (\`${s.type}\` via ${s.tech}): ${s.description}`
  )
  .join('\n')}`;
  }

  // Tech Stack Matrix
  let techStackSection = '';
  if (spec?.architecture?.techStack) {
    const ts = spec.architecture.techStack;
    const items = [
      { cat: 'Framework', ...ts.framework },
      { cat: 'Database', ...ts.database },
      { cat: 'ORM / Driver', ...ts.orm },
      { cat: 'Authentication', ...ts.auth },
      { cat: 'UI System', ...ts.ui },
      { cat: 'Deployment & Hosting', ...ts.hosting },
    ].filter((i) => i.name);

    techStackSection = `## 2. Technology Stack & Architectural Trade-offs
| Category | Selection | Architectural Rationale | Trade-offs & Limitations |
| :--- | :--- | :--- | :--- |
${items
  .map(
    (i) =>
      `| **${i.cat}** | \`${i.name || 'Standard'}\` | ${i.rationale || 'Industry standard selection'} | ${
        Array.isArray(i.tradeOffs) ? i.tradeOffs.join(', ') : i.tradeOffs || 'None specified'
      } |`
  )
  .join('\n')}`;
  } else {
    techStackSection = `## 2. Core Technology Stack
- **Database Engine:** \`${dbType}\`
- **Authentication:** \`${authType}\`
- **Deployment Runtime:** \`${deployTarget}\``;
  }

  // Data Flow Diagram
  const dataFlow =
    spec?.architecture?.dataFlowDiagramText ||
    `[Client Browser / Mobile]
       │
       ▼ (HTTPS / TLS 1.3)
[Edge Reverse Proxy & CDN]
       │
       ▼
[Next.js App Server (API Routes)]
       ├── (Prisma ORM) ──────► [${dbType} Database Cluster]
       ├── (Cache Client) ────► [Redis / In-Memory State Store]
       └── (Background Jobs) ─► [Asynchronous Worker Queue]`;

  // API Contracts
  const rawEndpoints = spec?.apiContract?.endpoints || spec?.apiContracts?.endpoints || [];
  let apiSection = `## 4. API Contract & Interface Blueprint
| Method | Route | Description | Auth | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
`;

  if (Array.isArray(rawEndpoints) && rawEndpoints.length > 0) {
    apiSection += rawEndpoints
      .map((e: any) => {
        const isAuth = e.authRequired ?? (e.auth !== 'None' && e.auth !== 'PUBLIC');
        return `| \`${e.method}\` | \`${e.path}\` | ${e.summary} | ${isAuth ? 'Bearer Required' : 'Public'} | ${
          e.rateLimit || '100 req/min'
        } |`;
      })
      .join('\n');

    apiSection += `\n\n### Endpoint Detailed Specifications\n`;
    apiSection += rawEndpoints
      .map((e: any) => {
        let details = `#### \`${e.method} ${e.path}\`\n- **Summary:** ${e.summary}\n- **Access:** ${
          e.authRequired ? 'Authenticated (Session/Bearer)' : 'Public'
        }\n- **Rate Limit:** ${e.rateLimit || 'Standard IP Throttling'}`;
        if (e.requestBodySchema) {
          details += `\n- **Request Schema:**\n\`\`\`json\n${e.requestBodySchema}\n\`\`\``;
        }
        if (e.responseBodySchema) {
          details += `\n- **Response Schema:**\n\`\`\`json\n${e.responseBodySchema}\n\`\`\``;
        }
        return details;
      })
      .join('\n\n');
  } else {
    apiSection += `| \`GET\` | \`/api/health\` | System liveness probe | Public | Unrestricted |\n| \`POST\` | \`/api/data\` | Primary resource mutation | Bearer Required | 60 req/min |`;
  }

  // 14-Day Roadmap
  const rawDays = spec?.sprintRoadmap?.days || [];
  let roadmapSection = `## 5. 14-Day Execution & Production Roadmap
| Day | Phase | Deliverables | Risk Mitigation |
| :--- | :--- | :--- | :--- |
`;

  if (Array.isArray(rawDays) && rawDays.length > 0) {
    roadmapSection += rawDays
      .map((d: any) => {
        const dayNumber = d.dayNumber || d.day || 1;
        const phase = d.phase || 'CORE_ENGINE';
        const title = d.title || `Day ${dayNumber} Milestone`;
        const deliverables = Array.isArray(d.deliverables) ? d.deliverables.join('<br>• ') : d.deliverables;
        const risks = Array.isArray(d.risks) && d.risks.length > 0 ? d.risks.join('<br>• ') : 'None identified';
        return `| **Day ${dayNumber}** | \`${phase}\` | **${title}**<br>• ${deliverables} | • ${risks} |`;
      })
      .join('\n');
  } else {
    roadmapSection += `| **Day 1** | \`FOUNDATION\` | Repository setup, environment configs, schema baseline | Strict lint and typecheck in CI |`;
  }

  return `# ${projectName} — Architecture Specification
> **System Architecture & Technical Execution Blueprint**
> Generated by **${credits}**
> Timestamp: \`${generatedAt}\` | Version: \`${version}\`

---

## 1. Executive Summary & Topology
- **Project Name:** ${projectName}
- **Core Concept:** ${concept}
- **Target Audience:** ${audience}
- **Database Engine:** \`${dbType}\`
- **Authentication Provider:** \`${authType}\`
- **Deployment Target:** \`${deployTarget}\`

### Topology Overview
${topologySummary}

${componentsSection}

---

${techStackSection}

---

## 3. End-to-End System Data Flow
\`\`\`
${dataFlow}
\`\`\`

---

${apiSection}

---

${roadmapSection}

---
*Generated by Quzar Ship • Piyush Ratan Directives 2.0*
`;
}
