import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PrintPreviewButton from "../../documents/PrintButton";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import { getStep5Suggestions } from "@/utils/assessmentDataAggregator";

interface FinalRevocationModalProps {
  show: boolean;
  onClose: () => void;
  onPreview: () => void;
  onSend: () => void;
  preview: boolean;
  form: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleArrayChange: (field: 'convictions' | 'jobDuties', idx: number, value: string) => void;
  setPreview: (val: boolean) => void;
  setForm: (val: any) => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const FinalRevocationModal: React.FC<FinalRevocationModalProps> = ({
  show,
  onClose,
  onPreview,
  onSend,
  preview,
  form,
  handleFormChange,
  handleArrayChange,
  setPreview,
  setForm,
  candidateProfile,
  hrAdmin,
  candidateId,
}) => {
  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleAutofill = async () => {
    setIsAutofilling(true);
    try {
      console.log('Step5 - Autofill triggered');
      console.log('Step5 - Candidate profile:', candidateProfile);
      console.log('Step5 - HR admin:', hrAdmin);

      if (!candidateProfile || !hrAdmin) {
        console.warn('Step5 - Missing candidateProfile or hrAdmin data');
        return;
      }

      const suggestions = await getStep5Suggestions(candidateId, candidateProfile, hrAdmin);

      console.log('Step5 - Generated suggestions:', suggestions);

      // Apply suggestions to form, but only for empty fields
      const updatedForm = { ...form };

      // Basic information
      if (!updatedForm.date || updatedForm.date.trim() === '') {
        updatedForm.date = suggestions.date;
      }
      if (!updatedForm.applicant || updatedForm.applicant.trim() === '') {
        updatedForm.applicant = suggestions.applicant;
      }
      if (!updatedForm.dateOfNotice || updatedForm.dateOfNotice.trim() === '') {
        updatedForm.dateOfNotice = suggestions.dateOfNotice;
      }
      if (!updatedForm.position || updatedForm.position.trim() === '') {
        updatedForm.position = suggestions.position;
      }

      // Job duties - only fill if current array is empty or has only empty strings
      const currentJobDuties = updatedForm.jobDuties || [];
      const hasJobDuties = currentJobDuties.some((duty: string) => duty && duty.trim() !== '');
      if (!hasJobDuties && suggestions.jobDuties && suggestions.jobDuties.length > 0) {
        updatedForm.jobDuties = suggestions.jobDuties.slice(0, 4); // Limit to 4 duties
      }

      // Assessment reasoning
      if (!updatedForm.timeSinceConduct || updatedForm.timeSinceConduct.trim() === '') {
        updatedForm.timeSinceConduct = suggestions.timeSinceConduct;
      }
      if (!updatedForm.fitnessReason || updatedForm.fitnessReason.trim() === '') {
        updatedForm.fitnessReason = suggestions.fitnessReason;
      }

      // Contact information
      if (!updatedForm.contactName || updatedForm.contactName.trim() === '') {
        updatedForm.contactName = suggestions.contactName;
      }
      if (!updatedForm.companyName || updatedForm.companyName.trim() === '') {
        updatedForm.companyName = suggestions.companyName;
      }
      if (!updatedForm.address || updatedForm.address.trim() === '') {
        updatedForm.address = suggestions.address;
      }
      if (!updatedForm.phone || updatedForm.phone.trim() === '') {
        updatedForm.phone = suggestions.phone;
      }

      console.log('Step5 - Updated form:', updatedForm);
      setForm(updatedForm);
    } catch (error) {
      console.error('Error during autofill:', error);
    } finally {
      setIsAutofilling(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-black flex-1 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Notice of Final Decision to Revoke Job Offer Because of Conviction History
          </h2>
          {!preview && (
            <button
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Sparkles className="h-4 w-4" />
              {isAutofilling ? 'Autofilling...' : 'AI Autofill'}
            </button>
          )}
        </div>
        {!preview ? (
          <form className="space-y-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <SmartSuggestionField
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, date: value }))}
                  suggestionsEnabled={false}
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="Applicant Name"
                  type="text"
                  value={form.applicant}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, applicant: value }))}
                  suggestionsEnabled={false}
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="Date of Notice"
                  type="date"
                  value={form.dateOfNotice}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, dateOfNotice: value }))}
                  suggestionsEnabled={false}
                />
              </div>
            </div>
            <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
            <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Dear {form.applicant || '[APPLICANT NAME]'}:</div>
            <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We are following up about our letter dated {form.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
            <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>(Please check one:)</div>
            <div className="flex flex-col gap-4 mb-8">
              <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="checkbox" name="noResponse" checked={form.noResponse} onChange={handleFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
              </label>
              <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="checkbox" name="infoSubmitted" checked={form.infoSubmitted} onChange={handleFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                We made a final decision to revoke the job offer after considering the information you submitted, which included:
              </label>
              {form.infoSubmitted && (
                <textarea name="infoSubmittedList" value={form.infoSubmittedList} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="List information submitted" style={{ fontFamily: 'Poppins, sans-serif' }} />
              )}
            </div>
            <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>After reviewing the information you submitted, we have determined that there
              <label className="ml-4 font-normal inline-flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="radio" name="errorOnReport" value="was" checked={form.errorOnReport === 'was'} onChange={handleFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} /> was
              </label>
              <label className="ml-4 font-normal inline-flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="radio" name="errorOnReport" value="was not" checked={form.errorOnReport === 'was not'} onChange={handleFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} /> was not
              </label>
              (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
            <div className="flex flex-col gap-2 mb-8">
              {[0, 1, 2].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  value={form.convictions[idx]}
                  onChange={e => handleArrayChange('convictions', idx, e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={`Conviction ${idx + 1}`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              ))}
            </div>
            <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Individualized Assessment:</div>
            <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:</div>
            <ol className="list-decimal ml-8 mb-8 space-y-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <input type="text" name="seriousReason" value={form.seriousReason} onChange={handleFormChange} className="border border-gray-300 rounded-xl px-2 py-1 w-2/3 inline-block focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} /></li>
              <li>How long ago the conduct occurred that led to your conviction, which was: <SmartSuggestionField
                label=""
                type="text"
                value={form.timeSinceConduct}
                onChange={(value) => setForm((prev: any) => ({ ...prev, timeSinceConduct: value }))}
                suggestionsEnabled={false}
              /> and how long ago you completed your sentence, which was: <SmartSuggestionField
                  label=""
                  type="text"
                  value={form.timeSinceSentence}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, timeSinceSentence: value }))}
                  suggestionsEnabled={false}
                />.</li>
              <li>The specific duties and responsibilities of the position of <SmartSuggestionField
                label=""
                type="text"
                value={form.position}
                onChange={(value) => setForm((prev: any) => ({ ...prev, position: value }))}
                placeholder="[INSERT POSITION]"
                suggestionsEnabled={false}
              />, which are:
                <div className="flex flex-col gap-2 mt-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={form.jobDuties[idx]}
                      onChange={e => handleArrayChange('jobDuties', idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={`Job Duty ${String.fromCharCode(97 + idx)}`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                  ))}
                </div>
              </li>
            </ol>
            <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
            <textarea name="fitnessReason" value={form.fitnessReason} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[60px] mb-8 focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Outline reasoning for decision to revoke job offer based on relevance of conviction history to position" style={{ fontFamily: 'Poppins, sans-serif' }} />
            <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Request for Reconsideration:</div>
            <div className="flex flex-col gap-4 mb-8">
              <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="checkbox" name="reconsideration" value="none" checked={form.reconsideration === 'none'} onChange={() => setForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'none' ? '' : 'none' }))} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                We do not offer any way to challenge this decision or request reconsideration.
              </label>
              <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <input type="checkbox" name="reconsideration" value="procedure" checked={form.reconsideration === 'procedure'} onChange={() => setForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'procedure' ? '' : 'procedure' }))} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                If you would like to challenge this decision or request reconsideration, you may:
              </label>
              {form.reconsideration === 'procedure' && (
                <textarea name="reconsiderationProcedure" value={form.reconsiderationProcedure} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Describe internal procedure" style={{ fontFamily: 'Poppins, sans-serif' }} />
              )}
            </div>
            <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Your Right to File a Complaint:</div>
            <div className="text-sm mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
              If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
              <ul className="list-disc ml-6">
                <li>California CRD:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: ccrs.calcivilrights.ca.gov/s/</li>
                    <li>Download an intake form at the following link: calcivilrights.ca.gov/complaintprocess/filebymail/ and email it to contact.center@calcivilrights.gov or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
                    <li>Visit a CRD office. Click the following link for office locations: calcivilrights.ca.gov/locations/</li>
                    <li>Call California CRD at (800) 884-1684</li>
                  </ul>
                </li>
                <li>San Diego County OLSE:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</li>
                    <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
                    <li>Call San Diego County OLSE at 619-531-5129</li>
                  </ul>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-10 mb-8">
              <div>
                <SmartSuggestionField
                  label="Employer contact person name"
                  type="text"
                  value={form.contactName}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, contactName: value }))}
                  suggestionsEnabled={false}
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="Employer company name"
                  type="text"
                  value={form.companyName}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, companyName: value }))}
                  suggestionsEnabled={false}
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="Employer address"
                  type="text"
                  value={form.address}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, address: value }))}
                  suggestionsEnabled={false}
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="Employer contact phone number"
                  type="text"
                  value={form.phone}
                  onChange={(value) => setForm((prev: any) => ({ ...prev, phone: value }))}
                  suggestionsEnabled={false}
                />
              </div>
            </div>
            <div className="flex justify-end mt-12 gap-6">
              {preview ? (
                <>
                  <PrintPreviewButton documentSelector=".prose" documentTitle="Final Revocation Notice" />
                  <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" onClick={() => setPreview(false)} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Edit
                  </button>
                  <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={onSend} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>Send</button>
                </>
              ) : (
                <>
                  <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={() => setPreview(true)} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>
                    Preview
                  </button>
                  <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" onClick={onClose} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Cancel
                  </button>
                  <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={onSend} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>Send</button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="prose max-w-none text-black text-base bg-white rounded-xl p-16 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex justify-end mb-8">
              <PrintPreviewButton documentSelector=".prose" documentTitle="Final Revocation Notice" />
              <button type="button" className="ml-4 px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" onClick={() => setPreview(false)} style={{ fontFamily: 'Poppins, sans-serif' }}>
                Edit
              </button>
              <button type="button" className="ml-4 px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={onSend} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>Send</button>
            </div>
            <div className="mb-6">{form.date}</div>
            <div className="mb-6 font-bold">Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
            <div className="mb-6">Dear {form.applicant || '[APPLICANT NAME]'}:</div>
            <div className="mb-6">We are following up about our letter dated {form.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
            <div className="mb-6 font-semibold">(Please check one:)</div>
            <ul className="list-disc ml-6" style={{ color: '#595959' }}>
              {form.noResponse && <li>We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.</li>}
              {form.infoSubmitted && <li>We made a final decision to revoke the job offer after considering the information you submitted, which included: {form.infoSubmittedList}</li>}
            </ul>
            <div className="mb-6">After reviewing the information you submitted, we have determined that there
              <span className="font-semibold">{form.errorOnReport === 'was' ? 'was' : form.errorOnReport === 'was not' ? 'was not' : '[check one]'}</span> (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
            <ul className="list-disc ml-6" style={{ color: '#595959' }}>
              {form.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
            </ul>
            <div className="mb-6 font-semibold">Our Individualized Assessment:</div>
            <ol className="list-decimal ml-8 mb-8 space-y-4" style={{ color: '#595959' }}>
              <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {form.seriousReason}</li>
              <li>How long ago the conduct occurred that led to your conviction, which was: {form.timeSinceConduct} and how long ago you completed your sentence, which was: {form.timeSinceSentence}.</li>
              <li>The specific duties and responsibilities of the position of {form.position}, which are:
                <ul className="list-disc ml-6">
                  {form.jobDuties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
                </ul>
              </li>
            </ol>
            <div className="mb-6">We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
            <div className="mb-8 p-4 bg-gray-50 rounded-lg" style={{ color: '#595959' }}>{form.fitnessReason}</div>
            <div className="mb-6 font-semibold">Request for Reconsideration:</div>
            {form.reconsideration === 'none' ? (
              <div className="mb-8" style={{ color: '#595959' }}>We do not offer any way to challenge this decision or request reconsideration.</div>
            ) : form.reconsideration === 'procedure' ? (
              <div className="mb-8" style={{ color: '#595959' }}>
                If you would like to challenge this decision or request reconsideration, you may:<br />
                {form.reconsiderationProcedure}
              </div>
            ) : null}
            <div className="mb-6 font-semibold">Your Right to File a Complaint:</div>
            <div className="text-sm mb-8" style={{ color: '#595959' }}>
              If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
              <ul className="list-disc ml-6">
                <li>California CRD:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: ccrs.calcivilrights.ca.gov/s/</li>
                    <li>Download an intake form at the following link: calcivilrights.ca.gov/complaintprocess/filebymail/ and email it to contact.center@calcivilrights.gov or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
                    <li>Visit a CRD office. Click the following link for office locations: calcivilrights.ca.gov/locations/</li>
                    <li>Call California CRD at (800) 884-1684</li>
                  </ul>
                </li>
                <li>San Diego County OLSE:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</li>
                    <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
                    <li>Call San Diego County OLSE at 619-531-5129</li>
                  </ul>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-10 mb-8">
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#595959' }}>Employer contact person name</div>
                <div>{form.contactName}</div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#595959' }}>Employer company name</div>
                <div>{form.companyName}</div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#595959' }}>Employer address</div>
                <div>{form.address}</div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#595959' }}>Employer contact phone number</div>
                <div>{form.phone}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalRevocationModal; 
