import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('Processing uploaded PDF:', file.name, 'size:', file.size, 'bytes');

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Import pdf-parse dynamically (avoids edge runtime issues)
    const pdfParse = (await import('pdf-parse')).default;

    const parsed = await pdfParse(fileBuffer);

    const cleanedText = parsed.text
      .replace(/\s{2,}/g, ' ')
      .replace(/([a-z])\.([A-Z])/g, '$1. $2')
      .replace(/[^\x20-\x7E\r\n]/g, '')
      .replace(/\n{2,}/g, '\n')
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      return NextResponse.json(
        { error: 'Extracted text is too short or unreadable.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      textLength: cleanedText.length,
      preview: cleanedText.slice(0, 500),
      fullText: cleanedText,
      source: 'File Upload',
      extractedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from PDF',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PDF Text Extraction API is working',
    endpoint: '/api/extract-pdf-text',
    method: 'POST',
    expectedInput: 'FormData with file field containing PDF',
    timestamp: new Date().toISOString(),
  });
}

