import { GoogleGenAI } from '@google/genai';
import {
  ProjectIntake,
  CompetitorIntelligence,
  FullMvpSpec,
  FullMvpSpecSchema
} from './types';
import { buildSystemInstruction, buildUserPrompt } from './prompt';
import { generateMockSpec } from './mockSpec';

/**
 * Checks if the Gemini API key is configured in the environment.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

/**
 * Normalizes and guarantees schema invariants before strict Zod validation.
 */
function sanitizeAndNormalizeSpec(
  raw: any,
  intake: ProjectIntake,
  competitorIntelligence?: CompetitorIntelligence | null
): any {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Raw response is not a valid JSON object');
  }

  // Ensure top-level envelope fields
  raw.id = raw.id || `spec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  raw.projectName = raw.projectName || intake.projectName;
  raw.intake = raw.intake || intake;
  raw.generatedAt = raw.generatedAt || new Date().toISOString();
  raw.version = raw.version || '1.0.0';
  raw.credits = 'Built with Quzar Ship by Piyush Ratan';

  // Ensure Cost Matrix total calculation is valid
  if (raw.costMatrix && Array.isArray(raw.costMatrix.items)) {
    if (typeof raw.costMatrix.totalEstimatedStarterCost !== 'number') {
      raw.costMatrix.totalEstimatedStarterCost = raw.costMatrix.items.reduce(
        (sum: number, item: any) => sum + (Number(item?.estimatedMonthlyCostUsd) || 0),
        0
      );
    }
  }

  // Normalize Sprint Roadmap to guarantee exactly 14 days if model drifted
  if (raw.sprintRoadmap && Array.isArray(raw.sprintRoadmap.days)) {
    const rawDays = raw.sprintRoadmap.days;
    if (rawDays.length !== 14) {
      console.warn(
        `[Quzar Ship Generator] Model returned ${rawDays.length} sprint days instead of 14. Normalizing to 14-day standard.`
      );
      const mockFallback = generateMockSpec(intake, competitorIntelligence);
      const normalizedDays = [];
      for (let i = 1; i <= 14; i++) {
        const found = rawDays.find((d: any) => d?.dayNumber === i) || rawDays[i - 1];
        if (found) {
          normalizedDays.push({
            dayNumber: i,
            title: found.title || mockFallback.sprintRoadmap.days[i - 1].title,
            phase: found.phase || mockFallback.sprintRoadmap.days[i - 1].phase,
            deliverables: Array.isArray(found.deliverables) && found.deliverables.length > 0
              ? found.deliverables
              : mockFallback.sprintRoadmap.days[i - 1].deliverables,
            risks: Array.isArray(found.risks) && found.risks.length > 0
              ? found.risks
              : mockFallback.sprintRoadmap.days[i - 1].risks
          });
        } else {
          normalizedDays.push(mockFallback.sprintRoadmap.days[i - 1]);
        }
      }
      raw.sprintRoadmap.days = normalizedDays;
    }
  }

  return raw;
}

/**
 * Primary specification generation engine.
 *
 * Orchestration:
 * 1. Checks if GEMINI_API_KEY is present in the environment.
 * 2. If present, calls Gemini 2.5 with JSON schema enforcement and principal architect prompt.
 * 3. Injects competitor crawl intelligence when provided.
 * 4. Parses and validates the response through FullMvpSpecSchema.
 * 5. If key is missing, API fails, or rate-limited, gracefully falls back to the deterministic
 *    high-fidelity mock generator with full fidelity so development and user testing never break.
 */
export async function generateMvpSpec(
  intake: ProjectIntake,
  competitorIntelligence?: any
): Promise<FullMvpSpec> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.info(
      '[Quzar Ship Engine] GEMINI_API_KEY is not defined. Using high-fidelity local architect fallback engine.'
    );
    return generateMockSpec(intake, competitorIntelligence);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const systemInstruction = buildSystemInstruction();
    const prompt = buildUserPrompt(intake, competitorIntelligence);

    console.info(`[Quzar Ship Engine] Querying Gemini model: ${modelName} for "${intake.projectName}"...`);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const rawText = response.text;
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Gemini API returned an empty response string');
    }

    let cleanedJson = rawText.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanedJson);
    const normalized = sanitizeAndNormalizeSpec(parsed, intake, competitorIntelligence);
    const validatedSpec = FullMvpSpecSchema.parse(normalized);

    console.info(
      `[Quzar Ship Engine] Successfully generated and verified AI MVP specification for "${intake.projectName}".`
    );
    return validatedSpec;
  } catch (error: any) {
    console.error(
      `[Quzar Ship Engine] Gemini generation encountered an error: ${error?.message || error}. Falling back to high-fidelity mock spec.`,
      error
    );
    return generateMockSpec(intake, competitorIntelligence);
  }
}
