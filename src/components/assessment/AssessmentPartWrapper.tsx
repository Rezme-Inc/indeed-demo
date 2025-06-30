import React from "react";
import AIAutofillButton from "./AIAutofillButton";

interface AssessmentPartWrapperProps {
  title: string;
  stepNumber: string;
  children: React.ReactNode;
  onAutofill?: () => Promise<void>;
  onClose?: () => void;
  showModal: boolean;
  autofillDisabled?: boolean;
}

const AssessmentPartWrapper: React.FC<AssessmentPartWrapperProps> = ({
  title,
  stepNumber,
  children,
  onAutofill,
  onClose,
  showModal,
  autofillDisabled = false,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm mt-1">{stepNumber}</p>
          </div>

          <div className="flex items-center gap-3">
            {onAutofill && (
              <AIAutofillButton
                onAutofill={onAutofill}
                disabled={autofillDisabled}
              />
            )}
            {onClose && (
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                onClick={onClose}
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Please complete all information before proceeding.
        </div>

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPartWrapper;
