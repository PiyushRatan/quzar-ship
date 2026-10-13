/**
 * prdGenerator.ts
 * Generates PRD.md: full product requirement document with UI/UX blueprints, wireframe screens, and cost matrix.
 */

export function generatePrdMarkdown(spec: any): string {
  const projectName = spec?.projectName || spec?.conceptName || 'Application';
  const generatedAt = spec?.generatedAt || new Date().toISOString();
  const version = spec?.version || '1.0.0';
  const credits = spec?.credits || 'Built with Quzar Ship by Piyush Ratan';

  const concept = spec?.intake?.concept || spec?.problemStatement || 'Enterprise product specification.';
  const audience = spec?.intake?.targetAudience || 'Modern technical teams & software developers';

  // Competitor Analysis Section
  let competitorSection = '';
  if (spec?.competitorAnalysis) {
    const ca = spec.competitorAnalysis;
    competitorSection = `## 2. Competitive Landscape & Defensibility
- **Reference Competitor:** ${ca.competitorUrl || 'Market Baseline'}

### Key Market Gaps Identified
${(ca.keyGapsIdentified || []).map((g: string) => `- ${g}`).join('\n')}

### Architectural & Unfair Advantages
${(ca.unfairAdvantages || []).map((a: string) => `- ${a}`).join('\n')}

### Defensibility Tactics
${(ca.defensibilityTactics || []).map((t: string) => `- ${t}`).join('\n')}

---
`;
  }

  // UI/UX Blueprint Section
  let uiSection = `## 3. UI/UX Design System Blueprint (Directives 2.0)
`;

  if (spec?.uiBlueprint?.designSystemGuidance) {
    const ds = spec.uiBlueprint.designSystemGuidance;
    uiSection += `### Design Philosophy
${ds.philosophy}

### Color Architecture (Void Canvas & 5-Tier Ladder)
- **Void:** \`${ds.colorPalette?.void || '#000000'}\` (Pure pitch black depth)
- **Canvas (Tier 1):** \`${ds.colorPalette?.canvas || '#09090b'}\`
- **Surface (Tier 2):** \`${ds.colorPalette?.surface || '#121214'}\`
- **Elevated (Tier 3):** \`${ds.colorPalette?.elevated || '#18181b'}\`
- **Active (Tier 4):** \`${ds.colorPalette?.active || '#27272a'}\`
- **Accent Indicator:** \`${ds.colorPalette?.accent || '#06b6d4'}\` (Monochrome with telemetry accent)
- **Border Key-Lighting:** \`${ds.colorPalette?.borderKey || '1px solid rgba(255,255,255,0.12)'}\`

### Typography Directives
- **Sans Font:** ${ds.typography?.fontSans || 'Inter, Geist Sans, system-ui'}
- **Mono Font:** ${ds.typography?.fontMono || 'JetBrains Mono, Geist Mono'}
- **Protocol Kickers:** ${ds.typography?.kickerRule || 'Uppercase mono labels with 0.1em tracking'}
- **Action CTAs:** ${ds.typography?.buttonCtaRule || 'Clean uppercase monospace unbracketed labels'}

### Strict Architectural UI Directives
${(ds.componentRules || []).map((r: string) => `- ${r}`).join('\n')}
`;
  } else if (spec?.uiBlueprint?.designTokens) {
    uiSection += `### Design Tokens & Rules
${spec.uiBlueprint.designTokens
  .map((t: any) => `- **${t.token}**: \`${t.value}\` — ${t.rule}`)
  .join('\n')}
`;
  } else {
    uiSection += `- **Theme:** Strict True Black (#000000) canvas with 1px directional border lighting.
- **Rules:** Zero decorative emojis, sharp geometric corners or rounded-xs, high tabular data density.\n`;
  }

  // Wireframe Screens
  let wireframeSection = `\n### Wireframe Screens & State Models\n`;
  const screens = spec?.uiBlueprint?.wireframeScreens || [];
  if (Array.isArray(screens) && screens.length > 0) {
    wireframeSection += screens
      .map(
        (s: any) => `#### Screen: ${s.screenName} (\`${s.route}\`)
- **Purpose:** ${s.purpose}
- **Key UI Components:**
${(s.keyComponents || []).map((c: string) => `  - ${c}`).join('\n')}
- **State Model:**
${(s.stateModel || []).map((st: string) => `  - \`${st}\``).join('\n')}`
      )
      .join('\n\n');
  } else if (spec?.uiBlueprint?.componentTree) {
    wireframeSection += spec.uiBlueprint.componentTree
      .map(
        (tree: any) => `#### ${tree.category}
${(tree.components || [])
  .map((c: any) => `- **${c.name}** (${c.role}): ${c.directive}`)
  .join('\n')}`
      )
      .join('\n\n');
  } else {
    wireframeSection += `- **Dashboard:** Overview metrics and operational controls.
- **Resource Inspector:** Detailed inspection and telemetry telemetry view.`;
  }

  // Cost Matrix
  let costSection = `## 4. Infrastructure Cost Matrix & Projections
`;
  const costItems = spec?.costMatrix?.items || [];
  const totalStarter = spec?.costMatrix?.totalEstimatedStarterCost ?? 0;

  if (Array.isArray(costItems) && costItems.length > 0) {
    costSection += `| Service | Tier / Plan | Monthly Cost (USD) | Scaling Threshold |
| :--- | :--- | :--- | :--- |
${costItems
  .map(
    (item: any) =>
      `| **${item.serviceName}** | \`${item.tier}\` | $${Number(item.estimatedMonthlyCostUsd || 0).toFixed(2)} | ${
        item.scalingThreshold
      } |`
  )
  .join('\n')}
| **TOTAL STARTER FLEET** | **Starter Production** | **$${Number(totalStarter).toFixed(2)}/mo** | **Initial Launch Fleet** |`;
  } else if (spec?.costTiers && Array.isArray(spec.costTiers)) {
    costSection += `| Tier | Capacity | Monthly Total | Operating Margin |
| :--- | :--- | :--- | :--- |
${spec.costTiers
  .map((ct: any) => `| **${ct.name}** | ${ct.users} | \`${ct.monthlyTotal}\` | ${ct.margin} |`)
  .join('\n')}`;
  } else {
    costSection += `Estimated Starter Cloud Budget: ~$20.00 - $45.00 / month on serverless/edge tiers.`;
  }

  return `# ${projectName} — Product Requirement Document (PRD)
> **Executive Product Blueprint & User Experience Architecture**
> Generated by **${credits}**
> Timestamp: \`${generatedAt}\` | Version: \`${version}\`

---

## 1. Product Overview & Problem Statement
- **Product Name:** ${projectName}
- **Core Problem & Solution:** ${concept}
- **Target Audience:** ${audience}

---

${competitorSection}

${uiSection}

${wireframeSection}

---

${costSection}

---
*Generated by Quzar Ship • Piyush Ratan Directives 2.0*
`;
}
