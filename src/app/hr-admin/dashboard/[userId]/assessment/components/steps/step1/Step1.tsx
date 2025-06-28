import React, { useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Sparkles, CheckCircle, Eye } from "lucide-react";
import { useParams } from "next/navigation";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import FileUploadSection from "./FileUploadSection";
import TemplateModal from "./TemplateModal";
import { CONDITIONAL_OFFER_TEMPLATE } from "./templateContent";

interface UploadedFiles {
  jobDescription: File | null;
  offerLetter: File | null;
  backgroundReport: File | null;
}

interface JobDescriptionResults {
  position: string;
  duties: string[];
}

interface OfferLetterResults {
  offerDate: string;
}

const Step1: React.FC = () => {
  const { handleNext, currentStep } = useAssessmentSteps();
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    jobDescription: null,
    offerLetter: null,
    backgroundReport: null,
  });

  // AI processing state
  const [jobDescriptionResults, setJobDescriptionResults] = useState<JobDescriptionResults | null>(null);
  const [offerLetterResults, setOfferLetterResults] = useState<OfferLetterResults | null>(null);
  const [isProcessingJobDescription, setIsProcessingJobDescription] = useState(false);
  const [isProcessingOfferLetter, setIsProcessingOfferLetter] = useState(false);
  const [jobDescriptionApproved, setJobDescriptionApproved] = useState(false);
  const [offerLetterApproved, setOfferLetterApproved] = useState(false);

  // Manual input states
  const [manualJobDescData, setManualJobDescData] = useState({
    position: '',
    duties: ['']
  });
  const [manualOfferData, setManualOfferData] = useState({
    offerDate: ''
  });

  // Load files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem(`step1_files_${userId}`);
    const savedJobResults = localStorage.getItem(`step1_job_results_${userId}`);
    const savedOfferResults = localStorage.getItem(`step1_offer_results_${userId}`);
    const savedJobApproval = localStorage.getItem(`step1_job_approved_${userId}`);
    const savedOfferApproval = localStorage.getItem(`step1_offer_approved_${userId}`);

    if (savedFiles) {
      try {
        // Note: Files can't be restored from localStorage, but we can show that they were uploaded
        const fileData = JSON.parse(savedFiles);
        // For now, we'll just show the processing results if they exist
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }

    if (savedJobResults) {
      try {
        setJobDescriptionResults(JSON.parse(savedJobResults));
      } catch (error) {
        console.error('Error loading saved job results:', error);
      }
    }

    if (savedOfferResults) {
      try {
        setOfferLetterResults(JSON.parse(savedOfferResults));
      } catch (error) {
        console.error('Error loading saved offer results:', error);
      }
    }

    if (savedJobApproval) {
      setJobDescriptionApproved(JSON.parse(savedJobApproval));
    }

    if (savedOfferApproval) {
      setOfferLetterApproved(JSON.parse(savedOfferApproval));
    }
  }, [userId]);

  // Save results to localStorage
  const saveJobResultsToLocalStorage = (results: JobDescriptionResults | null, approved: boolean = false) => {
    if (results) {
      localStorage.setItem(`step1_job_results_${userId}`, JSON.stringify(results));
    }
    localStorage.setItem(`step1_job_approved_${userId}`, JSON.stringify(approved));
  };

  const saveOfferResultsToLocalStorage = (results: OfferLetterResults | null, approved: boolean = false) => {
    if (results) {
      localStorage.setItem(`step1_offer_results_${userId}`, JSON.stringify(results));
    }
    localStorage.setItem(`step1_offer_approved_${userId}`, JSON.stringify(approved));
  };

  const handleFileUpload = (fileType: keyof UploadedFiles, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Save file info to localStorage (actual file can't be stored)
    const fileInfo = {
      [fileType]: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    };
    localStorage.setItem(`step1_files_${userId}`, JSON.stringify({
      ...JSON.parse(localStorage.getItem(`step1_files_${userId}`) || '{}'),
      ...fileInfo
    }));

    // Reset processing state when new files are uploaded
    if (fileType === 'jobDescription') {
      setJobDescriptionResults(null);
      setJobDescriptionApproved(false);
      saveJobResultsToLocalStorage(null, false);
    }
    if (fileType === 'offerLetter') {
      setOfferLetterResults(null);
      setOfferLetterApproved(false);
      saveOfferResultsToLocalStorage(null, false);
    }
  };

  const handleFileRemove = (fileType: keyof UploadedFiles) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    // Remove from localStorage
    const savedFiles = JSON.parse(localStorage.getItem(`step1_files_${userId}`) || '{}');
    delete savedFiles[fileType];
    localStorage.setItem(`step1_files_${userId}`, JSON.stringify(savedFiles));

    // Reset processing state when files are removed
    if (fileType === 'jobDescription') {
      setJobDescriptionResults(null);
      setJobDescriptionApproved(false);
      saveJobResultsToLocalStorage(null, false);
    }
    if (fileType === 'offerLetter') {
      setOfferLetterResults(null);
      setOfferLetterApproved(false);
      saveOfferResultsToLocalStorage(null, false);
    }
  };

  const handleProcessJobDescription = async () => {
    if (!uploadedFiles.jobDescription) {
      alert('Please upload job description before processing.');
      return;
    }

    setIsProcessingJobDescription(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock AI processing results
    const mockResults: JobDescriptionResults = {
      position: "Software Engineer",
      duties: [
        "Develop and maintain web applications using React and Node.js",
        "Collaborate with cross-functional teams to define and implement features",
        "Write clean, maintainable, and testable code",
        "Participate in code reviews and technical discussions",
        "Debug and resolve technical issues in production systems"
      ]
    };

    setJobDescriptionResults(mockResults);
    setIsProcessingJobDescription(false);
    saveJobResultsToLocalStorage(mockResults, false);
  };

  const handleProcessOfferLetter = async () => {
    if (!uploadedFiles.offerLetter) {
      alert('Please upload conditional offer letter before processing.');
      return;
    }

    setIsProcessingOfferLetter(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI processing results
    const mockResults: OfferLetterResults = {
      offerDate: new Date().toISOString().split('T')[0] // Today's date
    };

    setOfferLetterResults(mockResults);
    setIsProcessingOfferLetter(false);
    saveOfferResultsToLocalStorage(mockResults, false);
  };

  const handleApproveJobDescription = (approvedResults: JobDescriptionResults) => {
    setJobDescriptionResults(approvedResults);
    setJobDescriptionApproved(true);
    saveJobResultsToLocalStorage(approvedResults, true);
  };

  const handleApproveOfferLetter = (approvedResults: OfferLetterResults) => {
    setOfferLetterResults(approvedResults);
    setOfferLetterApproved(true);
    saveOfferResultsToLocalStorage(approvedResults, true);
  };

  const handleManualJobDescApprove = (data: any) => {
    console.log('Approved manual job description data:', data);
    const results = {
      position: data.position,
      duties: data.duties.filter((duty: string) => duty.trim() !== '')
    };
    setJobDescriptionResults(results);
    setJobDescriptionApproved(true);
    saveJobResultsToLocalStorage(results, true);
  };

  const handleManualOfferApprove = (data: any) => {
    console.log('Approved manual offer data:', data);
    const results = {
      offerDate: data.offerDate
    };
    setOfferLetterResults(results);
    setOfferLetterApproved(true);
    saveOfferResultsToLocalStorage(results, true);
  };

  const canProceed = uploadedFiles.backgroundReport && uploadedFiles.offerLetter && jobDescriptionApproved && offerLetterApproved;

  const handleNextStep = () => {
    if (canProceed) {
      handleNext();
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-6 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Document Upload & Processing
        </h2>

        <div className="space-y-8">
          {/* Job Description Upload */}
          <FileUploadSection
            title="Job Description"
            description="Upload the job description for the position the candidate applied for. This will be used to extract job duties and position details."
            fileType="job_description"
            file={uploadedFiles.jobDescription}
            onFileUpload={(file) => handleFileUpload('jobDescription', file)}
            onFileRemove={() => handleFileRemove('jobDescription')}
            required={true}
            showProcessing={true}
            isProcessing={isProcessingJobDescription}
            onProcess={handleProcessJobDescription}
            processingResults={jobDescriptionResults}
            onApprove={handleApproveJobDescription}
            isApproved={jobDescriptionApproved}
            showManualInput={true}
            manualData={manualJobDescData}
            onManualDataChange={setManualJobDescData}
            onManualApprove={handleManualJobDescApprove}
          />

          {/* Conditional Offer Letter Upload */}
          <FileUploadSection
            title="Conditional Job Offer Letter"
            description="Upload the conditional job offer letter sent to the candidate. If you haven't sent one yet, use our template below."
            fileType="offer_letter"
            file={uploadedFiles.offerLetter}
            onFileUpload={(file) => handleFileUpload('offerLetter', file)}
            onFileRemove={() => handleFileRemove('offerLetter')}
            required={true}
            showTemplate={true}
            onShowTemplate={() => setShowTemplateModal(true)}
            showProcessing={true}
            isProcessing={isProcessingOfferLetter}
            onProcess={handleProcessOfferLetter}
            processingResults={offerLetterResults}
            onApprove={handleApproveOfferLetter}
            isApproved={offerLetterApproved}
            showManualInput={true}
            manualData={manualOfferData}
            onManualDataChange={setManualOfferData}
            onManualApprove={handleManualOfferApprove}
          />

          {/* Criminal Background Report Upload */}
          <FileUploadSection
            title="Criminal Background Report"
            description="Upload the criminal background report for this candidate. This is required to proceed to the assessment."
            fileType="background_report"
            file={uploadedFiles.backgroundReport}
            onFileUpload={(file) => handleFileUpload('backgroundReport', file)}
            onFileRemove={() => handleFileRemove('backgroundReport')}
            required={true}
          />

          {/* Validation Notices */}
          {(!uploadedFiles.backgroundReport || !uploadedFiles.offerLetter || !jobDescriptionApproved || !offerLetterApproved) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Required to proceed to Step 2:
                  </p>
                  <ul className="text-sm text-red-800 space-y-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {!uploadedFiles.offerLetter && (
                      <li>• Upload conditional job offer letter</li>
                    )}
                    {!uploadedFiles.backgroundReport && (
                      <li>• Upload criminal background report</li>
                    )}
                    {uploadedFiles.jobDescription && !jobDescriptionApproved && (
                      <li>• Process and approve job description (position & duties)</li>
                    )}
                    {uploadedFiles.offerLetter && !offerLetterApproved && (
                      <li>• Process and approve offer letter (offer date)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end items-center mt-8">
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold flex items-center space-x-2 transition-all duration-200 ${canProceed
              ? "text-white hover:opacity-90"
              : "border border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            style={{
              fontFamily: "Poppins, sans-serif",
              backgroundColor: canProceed ? "#E54747" : "transparent",
            }}
            onClick={handleNextStep}
            disabled={!canProceed}
          >
            Next <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>

      <CriticalInfoSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStep={currentStep}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templateContent={CONDITIONAL_OFFER_TEMPLATE}
      />
    </>
  );
};

export default Step1;
