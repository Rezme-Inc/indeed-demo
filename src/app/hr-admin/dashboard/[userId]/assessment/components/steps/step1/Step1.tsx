import React, { useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Sparkles, CheckCircle, Eye } from "lucide-react";
import { useParams } from "next/navigation";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import FileUploadSection from "./FileUploadSection";
import TemplateModal from "./TemplateModal";
import { CONDITIONAL_OFFER_TEMPLATE } from "./templateContent";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";
import { FileStorageService, UploadedFile } from "@/lib/services/fileStorageService";
import { initializeCSRFProtection, secureFetch } from "@/lib/csrf";
import { useDocumentRefresh } from "@/context/DocumentRefreshContext";

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

    const response = await secureFetch('/api/extract-pdf-text', {
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
    const response = await secureFetch('/api/autofill-duties', {
      method: 'POST',
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
    const response = await secureFetch('/api/autofill-date', {
      method: 'POST',
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

// Helper function to upload and store file in Supabase
const uploadFileToSupabase = async (
  candidateId: string,
  file: File,
  fileType: 'job_desc' | 'offer_letter' | 'background_report'
): Promise<UploadedFile | null> => {
  try {
    console.log('[Step1] Uploading file to Supabase:', { fileName: file.name, fileType });

    const result = await FileStorageService.uploadFile(candidateId, file, fileType, 1);

    if (result.success && result.file) {
      console.log('[Step1] File uploaded successfully:', result.file);
      return result.file;
    } else {
      console.error('[Step1] File upload failed:', result.error);
      alert(`Failed to upload ${file.name}: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error('[Step1] Error uploading file:', error);
    alert(`Failed to upload ${file.name}. Please try again.`);
    return null;
  }
};

// Helper function to get file from Supabase for processing
const getFileFromSupabase = async (bucketPath: string): Promise<File | null> => {
  try {
    console.log('[Step1] Downloading file from Supabase:', bucketPath);

    const file = await FileStorageService.downloadFile(bucketPath);

    if (file) {
      console.log('[Step1] File downloaded successfully:', file.name);
      return file;
    } else {
      console.error('[Step1] Failed to download file');
      return null;
    }
  } catch (error) {
    console.error('[Step1] Error downloading file:', error);
    return null;
  }
};

const Step1: React.FC = () => {
  const { handleNext, currentStep } = useAssessmentSteps();
  const { userId } = useParams<{ userId: string }>();
  const { refreshDocuments } = useDocumentRefresh();
  const [activeTab, setActiveTab] = useState("Legal");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // File upload state - track both File objects and uploaded file metadata
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    jobDescription: null,
    offerLetter: null,
    backgroundReport: null,
  });

  // Track uploaded file metadata from Supabase
  const [uploadedFileMetadata, setUploadedFileMetadata] = useState<{
    jobDescription: UploadedFile | null;
    offerLetter: UploadedFile | null;
    backgroundReport: UploadedFile | null;
  }>({
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
  const [isStep1CompletedFromDB, setIsStep1CompletedFromDB] = useState(false);

  // Manual input states
  const [manualJobDescData, setManualJobDescData] = useState({
    position: '',
    duties: ['']
  });
  const [manualOfferData, setManualOfferData] = useState({
    offerDate: ''
  });

  // Load files and data from localStorage/database on component mount
  useEffect(() => {
    const loadStep1Data = async () => {
      console.log('[Step1] Loading data for candidate:', userId);

      // Check if step is already completed in database
      try {
        const assessmentStatus = await AssessmentDatabaseService.getAssessmentStatus(userId as string);

        if (assessmentStatus && assessmentStatus.current_step > 1) {
          console.log('[Step1] Step 1 completed in database, showing completion notice');
          setIsStep1CompletedFromDB(true);
          return;
        } else {
          console.log('[Step1] Step 1 not yet completed in database');
          setIsStep1CompletedFromDB(false);
        }
      } catch (error) {
        console.error('[Step1] Error checking database completion status:', error);
        setIsStep1CompletedFromDB(false);
      }

      // Load saved files from Supabase
      console.log('[Step1] Loading files from Supabase...');

      try {
        const [jobDescFiles, offerLetterFiles, backgroundFiles] = await Promise.all([
          FileStorageService.getFilesByCategory(userId as string, 'job_desc'),
          FileStorageService.getFilesByCategory(userId as string, 'offer_letter'),
          FileStorageService.getFilesByCategory(userId as string, 'background_report')
        ]);

        // Get the latest file from each category
        const latestJobDesc = jobDescFiles.length > 0 ? jobDescFiles[0] : null;
        const latestOfferLetter = offerLetterFiles.length > 0 ? offerLetterFiles[0] : null;
        const latestBackground = backgroundFiles.length > 0 ? backgroundFiles[0] : null;

        setUploadedFileMetadata({
          jobDescription: latestJobDesc,
          offerLetter: latestOfferLetter,
          backgroundReport: latestBackground,
        });

        // Download files for processing if they exist
        const loadedFiles: UploadedFiles = {
          jobDescription: null,
          offerLetter: null,
          backgroundReport: null,
        };

        if (latestJobDesc) {
          const jobDescFile = await getFileFromSupabase(latestJobDesc.bucket_path);
          if (jobDescFile) loadedFiles.jobDescription = jobDescFile;
        }

        if (latestOfferLetter) {
          const offerFile = await getFileFromSupabase(latestOfferLetter.bucket_path);
          if (offerFile) loadedFiles.offerLetter = offerFile;
        }

        if (latestBackground) {
          const backgroundFile = await getFileFromSupabase(latestBackground.bucket_path);
          if (backgroundFile) loadedFiles.backgroundReport = backgroundFile;
        }

        setUploadedFiles(loadedFiles);
      } catch (error) {
        console.error('[Step1] Error loading files from Supabase:', error);
      }
    };

    loadStep1Data();
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

  // Save manual input data to localStorage
  const saveManualJobDataToLocalStorage = (data: any) => {
    localStorage.setItem(`step1_manual_job_data_${userId}`, JSON.stringify(data));
  };

  const saveManualOfferDataToLocalStorage = (data: any) => {
    localStorage.setItem(`step1_manual_offer_data_${userId}`, JSON.stringify(data));
  };

  const handleFileUpload = async (fileType: keyof UploadedFiles, file: File) => {
    console.log('[Step1] Uploading file:', { fileType, fileName: file.name });

    // Update UI immediately with the file
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Upload file to Supabase storage
    const uploadedFile = await uploadFileToSupabase(userId as string, file, fileType === 'jobDescription' ? 'job_desc' :
      fileType === 'offerLetter' ? 'offer_letter' : 'background_report');

    if (uploadedFile) {
      // Update metadata state
      setUploadedFileMetadata(prev => ({
        ...prev,
        [fileType]: uploadedFile
      }));
      console.log('[Step1] File uploaded successfully to Supabase');

      // Refresh document availability to show the new file
      console.log('[Step1] Refreshing document availability...');
      await refreshDocuments();
    } else {
      console.error('[Step1] File upload failed');
      // Revert UI state if upload failed
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: null
      }));
      return;
    }

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

  const handleFileRemove = async (fileType: keyof UploadedFiles) => {
    console.log('[Step1] Removing file:', { fileType });

    // Get the uploaded file metadata
    const fileMetadata = uploadedFileMetadata[fileType];

    if (fileMetadata) {
      // Delete from Supabase storage
      const deleteSuccess = await FileStorageService.deleteFile(userId as string, fileMetadata.id);

      if (deleteSuccess) {
        console.log('[Step1] File deleted successfully from Supabase');

        // Refresh document availability to remove the deleted file
        console.log('[Step1] Refreshing document availability...');
        await refreshDocuments();
      } else {
        console.error('[Step1] Failed to delete file from Supabase');
        // Continue with UI update even if deletion failed
      }
    }

    // Update UI state
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    setUploadedFileMetadata(prev => ({
      ...prev,
      [fileType]: null
    }));

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

    // Update manual input to match approved AI results so UI reflects what will be saved
    const updatedManualData = {
      position: approvedResults.position,
      duties: approvedResults.duties
    };
    setManualJobDescData(updatedManualData);
    saveManualJobDataToLocalStorage(updatedManualData);
  };

  const handleApproveOfferLetter = (approvedResults: OfferLetterResults) => {
    setOfferLetterResults(approvedResults);
    setOfferLetterApproved(true);
    saveOfferResultsToLocalStorage(approvedResults, true);

    // Update manual input to match approved AI results so UI reflects what will be saved
    const updatedManualData = {
      offerDate: approvedResults.offerDate
    };
    setManualOfferData(updatedManualData);
    saveManualOfferDataToLocalStorage(updatedManualData);
  };

  // Initialize CSRF protection for secure API calls
  useEffect(() => {
    initializeCSRFProtection();
  }, []);

  // Check if all required fields are completed (from AI results OR manual input)
  const hasJobDescription = (
    // Either AI-approved results
    (jobDescriptionApproved && jobDescriptionResults?.position && jobDescriptionResults?.duties?.length > 0) ||
    // Or manual input filled
    (manualJobDescData?.position?.trim() && manualJobDescData?.duties?.some((duty: string) => duty.trim()))
  );
  const hasOfferDate = (
    // Either AI-approved results
    (offerLetterApproved && offerLetterResults?.offerDate) ||
    // Or manual input filled
    (manualOfferData?.offerDate?.trim())
  );
  const hasBackgroundReport = !!uploadedFiles.backgroundReport;

  // Only background report upload is required, but all fields must be completed
  const canProceed = hasBackgroundReport && hasJobDescription && hasOfferDate;

  const handleNextStep = async () => {
    if (!canProceed) {
      return;
    }

    try {
      console.log('[Step1] Starting Step 1 completion process...');

      // Gather all Step 1 data (prioritize manual input since it reflects user's final choice)
      const step1Data = {
        // Position and duties from manual input (updated when AI approved) OR AI results as fallback
        position: manualJobDescData?.position?.trim() || jobDescriptionResults?.position || '',
        duties: (() => {
          const filteredManualDuties = manualJobDescData?.duties?.filter((duty: string) => duty.trim()) || [];
          return filteredManualDuties.length > 0 ? filteredManualDuties : (jobDescriptionResults?.duties || []);
        })(),

        // Offer date from manual input (updated when AI approved) OR AI results as fallback  
        offer_date: manualOfferData?.offerDate?.trim() || offerLetterResults?.offerDate || '',

        // Additional metadata
        job_description_approved: jobDescriptionApproved,
        offer_letter_approved: offerLetterApproved,
        background_report_uploaded: !!uploadedFiles.backgroundReport,

        // Timestamps
        completed_at: new Date().toISOString(),
      };

      console.log('[Step1] Gathered Step 1 data for database:', step1Data);

      // Initialize assessment if it doesn't exist
      const assessmentExists = await AssessmentDatabaseService.assessmentExists(userId as string);
      if (!assessmentExists) {
        console.log('[Step1] Initializing new assessment...');
        const initSuccess = await AssessmentDatabaseService.initializeAssessment(userId as string);
        if (!initSuccess) {
          console.error('[Step1] Failed to initialize assessment');
          alert('Failed to initialize assessment. Please try again.');
          return;
        }
      }

      // Save Step 1 data to database and advance to Step 2
      console.log('[Step1] Saving Step 1 data to database...');
      const saveSuccess = await AssessmentDatabaseService.completeStep(
        userId as string,
        1, // Step number
        step1Data,
        2 // Next step
      );

      if (saveSuccess) {
        console.log('[Step1] Successfully saved Step 1 data to database');

        // Clear localStorage only after successful database save
        localStorage.removeItem(`step1_job_results_${userId}`);
        localStorage.removeItem(`step1_offer_results_${userId}`);
        localStorage.removeItem(`step1_job_approved_${userId}`);
        localStorage.removeItem(`step1_offer_approved_${userId}`);

        // Clear manual input data
        localStorage.removeItem(`step1_manual_job_data_${userId}`);
        localStorage.removeItem(`step1_manual_offer_data_${userId}`);

        // Clear file storage (optional - could keep for reference)
        localStorage.removeItem(`step1_jobDescription_file_${userId}`);
        localStorage.removeItem(`step1_offerLetter_file_${userId}`);
        localStorage.removeItem(`step1_backgroundReport_file_${userId}`);

        console.log('[Step1] Cleared localStorage, proceeding to Step 2');

        // Proceed to next step
        handleNext();
      } else {
        console.error('[Step1] Failed to save Step 1 data to database');
        alert('Failed to save assessment data. Please try again.');
      }
    } catch (error) {
      console.error('[Step1] Error during Step 1 completion:', error);
      alert('An error occurred while saving your progress. Please try again.');
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

        {/* Step 1 Completion Notice */}
        {isStep1CompletedFromDB && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-green-900 mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Step 1 Already Completed
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  This step has been completed and saved to the database. Position: <strong>{jobDescriptionResults?.position}</strong>, Offer Date: <strong>{offerLetterResults?.offerDate}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Job Description Upload */}
          <FileUploadSection
            title="Job Description (Optional)"
            description="Upload the job description to automatically extract position and duties, or enter them manually below. Position and job duties are required to proceed."
            fileType="job_description"
            file={uploadedFiles.jobDescription}
            onFileUpload={(file) => handleFileUpload('jobDescription', file)}
            onFileRemove={() => handleFileRemove('jobDescription')}
            required={false}
            showProcessing={true}
            isProcessing={isProcessingJobDescription}
            onProcess={handleProcessJobDescription}
            processingResults={jobDescriptionResults}
            onApprove={handleApproveJobDescription}
            isApproved={jobDescriptionApproved}
            showManualInput={true}
            manualData={manualJobDescData}
            onManualDataChange={(data) => {
              setManualJobDescData(data);
              saveManualJobDataToLocalStorage(data);
            }}
          />

          {/* Conditional Offer Letter Upload */}
          <FileUploadSection
            title="Conditional Job Offer Letter (Optional)"
            description="Upload the conditional job offer letter to automatically extract the offer date, or enter it manually below. If you haven't sent one yet, use our template. Offer date is required to proceed."
            fileType="offer_letter"
            file={uploadedFiles.offerLetter}
            onFileUpload={(file) => handleFileUpload('offerLetter', file)}
            onFileRemove={() => handleFileRemove('offerLetter')}
            required={false}
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
            onManualDataChange={(data) => {
              setManualOfferData(data);
              saveManualOfferDataToLocalStorage(data);
            }}
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
          {!canProceed && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Required to proceed to Step 2:
                  </p>
                  <ul className="text-sm text-red-800 space-y-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {!hasBackgroundReport && (
                      <li>• Upload criminal background report</li>
                    )}
                    {!hasJobDescription && (
                      <li>• Complete position and job duties (upload job description + approve, or enter manually)</li>
                    )}
                    {!hasOfferDate && (
                      <li>• Complete offer date (upload offer letter + approve, or enter manually)</li>
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
