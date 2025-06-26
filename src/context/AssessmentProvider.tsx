import React from "react";
import { AssessmentStepsProvider } from "./useAssessmentSteps";
import { AssessmentFormsProvider } from "./useAssessmentForms";
import { CandidateDataProvider } from "./useCandidateData";
import { DocumentUploadsProvider } from "./useDocumentUploads";

interface Props {
  children: React.ReactNode;
  candidateId: string;
}

export function AssessmentProvider({ children, candidateId }: Props) {
  return (
    <AssessmentStepsProvider candidateId={candidateId}>
      <AssessmentFormsProvider candidateId={candidateId}>
        <CandidateDataProvider candidateId={candidateId}>
          <DocumentUploadsProvider candidateId={candidateId}>
            {children}
          </DocumentUploadsProvider>
        </CandidateDataProvider>
      </AssessmentFormsProvider>
    </AssessmentStepsProvider>
  );
}
