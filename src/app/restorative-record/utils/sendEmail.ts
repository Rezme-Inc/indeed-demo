// Initialize SendGrid client
const sendgridClient = require('@sendgrid/mail');
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({ to, subject, html, from = process.env.SENDGRID_FROM_EMAIL }: EmailData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html, from }),
    });

    const result = await response.json();
    return { success: result.success, response: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Helper function specifically for offer letters
export const sendOfferLetterEmail = async (offerData: any) => {
  const { candidateEmail, hrAdminName, company, date, applicant, position, employer, ...rest } = offerData;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Conditional Job Offer Letter</h2>
      
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600;">${date || '[DATE]'}</span>
      </div>
      
      <div style="margin-bottom: 8px;">
        RE: Conditional Offer of Employment & Notice of Conviction Background Check
      </div>
      
      <div style="margin-bottom: 8px;">
        Dear <span style="font-weight: 600;">${applicant || '[APPLICANT NAME]'}</span>:
      </div>
      
      <div style="margin-bottom: 8px;">
        We are writing to make you a conditional offer of employment for the position of <span style="font-weight: 600;">${position || '[INSERT POSITION]'}</span>. Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
      </div>
      
      <div style="margin-bottom: 8px;">
        After reviewing your conviction history report, we will either:<br />
        a. Notify you that this conditional job offer has become final; or<br />
        b. Notify you in writing that we intend to revoke (take back) this job offer because of your conviction history.
      </div>
      
      <div style="margin-bottom: 8px;">
        As required by California state and San Diego County law, we will NOT consider any of the following information:<br />
        • Arrest not followed by conviction;<br />
        • Referral to or participation in a pretrial or posttrial diversion program; or<br />
        • Convictions that have been sealed, dismissed, expunged, or pardoned.
      </div>
      
      <div style="margin-bottom: 8px;">
        As required by the California Fair Chance Act and the San Diego County Fair Chance Ordinance, we will consider whether your conviction history is directly related to the duties of the job we have offered you. We will consider all of the following:<br />
        • The nature and seriousness of the offense<br />
        • The amount of time since the offense<br />
        • The nature of the job
      </div>
      
      <div style="margin-bottom: 8px;">
        We will notify you in writing if we plan to revoke (take back) this job offer after reviewing your conviction history. That decision will be preliminary, and you will have an opportunity to respond before it becomes final. We will identify conviction(s) that concern us, give you a copy of the background check report, as well as a copy of the written individualized assessment of the report and the relevance of your history to the position. We will then hold the position open, except in emergent circumstances to allow you at least 5 business days to provide information about your rehabilitation or mitigating circumstances and/or provide notice that you will provide information showing the conviction history report is inaccurate. Should you provide notice that you will provide information showing the conviction history report is inaccurate, you will have an additional 5 business days to provide that evidence. Should you provide additional information, we will then conduct a written individualized reassessment and decide whether to finalize or take back this conditional job offer. We will notify you of that decision in writing.
      </div>
      
      <div style="margin-bottom: 8px;">
        Sincerely,<br />
        <span style="font-weight: 600;">${employer || '[EMPLOYER]'}</span>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This offer letter was sent by ${hrAdminName} on behalf of ${company}.</p>
        <p>Sent on: ${new Date(rest.sentDate).toLocaleDateString()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: 'jodi@rezme.app', // TODO: change to candidate email
    subject: `Conditional Job Offer Letter - ${position || 'Position'}`,
    html: emailHtml,
  });
}; 
