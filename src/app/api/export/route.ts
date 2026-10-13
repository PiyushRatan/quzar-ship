import { NextResponse } from 'next/server';
import { exportSpecFiles, type ExportFormat } from '@/lib/export';

const VALID_FORMATS = new Set<string>(['markdown', 'architecture', 'prisma', 'prd', 'json', 'all']);

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { spec, format = 'all' } = body || {};

    if (!spec || typeof spec !== 'object') {
      return NextResponse.json(
        { success: false, error: 'A valid "spec" object is required in the request body' },
        { status: 400 }
      );
    }

    const normalizedFormat = String(format).toLowerCase().trim() as ExportFormat;
    if (!VALID_FORMATS.has(normalizedFormat)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported format "${format}". Supported formats: markdown, prisma, prd, json, all`,
        },
        { status: 400 }
      );
    }

    const exportResult = exportSpecFiles(spec, normalizedFormat);

    // If client requested JSON metadata envelope or files bundle explicitly
    const acceptHeader = req.headers.get('accept') || '';
    const url = new URL(req.url);
    const preferJson = url.searchParams.get('json') === 'true' || acceptHeader.includes('application/json') && normalizedFormat === 'all' && !acceptHeader.includes('text/');

    if (preferJson) {
      return NextResponse.json({
        success: true,
        filename: exportResult.filename,
        format: normalizedFormat,
        content: exportResult.content,
        files: exportResult.files,
      });
    }

    // Default: Return downloadable attachment stream with headers
    return new Response(exportResult.content, {
      status: 200,
      headers: {
        'Content-Type': exportResult.contentType,
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
        'Cache-Control': 'no-store',
        'X-Export-Format': normalizedFormat,
      },
    });
  } catch (error: any) {
    console.error('[API /api/export] Export failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate specification export',
      },
      { status: 500 }
    );
  }
}
