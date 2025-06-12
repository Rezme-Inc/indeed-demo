// Email utility functions using SendGrid
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

import { supabase } from '@/lib/supabase';

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
export const sendOfferLetterEmail = async (offerData: any, candidateEmail: string) => {
  const { hrAdminName, company, date, applicant, position, employer, ...rest } = offerData;

  const highlightStyle = 'font-weight: bold;';
  const bodyFont = 'font-family: Times New Roman, Times, serif;';

  const emailHtml = `
    <div style="${bodyFont} max-width: 800px; margin: 0 auto; padding: 32px 32px 24px 32px; color: #222; background: #fff;">
      <div style="border-top: 3px solid #222; margin-bottom: 24px;"></div>
      <div style="text-align: center; font-weight: bold; text-decoration: underline; font-size: 18px; margin-bottom: 24px; letter-spacing: 0.5px;"> CONDITIONAL JOB OFFER LETTER</div>
      <div style="margin-bottom: 16px; font-weight: bold;"><span style="${highlightStyle}">${date || '[DATE]'}</span></div>
      <div style="margin-bottom: 16px; font-weight: bold;">
        RE: <span style="text-decoration: underline;">Conditional Offer of Employment & Notice of Conviction Background Check</span>
      </div>
      <div style="margin-bottom: 16px;">Dear <span style="${highlightStyle}">${applicant || '[APPLICANT NAME]'}</span>:</div>
      <div style="margin-bottom: 16px;">
        We are writing to make you a conditional offer of employment for the position of <span style="${highlightStyle}">${position || '[INSERT POSITION]'}</span>. Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
      </div>
      <div style="margin-bottom: 16px;">
        After reviewing your conviction history report, we will either:<br>
        a. Notify you that this conditional job offer has become final; or<br>
        b. Notify you in writing that we intend to revoke (take back) this job offer because of your conviction history.
      </div>
      <div style="margin-bottom: 16px;">
        As required by California state and San Diego County law, we will <b>NOT</b> consider any of the following information:
        <ul style="margin: 8px 0 8px 24px;">
          <li>Arrest not followed by conviction;</li>
          <li>Referral to or participation in a pretrial or posttrial diversion program; or</li>
          <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
        </ul>
      </div>
      <div style="margin-bottom: 16px;">
        As required by the California Fair Chance Act and the San Diego County Fair Chance Ordinance, we will consider whether your conviction history is directly related to the duties of the job we have offered you. We will consider all of the following:
        <ul style="margin: 8px 0 8px 24px;">
          <li>The nature and seriousness of the offense</li>
          <li>The amount of time since the offense</li>
          <li>The nature of the job</li>
        </ul>
      </div>
      <div style="margin-bottom: 16px;">
        <b>We will notify you in writing if we plan to revoke (take back) this job offer after reviewing your conviction history. That decision will be preliminary, and you will have an opportunity to respond before it becomes final.</b> We will identify conviction(s) that concern us, give you a copy of the background check report, as well as a copy of the written individualized assessment of the report and the relevance of your history to the position. We will then hold the position open, except in emergent circumstances to allow you at least 5 business days to provide information about your rehabilitation or mitigating circumstances and/or provide notice that you will provide information showing the conviction history report is inaccurate. Should you provide notice that you will provide information showing the conviction history report is inaccurate, you will have an additional 5 business days to provide that evidence. Should you provide additional information, we will then conduct a written individualized reassessment and decide whether to finalize or take back this conditional job offer. We will notify you of that decision in writing.
      </div>
      <div style="margin-bottom: 16px;">
        Sincerely,<br>
        <span style="${highlightStyle}">${employer || '[EMPLOYER]'}</span>
      </div>
      <div style="margin-bottom: 16px; font-size: 14px;">
        Enclosure: Authorization for Background Check (as required by the U.S. Fair Credit Reporting Act and California Investigative Consumer Reporting Agencies Act)
      </div>
      <div style="border-bottom: 3px solid #222; margin-top: 32px;"></div>
      <div style="margin-top: 16px; font-size: 12px; color: #666;">
        <p>This offer letter was sent by ${hrAdminName} on behalf of ${company}.</p>
        <p>Sent on: ${new Date(rest.sentDate).toLocaleDateString()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidateEmail,
    subject: `Conditional Job Offer Letter - ${position || 'Position'}`,
    html: emailHtml,
  });
};

export const sendAssessmentEmail = async (assessmentData: any, candidateEmail: string) => {
  const { employer, applicant, position, offerDate, assessmentDate, reportDate, performedBy, duties = [], conduct, howLongAgo, activities = [], rescindReason } = assessmentData;
  const emailHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; background: #fff;">
      <h2 style="text-align: center; font-size: 22px; font-weight: bold; text-decoration: underline; margin-bottom: 32px;">
        Criminal History Individual Assessment Form
      </h2>
      <div style="font-weight: bold; margin-bottom: 12px; text-decoration: underline;">INFORMATION</div>
      <div style="margin-bottom: 6px;">Employer Name: <span style="font-weight: normal;">${employer || ''}</span></div>
      <div style="margin-bottom: 6px;">Applicant Name: <span style="font-weight: normal;">${applicant || ''}</span></div>
      <div style="margin-bottom: 6px;">Position Applied For: <span style="font-weight: normal;">${position || ''}</span></div>
      <div style="margin-bottom: 6px;">Date of Conditional Offer: <span style="font-weight: normal;">${offerDate || ''}</span></div>
      <div style="margin-bottom: 6px;">Date of Assessment: <span style="font-weight: normal;">${assessmentDate || ''}</span></div>
      <div style="margin-bottom: 6px;">Date of Criminal History Report: <span style="font-weight: normal;">${reportDate || ''}</span></div>
      <div style="margin-bottom: 16px;">Assessment Performed by: <span style="font-weight: normal;">${performedBy || ''}</span></div>
      <div style="font-weight: bold; margin-bottom: 12px; text-decoration: underline;">ASSESSMENT</div>
      <div style="margin-bottom: 12px;">1. The specific duties and responsibilities of the job are:
        <ol type="a" style="margin-left: 24px;">
          ${(duties || []).map((d: string) => d ? `<li>${d}</li>` : '').join('')}
        </ol>
      </div>
      <div style="margin-bottom: 12px;">2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question (conduct that can't be considered includes infractions or arrests that didn't lead to a conviction, convictions that have been sealed or expunged, adjudications in the juvenile justice system, or participation in a pre- or post-trial diversion program):<br />
        <span style="font-weight: normal;">${conduct || ''}</span>
      </div>
      <div style="margin-bottom: 12px;">3. How long ago did the criminal activity occur:<br />
        <span style="font-weight: normal;">${howLongAgo || ''}</span>
      </div>
      <div style="margin-bottom: 12px;">4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:
        <ol type="a" style="margin-left: 24px;">
          ${(activities || []).map((a: string) => a ? `<li>${a}</li>` : '').join('')}
        </ol>
      </div>
      <div style="margin-top: 24px; font-weight: bold;">
        BASED ON THE FACTORS ABOVE, WE ARE CONSIDERING RESCINDING OUR OFFER OF EMPLOYMENT BECAUSE
        <span style="font-weight: normal; font-style: italic;">${rescindReason || ''}</span>
      </div>
    </div>
  `;
  return sendEmail({
    to: candidateEmail,
    subject: `Individualized Assessment Form - ${position || ''}`,
    html: emailHtml,
  });
};

export const getCandidateEmail = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching candidate email:', error);
    return null;
  }
  return data?.email || null;
};

export const sendRevocationEmail = async (revocationData: any, candidateEmail: string) => {
  const {
    date,
    applicant,
    position,
    convictions = [],
    numBusinessDays,
    contactName,
    companyName,
    company,
    address,
    phone,
    seriousReason,
    timeSinceConduct,
    timeSinceSentence,
    jobDuties,
    fitnessReason,
  } = revocationData;

  const emailHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; background: #fff;">
      <h2 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 24px;">
         Employer Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History
      </h2>
      <div style="font-weight: bold; color: #000; margin-bottom: 8px;"><span style="font-weight: bold;">${date || '[DATE]'}</span></div>
      <div style="font-weight: bold; margin-bottom: 8px;">Re: Preliminary Decision to Revoke Job Offer Because of Conviction History</div>
      <div style="margin-bottom: 8px;">Dear <span style="font-weight: bold;">${applicant || '[APPLICANT NAME]'}</span>:</div>
      <div style="margin-bottom: 8px;">After reviewing the results of your conviction history background check, we have made a preliminary (non-final) decision to revoke (take back) our previous job offer for the position of <span style="font-weight: bold;">${position || '[INSERT POSITION]'}</span> because of the following conviction(s):
        <ul style="margin-left: 24px;">
          ${(convictions || []).map((c: string) => c ? `<li style='font-weight: bold;'>${c}</li>` : '').join('')}
        </ul>
        <span style="font-style: italic;">A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.</span>
      </div>
      <div style="margin-bottom: 8px;">As prohibited by Local and California law, we have NOT considered any of the following:
        <ul style="margin-left: 24px;">
          <li>Arrest(s) not followed by conviction;</li>
          <li>Participation in a pretrial or posttrial diversion program; or</li>
          <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
        </ul>
      </div>
      <div style="margin-bottom: 8px; font-weight: bold; text-decoration: underline;">Your Right to Respond:</div>
      <div style="margin-bottom: 8px;"><span style="font-style: italic;">The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final.</span> Within <span style=" font-weight: bold;">${numBusinessDays || '[NUMBER]'}</span> business days* from when you first receive this notice, you may send us:
        <ol type="a" style="margin-left: 24px;">
          <li>Evidence of rehabilitation or mitigating circumstances</li>
          <li>Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.</li>
        </ol>
      </div>
      <div style="margin-bottom: 8px;">Please send any additional information you would like us to consider to: <span style="font-weight: bold;">${contactName || '[INSERT NAME]'}, ${company || '[COMPANY]'}, ${address || '[ADDRESS]'}, ${phone || '[PHONE]'}</span></div>
      <div style="margin-bottom: 8px;">Here are some examples of information you may send us:
        <ul style="margin-left: 24px;">
          <li>Evidence that you were not convicted of one or more of the offenses we listed above or that the conviction record is inaccurate (such as the number of convictions listed);</li>
          <li>Facts or circumstances surrounding the offense or conduct, showing that the conduct was less serious than the conviction seems;</li>
          <li>The time that has passed since the conduct that led to your conviction(s) or since your release from incarceration;</li>
          <li>The length and consistency of employment history or community involvement (such as volunteer activities) before and after the offense(s);</li>
          <li>Employment or character references from people who know you, such as letters from teachers, counselors, supervisors, clergy, and probation or parole officers;</li>
          <li>Evidence that you attended school, job training, or counseling;</li>
          <li>Evidence that you have performed the same type of work since your conviction;</li>
          <li>Whether you are bonded under a federal, state, or local bonding program; and</li>
          <li>Any other evidence of your rehabilitation efforts, such as (i) evidence showing how much time has passed since release from incarceration without subsequent conviction, (ii) evidence showing your compliance with the terms and conditions of probation or parole, or (iii) evidence showing your present fitness for the job.</li>
        </ul>
      </div>
      <div style="margin-bottom: 8px;">We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. <span style="font-style: italic;">We will notify you in writing if we make a final decision to revoke the job offer.</span></div>
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px;">Our Individualized Assessment:</div>
      <div style="margin-bottom: 8px;">We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
        <ol style="margin-left: 24px;">
          <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <span style=" font-weight: bold;">${seriousReason || '[DESCRIBE WHY CONSIDERED SERIOUS]'}</span></li>
          <li>How long ago the conduct occurred that led to your conviction, which was: <span style=" font-weight: bold;">${timeSinceConduct || '[INSERT AMOUNT OF TIME PASSED]'}</span> and how long ago you completed your sentence, which was: <span style=" font-weight: bold;">${timeSinceSentence || '[INSERT AMOUNT OF TIME PASSED]'}</span>.</li>
          <li>The specific duties and responsibilities of the position of <span style=" font-weight: bold;">${position || '[INSERT POSITION]'}</span>, which are: <span style=" font-weight: bold;">${jobDuties || '[LIST JOB DUTIES]'}</span></li>
        </ol>
        We believe your conviction record lessens your fitness/ability to perform the job duties because: <span style=" font-weight: bold;">${fitnessReason || '[OUTLINE REASONING FOR REVOKING JOB OFFER BASED ON RELEVANCE OF CONVICTION HISTORY TO JOB DUTIES]'}</span>
      </div>
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px;">Your Right to File a Complaint:</div>
      <div style="margin-bottom: 8px;">If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
        <ul style="margin-left: 24px;">
          <li>California CRD:
            <ul>
              <li>File a complaint online at the following link: <a href="https://ccrs.calcivilrights.ca.gov/s/" target="_blank">ccrs.calcivilrights.ca.gov/s/</a></li>
              <li>Download an intake form at the following link: <a href="https://calcivilrights.ca.gov/complaintprocess/filebymail/" target="_blank">calcivilrights.ca.gov/complaintprocess/filebymail/</a> and email it to <a href="mailto:contact.center@calcivilrights.ca.gov">contact.center@calcivilrights.ca.gov</a> or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
              <li>Visit a CRD office. Click the following link for office locations: <a href="https://calcivilrights.ca.gov/locations/" target="_blank">calcivilrights.ca.gov/locations/</a></li>
              <li>Call California CRD at (800) 884-1684</li>
            </ul>
          </li>
          <li>San Diego County OLSE:
            <ul>
              <li>File a complaint online at the following link: <a href="https://www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html" target="_blank">sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</a></li>
              <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
              <li>Call San Diego County OLSE at 619-531-5129</li>
            </ul>
          </li>
        </ul>
      </div>
      <div style="margin-bottom: 8px;">Sincerely,<br />
        <span style=" font-weight: bold;">${contactName || '[Employer contact person name]'}</span><br />
        <span style=" font-weight: bold;">${company || '[Employer company name]'}</span><br />
        <span style=" font-weight: bold;">${address || '[Employer address]'}</span><br />
        <span style=" font-weight: bold;">${phone || '[Employer contact phone number]'}</span>
      </div>
      <div style="margin-bottom: 8px;">Enclosure: Copy of conviction history report</div>
      <div style="margin-bottom: 8px; font-size: 12px;">* The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information</div>
    </div>
  `;
  return sendEmail({
    to: candidateEmail,
    subject: `Preliminary Decision to Revoke Job Offer - ${position || ''}`,
    html: emailHtml,
  });
};

export const sendReassessmentEmail = async (reassessmentData: any, candidateEmail: string) => {
  const {
    employer = '',
    applicant = '',
    position = '',
    offerDate = '',
    reassessmentDate = '',
    reportDate = '',
    performedBy = '',
    errorYesNo = '',
    error = '',
    evidenceA = '',
    evidenceB = '',
    evidenceC = '',
    evidenceD = '',
    rescindReason = '',
  } = reassessmentData;

  const emailHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; background: #fff;">
      <h2 style="text-align: center; font-size: 22px; font-weight: bold; text-decoration: underline; margin-bottom: 32px;">
        Criminal History Individualized Reassessment Form
      </h2>
      <div style="font-weight: bold; margin-bottom: 12px; text-decoration: underline;">INFORMATION</div>
      <div style="margin-bottom: 6px;">Employer Name: <span style="font-weight: normal;">${employer}</span></div>
      <div style="margin-bottom: 6px;">Applicant Name: <span style="font-weight: normal;">${applicant}</span></div>
      <div style="margin-bottom: 6px;">Position Applied For: <span style="font-weight: normal;">${position}</span></div>
      <div style="margin-bottom: 6px;">Date of Conditional Offer: <span style="font-weight: normal;">${offerDate}</span></div>
      <div style="margin-bottom: 6px;">Date of Reassessment: <span style="font-weight: normal;">${reassessmentDate}</span></div>
      <div style="margin-bottom: 6px;">Date of Criminal History Report: <span style="font-weight: normal;">${reportDate}</span></div>
      <div style="margin-bottom: 16px;">Assessment Performed by: <span style="font-weight: normal;">${performedBy}</span></div>
      <div style="font-weight: bold; margin-bottom: 12px; text-decoration: underline;">REASSESSMENT</div>
      <div style="margin-bottom: 12px;">1. Was there an error in the Criminal History Report? <span style="font-weight: normal;"><input type="checkbox" ${errorYesNo === 'Yes' ? 'checked' : ''} disabled /> Yes <input type="checkbox" ${errorYesNo === 'No' ? 'checked' : ''} disabled /> No</span></div>
      <div style="margin-bottom: 12px;">If yes, describe the error:<br /><span style="font-weight: normal;">${error}</span></div>
      <div style="margin-bottom: 12px;">2. Evidence of rehabilitation and good conduct (this evidence may include, but is not limited to, documents or other information demonstrating that the Applicant attended school, a religious institution, job training, or counseling, or is involved with the community. This evidence can include letters from people who know the Applicant, such as teachers, counselors, supervisors, clergy, and parole or probation officers):
        <ol type="a" style="margin-left: 24px;">
          ${evidenceA ? `<li>${evidenceA}</li>` : ''}
          ${evidenceB ? `<li>${evidenceB}</li>` : ''}
          ${evidenceC ? `<li>${evidenceC}</li>` : ''}
          ${evidenceD ? `<li>${evidenceD}</li>` : ''}
        </ol>
      </div>
      <div style="margin-top: 24px; font-weight: bold;">BASED ON THE FACTORS ABOVE, WE ARE RESCINDING OUR OFFER OF EMPLOYMENT BECAUSE <span style="font-weight: normal; font-style: italic;">${rescindReason}</span></div>
    </div>
  `;
  return sendEmail({
    to: candidateEmail,
    subject: `Individualized Reassessment Form - ${position}`,
    html: emailHtml,
  });
};

export const sendFinalRevocationEmail = async (finalRevocationData: any, candidateEmail: string) => {
  const {
    date = '',
    applicant = '',
    dateOfNotice = '',
    noResponse = false,
    infoSubmitted = false,
    infoSubmittedList = '',
    errorOnReport = '',
    convictions = [],
    seriousReason = '',
    timeSinceConduct = '',
    timeSinceSentence = '',
    position = '',
    jobDuties = [],
    fitnessReason = '',
    reconsideration = '',
    reconsiderationProcedure = '',
    contactName = '',
    companyName = '',
    address = '',
    phone = '',
  } = finalRevocationData;

  const emailHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; background: #fff;">
      <h2 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 24px;">
        Employer Notice of Final Decision to Revoke Job Offer Because of Conviction History
      </h2>
      <div style="font-weight: bold; margin-bottom: 8px;">${date || '[DATE]'}</div>
      <div style="font-weight: bold; margin-bottom: 8px;">Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
      <div style="margin-bottom: 8px;">Dear <span style="font-weight: bold;">${applicant || '[APPLICANT NAME]'}</span>:</div>
      <div style="margin-bottom: 8px;">We are following up about our letter dated <span style="font-weight: bold;">${dateOfNotice || '[DATE OF NOTICE]'}</span> which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
      <div style="margin-bottom: 8px;">(Please check one:)</div>
      <div style="margin-bottom: 8px;">
        <input type="checkbox" ${noResponse ? 'checked' : ''} disabled /> We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.<br />
        <input type="checkbox" ${infoSubmitted ? 'checked' : ''} disabled /> We made a final decision to revoke the job offer after considering the information you submitted, which included: <span style="font-weight: bold;">${infoSubmittedList || '[LIST INFORMATION SUBMITTED]'}</span>
      </div>
      <div style="margin-bottom: 8px;">After reviewing the information you submitted, we have determined that there <input type="checkbox" ${errorOnReport === 'was' ? 'checked' : ''} disabled /> was <input type="checkbox" ${errorOnReport === 'was not' ? 'checked' : ''} disabled /> was not (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):
        <ul style="margin-left: 24px;">
          ${(convictions || []).map((c: string) => c ? `<li style='font-weight: bold;'>${c}</li>` : '').join('')}
        </ul>
      </div>
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px;">Our Individualized Assessment:</div>
      <div style="margin-bottom: 8px;">We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
        <ol style="margin-left: 24px;">
          <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <span style="font-weight: bold;">${seriousReason || '[DESCRIBE WHY CONSIDERED SERIOUS]'}</span></li>
          <li>How long ago the conduct occurred that led to your conviction, which was: <span style="font-weight: bold;">${timeSinceConduct || '[INSERT AMOUNT OF TIME PASSED]'}</span> and how long ago you completed your sentence, which was: <span style="font-weight: bold;">${timeSinceSentence || '[INSERT AMOUNT OF TIME PASSED]'}</span>.</li>
          <li>The specific duties and responsibilities of the position of <span style="font-weight: bold;">${position || '[INSERT POSITION]'}</span>, which are: <span style="font-weight: bold;">${(jobDuties || []).join(', ') || '[LIST JOB DUTIES]'}</span></li>
        </ol>
        We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because: <span style="font-weight: bold;">${fitnessReason || '[OUTLINE REASONING FOR DECISION TO REVOKE JOB OFFER BASED ON RELEVANCE OF CONVICTION HISTORY TO POSITION]'}</span>
      </div>
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px;">Request for Reconsideration:</div>
      <div style="margin-bottom: 8px;">(Please check one:)</div>
      <div style="margin-bottom: 8px;">
        <input type="checkbox" ${reconsideration === 'none' ? 'checked' : ''} disabled /> We do not offer any way to challenge this decision or request reconsideration.<br />
        <input type="checkbox" ${reconsideration === 'procedure' ? 'checked' : ''} disabled /> If you would like to challenge this decision or request reconsideration, you may: <span style="font-weight: bold;">${reconsiderationProcedure || '[DESCRIBE INTERNAL PROCEDURE]'}</span>
      </div>
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px;">Your Right to File a Complaint:</div>
      <div style="margin-bottom: 8px;">If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
        <ul style="margin-left: 24px;">
          <li>California CRD:
            <ul>
              <li>File a complaint online at the following link: <a href="https://ccrs.calcivilrights.ca.gov/s/" target="_blank">ccrs.calcivilrights.ca.gov/s/</a></li>
              <li>Download an intake form at the following link: <a href="https://calcivilrights.ca.gov/complaintprocess/filebymail/" target="_blank">calcivilrights.ca.gov/complaintprocess/filebymail/</a> and email it to <a href="mailto:contact.center@calcivilrights.ca.gov">contact.center@calcivilrights.ca.gov</a> or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
              <li>Visit a CRD office. Click the following link for office locations: <a href="https://calcivilrights.ca.gov/locations/" target="_blank">calcivilrights.ca.gov/locations/</a></li>
              <li>Call California CRD at (800) 884-1684</li>
            </ul>
          </li>
          <li>San Diego County OLSE:
            <ul>
              <li>File a complaint online at the following link: <a href="https://www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html" target="_blank">sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</a></li>
              <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
              <li>Call San Diego County OLSE at 619-531-5129</li>
            </ul>
          </li>
        </ul>
      </div>
      <div style="margin-bottom: 8px;">For more information, visit www.sandiegocounty.gov/content/sdc/OLSE</div>
      <div style="margin-bottom: 8px;">Sincerely,<br />
        <span style="font-weight: bold;">${contactName || '[Employer contact person name]'}</span><br />
        <span style="font-weight: bold;">${companyName || '[Employer company name]'}</span><br />
        <span style="font-weight: bold;">${address || '[Employer address]'}</span><br />
        <span style="font-weight: bold;">${phone || '[Employer contact phone number]'}</span>
      </div>
    </div>
  `;
  return sendEmail({
    to: candidateEmail,
    subject: `Final Decision to Revoke Job Offer - ${position}`,
    html: emailHtml,
  });
};

export const sendInvitationEmail = async (invitationData: any, candidateEmail: string) => {
  const { candidateName, customMessage, hrAdminName, company } = invitationData;

  // Replace placeholders in the custom message
  const processedMessage = customMessage
    .replace(/\[Candidate Name\]/g, candidateName || '[Candidate Name]')
    .replace(/\[CODE\]/g, invitationData.invitationCode || '[CODE]');

  // Convert line breaks to HTML and preserve formatting
  const htmlMessage = processedMessage
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .map((line: string) => `<p style="margin-bottom: 12px; color: #333;">${line}</p>`)
    .join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #333; background: #fff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #333; font-size: 24px; font-weight: bold; margin-bottom: 8px;">Restorative Record Invitation</h1>
        <p style="color: #666; font-size: 16px; margin: 0;">You're invited to create your Restorative Record</p>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        ${htmlMessage}
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          This invitation was sent by ${hrAdminName || 'HR Team'} from ${company || 'the company'}.
        </p>
        <p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">
          Sent on: ${new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidateEmail,
    subject: `Invitation to Create Your Restorative Record - ${company || 'Company'}`,
    html: emailHtml,
  });
};

export const sendReinvitationEmail = async (reinvitationData: any, candidateEmail: string) => {
  const { candidateName, originalMessage, hrAdminName, company, invitationCode, originalDateSent } = reinvitationData;

  // Create a reinvitation message that references the original invitation
  const reinviteMessage = `Dear ${candidateName || '[Candidate Name]'},

We hope this message finds you well. This is a follow-up to our previous invitation sent on ${originalDateSent ? new Date(originalDateSent).toLocaleDateString() : '[Previous Date]'} regarding creating your Restorative Record as part of our hiring process.

We understand that you may have been busy or may not have received our initial invitation. We wanted to reach out again to ensure you have the opportunity to participate in this important step of our hiring process.

As mentioned in our previous communication, your Restorative Record is an opportunity to share your story, highlight your growth, and demonstrate the positive changes you've made. This process is designed to ensure fair consideration of all candidates while meeting our compliance requirements.

To get started, please:
1. Visit our platform using your invitation code: ${invitationCode || '[CODE]'}
2. Create your account and complete your Restorative Record
3. Share your record with us when you're ready

If you have any questions about this process or need assistance, please don't hesitate to reach out to me directly. We're here to support you through this process.

We look forward to hearing from you soon.

Best regards,
${hrAdminName || 'HR Team'}
${company || 'Company'}

Your invitation code: ${invitationCode || '[CODE]'}`;

  // Convert line breaks to HTML and preserve formatting
  const htmlMessage = reinviteMessage
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .map((line: string) => `<p style="margin-bottom: 12px; color: #333;">${line}</p>`)
    .join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #333; background: #fff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h1 style="color: #856404; font-size: 24px; font-weight: bold; margin-bottom: 8px;">Restorative Record Invitation - Reminder</h1>
          <p style="color: #856404; font-size: 16px; margin: 0;">Follow-up invitation to create your Restorative Record</p>
        </div>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        ${htmlMessage}
      </div>
      
      <div style="background: #e7f3ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #0066cc; font-size: 16px; font-weight: bold; margin-bottom: 8px;">Need Help?</h3>
        <p style="color: #0066cc; font-size: 14px; margin: 0;">
          If you're experiencing any technical difficulties or have questions about the process, please contact us directly. We're committed to ensuring all candidates have equal opportunity to participate.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          This reminder was sent by ${hrAdminName || 'HR Team'} from ${company || 'the company'}.
        </p>
        <p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">
          Reminder sent on: ${new Date().toLocaleDateString()}
        </p>
        ${originalDateSent && (
          `<p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">
            Original invitation sent: ${new Date(originalDateSent).toLocaleDateString()}
          </p>`
        )}
      </div>
    </div>
  `;

  return sendEmail({
    to: candidateEmail,
    subject: `Reminder: Invitation to Create Your Restorative Record - ${company || 'Company'}`,
    html: emailHtml,
  });
}; 
