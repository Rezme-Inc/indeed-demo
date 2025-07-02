"use client";
import { useState } from "react";
import { getCurrentAssessmentStep } from "@/utils/invitation";

const ASSESSMENT_STEPS = [
  { key: "conditional_job_offer", label: "Conditional Job Offers" },
  { key: "individualized_assessment", label: "Written Individualized Assessment" },
  { key: "preliminary_job_offer_revocation", label: "Preliminary Job Offer Revocation" },
  { key: "individualized_reassessment", label: "Individual Reassessment" },
  { key: "final_revocation_notice", label: "Final Revocation Notice" },
];

export default function ComplianceStepDisplay({ user }: { user: any }) {
  const [expanded, setExpanded] = useState(false);

  // Use database compliance_steps if available, otherwise fall back to localStorage
  let currentStepIdx = 0;
  let completedSteps: any[] = [];
  let currentStep = null;

  if (user.compliance_steps) {
    // Use database-driven compliance steps
    const steps = user.compliance_steps;
    const completedStepKeys = Object.entries(steps)
      .filter(([key, completed]) => completed && key !== 'decision')
      .map(([key]) => key);

    completedSteps = ASSESSMENT_STEPS.filter(step => completedStepKeys.includes(step.key));
    currentStepIdx = completedSteps.length;

    // Determine current step
    if (steps.decision) {
      currentStepIdx = 5; // All steps completed
    } else if (!steps.final_revocation_notice) {
      currentStep = ASSESSMENT_STEPS.find(step => !completedStepKeys.includes(step.key));
    }
  } else {
    // Fallback to localStorage method
    currentStepIdx = getCurrentAssessmentStep(user);
    completedSteps = ASSESSMENT_STEPS.slice(0, currentStepIdx);
    currentStep = ASSESSMENT_STEPS[currentStepIdx];
  }

  if (currentStepIdx === 5) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              fontWeight: "bold",
            }}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            All steps completed
          </span>
          <button
            type="button"
            className="text-xs font-medium underline focus:outline-none transition-all duration-200 hover:opacity-90"
            style={{ color: "#595959" }}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Hide" : "Show Previous"}
          </button>
        </div>
        {expanded && (
          <div className="mt-3 flex flex-col gap-2">
            {ASSESSMENT_STEPS.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#F0F9FF", color: "#1E40AF", border: "1px solid #DBEAFE" }}
        >
          {currentStep ? currentStep.label : "-"}
        </span>
        <button
          type="button"
          className="text-xs font-medium underline focus:outline-none transition-all duration-200 hover:opacity-90"
          style={{ color: "#595959" }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Hide" : "Show Previous"}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {completedSteps.length === 0 ? (
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              No previous steps
            </span>
          ) : (
            completedSteps.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {s.label}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}
