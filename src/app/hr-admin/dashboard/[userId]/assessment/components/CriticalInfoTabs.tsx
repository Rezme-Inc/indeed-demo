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
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>San Diego Fair Chance Ordinance Requirements</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Internal policy requires documented confirmation of conditional offer before accessing any conviction history information. This ensures compliance with local fair chance hiring legislation.</p>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Assessment Guidelines</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal requirements for conducting fair and compliant individualized assessments under San Diego Fair Chance Ordinance will be displayed here.</p>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Preliminary Decision Legal Framework</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal guidelines for preliminary job offer decisions and revocation procedures will be displayed here.</p>
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Reassessment Legal Requirements</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal framework for conducting reassessments and handling candidate responses will be displayed here.</p>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Legal Compliance</h4>
              <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal requirements for final hiring decisions and documentation will be displayed here.</p>
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
        </div>
      )}
    </div>
  );
} 
