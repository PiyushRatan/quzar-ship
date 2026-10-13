import { NextResponse } from 'next/server';
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

    const { url } = body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'A valid URL string is required in the "url" field' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // Protocol check
    try {
      const testUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`;
      const parsedUrl = new URL(testUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { success: false, error: 'Only HTTP and HTTPS URLs are supported' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed URL provided' },
        { status: 400 }
      );
    }

    const intelligence = await crawlAndAnalyzeCompetitor(trimmedUrl);

    return NextResponse.json(
      {
        success: true,
        intelligence,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/research] Error crawling competitor:', error);

    const errorMessage = error?.message || 'Failed to analyze competitor';
    const isSecurityOrValidationError =
      errorMessage.toLowerCase().includes('blocked') ||
      errorMessage.toLowerCase().includes('private') ||
      errorMessage.toLowerCase().includes('ssrf') ||
      errorMessage.toLowerCase().includes('invalid url');

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: isSecurityOrValidationError ? 400 : 500 }
    );
  }
}
