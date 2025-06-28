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

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:application/pdf;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

// Helper function to extract text from PDF using API
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/extract-pdf-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.fullText;
    } else {
      throw new Error(result.error || 'Failed to extract text from PDF');
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Helper function to extract job duties using AI
const extractJobDuties = async (pdfText: string): Promise<JobDescriptionResults> => {
  try {
    const response = await fetch('/api/autofill-duties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText,
        context: 'job_description'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        position: result.data.position_title,
        duties: result.data.suggested_duties
      };
    } else {
      throw new Error(result.error || 'Failed to extract job duties');
    }
  } catch (error) {
    console.error('Error extracting job duties:', error);
    throw error;
  }
};

// Helper function to extract offer date using AI
const extractOfferDate = async (pdfText: string): Promise<OfferLetterResults> => {
  try {
    const response = await fetch('/api/autofill-date', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText,
        context: 'offer_letter'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        offerDate: result.data.offer_date
      };
    } else {
      throw new Error(result.error || 'Failed to extract offer date');
    }
  } catch (error) {
    console.error('Error extracting offer date:', error);
    throw error;
  }
};

// Helper function to store file in localStorage as base64
const storeFileInLocalStorage = (key: string, file: File) => {
  fileToBase64(file).then(base64 => {
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      data: base64
    };
    localStorage.setItem(key, JSON.stringify(fileData));
  }).catch(error => {
    console.error('Error storing file in localStorage:', error);
  });
};

// Helper function to retrieve file from localStorage
const getFileFromLocalStorage = (key: string): File | null => {
  try {
    const fileDataStr = localStorage.getItem(key);
    if (!fileDataStr) return null;

    const fileData = JSON.parse(fileDataStr);

    // Convert base64 back to File
    const byteCharacters = atob(fileData.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileData.type });

    return new File([blob], fileData.name, {
      type: fileData.type,
      lastModified: fileData.lastModified
    });
  } catch (error) {
    console.error('Error retrieving file from localStorage:', error);
    return null;
  }
};

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

  // Load files and data from localStorage on component mount
  useEffect(() => {
    // Load files from localStorage
    const jobDescFile = getFileFromLocalStorage(`step1_jobDesc_file_${userId}`);
    const offerLetterFile = getFileFromLocalStorage(`step1_offerLetter_file_${userId}`);
    const backgroundReportFile = getFileFromLocalStorage(`step1_backgroundReport_file_${userId}`);

    setUploadedFiles({
      jobDescription: jobDescFile,
      offerLetter: offerLetterFile,
      backgroundReport: backgroundReportFile,
    });

    // Load processing results
    const savedJobResults = localStorage.getItem(`step1_job_results_${userId}`);
    const savedOfferResults = localStorage.getItem(`step1_offer_results_${userId}`);
    const savedJobApproval = localStorage.getItem(`step1_job_approved_${userId}`);
    const savedOfferApproval = localStorage.getItem(`step1_offer_approved_${userId}`);

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

    // Store file in localStorage
    storeFileInLocalStorage(`step1_${fileType}_file_${userId}`, file);

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
    localStorage.removeItem(`step1_${fileType}_file_${userId}`);

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

    try {
      // Step 1: Extract text from PDF
      const pdfText = await extractTextFromPDF(uploadedFiles.jobDescription);

      // Step 2: Extract job duties using AI
      const results = await extractJobDuties(pdfText);

      setJobDescriptionResults(results);
      saveJobResultsToLocalStorage(results, false);
    } catch (error) {
      console.error('Error processing job description:', error);
      alert('Failed to process job description. Please try again.');
    } finally {
      setIsProcessingJobDescription(false);
    }
  };

  const handleProcessOfferLetter = async () => {
    if (!uploadedFiles.offerLetter) {
      alert('Please upload conditional offer letter before processing.');
      return;
    }

    setIsProcessingOfferLetter(true);

    try {
      // Step 1: Extract text from PDF
      const pdfText = await extractTextFromPDF(uploadedFiles.offerLetter);

      // Step 2: Extract offer date using AI
      const results = await extractOfferDate(pdfText);

      setOfferLetterResults(results);
      saveOfferResultsToLocalStorage(results, false);
    } catch (error) {
      console.error('Error processing offer letter:', error);
      alert('Failed to process offer letter. Please try again.');
    } finally {
      setIsProcessingOfferLetter(false);
    }
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
