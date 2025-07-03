import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting storage (in production, use Redis)
const auditRateLimitMap = new Map();

function auditRateLimit(identifier: string, limit: number = 20, window: number = 60000): boolean {
  const now = Date.now();
  const requests = auditRateLimitMap.get(identifier) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter((time: number) => now - time < window);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  auditRateLimitMap.set(identifier, validRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!auditRateLimit(clientIP, 20, 60000)) { // 20 audit events per minute
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      event_type, 
      user_id, 
      session_id, 
      ip_address, 
      user_agent, 
      details, 
      timestamp 
    } = body;

    // Input validation
    if (!event_type || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate event_type
    const validEventTypes = ['logout', 'login', 'session_timeout', 'security_logout'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Create audit log entry
    const auditData = {
      event_type,
      user_id: user_id || null,
      session_id: session_id || null,
      ip_address: ip_address || clientIP,
      user_agent: user_agent || request.headers.get('user-agent') || null,
      details: details || {},
      timestamp: new Date(timestamp).toISOString(),
      created_at: new Date().toISOString()
    };

    // In production, you might want to use a dedicated audit table
    // For now, we'll log to console and potentially store in a simple table
    console.log('Security Event:', JSON.stringify(auditData, null, 2));

    // You could store this in a security_audit_logs table:
    /*
    const { error } = await supabase
      .from('security_audit_logs')
      .insert([auditData]);

    if (error) {
      throw error;
    }
    */

    // Store in application logs or external service
    await storeSecurityEvent(auditData);

    return NextResponse.json({ 
      success: true,
      logged_at: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Error logging security event:', error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { success: false, error: 'Failed to log security event' },
      { status: 500 }
    );
  }
}

// Store security event (implement based on your audit requirements)
async function storeSecurityEvent(auditData: any): Promise<void> {
  try {
    // Option 1: Store in Supabase (if you create a security_audit_logs table)
    // const { error } = await supabase
    //   .from('security_audit_logs')
    //   .insert([auditData]);
    
    // Option 2: Send to external audit service
    // await fetch('https://your-audit-service.com/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(auditData)
    // });
    
    // Option 3: Write to file (for development)
    console.log('AUDIT_LOG:', JSON.stringify(auditData));
    
  } catch (error) {
    console.error('Failed to store security event:', error);
    // Don't throw - audit failure shouldn't break logout
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 
