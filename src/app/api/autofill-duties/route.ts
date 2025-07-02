import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const PDF_ANALYSIS_TEMPLATE = `You are an expert HR assistant helping to extract job information from a job description.

Given the following text from a job description, extract and return structured information about:
1. The position/job title
2. The specific duties and responsibilities listed

--- Begin Job Description Text ---
{pdfText}
--- End Job Description Text ---

Extract the information exactly as written in the job description. If duties are listed as bullet points or numbered items, extract each one as a separate responsibility.`;

/**
 * This handler extracts position and duties from PDF content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfText, context } = body;

    // Determine which template and schema to use
    if (!pdfText) {
      return NextResponse.json(
        { error: 'PDF text is required' },
        { status: 400 }
      );
    }

    const model = new ChatOpenAI({
      temperature: 0.3,
      model: "gpt-4o-mini",
    });

    // PDF Analysis Mode
    const prompt = PromptTemplate.fromTemplate(PDF_ANALYSIS_TEMPLATE);
    
    const schema = z
      .object({
        position_title: z.string().describe("The job title/position extracted from the job description"),
        job_responsibilities: z
          .array(z.string())
          .describe("Array of specific job duties/responsibilities extracted from the job description"),
        confidence: z
          .enum(["high", "medium", "low"])
          .describe("Confidence level in the extraction accuracy"),
        source_type: z.literal("pdf_extraction").describe("Indicates this came from PDF analysis")
      })
      .describe("Structured job information extracted from PDF");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "pdf_job_extractor",
    });

    const chain = prompt.pipe(functionCallingModel);
    
    const result = await chain.invoke({
      pdfText: pdfText.slice(0, 8000), // Limit text length for API efficiency
    });

    return NextResponse.json({
      success: true,
      data: {
        position_title: result.position_title,
        suggested_duties: result.job_responsibilities,
        source: 'PDF Analysis using LangChain + OpenAI',
        confidence: result.confidence,
        source_type: result.source_type,
        timestamp: new Date().toISOString()
      }
    });

  } catch (e: any) {
    console.error('Error in autofill-duties API:', e);
    return NextResponse.json(
      { 
        error: 'Failed to process job duties request',
        details: e.message 
      }, 
      { status: e.status ?? 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Autofill Job Duties API is working',
    modes: ['PDF content analysis'],
    timestamp: new Date().toISOString(),
    path: '/api/autofill-duties'
  });
} 
