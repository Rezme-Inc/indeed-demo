import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const OFFER_DATE_EXTRACTION_TEMPLATE = `You are an expert HR assistant helping to extract the offer date from a conditional job offer letter.

Given the following text from a conditional job offer letter, find and extract the date when the job offer was issued or sent to the candidate.

Look for phrases like:
- "This offer is dated..."
- "Offer date:"
- "Date of offer:"
- "This letter is dated..."
- "Issued on..."
- "Date: [date]" at the top of the letter
- Any date that appears to be when the offer was made or sent

IMPORTANT: Focus on finding the date the offer was ISSUED/SENT, not other dates like:
- Start dates
- Deadline dates for response
- Background check dates
- Orientation dates

--- Begin Conditional Offer Letter Text ---
{pdfText}
--- End Conditional Offer Letter Text ---

Extract the offer issuance date exactly as it appears in the document. If multiple dates are present, prioritize the one that clearly indicates when the offer was issued or sent to the candidate.`;

/**
 * This handler extracts the offer date from conditional job offer letter content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfText, context } = body;

    if (!pdfText) {
      return NextResponse.json(
        { error: 'PDF text is required' },
        { status: 400 }
      );
    }

    const model = new ChatOpenAI({
      temperature: 0.1, // Lower temperature for more consistent date extraction
      model: "gpt-4o-mini",
    });

    const prompt = PromptTemplate.fromTemplate(OFFER_DATE_EXTRACTION_TEMPLATE);
    
    const schema = z
      .object({
        offer_date: z.string().describe("The date when the job offer was issued/sent to the candidate in YYYY-MM-DD format"),
        original_date_text: z.string().describe("The exact text/phrase from the document where the date was found"),
        confidence: z
          .enum(["high", "medium", "low"])
          .describe("Confidence level in the date extraction accuracy"),
        date_context: z.string().describe("Brief explanation of why this date was identified as the offer date"),
        alternative_dates: z
          .array(z.string())
          .describe("Other dates found in the document that were considered but not selected (empty array if none)"),
        source_type: z.literal("offer_date_extraction").describe("Indicates this came from offer date analysis")
      })
      .describe("Offer date information extracted from conditional job offer letter");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "offer_date_extractor",
    });

    const chain = prompt.pipe(functionCallingModel);
    
    const result = await chain.invoke({
      pdfText: pdfText.slice(0, 8000), // Limit text length for API efficiency
    });

    // Validate the extracted date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let formattedDate = result.offer_date;
    
    if (!dateRegex.test(formattedDate)) {
      // Try to parse and reformat the date
      try {
        const parsedDate = new Date(result.offer_date);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        } else {
          // Fallback to today's date if parsing fails
          formattedDate = new Date().toISOString().split('T')[0];
        }
      } catch (error) {
        formattedDate = new Date().toISOString().split('T')[0];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        offer_date: formattedDate,
        original_date_text: result.original_date_text,
        date_context: result.date_context,
        alternative_dates: result.alternative_dates,
        confidence: result.confidence,
        source_type: result.source_type,
        source: 'Offer Date Analysis using LangChain + OpenAI',
        timestamp: new Date().toISOString()
      }
    });

  } catch (e: any) {
    console.error('Error in autofill-date API:', e);
    return NextResponse.json(
      { 
        error: 'Failed to process offer date extraction request',
        details: e.message 
      }, 
      { status: e.status ?? 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Autofill Offer Date API is working',
    description: 'Extracts offer issuance date from conditional job offer letter text',
    timestamp: new Date().toISOString(),
    path: '/api/autofill-date'
  });
} 
