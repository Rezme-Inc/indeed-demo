import React from 'react';

interface CriticalInfoTabsProps {
  activeTab: string;
  currentStep: number;
}

export default function CriticalInfoTabs({ activeTab, currentStep }: CriticalInfoTabsProps) {
  return (
    <div className="min-h-[200px]">
      {activeTab === 'Legal' && (
        <div className="space-y-4">
          {currentStep === 1 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>San Diego Fair Chance Ordinance Requirements</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Conditional offer before background check.</strong> Employer must make a conditional job offer before requesting, receiving, or considering conviction history information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Written conditional offer required.</strong> The conditional job offer must be documented in writing and clearly specify the position terms and conditions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>No conviction history inquiries before offer.</strong> Employers cannot ask about criminal history on applications, during interviews, or before making conditional offers.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Document timing and process.</strong> Maintain clear records showing the conditional offer was made before any background check or conviction history review.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Apply to all positions and applicants.</strong> Fair chance requirements apply uniformly regardless of position level or applicant characteristics.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Compliance with local ordinance.</strong> San Diego County Fair Chance Ordinance provides additional protections beyond state requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Assessment Legal Guidelines</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Conditional offer before background check.</strong> Employer must make conditional job offer before requesting or reviewing any conviction history information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Consider nature and gravity of convictions.</strong> Assessment must evaluate the seriousness and relevance of criminal history to the position.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Evaluate time elapsed since conviction.</strong> Consider how much time has passed since the conviction and completion of sentence.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Assess job-relatedness.</strong> Determine whether the conviction history directly relates to the specific duties and responsibilities of the position.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Document individualized analysis.</strong> All assessment factors and reasoning must be clearly documented in writing for each case.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Business necessity standard.</strong> Employer must demonstrate legitimate business reasons for any adverse decision based on conviction history.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Preliminary Decision Legal Framework</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Written notice required for revocation.</strong> Employer must provide written notification if preliminarily deciding to revoke the conditional offer.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Copy of conviction records included.</strong> Notice must include a copy of the conviction history relied upon in making the decision.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Individualized assessment explanation.</strong> Written analysis of how the conviction history relates to the specific duties of the position.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Response opportunity notification.</strong> Inform applicant of their right to respond with mitigating evidence within 5 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Accuracy dispute rights.</strong> Notify applicant of their right to dispute the accuracy of conviction records within additional 5 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Business necessity demonstration.</strong> Decision must be supported by clear connection between conviction and essential job functions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Reassessment Legal Requirements</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Candidate response deadline: 5 business days.</strong> Applicant must be given at least 5 business days to provide mitigating evidence or information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Accuracy dispute period: additional 5 days.</strong> Additional 5 business days must be provided for disputing accuracy of conviction records.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Consider all submitted evidence.</strong> Employer must review and consider any mitigating information provided by the applicant.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Document reassessment process.</strong> All steps of the reassessment and candidate communications must be thoroughly documented.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Fair consideration required.</strong> Reassessment must be conducted in good faith with genuine consideration of new information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>No retaliation for response.</strong> Employer cannot penalize applicant for exercising their right to respond or dispute accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Legal Requirements</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Written notice of final decision required.</strong> Employer must provide written notification of the final hiring decision to the applicant.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Document decision rationale.</strong> All factors considered in the final decision must be clearly documented and justified.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Consider all candidate responses.</strong> Any information provided by the candidate during reassessment must be factored into the final decision.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Non-discrimination compliance.</strong> Final decision must be based on job-related factors and cannot discriminate based on criminal history alone.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Retain complete documentation.</strong> All assessment records, candidate responses, and decision documentation must be preserved for one year.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Consistency with business necessity.</strong> Decision must align with the essential functions and requirements of the specific position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
          {currentStep === 6 && (
            <div>
              <h4 className="font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Record Retention & Compliance Requirements</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>One-year record retention required.</strong> All employment application documents and assessments must be retained for one full year.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>First violation penalty: up to $5,000</strong> per affected applicant or employee.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Second violation penalty: up to $10,000</strong> per affected applicant or employee.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Third+ violation penalty: up to $20,000</strong> per affected applicant or employee.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Penalty distribution:</strong> At least half of collected penalties are awarded to the affected applicant or employee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Sources & References</h5>
                <div className="space-y-2">
                  <a 
                    href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB1008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    California Fair Chance Act
                  </a>
                  <br />
                  <a 
                    href="https://codelibrary.amlegal.com/codes/san_diego/latest/sandiego_regs/0-0-0-114175" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    San Diego County Fair Chance Ordinance
                  </a>
                  <br />
                  <a 
                    href="mailto:OLSE@sdcounty.ca.gov"
                    className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Contact OLSE: OLSE@sdcounty.ca.gov
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Company Policy' && (
        <div className="space-y-4">
          {currentStep === 1 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Conditional Offer Policy</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company-specific policies regarding conditional job offers and documentation requirements will be displayed here.</p>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Procedures</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Internal company policies for conducting individualized assessments will be displayed here.</p>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Decision Making Policy</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for preliminary hiring decisions and notification procedures will be displayed here.</p>
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Reassessment Guidelines</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for handling candidate responses and conducting reassessments will be displayed here.</p>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Policy</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for final hiring decisions and record keeping will be displayed here.</p>
            </div>
          )}
          {currentStep === 6 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Process Complete</h4>
              <div className="space-y-3">
                <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>The fair chance assessment process has been completed according to company policy and procedures.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Next Steps</h5>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <li>• Archive all assessment documentation</li>
                    <li>• Update candidate status in HR systems</li>
                    <li>• Proceed with onboarding (if hired) or close case</li>
                    <li>• Review process for continuous improvement</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>Ensure all team members involved are notified of the final decision and next steps.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Candidate Context' && (
        <div className="space-y-4">
          {currentStep === 1 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Candidate Background</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Relevant candidate information and context for the conditional offer stage will be displayed here.</p>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Context</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Candidate-specific context and considerations for the individualized assessment will be displayed here.</p>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Decision Context</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Relevant candidate context for preliminary decision making will be displayed here.</p>
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Response Context</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Candidate response and relevant context for reassessment will be displayed here.</p>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Context</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Complete candidate context for final hiring decision will be displayed here.</p>
            </div>
          )}
          {currentStep === 6 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Candidate Assessment Summary</h4>
              <div className="space-y-3">
                <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>The complete assessment process has been concluded for this candidate.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Timeline Complete</h5>
                  <ul className="text-sm text-gray-700 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <li>• All required forms submitted and processed</li>
                    <li>• Candidate had full opportunity to respond</li>
                    <li>• Decision made through fair and consistent process</li>
                    <li>• Communication completed per policy requirements</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>This candidate's file can now be closed and archived according to company retention policies.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
