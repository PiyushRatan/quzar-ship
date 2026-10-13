import { NextResponse } from 'next/server';
import { ProjectIntakeSchema, generateMvpSpec, type ProjectIntake } from '@/lib/generator';
import { crawlAndAnalyzeCompetitor } from '@/lib/research';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    // Validate intake payload
    const parseResult = ProjectIntakeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid project intake schema',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const intake: ProjectIntake = parseResult.data;

    // Optional competitor crawling & intelligence gathering
    let competitorIntelligence = null;
    const rawCompetitorUrl = intake.competitorUrl?.trim();

    if (rawCompetitorUrl && rawCompetitorUrl.length > 0) {
      try {
        console.info(`[API /api/generate] Initiating automated competitor research for: ${rawCompetitorUrl}`);
        competitorIntelligence = await crawlAndAnalyzeCompetitor(rawCompetitorUrl);
      } catch (researchErr: any) {
        console.warn(
          `[API /api/generate] Competitor research was non-blocking and encountered an issue: ${researchErr?.message || researchErr}. Proceeding with spec generation.`
        );
      }
    }

    // Generate comprehensive MVP specification
    const spec = await generateMvpSpec(intake, competitorIntelligence);

    return NextResponse.json(
      {
        success: true,
        spec,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/generate] Specification generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate MVP specification',
      },
      { status: 500 }
    );
  }
}
