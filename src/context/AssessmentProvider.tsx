import React from "react";
import { AssessmentStepsProvider } from "./useAssessmentSteps";
import { AssessmentStorageProvider } from "./AssessmentStorageProvider";
import { CandidateDataProvider } from "./useCandidateData";
import { DocumentUploadsProvider } from "./useDocumentUploads";

interface Props {
  children: React.ReactNode;
  candidateId: string;
}

export function AssessmentProvider({ children, candidateId }: Props) {
  return (
    <AssessmentStepsProvider candidateId={candidateId}>
      <AssessmentStorageProvider candidateId={candidateId}>
        <CandidateDataProvider candidateId={candidateId}>
          <DocumentUploadsProvider candidateId={candidateId}>
            {children}
          </DocumentUploadsProvider>
        </CandidateDataProvider>
      </AssessmentStorageProvider>
    </AssessmentStepsProvider>
  );
}
