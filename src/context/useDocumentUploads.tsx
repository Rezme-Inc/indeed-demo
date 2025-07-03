import { createContext, useContext, useEffect, useState } from "react";

interface ViewingDocument {
  file: File;
  type: "background" | "jobdesc" | "jobposting" | "emails" | "notes" | "companypolicy";
  title: string;
}

interface DocumentState {
  backgroundCheckFile: File | null;
  setBackgroundCheckFile: (f: File | null) => void;
  jobDescriptionFile: File | null;
  setJobDescriptionFile: (f: File | null) => void;
  jobPostingFile: File | null;
  setJobPostingFile: (f: File | null) => void;
  emailsFile: File | null;
  setEmailsFile: (f: File | null) => void;
  notesFile: File | null;
  setNotesFile: (f: File | null) => void;
  companyPolicyFile: File | null;
  setCompanyPolicyFile: (f: File | null) => void;
  uploadingBackground: boolean;
  setUploadingBackground: (b: boolean) => void;
  uploadingJobDesc: boolean;
  setUploadingJobDesc: (b: boolean) => void;
  uploadingJobPosting: boolean;
  setUploadingJobPosting: (b: boolean) => void;
  uploadingEmails: boolean;
  setUploadingEmails: (b: boolean) => void;
  uploadingNotes: boolean;
  setUploadingNotes: (b: boolean) => void;
  uploadingCompanyPolicy: boolean;
  setUploadingCompanyPolicy: (b: boolean) => void;
  showDocumentPanel: boolean;
  setShowDocumentPanel: (b: boolean) => void;
  viewingDocument: ViewingDocument | null;
  setViewingDocument: (v: ViewingDocument | null) => void;
  showDocumentViewer: boolean;
  setShowDocumentViewer: (b: boolean) => void;
  showDocumentsDropdown: boolean;
  setShowDocumentsDropdown: (b: boolean) => void;
}

const DocumentUploadsContext = createContext<DocumentState | undefined>(undefined);

interface ProviderProps { children: React.ReactNode; candidateId: string; }

export function DocumentUploadsProvider({ children, candidateId }: ProviderProps) {
  const [backgroundCheckFile, setBackgroundCheckFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobPostingFile, setJobPostingFile] = useState<File | null>(null);
  const [emailsFile, setEmailsFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [companyPolicyFile, setCompanyPolicyFile] = useState<File | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingJobDesc, setUploadingJobDesc] = useState(false);
  const [uploadingJobPosting, setUploadingJobPosting] = useState(false);
  const [uploadingEmails, setUploadingEmails] = useState(false);
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [uploadingCompanyPolicy, setUploadingCompanyPolicy] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<ViewingDocument | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);

  useEffect(() => {
    if (showDocumentPanel)
      localStorage.setItem(`showDocumentPanel_${candidateId}`, "true");
    else localStorage.removeItem(`showDocumentPanel_${candidateId}`);
  }, [showDocumentPanel, candidateId]);

  return (
    <DocumentUploadsContext.Provider
      value={{
        backgroundCheckFile,
        setBackgroundCheckFile,
        jobDescriptionFile,
        setJobDescriptionFile,
        jobPostingFile,
        setJobPostingFile,
        emailsFile,
        setEmailsFile,
        notesFile,
        setNotesFile,
        companyPolicyFile,
        setCompanyPolicyFile,
        uploadingBackground,
        setUploadingBackground,
        uploadingJobDesc,
        setUploadingJobDesc,
        uploadingJobPosting,
        setUploadingJobPosting,
        uploadingEmails,
        setUploadingEmails,
        uploadingNotes,
        setUploadingNotes,
        uploadingCompanyPolicy,
        setUploadingCompanyPolicy,
        showDocumentPanel,
        setShowDocumentPanel,
        viewingDocument,
        setViewingDocument,
        showDocumentViewer,
        setShowDocumentViewer,
        showDocumentsDropdown,
        setShowDocumentsDropdown,
      }}
    >
      {children}
    </DocumentUploadsContext.Provider>
  );
}

export function useDocumentUploads() {
  const ctx = useContext(DocumentUploadsContext);
  if (!ctx) throw new Error("useDocumentUploads must be used within provider");
  return ctx;
}
